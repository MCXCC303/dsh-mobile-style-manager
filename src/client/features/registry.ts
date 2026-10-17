import type { Controller } from "../core/controller"
import type { ClientContext } from "../types"

export interface MsmFeature {
  readonly name: string
  install(controller: Controller, ctx: ClientContext): (() => void) | void
}

export function installFeatures(
  features: readonly MsmFeature[],
  controller: Controller,
  ctx: ClientContext,
): void {
  for (const feature of features) {
    try {
      const cleanup = feature.install(controller, ctx)
      if (typeof cleanup === "function") controller.addCleanup(cleanup)
    } catch (error) {
      controller.reportError(feature.name, error)
    }
  }
}
