import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import { uglify } from "rollup-plugin-uglify";
import json from "@rollup/plugin-json";
import pkg from "./package.json";

export default {
  input: "./src/index.js",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true
    }
  ],
  plugins: [
    json(),
    babel({
      babelrc: false,
      exclude: "node_modules/**",
      presets: [
        [
          "es2015",
          {
            modules: false
          }
        ],
        "stage-0"
      ],
      plugins: ["external-helpers"]
    }),
    resolve(),
    commonjs(),
    uglify()
  ]
};
