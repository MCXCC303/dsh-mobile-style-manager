import { ATTRS, coarseQuery, mobileQuery } from "../../shared/identity"
import type { NavMode, SettingsV1 } from "../../shared/state"
import type { ClientContext } from "../types"
import type { HealthReport } from "./health"
import { probeHealth } from "./health"
import { isSidebarOpen as readSidebarOpen, toggleSidebar as toggleHostSidebar } from "./layout-bridge"
import { createStore, type Store } from "./store"
import { createStyleLayer } from "./style-layer"

export type EffectiveNavMode = NavMode

export interface NavState {
  readonly selected: NavMode
  readonly effective: EffectiveNavMode
  readonly active: boolean
  readonly topbarAvailable: boolean
  readonly drawerAvailable: boolean
}

export interface Controller {
  readonly store: Store
  readonly errors: readonly string[]
  addCleanup(cleanup: () => void): void
  refreshHealth(): HealthReport
  reportError(feature: string, error: unknown): void
  getNavState(): NavState
  subscribeNav(listener: () => void): () => void
  getSidebarOpen(): boolean
  subscribeSidebar(listener: () => void): () => void
  setSidebarOpen(open: boolean): void
  isSidebarOpen(): boolean
  toggleSidebar(): void
  setTopbarAvailable(value: boolean): void
  setDrawerAvailable(value: boolean): void
  dispose(): void
}

function buildNavState(
  state: SettingsV1,
  media: MediaQueryList,
  coarse: MediaQueryList,
  topbarAvailable: boolean,
  drawerAvailable: boolean,
): NavState {
  const active = state.enabled && media.matches && (state.gate !== "device" || coarse.matches)
  const selected = state.navMode
  const effective: EffectiveNavMode = selected === "topbar"
    ? topbarAvailable ? "topbar" : drawerAvailable ? "drawer" : "rail"
    : selected === "drawer"
      ? drawerAvailable ? "drawer" : "rail"
      : "rail"
  return { selected, effective, active, topbarAvailable, drawerAvailable }
}

function sameNav(left: NavState, right: NavState): boolean {
  return left.selected === right.selected
    && left.effective === right.effective
    && left.active === right.active
    && left.topbarAvailable === right.topbarAvailable
    && left.drawerAvailable === right.drawerAvailable
}

function setValue(name: string, value: string | null): void {
  const root = document.documentElement
  if (value === null) root.removeAttribute(name)
  else root.setAttribute(name, value)
}

export function createController(ctx: ClientContext): Controller {
  const store = createStore()
  const styleLayer = createStyleLayer(store)
  const cleanups: (() => void)[] = []
  const errors: string[] = []
  const navListeners = new Set<() => void>()
  const sidebarListeners = new Set<() => void>()
  let disposed = false
  let topbarSlotAvailable = false
  let drawerAvailable = false
  let sidebarOpen = false

  const initial = store.get()
  let media = window.matchMedia(mobileQuery(initial.breakpoint))
  const coarse = window.matchMedia(coarseQuery)
  let lastBreakpoint = initial.breakpoint
  let navState = buildNavState(initial, media, coarse, topbarSlotAvailable, drawerAvailable)

  const notifyNav = (): void => {
    for (const listener of [...navListeners]) listener()
  }

  const notifySidebar = (): void => {
    for (const listener of [...sidebarListeners]) listener()
  }

  const syncNav = (): void => {
    const state = store.get()
    const next = buildNavState(state, media, coarse, topbarSlotAvailable, drawerAvailable)
    setValue(ATTRS.nav, next.active ? next.effective : null)
    if (!sameNav(navState, next)) {
      navState = next
      notifyNav()
    }
  }

  const onMediaChange = (): void => {
    if (!disposed) syncNav()
  }

  const unsubscribe = store.subscribe((state) => {
    if (state.breakpoint !== lastBreakpoint) {
      media.removeEventListener("change", onMediaChange)
      media = window.matchMedia(mobileQuery(state.breakpoint))
      media.addEventListener("change", onMediaChange)
      lastBreakpoint = state.breakpoint
    }
    syncNav()
  })

  media.addEventListener("change", onMediaChange)
  coarse.addEventListener("change", onMediaChange)
  syncNav()

  const setTopbarAvailable = (value: boolean): void => {
    if (topbarSlotAvailable === value) return
    topbarSlotAvailable = value
    syncNav()
  }

  const setDrawerAvailable = (value: boolean): void => {
    if (drawerAvailable === value) return
    drawerAvailable = value
    syncNav()
  }

  const setSidebarOpen = (open: boolean): void => {
    if (sidebarOpen === open) return
    sidebarOpen = open
    notifySidebar()
  }

  const dispose = (): void => {
    if (disposed) return
    disposed = true
    for (const cleanup of cleanups.splice(0).reverse()) {
      try {
        cleanup()
      } catch {
        // A feature cleanup must not prevent the rest from running.
      }
    }
    unsubscribe()
    media.removeEventListener("change", onMediaChange)
    coarse.removeEventListener("change", onMediaChange)
    setValue(ATTRS.nav, null)
    navListeners.clear()
    sidebarListeners.clear()
    styleLayer.dispose()
    store.dispose()
  }

  return {
    store,
    errors,
    addCleanup: (cleanup) => {
      if (disposed) {
        try {
          cleanup()
        } catch {
          // Ignore cleanup failures after disposal.
        }
        return
      }
      cleanups.push(cleanup)
    },
    refreshHealth: () => probeHealth(),
    reportError: (feature, error) => {
      const message = error instanceof Error ? error.message : String(error)
      errors.push(feature + ": " + message)
      console.error("dsh-mobile-style-manager: feature failed", feature, error)
    },
    getNavState: () => navState,
    subscribeNav: (listener) => {
      navListeners.add(listener)
      return () => navListeners.delete(listener)
    },
    getSidebarOpen: () => sidebarOpen,
    subscribeSidebar: (listener) => {
      sidebarListeners.add(listener)
      return () => sidebarListeners.delete(listener)
    },
    setSidebarOpen,
    isSidebarOpen: () => readSidebarOpen(),
    toggleSidebar: () => toggleHostSidebar(ctx),
    setTopbarAvailable,
    setDrawerAvailable,
    dispose,
  }
}
