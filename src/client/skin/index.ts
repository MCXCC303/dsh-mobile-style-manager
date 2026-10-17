import { baseSkin } from "./base.css"
import { compactSkin } from "./compact.css"
import { navigationSkin } from "./navigation.css"
import { buildSettingsCss } from "./settings.css"

export function buildSkin(): string {
  return [baseSkin, compactSkin, navigationSkin].join("\n")
}

export { buildSettingsCss }
