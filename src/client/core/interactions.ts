import type { Controller } from "./controller"
import { findFrame, isSidebarOpen } from "./layout-bridge"

const SIDEBAR_ACTION_SELECTOR = [
  '[data-row-key^="session:"]',
  '[class*="_newSession"]',
  '[data-slot="sidebar.settings"]',
  '[data-slot="settings.launcher"]',
].join(", ")

export interface Interactions {
  dispose(): void
}

export function createInteractions(controller: Controller): Interactions {
  let installed = false
  let frame: HTMLElement | null = null
  let observer: MutationObserver | null = null
  let frameObserver: MutationObserver | null = null
  let unsubscribeSidebar: (() => void) | null = null
  let bodyOverflow: string | null = null
  let lastOpen = false
  let disposed = false

  const lockBody = (lock: boolean): void => {
    if (lock) {
      if (bodyOverflow === null) bodyOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return
    }
    if (bodyOverflow !== null) {
      document.body.style.overflow = bodyOverflow
      bodyOverflow = null
    }
  }

  const focusMenu = (): void => {
    requestAnimationFrame(() => {
      const menu = document.querySelector<HTMLElement>("[data-dsh-msm-menu]")
        ?? document.querySelector<HTMLElement>('button[class*="_toggle"]')
      menu?.focus()
    })
  }

  const focusSidebar = (): void => {
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('button[class*="_toggle"]')?.focus()
    })
  }

  const close = (): void => {
    if (isSidebarOpen()) controller.toggleSidebar()
  }

  const onFrameClick = (event: MouseEvent): void => {
    const target = event.target instanceof Element ? event.target : null
    if (target === null) return
    if (target === frame) {
      close()
      return
    }
    if (target.closest(SIDEBAR_ACTION_SELECTOR) !== null && isSidebarOpen()) {
      requestAnimationFrame(close)
    }
  }

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || !isSidebarOpen()) return
    event.preventDefault()
    event.stopPropagation()
    close()
    focusMenu()
  }

  const onSidebarChange = (): void => {
    const open = controller.getSidebarOpen()
    if (open === lastOpen) return
    lastOpen = open
    lockBody(open)
    if (open) focusSidebar()
    else focusMenu()
  }

  const stopFrameObserver = (): void => {
    frameObserver?.disconnect()
    frameObserver = null
  }

  // apply() can run before the React frame mounts; keep watching until it exists.
  const watchForFrame = (): void => {
    if (frameObserver !== null || disposed) return
    frameObserver = new MutationObserver(() => {
      if (installed || findFrame() === null) return
      stopFrameObserver()
      sync()
    })
    frameObserver.observe(document.documentElement, { childList: true, subtree: true })
  }

  const install = (): void => {
    if (installed || disposed) return
    const observed = findFrame()
    if (observed === null) {
      watchForFrame()
      return
    }
    stopFrameObserver()
    frame = observed
    installed = true
    observer = new MutationObserver(() => {
      controller.setSidebarOpen(!observed.hasAttribute("data-sidebar-collapsed"))
    })
    observer.observe(observed, { attributes: true, attributeFilter: ["data-sidebar-collapsed"] })
    controller.setSidebarOpen(!observed.hasAttribute("data-sidebar-collapsed"))
    lastOpen = controller.getSidebarOpen()
    lockBody(lastOpen)
    unsubscribeSidebar = controller.subscribeSidebar(onSidebarChange)
    observed.addEventListener("click", onFrameClick, true)
    document.addEventListener("keydown", onKeyDown, true)
  }

  const uninstall = (): void => {
    stopFrameObserver()
    if (!installed) return
    installed = false
    observer?.disconnect()
    observer = null
    unsubscribeSidebar?.()
    unsubscribeSidebar = null
    frame?.removeEventListener("click", onFrameClick, true)
    document.removeEventListener("keydown", onKeyDown, true)
    lockBody(false)
    frame = null
    lastOpen = false
  }

  const sync = (): void => {
    const nav = controller.getNavState()
    const shouldInstall = nav.active && (nav.effective === "drawer" || nav.effective === "topbar")
    if (shouldInstall) install()
    else uninstall()
  }

  const unsubscribeNav = controller.subscribeNav(sync)
  sync()

  return {
    dispose: () => {
      if (disposed) return
      disposed = true
      unsubscribeNav()
      uninstall()
    },
  }
}
