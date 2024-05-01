import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import nodePolyfill from "rollup-plugin-polyfill-node";

export default [
  // debug
  {
    input: "dist/main/main.js",
    external: ["sax"],
    plugins: [
      commonjs({
        sourceMap: true,
      }),
      nodeResolve({
        preferBuiltins: true,
        browser: true,
      }),
      nodePolyfill(),
    ],
    output: [{
      file: "dist/imsc.debug.js",
      format: "umd",
      name: "imsc",
      sourcemap: true,
      globals: {
        sax: "sax",
      },
    }, {
      file: "dist/imsc.min.js",
      format: "umd",
      name: "imsc",
      sourcemap: true,
      globals: {
        sax: "sax",
      },
      plugins: [terser()],
    }],
  },

  // all
  {
    input: "dist/main/main.js",
    plugins: [
      commonjs({
        sourceMap: true,
      }),
      nodeResolve({
        preferBuiltins: true,
        browser: true,
      }),
      nodePolyfill(),
    ],
    output: [{
      file: "dist/imsc.all.debug.js",
      format: "umd",
      name: "imsc",
      sourcemap: true,
    }, {
      file: "dist/imsc.all.min.js",
      format: "umd",
      name: "imsc",
      sourcemap: true,
      plugins: [terser()],
    }],
  },
];
