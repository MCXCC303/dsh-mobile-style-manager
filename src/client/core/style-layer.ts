import { ATTRS, PKG, STYLE_IDS, coarseQuery, mobileQuery } from "../../shared/identity"
import { gateQuery, scanCss } from "../../shared/css"
import { DRAWER_WIDTH_MAX, INPUT_FONT_SIZE, INPUT_RADIUS, type SettingsV1 } from "../../shared/state"
import { buildSkin, settingsDialogCss, settingsUiCss } from "../skin"
import type { Store } from "./store"

export interface StyleLayer {
  dispose(): void
}

const ROOT_ATTRS = [
  ATTRS.active,
  ATTRS.compactHeader,
  ATTRS.hideSubtitles,
  ATTRS.compactButtons,
  ATTRS.hidePresetDescriptions,
  ATTRS.denseSettings,
  ATTRS.hideOwnSubtitles,
  ATTRS.hidePluginPageSubtitles,
  ATTRS.inputRadius,
  ATTRS.inputFontSize,
  ATTRS.hideComposerMeta,
  ATTRS.safeArea,
  ATTRS.settingsFullscreen,
  ATTRS.drawerScrim,
] as const

const ROOT_VARS = ["--msm-nav-size", "--msm-sidebar-width"] as const

/** Matches every viewport. */
const ALWAYS = "all"
/** Applies to no viewport; the sheet stays parsed without matching. */
const NEVER = "not all"

function createStyle(id: string, css: string, media: string): HTMLStyleElement {
  const style = document.createElement("style")
  style.id = id
  style.dataset.plugin = PKG
  style.media = media
  style.textContent = css
  return style
}

function setFlag(root: HTMLElement, name: string, on: boolean): void {
  if (on) root.setAttribute(name, "")
  else root.removeAttribute(name)
}

function setVar(root: HTMLElement, name: string, value: string | null): void {
  if (value === null) root.style.removeProperty(name)
  else root.style.setProperty(name, value)
}

function setMedia(style: HTMLStyleElement, media: string): void {
  if (style.media !== media) style.media = media
}

export function createStyleLayer(store: Store): StyleLayer {
  const root = document.documentElement
  const initial = store.get()
  const skin = createStyle(STYLE_IDS.skin, buildSkin(), NEVER)
  const settings = createStyle(STYLE_IDS.settings, settingsUiCss, ALWAYS)
  const dialog = createStyle(STYLE_IDS.settingsDialog, settingsDialogCss, NEVER)
  const user = createStyle(STYLE_IDS.user, "", NEVER)
  document.head.append(skin, settings, dialog, user)

  let media = window.matchMedia(mobileQuery(initial.breakpoint))
  const coarse = window.matchMedia(coarseQuery)
  let lastBreakpoint = initial.breakpoint
  let disposed = false

  const isMobile = (state: SettingsV1): boolean =>
    media.matches && (state.gate !== "device" || coarse.matches)

  const syncRoot = (state: SettingsV1): void => {
    const mobile = isMobile(state)
    setFlag(root, ATTRS.active, state.enabled && mobile)
    setFlag(root, ATTRS.compactHeader, state.enabled && mobile && state.compactHeader)
    setFlag(root, ATTRS.hideSubtitles, state.enabled && mobile && state.hideSubtitles)
    setFlag(root, ATTRS.compactButtons, state.enabled && mobile && state.compactButtons)
    setFlag(root, ATTRS.hidePresetDescriptions, state.enabled && mobile && state.hidePresetDescriptions)
    setFlag(root, ATTRS.denseSettings, state.enabled && mobile && state.denseSettings)
    setFlag(root, ATTRS.hideOwnSubtitles, state.enabled && mobile && state.hideOwnSubtitles)
    setFlag(root, ATTRS.hidePluginPageSubtitles, state.enabled && mobile && state.hidePluginPageSubtitles)
    setFlag(root, ATTRS.inputRadius, state.enabled && mobile && state.inputRadius !== INPUT_RADIUS.defaultValue)
    setFlag(root, ATTRS.inputFontSize, state.enabled && mobile && state.inputFontSize !== INPUT_FONT_SIZE.defaultValue)
    setFlag(root, ATTRS.hideComposerMeta, state.enabled && mobile && state.hideComposerMeta)
    setFlag(root, ATTRS.safeArea, state.enabled && mobile && state.safeArea)
    root.style.setProperty("--msm-input-radius", state.inputRadius + "px")
    root.style.setProperty("--msm-input-font-size", state.inputFontSize + "px")
    setFlag(root, ATTRS.settingsFullscreen, media.matches && state.settingsFullscreen)
    setFlag(root, ATTRS.drawerScrim, state.enabled && mobile && state.drawerWidth < DRAWER_WIDTH_MAX)
    setVar(root, "--msm-nav-size", state.enabled && mobile ? state.navSize + "px" : null)
    setVar(root, "--msm-sidebar-width", state.enabled && mobile ? state.drawerWidth + "%" : null)
  }

  const render = (state: SettingsV1): void => {
    syncRoot(state)
    setMedia(skin, state.enabled && state.useBuiltinSkin
      ? gateQuery(state.breakpoint, state.gate)
      : NEVER)
    setMedia(dialog, mobileQuery(state.breakpoint))
    const css = state.customCss.trim()
    const accepted = state.enabled && css !== "" && scanCss(css).ok
    const text = accepted ? css : ""
    if (user.textContent !== text) user.textContent = text
    setMedia(user, accepted
      ? state.rawCss ? ALWAYS : gateQuery(state.breakpoint, state.gate)
      : NEVER)
  }

  const onMediaChange = (): void => {
    if (!disposed) render(store.get())
  }

  const unsubscribe = store.subscribe((state) => {
    if (state.breakpoint !== lastBreakpoint) {
      media.removeEventListener("change", onMediaChange)
      media = window.matchMedia(mobileQuery(state.breakpoint))
      media.addEventListener("change", onMediaChange)
      lastBreakpoint = state.breakpoint
    }
    render(state)
  })

  media.addEventListener("change", onMediaChange)
  coarse.addEventListener("change", onMediaChange)
  render(initial)

  return {
    dispose: () => {
      if (disposed) return
      disposed = true
      unsubscribe()
      media.removeEventListener("change", onMediaChange)
      coarse.removeEventListener("change", onMediaChange)
      for (const name of ROOT_ATTRS) root.removeAttribute(name)
      root.style.removeProperty("--msm-input-radius")
      root.style.removeProperty("--msm-input-font-size")
      for (const name of ROOT_VARS) root.style.removeProperty(name)
      skin.remove()
      settings.remove()
      dialog.remove()
      user.remove()
    },
  }
}
