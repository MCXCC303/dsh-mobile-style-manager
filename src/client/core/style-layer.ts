import { ATTRS, PKG, STYLE_IDS, coarseQuery, mobileQuery } from "../../shared/identity"
import { scanCss, wrapCss } from "../../shared/css"
import type { SettingsV1 } from "../../shared/state"
import { buildSettingsCss, buildSkin } from "../skin"
import type { Store } from "./store"

export interface StyleLayer {
  dispose(): void
}

const ROOT_ATTRS = [
  ATTRS.active,
  ATTRS.nav,
  ATTRS.sidebar,
  ATTRS.compactHeader,
  ATTRS.hideSubtitles,
  ATTRS.compactButtons,
  ATTRS.safeArea,
  ATTRS.settingsFullscreen,
] as const

function createStyle(id: string): HTMLStyleElement {
  const style = document.createElement("style")
  style.id = id
  style.dataset.plugin = PKG
  return style
}

function setFlag(root: HTMLElement, name: string, on: boolean): void {
  if (on) root.setAttribute(name, "")
  else root.removeAttribute(name)
}

function setValue(root: HTMLElement, name: string, value: string | null): void {
  if (value === null) root.removeAttribute(name)
  else root.setAttribute(name, value)
}

export function createStyleLayer(store: Store): StyleLayer {
  const root = document.documentElement
  const skin = createStyle(STYLE_IDS.skin)
  const settings = createStyle(STYLE_IDS.settings)
  const user = createStyle(STYLE_IDS.user)
  document.head.append(skin, settings, user)

  const initial = store.get()
  let media = window.matchMedia(mobileQuery(initial.breakpoint))
  const coarse = window.matchMedia(coarseQuery)
  let lastBreakpoint = initial.breakpoint
  let disposed = false

  const isMobile = (state: SettingsV1): boolean =>
    media.matches && (state.gate !== "device" || coarse.matches)

  const syncRoot = (state: SettingsV1): void => {
    const mobile = isMobile(state)
    setFlag(root, ATTRS.active, state.enabled && mobile)
    setValue(root, ATTRS.nav, mobile ? state.navMode : null)
    setValue(root, ATTRS.sidebar, mobile ? state.sidebarWidth : null)
    setFlag(root, ATTRS.compactHeader, state.enabled && mobile && state.compactHeader)
    setFlag(root, ATTRS.hideSubtitles, state.enabled && mobile && state.hideSubtitles)
    setFlag(root, ATTRS.compactButtons, state.enabled && mobile && state.compactButtons)
    setFlag(root, ATTRS.safeArea, state.enabled && mobile && state.safeArea)
    setFlag(root, ATTRS.settingsFullscreen, media.matches && state.settingsFullscreen)
  }

  const render = (state: SettingsV1): void => {
    syncRoot(state)
    skin.textContent = state.enabled && state.useBuiltinSkin
      ? wrapCss(buildSkin(), state.breakpoint, state.gate)
      : ""
    settings.textContent = buildSettingsCss(state.breakpoint)
    const css = state.customCss.trim()
    user.textContent = state.enabled && css !== "" && scanCss(css).ok
      ? wrapCss(css, state.breakpoint, state.gate, state.rawCss)
      : ""
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
      skin.remove()
      settings.remove()
      user.remove()
    },
  }
}
