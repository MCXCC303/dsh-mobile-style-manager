import { defineConfig } from "tsdown"

/** Must equal the package name: the boot row id is the package name. */
const ID = "dsh-mobile-style-manager"

/** The only module-table requests this bundle may make. */
const EXTERNALS = ["react", "react/jsx-runtime"]

export default defineConfig({
  entry: { client: "src/client/index.ts" },
  outDir: "lib",
  format: "cjs",
  platform: "browser",
  target: "es2022",
  dts: false,
  sourcemap: true,
  clean: false,
  deps: {
    neverBundle: [...EXTERNALS],
    alwaysBundle: (id) => !EXTERNALS.includes(id),
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  outputOptions: {
    entryFileNames: "client.js",
    banner: "window.__ModuleLoader__.load({ id: " + JSON.stringify(ID) + ", factory: (require) => {",
    footer: "return module.exports; } });",
    intro: "var module = { exports: {} }; var exports = module.exports;",
  },
})
