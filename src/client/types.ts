import type { ReactElement } from "react"

export interface SlotRegistration {
  name: string
  id: string
  order?: number
  label?: string | (() => string)
  registrant?: string
}

export interface SlotRegistry {
  inject(name: string, callback: () => () => void): () => void
  register(
    options: SlotRegistration,
    component: (props: { close: () => void }) => ReactElement,
  ): () => void
}

export interface ClientContext {
  slots: SlotRegistry
  effect(callback: () => (() => void) | void, label?: string): () => void
}
