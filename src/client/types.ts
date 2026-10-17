import type { ReactElement } from "react"

export interface SlotRegistration {
  name: string
  id?: string
  order?: number
  priority?: number
  label?: string | (() => string)
  registrant?: string
}

export interface SlotRegistry {
  inject(name: string, callback: () => () => void): () => void
  register<P extends object>(options: SlotRegistration, component: (props: P) => ReactElement): () => void
}

export interface LayoutService {
  toggleSidebar?: () => void
}

export interface ClientContext {
  slots: SlotRegistry
  effect(callback: () => (() => void) | void, label?: string): () => void
  get<T>(name: string): T | undefined
}
