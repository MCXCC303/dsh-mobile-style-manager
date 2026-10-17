import { PKG } from "../shared/identity"
import { createController } from "./core/controller"
import { installFeatures } from "./features/registry"
import { settingsFeature } from "./features/settings"
import type { ClientContext } from "./types"

export const inject = ["slots"]

declare global {
  interface Window {
    /** Diagnostics marker proving this bundle materialized and applied. */
    __DSH_MSM_LOADED__?: string
  }
}

export function apply(ctx: ClientContext): void {
  window.__DSH_MSM_LOADED__ = "0.1.0"
  const controller = createController()
  ctx.effect(() => () => controller.dispose(), PKG + ": lifetime")
  installFeatures([settingsFeature], controller, ctx)
}
