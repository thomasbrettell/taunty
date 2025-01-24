import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import esbuild from "rollup-plugin-esbuild";
import { preserveShebangs } from "rollup-plugin-preserve-shebangs";
import json from "@rollup/plugin-json";

export default {
  input: "bin.ts",
  output: {
    file: "dist/bin.js",
    format: "esm",
  },
  plugins: [
    preserveShebangs(),
    esbuild(),
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    json(),
  ],
};
