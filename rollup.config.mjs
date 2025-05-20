import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
// import terser from "@rollup/plugin-terser";
import { defineConfig } from "rollup";
import { dts } from "rollup-plugin-dts";

const sharedConfig = {
  input: "src/index.ts",
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript({
      tsconfig: "./tsconfig.json",
      useTsconfigDeclarationDir: true,
      clean: true,
    }),
    // terser(),
  ],
  external: [
    "vite",
    "postcss",
    "sass-embedded",
    "get-tsconfig",
    "glob",
    "json-schema-to-typescript",
    "postcss-modules",
  ],
};

export default defineConfig([
  {
    ...sharedConfig,
    output: {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
    },
  },
  {
    ...sharedConfig,
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
    },
  },
  {
    input: "dist-types/index.d.ts",
    output: {
      file: "dist/index.d.ts",
      format: "esm",
    },
    plugins: [dts()],
  },
]);
