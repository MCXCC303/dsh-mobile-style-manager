export const PKG = "dsh-mobile-style-manager"
export const STORAGE_KEY = PKG + ":v1"

export const STYLE_IDS = {
  skin: PKG + ":skin",
  settings: PKG + ":settings",
  user: PKG + ":user",
} as const

export const ATTRS = {
  active: "data-dsh-msm",
  nav: "data-dsh-msm-nav",
  sidebar: "data-dsh-msm-sidebar",
  compactHeader: "data-dsh-msm-compact-header",
  hideSubtitles: "data-dsh-msm-hide-subtitles",
  compactButtons: "data-dsh-msm-compact-buttons",
  safeArea: "data-dsh-msm-safe-area",
  settingsFullscreen: "data-dsh-msm-settings-fullscreen",
  section: "data-dsh-msm-section",
  dialog: "data-dsh-msm-dialog",
} as const

export const coarseQuery = "(pointer: coarse)"

export function mobileQuery(breakpoint: number): string {
  return "(max-width: " + breakpoint + "px)"
}
