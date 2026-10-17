import { useSyncExternalStore, type ReactElement } from "react"
import type { Controller } from "../core/controller"

interface MenuButtonProps {
  controller: Controller
  placement: "header" | "overlay"
}

export function MenuButton({ controller, placement }: MenuButtonProps): ReactElement | null {
  const nav = useSyncExternalStore(controller.subscribeNav, controller.getNavState, controller.getNavState)
  const open = useSyncExternalStore(controller.subscribeSidebar, controller.getSidebarOpen, controller.getSidebarOpen)

  if (!nav.active) return null
  if (placement === "header" && nav.effective !== "topbar") return null
  if (placement === "overlay" && (nav.effective !== "drawer" || open)) return null

  return (
    <div className={"msm-menu-anchor msm-menu-" + placement}>
      <button
        type="button"
        className="msm-menu-button"
        data-dsh-msm-menu=""
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          controller.toggleSidebar()
        }}
      >
        <span className="msm-menu-bars" aria-hidden="true" />
      </button>
    </div>
  )
}
