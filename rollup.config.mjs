import { defineConfig } from "rollup";

import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

import typescript from "rollup-plugin-typescript2";

export default defineConfig({
  input: "src/index.ts", // Entry file
  output: ["cjs", "esm"].map((format) => {
    return {
      file: `dist/bundle.${format}.js`,
      inlineDynamicImports: true,
      format,
      sourcemap: true,
    };
  }),
  external: [
    "change-case",
    "get-tsconfig",
    "glob",
    "json-schema-to-typescript",
    "vite",
    "postcss",
    "postcss-modules",
    "sass-embedded",
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),
    json(),
    terser(),
  ],
});
