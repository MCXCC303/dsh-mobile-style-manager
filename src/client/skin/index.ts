import baseSkin from "./base.css?inline"
import compactSkin from "./compact.css?inline"
import hostTextCss from "./host-text.css?inline"
import navigationSkin from "./navigation.css?inline"
import settingsDialogCss from "./settings-dialog.css?inline"
import settingsUiCss from "./settings-ui.css?inline"
import textCss from "./text.css?inline"

export function buildSkin(): string {
  return [baseSkin, compactSkin, navigationSkin, hostTextCss, textCss].join("\n")
}

export { settingsDialogCss, settingsUiCss }
