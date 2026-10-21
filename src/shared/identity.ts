export const PKG = "dsh-mobile-style-manager"
export const STORAGE_KEY = PKG + ":v1"

export const STYLE_IDS = {
  skin: PKG + ":skin",
  settings: PKG + ":settings",
  settingsDialog: PKG + ":settings-dialog",
  font: PKG + ":font",
  user: PKG + ":user",
} as const

export const ATTRS = {
  active: "data-dsh-msm",
  nav: "data-dsh-msm-nav",
  drawerScrim: "data-dsh-msm-drawer-scrim",
  compactHeader: "data-dsh-msm-compact-header",
  hideSubtitles: "data-dsh-msm-hide-subtitles",
  compactButtons: "data-dsh-msm-compact-buttons",
  hidePresetDescriptions: "data-dsh-msm-hide-preset-desc",
  denseSettings: "data-dsh-msm-dense-settings",
  hideOwnSubtitles: "data-dsh-msm-hide-own-subtitles",
  hidePluginPageSubtitles: "data-dsh-msm-hide-plugin-subtitles",
  inputRadius: "data-dsh-msm-input-radius",
  inputFontSize: "data-dsh-msm-input-font",
  hideComposerMeta: "data-dsh-msm-hide-composer-meta",
  codeBlockRadius: "data-dsh-msm-code-radius",
  codeBlockPadding: "data-dsh-msm-code-padding",
  codeBlockMargin: "data-dsh-msm-code-margin",
  codeBlockPaddingTop: "data-dsh-msm-code-padding-top",
  codeBlockPaddingBottom: "data-dsh-msm-code-padding-bottom",
  inlineCodeRadius: "data-dsh-msm-inline-code-radius",
  inlineCodePaddingX: "data-dsh-msm-inline-code-pad-x",
  inlineCodePaddingY: "data-dsh-msm-inline-code-pad-y",
  inlineCodeLineHeight: "data-dsh-msm-inline-code-line-height",
  messageRadius: "data-dsh-msm-message-radius",
  messagePadX: "data-dsh-msm-message-pad-x",
  messagePadY: "data-dsh-msm-message-pad-y",
  messageMargin: "data-dsh-msm-message-margin",
  safeArea: "data-dsh-msm-safe-area",
  settingsFullscreen: "data-dsh-msm-settings-fullscreen",
  section: "data-dsh-msm-section",
  dialog: "data-dsh-msm-dialog",
} as const

export const coarseQuery = "(pointer: coarse)"

export function mobileQuery(breakpoint: number): string {
  return "(max-width: " + breakpoint + "px)"
}
