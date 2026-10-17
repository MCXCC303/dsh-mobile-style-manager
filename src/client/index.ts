import { createElement, type ReactElement } from "react"
import type { ClientContext } from "./types"

export const inject = ["slots"]

const PKG = "dsh-mobile-style-manager"
const MOBILE_QUERY = "(max-width: 768px)"

declare global {
  interface Window {
    /** Diagnostics marker proving this bundle materialized and applied. */
    __DSH_MSM_LOADED__?: string
  }
}

function Section(_props: { close: () => void }): ReactElement {
  return createElement("div", { "data-dsh-msm-section": "" }, "移动端样式")
}

export function apply(ctx: ClientContext): void {
  window.__DSH_MSM_LOADED__ = "0.1.0"

  const media = window.matchMedia(MOBILE_QUERY)
  const sync = (): void => {
    document.documentElement.toggleAttribute("data-dsh-msm", media.matches)
  }
  media.addEventListener("change", sync)
  sync()

  const style = document.createElement("style")
  style.id = PKG + ":smoke"
  style.dataset.plugin = PKG
  style.textContent = `@media ${MOBILE_QUERY} { html[data-dsh-msm] { --dsh-msm-smoke: 1; } }`
  document.head.append(style)

  ctx.effect(() => () => {
    media.removeEventListener("change", sync)
    document.documentElement.removeAttribute("data-dsh-msm")
    style.remove()
  }, PKG + ": smoke style layer")

  ctx.slots.inject("settings.section", () =>
    ctx.slots.register({
      name: "settings.section",
      id: PKG,
      order: 60,
      label: () => "移动端样式",
      registrant: PKG,
    }, Section),
  )
}
