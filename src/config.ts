import crypto from "node:crypto";
import path from "node:path";

import { type CSSOptions } from "vite";

const getClassName = (name: string, filename: string, css?: string) => {
  const component = path
    .basename(filename)
    .replace("_", "")
    .replace(".module.scss", "");

  if (css === undefined) {
    return `${component}__${name}`;
  }

  const hash = crypto
    .createHash("md5")
    .update(JSON.stringify({ component, name, css }));

  return `${component}__${name}--${hash.digest("hex").slice(0, 5)}`;
};

export const getViteCssModulesOptions = (
  isProduction: boolean,
  classNameLength: number = 5
) => {
  return {
    localsConvention: "camelCaseOnly",
    generateScopedName:
      isProduction === false
        ? "[name]__[local]--[hash:base64:5]"
        : (name: string, filename: string, css: string) => {
            const hash = crypto
              .createHash("md5")
              .update(getClassName(name, filename, css))
              .digest("hex");

            const i = hash.search(/[a-z]/i);

            return hash.slice(i, i + classNameLength);
          },
  } as const satisfies CSSOptions["modules"];
};
