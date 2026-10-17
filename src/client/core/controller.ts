import type { HealthReport } from "./health"
import { probeHealth } from "./health"
import { createStore, type Store } from "./store"
import { createStyleLayer } from "./style-layer"

export interface Controller {
  readonly store: Store
  readonly errors: readonly string[]
  addCleanup(cleanup: () => void): void
  refreshHealth(): HealthReport
  reportError(feature: string, error: unknown): void
  dispose(): void
}

export function createController(): Controller {
  const store = createStore()
  const styleLayer = createStyleLayer(store)
  const cleanups: (() => void)[] = []
  const errors: string[] = []
  let disposed = false

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
    dispose,
  }
}
