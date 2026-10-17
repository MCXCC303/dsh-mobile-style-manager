import { createElement } from "react"
import { PKG } from "../../shared/identity"
import { createInteractions } from "../core/interactions"
import { MenuButton } from "../slots/MenuButton"
import type { MsmFeature } from "./registry"

export const navigationFeature: MsmFeature = {
  name: "navigation",
  install(controller, ctx) {
    const HeaderMenu = () => createElement(MenuButton, { controller, placement: "header" })
    const OverlayMenu = () => createElement(MenuButton, { controller, placement: "overlay" })
    const cleanups: (() => void)[] = []

    cleanups.push(ctx.slots.inject("conversation.header.leading", () => {
      let dispose: (() => void) | null = null
      try {
        dispose = ctx.slots.register({ name: "conversation.header.leading" }, HeaderMenu)
        controller.setHeaderMenuAvailable(true)
      } catch (error) {
        controller.reportError("navigation:header", error)
        return () => {}
      }
      return () => {
        dispose?.()
        controller.setHeaderMenuAvailable(false)
      }
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
