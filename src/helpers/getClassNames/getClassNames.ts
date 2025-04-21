import postcss from "postcss";
import { logError } from "../logError/index";
import * as sass from "sass-embedded";
import { getTsconfig } from "get-tsconfig";
import { resolve, dirname } from "node:path";
import { type ScssTypesPluginOptions } from "types/ScssTypesPluginOptions";
import PostcssModulesPlugin from "postcss-modules";

const getLoadPaths = () => {
  const tsConfig = getTsconfig();

  if (tsConfig?.path) {
    return [resolve(dirname(tsConfig?.path), "src")];
  }

  return [];
};

/** Converts CSS source (string) to an array of camelcased class names */
export const getClassNames = async (
  file: string,
  { localsConvention = "camelCaseOnly" }: Partial<ScssTypesPluginOptions> = {}
) => {
  let output: Record<string, string> = {};

  const data = await sass.compileAsync(file, {
    loadPaths: getLoadPaths(),
  });

  try {
    await postcss([
      PostcssModulesPlugin({
        getJSON: (_, json) => {
          output = json;
        },
        localsConvention,
      }),
    ]).process(data.css, { from: file });

    return Object.keys(output);
  } catch (e) {
    logError(e as Error);
    return undefined;
  }
};
