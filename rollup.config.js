import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-css-only";

const debug =process.env.DEBUG;
const production = !process.env.ROLLUP_WATCH;
const chrome_extension=process.env.CHROME_EXTENSION;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require("child_process").spawn(
        "npm",
        ["run", "start", "--", "--dev"],
        {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        }
      );

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}

export default [
  {
    input: "src/main.js",
    output: {
      sourcemap: !production || debug,
      format: "iife",
      name: "app",
      file: "dist/bundle.js",
      globals:{'hanziyin':'hanziyin'}
    },
    plugins: [
      svelte({
        compilerOptions: {dev: (!production && !chrome_extension )|| debug},
      }),
      css({ output: "bundle.css" }),
      resolve({ browser: true, dedupe: ["svelte"]}),
      commonjs(),
      !production && !chrome_extension && !debug && serve(),
      !production && !chrome_extension && !debug && livereload("dist"),
      production && !debug && terser(),
    ],
    watch: {
      clearScreen: false,
      exclude: 'node_modules/**'
    },
  },
];
