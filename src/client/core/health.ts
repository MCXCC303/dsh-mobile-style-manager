export type AnchorName =
  | "frame"
  | "sidebar"
  | "center"
  | "composer"
  | "header"
  | "headerLeading"
  | "sessionRow"

export interface HealthReport {
  anchors: Record<AnchorName, boolean>
  missing: AnchorName[]
  checkedAt: number
}

const SELECTORS: Record<AnchorName, readonly string[]> = {
  frame: [
    'div:has(> div > [data-slot="sidebar"]):has(> div > [data-slot="main"])',
    '[class*="_frame"]',
  ],
  sidebar: ['div:has(> [data-slot="sidebar"])', '[class*="_sidebarCol"]'],
  center: ['div:has(> [data-slot="main"])', '[class*="_centerCol"]'],
  composer: ['div:has(> [data-slot="conversation.composer"])', '[class*="_composerSeat"]'],
  header: ['header[class*="_header"]'],
  headerLeading: ['[data-slot="conversation.header.leading"]'],
  sessionRow: ['[data-row-key^="session:"]'],
}

function findAnchor(selectors: readonly string[]): boolean {
  for (const selector of selectors) {
    try {
      if (document.querySelector(selector) !== null) return true
    } catch {
      // Ignore selector support differences.
    }
  }
  return false
}

export function probeHealth(): HealthReport {
  const anchors = {} as Record<AnchorName, boolean>
  const missing: AnchorName[] = []
  for (const name of Object.keys(SELECTORS) as AnchorName[]) {
    const found = findAnchor(SELECTORS[name])
    anchors[name] = found
    if (!found) missing.push(name)
  }
  return { anchors, missing, checkedAt: Date.now() }
}
