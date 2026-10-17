import { STORAGE_KEY } from "../../shared/identity"
import { SETTINGS_VERSION, createDefaultSettings, normalizeState, type SettingsV1 } from "../../shared/state"

export interface Store {
  get(): SettingsV1
  set(patch: Partial<SettingsV1>): void
  subscribe(listener: (state: SettingsV1) => void): () => void
  reset(): void
  exportJSON(): string
  importJSON(text: string): { ok: boolean; error?: string }
  isPersistent(): boolean
  dispose(): void
}

interface StoreOptions {
  persist?: boolean
}

const WRITE_DELAY = 150

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function canUseStorage(): boolean {
  try {
    const probe = "__dsh_msm_probe__"
    window.localStorage.setItem(probe, "1")
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

function readState(persist: boolean): SettingsV1 {
  if (!persist) return createDefaultSettings()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return createDefaultSettings()
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || parsed.version !== SETTINGS_VERSION) return createDefaultSettings()
    return normalizeState(parsed)
  } catch {
    return createDefaultSettings()
  }
}

export function createStore(options: StoreOptions = {}): Store {
  let persist = options.persist !== false && canUseStorage()
  let state = readState(persist)
  let writeTimer: ReturnType<typeof setTimeout> | undefined
  let disposed = false
  const listeners = new Set<(state: SettingsV1) => void>()

  const notify = (): void => {
    for (const listener of [...listeners]) listener(state)
  }

  const write = (): void => {
    if (!persist) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      persist = false
    }
  }

  const flush = (): void => {
    if (writeTimer === undefined) return
    clearTimeout(writeTimer)
    writeTimer = undefined
    write()
  }

  const schedule = (): void => {
    if (!persist) return
    if (writeTimer !== undefined) clearTimeout(writeTimer)
    writeTimer = setTimeout(() => {
      writeTimer = undefined
      write()
    }, WRITE_DELAY)
  }

  const commit = (next: SettingsV1): void => {
    state = next
    schedule()
    notify()
  }

  const onStorage = (event: StorageEvent): void => {
    if (!persist || event.key !== STORAGE_KEY || event.newValue === null) return
    try {
      const parsed: unknown = JSON.parse(event.newValue)
      if (!isRecord(parsed) || parsed.version !== SETTINGS_VERSION) return
      state = normalizeState(parsed)
      notify()
    } catch {
      // Ignore malformed writes from other documents.
    }
  }

  const onPageHide = (): void => {
    flush()
  }

  window.addEventListener("storage", onStorage)
  window.addEventListener("pagehide", onPageHide)

  return {
    get: () => state,
    set: (patch) => {
      if (disposed) return
      commit(normalizeState({
        ...state,
        ...patch,
        version: SETTINGS_VERSION,
        updatedAt: Date.now(),
      }))
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    reset: () => {
      if (disposed) return
      commit({ ...createDefaultSettings(), updatedAt: Date.now() })
    },
    exportJSON: () => JSON.stringify(state, null, 2),
    importJSON: (text) => {
      if (disposed) return { ok: false, error: "The store is closed." }
      let parsed: unknown
      try {
        parsed = JSON.parse(text)
      } catch {
        return { ok: false, error: "The file is not valid JSON." }
      }
      if (!isRecord(parsed)) return { ok: false, error: "Expected a JSON object." }
      if (parsed.version !== undefined && parsed.version !== SETTINGS_VERSION) {
        return { ok: false, error: "Unsupported settings version." }
      }
      commit({ ...normalizeState(parsed), updatedAt: Date.now() })
      return { ok: true }
    },
    isPersistent: () => persist,
    dispose: () => {
      if (disposed) return
      disposed = true
      flush()
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("pagehide", onPageHide)
      listeners.clear()
    },
  }
}
