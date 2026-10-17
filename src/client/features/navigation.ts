import { createElement } from "react"
import { PKG } from "../../shared/identity"
import { createInteractions } from "../core/interactions"
import { MenuButton } from "../slots/MenuButton"
import type { MsmFeature } from "./registry"

export const navigationFeature: MsmFeature = {
  name: "navigation",
  install(controller, ctx) {
    const OverlayMenu = () => createElement(MenuButton, { controller })
    const cleanups: (() => void)[] = []

    // The slot is the version probe: 0.1.7+ declares it, and topbar reuses the
    // host sidebar rail instead of rendering a second header control.
    cleanups.push(ctx.slots.inject("conversation.header.leading", () => {
      controller.setTopbarAvailable(true)
      return () => controller.setTopbarAvailable(false)
    }))

    cleanups.push(ctx.slots.inject("shell.overlay", () => {
      let dispose: (() => void) | null = null
      try {
        dispose = ctx.slots.register({ name: "shell.overlay", id: PKG + ":navigation", order: 50 }, OverlayMenu)
        controller.setDrawerAvailable(true)
      } catch (error) {
        controller.reportError("navigation:overlay", error)
        return () => {}
      }
      return () => {
        dispose?.()
        controller.setDrawerAvailable(false)
      }
    }))

    const interactions = createInteractions(controller)
    cleanups.push(interactions.dispose)

    return () => {
      for (const cleanup of cleanups.splice(0).reverse()) cleanup()
    }
  },
}
