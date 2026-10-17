#!/usr/bin/env node
/**
 * Validate the package surface M0 depends on: manifest, Loader patch, host half,
 * and the client closure-factory contract. Runs after a build and before pack.
 */
import { readFileSync, existsSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"))
const failures = []

const check = (condition, message) => {
  if (!condition) failures.push(message)
}

check(pkg.name === "dsh-mobile-style-manager", "package name must match the boot row id")
check(pkg.type === "module", "package must be ESM")
check(pkg.exports?.["./client"] === "./lib/client.js", "exports[\"./client\"] must point at lib/client.js")
check(pkg.dsh?.client?.platform === "web", "dsh.client.platform must be web")
check(typeof pkg.dsh?.bundle?.patch === "string", "dsh.bundle.patch must be declared")
check(pkg.files?.includes("lib"), "files must include lib")

const patchPath = resolve(root, pkg.dsh.bundle.patch)
check(existsSync(patchPath), "declared cordis patch file is missing")
if (existsSync(patchPath)) {
  const patch = readFileSync(patchPath, "utf8")
  check(/id:\s*ui-mobile-style-manager/.test(patch), "patch must insert ui-mobile-style-manager")
  check(/name:\s*dsh-mobile-style-manager/.test(patch), "patch must reference the package name")
}

const hostPath = resolve(root, "lib/index.js")
check(existsSync(hostPath), "lib/index.js is missing; run the build first")
if (existsSync(hostPath)) {
  const host = await import(pathToFileURL(hostPath).href)
  check(host.name === pkg.name, "host half must export the package name")
  check(typeof host.apply === "function", "host half must export apply")
}

const clientPath = resolve(root, "lib/client.js")
check(existsSync(clientPath), "lib/client.js is missing; run the build first")
if (existsSync(clientPath)) {
  const client = readFileSync(clientPath, "utf8")
  const clientCode = client.replace(/\n?\/\/# sourceMappingURL=.*\s*$/, "").trimEnd()
  check(clientCode.startsWith("window.__ModuleLoader__.load({"), "client bundle must register through __ModuleLoader__.load")
  check(clientCode.includes('id: "dsh-mobile-style-manager"'), "client bundle id must equal the package name")
  check(clientCode.includes("factory: (require) => {"), "client bundle must be a closure factory")
  check(/return module\.exports;\s*\}\s*\}\);\s*$/.test(clientCode), "client bundle must return module.exports")
  check(clientCode.includes("exports.apply = apply;"), "client bundle must export apply")

  const requests = [...clientCode.matchAll(/require\((["'])([^"']+)\1\)/g)].map(match => match[2])
  const allowed = new Set(["react", "react/jsx-runtime"])
  for (const request of new Set(requests)) {
    check(allowed.has(request), "client bundle requests an unapproved module: " + request)
    check(!request.startsWith("@deepseek-ai/"), "client bundle must not request @deepseek-ai modules at runtime")
  }
}

if (failures.length > 0) {
  console.error("package check failed:")
  for (const failure of failures) console.error("- " + failure)
  process.exitCode = 1
} else {
  console.log("package check passed: " + pkg.name + "@" + pkg.version)
}
