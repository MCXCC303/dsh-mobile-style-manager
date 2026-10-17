export const SETTINGS_VERSION = 1

export type Gate = "viewport" | "device"
export type NavMode = "rail" | "drawer" | "topbar"
export type SidebarWidth = "full" | "86vw"
export type PreviewScale = "fit" | number

export interface PreviewSettings {
  enabled: boolean
  deviceId: string
  scale: PreviewScale
}

export interface SettingsV1 {
  version: 1
  enabled: boolean
  useBuiltinSkin: boolean
  breakpoint: number
  gate: Gate
  navMode: NavMode
  sidebarWidth: SidebarWidth
  settingsFullscreen: boolean
  compactHeader: boolean
  hideSubtitles: boolean
  compactButtons: boolean
  hidePresetDescriptions: boolean
  denseSettings: boolean
  hideOwnSubtitles: boolean
  hidePluginPageSubtitles: boolean
  bodyFontSize: number
  safeArea: boolean
  customCss: string
  rawCss: boolean
  preview: PreviewSettings
  updatedAt: number
}

const GATES: readonly Gate[] = ["viewport", "device"]
const NAV_MODES: readonly NavMode[] = ["rail", "drawer", "topbar"]
const SIDEBAR_WIDTHS: readonly SidebarWidth[] = ["full", "86vw"]
const DEVICE_IDS: readonly string[] = ["390x844", "375x667", "412x915", "768x1024"]

export function createDefaultSettings(): SettingsV1 {
  return {
    version: SETTINGS_VERSION,
    enabled: true,
    useBuiltinSkin: true,
    breakpoint: 768,
    gate: "viewport",
    navMode: "rail",
    sidebarWidth: "full",
    settingsFullscreen: true,
    compactHeader: false,
    hideSubtitles: false,
    compactButtons: false,
    hidePresetDescriptions: false,
    denseSettings: false,
    hideOwnSubtitles: false,
    hidePluginPageSubtitles: false,
    bodyFontSize: 14,
    safeArea: true,
    customCss: "",
    rawCss: false,
    preview: {
      enabled: false,
      deviceId: "390x844",
      scale: "fit",
    },
    updatedAt: 0,
  }
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback
}

function readEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? value as T : fallback
}

function readBreakpoint(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 768
  return Math.min(1024, Math.max(480, Math.round(value)))
}

function readFontSize(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 14
  return Math.min(20, Math.max(12, Math.round(value)))
}

function readPreview(value: unknown, fallback: PreviewSettings): PreviewSettings {
  if (!isRecord(value)) return { ...fallback }
  const scale: PreviewScale = value.scale === "fit"
    ? "fit"
    : typeof value.scale === "number" && Number.isFinite(value.scale)
      ? Math.min(1, Math.max(0.25, value.scale))
      : fallback.scale
  return {
    enabled: readBoolean(value.enabled, fallback.enabled),
    deviceId: readEnum(value.deviceId, DEVICE_IDS, fallback.deviceId),
    scale,
  }
}

export function normalizeState(value: unknown): SettingsV1 {
  if (!isRecord(value)) return createDefaultSettings()
  if (value.version !== undefined && value.version !== SETTINGS_VERSION) return createDefaultSettings()
  const defaults = createDefaultSettings()
  return {
    version: SETTINGS_VERSION,
    enabled: readBoolean(value.enabled, defaults.enabled),
    useBuiltinSkin: readBoolean(value.useBuiltinSkin, defaults.useBuiltinSkin),
    breakpoint: readBreakpoint(value.breakpoint),
    gate: readEnum(value.gate, GATES, defaults.gate),
    navMode: readEnum(value.navMode, NAV_MODES, defaults.navMode),
    sidebarWidth: readEnum(value.sidebarWidth, SIDEBAR_WIDTHS, defaults.sidebarWidth),
    settingsFullscreen: readBoolean(value.settingsFullscreen, defaults.settingsFullscreen),
    compactHeader: readBoolean(value.compactHeader, defaults.compactHeader),
    hideSubtitles: readBoolean(value.hideSubtitles, defaults.hideSubtitles),
    compactButtons: readBoolean(value.compactButtons, defaults.compactButtons),
    hidePresetDescriptions: readBoolean(value.hidePresetDescriptions, defaults.hidePresetDescriptions),
    denseSettings: readBoolean(value.denseSettings, defaults.denseSettings),
    hideOwnSubtitles: readBoolean(value.hideOwnSubtitles, defaults.hideOwnSubtitles),
    hidePluginPageSubtitles: readBoolean(value.hidePluginPageSubtitles, defaults.hidePluginPageSubtitles),
    bodyFontSize: readFontSize(value.bodyFontSize),
    safeArea: readBoolean(value.safeArea, defaults.safeArea),
    customCss: readString(value.customCss, defaults.customCss),
    rawCss: readBoolean(value.rawCss, defaults.rawCss),
    preview: readPreview(value.preview, defaults.preview),
    updatedAt: typeof value.updatedAt === "number" && Number.isFinite(value.updatedAt)
      ? Math.max(0, value.updatedAt)
      : defaults.updatedAt,
  }
}
