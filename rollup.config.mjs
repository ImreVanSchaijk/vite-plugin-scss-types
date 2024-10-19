import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import { defineConfig } from "rollup";
import del from "rollup-plugin-delete";
import { terser } from "rollup-plugin-terser";
// import copy from "rollup-plugin-copy";

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
    resolve(), // Resolves modules in node_modules
    commonjs(), // Converts CommonJS to ES6
    typescript({
      // Integrates TypeScript with Rollup
      tsconfig: "./tsconfig.json",
    }),
    json(),
    del({ targets: "dist/*" }), // Deletes dist folder before building
    terser(), // Minifies JavaScript
    // copy({ targets: [{ src: "package.json", dest: "dist" }] }), // Copies package.json to dist folder
  ],
});
