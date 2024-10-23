import { access } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

import { type Plugin } from "vite";
import { glob } from "glob";
import { compile, JSONSchema } from "json-schema-to-typescript";
import { getClassNames } from "./helpers/getClassNames";
import { logError } from "helpers/logError";
import { AllOptions } from "types/Options";

const getFilePaths = async (globPattern: string) => {
  return (await glob(globPattern)).map((file) => {
    return path.resolve(file);
  });
};

const defaultOptions: Options = {
  banner: "// This file is generated automatically do not modify it by hand",
  fileGlob: "src/**/*.module.scss",
  initialize: true,
  modulesOnly: true,
  name: "Styles",
  removeOrphans: true,
  localsConvention: "camelCaseOnly",
};

type Options = Partial<AllOptions>;

const removeOrphanedFiles = async (files: string[], options: Options) => {
  const definitions = await getFilePaths(`${options.fileGlob}.d.ts`);
  const orphans = definitions.filter((definition) => {
    return !files.includes(definition.replace(".d.ts", ""));
  });

  await Promise.all(
    orphans.map(async (orphan) => {
      return fs.unlink(orphan);
    })
  );
};

const classNamesToTypeScript = async (
  classNames: string[],
  options: Options
) => {
  const title = options.name || "Styles";

  const schema: JSONSchema = {
    title,
    type: "object",
    additionalProperties: { type: "string" },
    properties: classNames.sort().reduce((acc, className) => {
      return {
        ...acc,
        [className]: {
          type: "string",
        },
      };
    }, {}),
    required: classNames,
  };

  const tsInterface = (
    await compile(schema, title, { bannerComment: options.banner })
  ).replace(/}\n$/, "}");

  const output = [
    tsInterface,
    `declare const styles: ${title};`,
    "export default styles;",
  ]
    .join("\n\n")
    .replace(/\r\n/g, "\n");

  return `${output}\n`;
};

const generate = async (
  filePath: string,
  options: Options = defaultOptions
) => {
  const classNames = await getClassNames(filePath);

  const targetPath = `${filePath}.d.ts`;

  if (classNames === undefined) {
    return;
  }

  if (classNames.length === 0) {
    let remove = null;

    access(targetPath, (err) => {
      if (!err) {
        remove = fs.unlink(targetPath);
      }
    });

    if (remove !== null) {
      await (remove as Promise<void>);
    }

    return;
  }

  const typescript = await classNamesToTypeScript(classNames, options);

  await fs.writeFile(targetPath, typescript, { encoding: "utf-8" });
};

const start = async (
  files: string[],
  {
    fileGlob = defaultOptions.fileGlob,
    banner = defaultOptions.banner,
    name = defaultOptions.name,
  }: Options = defaultOptions
) => {
  if (fileGlob === undefined) {
    throw new Error("fileGlob is required");
  }

  const hasNonModuleFiles = files.some((file) => {
    return !/\.module\.scss$/.test(file);
  });

  if (hasNonModuleFiles && defaultOptions.modulesOnly) {
    throw new Error(
      [
        "❌ All files must be SCSS modules.",
        "❌ You can disable this check by setting modulesOnly to false",
        "❌ Note that this may lead to unexpected behavior.",
      ].join("\n")
    );
  }

  await Promise.all(
    files.map(async (filePath) => {
      return generate(filePath, { banner, name });
    })
  );

  return files;
};

const logRun = async (
  callback: () => Promise<void>,
  quiet: boolean = false
) => {
  const start = Date.now();

  if (!quiet) {
    console.info(`♻️  Regenerating SCSS types...`);
  }

  try {
    await callback();
  } catch (e) {
    const error = e as Error;

    if (!quiet) {
      if (error.message.includes("❌")) {
        console.error(error.message);
      } else {
        logError(error);
      }
    }

    return;
  }

  if (!quiet) {
    console.info(`✅ SCSS types regenerated in ${Date.now() - start}ms`);
  }
};

export const ScssTypesPlugin = (
  _options: Partial<AllOptions> = defaultOptions // NOTE: Using partial here slightly reduces bundle size
): Plugin => {
  const options = { ...defaultOptions, ..._options };

  return {
    name: "watch-scss-modules",
    configResolved: async () => {
      if (
        (options.initialize || options.removeOrphans) &&
        options.fileGlob !== undefined
      ) {
        const files = await getFilePaths(options.fileGlob);

        if (options.initialize) {
          await logRun(async () => {
            await start(files, options);
          });
        }

        if (options.removeOrphans) {
          await removeOrphanedFiles(files, options);
        }
      }
    },

    watchChange: async (file) => {
      if (options.fileGlob !== undefined) {
        const isScssModule = /\.module\.scss$/.test(file);

        if (!isScssModule && options.modulesOnly) {
          return;
        }

        const files = await getFilePaths(options.fileGlob);

        const globFileUpdated = files.includes(path.resolve(file));

        if (globFileUpdated) {
          await logRun(async () => {
            await generate(file, options);
          });
        }

        if (options.removeOrphans) {
          await removeOrphanedFiles(files, options);
        }
      }
    },
  };
};
