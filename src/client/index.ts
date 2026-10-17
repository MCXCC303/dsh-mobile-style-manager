declare global {
  interface Window {
    /** Diagnostics marker proving this bundle materialized and applied. */
    __DSH_MSM_LOADED__?: string
  }
}

export function apply(): void {
  if (typeof window !== "undefined") {
    window.__DSH_MSM_LOADED__ = "0.1.0"
  }
}
