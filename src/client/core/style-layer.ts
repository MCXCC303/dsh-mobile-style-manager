import { ATTRS, PKG, STYLE_IDS, coarseQuery, mobileQuery } from "../../shared/identity"
import { gateQuery, scanCss } from "../../shared/css"
import { CODE_BLOCK_MARGIN, CODE_BLOCK_PADDING, CODE_BLOCK_PADDING_BOTTOM, CODE_BLOCK_PADDING_TOP, CODE_BLOCK_RADIUS, DRAWER_WIDTH_MAX, INLINE_CODE_PADDING_X, INLINE_CODE_PADDING_Y, INLINE_CODE_RADIUS, INPUT_FONT_SIZE, INPUT_RADIUS, type SettingsV1 } from "../../shared/state"
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
  ATTRS.codeBlockRadius,
  ATTRS.codeBlockPadding,
  ATTRS.codeBlockMargin,
  ATTRS.codeBlockPaddingTop,
  ATTRS.codeBlockPaddingBottom,
  ATTRS.inlineCodeRadius,
  ATTRS.inlineCodePaddingX,
  ATTRS.inlineCodePaddingY,
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
  const font = createStyle(STYLE_IDS.font, "", ALWAYS)
  document.head.append(skin, settings, dialog, user, font)

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
    setFlag(root, ATTRS.codeBlockRadius, state.enabled && mobile && state.codeBlockRadius !== CODE_BLOCK_RADIUS.defaultValue)
    setFlag(root, ATTRS.codeBlockPadding, state.enabled && mobile && state.codeBlockPadding !== CODE_BLOCK_PADDING.defaultValue)
    setFlag(root, ATTRS.codeBlockMargin, state.enabled && mobile && state.codeBlockMargin !== CODE_BLOCK_MARGIN.defaultValue)
    setFlag(root, ATTRS.codeBlockPaddingTop, state.enabled && mobile && state.codeBlockPaddingTop !== CODE_BLOCK_PADDING_TOP.defaultValue)
    setFlag(root, ATTRS.codeBlockPaddingBottom, state.enabled && mobile && state.codeBlockPaddingBottom !== CODE_BLOCK_PADDING_BOTTOM.defaultValue)
    setFlag(root, ATTRS.inlineCodeRadius, state.enabled && mobile && state.inlineCodeRadius !== INLINE_CODE_RADIUS.defaultValue)
    setFlag(root, ATTRS.inlineCodePaddingX, state.enabled && mobile && state.inlineCodePaddingX !== INLINE_CODE_PADDING_X.defaultValue)
    setFlag(root, ATTRS.inlineCodePaddingY, state.enabled && mobile && state.inlineCodePaddingY !== INLINE_CODE_PADDING_Y.defaultValue)
    setFlag(root, ATTRS.safeArea, state.enabled && mobile && state.safeArea)
    root.style.setProperty("--msm-input-radius", state.inputRadius + "px")
    root.style.setProperty("--msm-input-font-size", state.inputFontSize + "px")
    root.style.setProperty("--msm-code-block-radius", state.codeBlockRadius + "px")
    root.style.setProperty("--msm-code-block-padding", state.codeBlockPadding + "px")
    root.style.setProperty("--msm-code-block-margin", state.codeBlockMargin + "px")
    root.style.setProperty("--msm-code-block-padding-top", state.codeBlockPaddingTop + "px")
    root.style.setProperty("--msm-code-block-padding-bottom", state.codeBlockPaddingBottom + "px")
    root.style.setProperty("--msm-inline-code-radius", state.inlineCodeRadius + "px")
    root.style.setProperty("--msm-inline-code-padding-x", state.inlineCodePaddingX + "px")
    root.style.setProperty("--msm-inline-code-padding-y", state.inlineCodePaddingY + "px")
    setFlag(root, ATTRS.settingsFullscreen, media.matches && state.settingsFullscreen)
    setFlag(root, ATTRS.drawerScrim, state.enabled && mobile && state.drawerWidth < DRAWER_WIDTH_MAX)
    setVar(root, "--msm-nav-size", state.enabled && mobile ? state.navSize + "px" : null)
    setVar(root, "--msm-sidebar-width", state.enabled && mobile ? state.drawerWidth + "%" : null)
  }

  // An !important declaration in a style sheet outranks the host's inline value on body.
  const syncBodyFont = (state: SettingsV1): void => {
    const active = state.enabled && isMobile(state) && state.overrideBodyFont
    const rule = active ? "body { --dsh-content-font-size: " + state.bodyFontSize + "px !important }" : ""
    if (font.textContent !== rule) font.textContent = rule
  }
  const render = (state: SettingsV1): void => {
    syncRoot(state)
    syncBodyFont(state)
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
      font.remove()
      for (const name of ROOT_ATTRS) root.removeAttribute(name)
      root.style.removeProperty("--msm-input-radius")
      root.style.removeProperty("--msm-input-font-size")
      root.style.removeProperty("--msm-code-block-radius")
      root.style.removeProperty("--msm-code-block-padding")
      root.style.removeProperty("--msm-code-block-margin")
      root.style.removeProperty("--msm-code-block-padding-top")
      root.style.removeProperty("--msm-code-block-padding-bottom")
      root.style.removeProperty("--msm-inline-code-radius")
      root.style.removeProperty("--msm-inline-code-padding-x")
      root.style.removeProperty("--msm-inline-code-padding-y")
      for (const name of ROOT_VARS) root.style.removeProperty(name)
      skin.remove()
      settings.remove()
      dialog.remove()
      user.remove()
    },
  }
}