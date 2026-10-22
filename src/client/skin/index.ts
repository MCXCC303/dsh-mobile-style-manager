import baseSkin from "./base.css?inline"
import codeCss from "./code.css?inline"
import compactSkin from "./compact.css?inline"
import hostTextCss from "./host-text.css?inline"
import inputCss from "./input.css?inline"
import messageCss from "./message.css?inline"
import navigationSkin from "./navigation.css?inline"
import rhythmCss from "./rhythm.css?inline"
import settingsDialogCss from "./settings-dialog.css?inline"
import settingsUiCss from "./settings-ui.css?inline"

export function buildSkin(): string {
  return [baseSkin, compactSkin, navigationSkin, hostTextCss, inputCss, messageCss, codeCss].join("\n")
}

export { rhythmCss, settingsDialogCss, settingsUiCss }
