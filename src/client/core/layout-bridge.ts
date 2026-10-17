import type { ClientContext, LayoutService } from "../types"

const FRAME_SELECTOR = '[class*="_frame"]'
const SIDEBAR_SELECTOR = '[class*="_sidebarCol"]'
const TOGGLE_SELECTOR = 'button[class*="_toggle"]'

export function findFrame(): HTMLElement | null {
  return document.querySelector<HTMLElement>(FRAME_SELECTOR)
}

export function findSidebar(): HTMLElement | null {
  try {
    const sidebar = document.querySelector<HTMLElement>('div:has(> [data-slot="sidebar"])')
    if (sidebar !== null) return sidebar
  } catch {
    // Ignore selector support differences.
  }
  return document.querySelector<HTMLElement>(SIDEBAR_SELECTOR)
}

export function isSidebarOpen(): boolean {
  const frame = findFrame()
  return frame !== null && !frame.hasAttribute("data-sidebar-collapsed")
}

export function toggleSidebar(ctx: ClientContext): void {
  const layout = ctx.get<LayoutService>("layout")
  if (typeof layout?.toggleSidebar === "function") {
    layout.toggleSidebar()
    return
  }
  document.querySelector<HTMLButtonElement>(TOGGLE_SELECTOR)?.click()
}
