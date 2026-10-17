import { useSyncExternalStore, type ReactElement } from "react"
import type { Controller } from "../core/controller"

interface MenuButtonProps {
  controller: Controller
}

export function MenuButton({ controller }: MenuButtonProps): ReactElement | null {
  const nav = useSyncExternalStore(controller.subscribeNav, controller.getNavState, controller.getNavState)
  const open = useSyncExternalStore(controller.subscribeSidebar, controller.getSidebarOpen, controller.getSidebarOpen)

  if (!nav.active || nav.effective !== "drawer" || open) return null

  return (
    <div className="msm-menu-anchor msm-menu-overlay">
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
