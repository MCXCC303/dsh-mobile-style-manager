export const SETTINGS_VERSION = 1

export const INPUT_RADIUS = { min: 8, max: 32, defaultValue: 28 } as const
export const INPUT_FONT_SIZE = { min: 12, max: 18, defaultValue: 14 } as const
export const MESSAGE_RADIUS = { min: 8, max: 28, defaultValue: 20 } as const
export const MESSAGE_PAD_X = { min: 8, max: 24, defaultValue: 16 } as const
export const MESSAGE_PAD_Y = { min: 4, max: 20, defaultValue: 10 } as const
export const MESSAGE_MARGIN = { min: 0, max: 24, defaultValue: 0 } as const

// Radius and padding mirror the host's fenced code block. Margin is additive,
// so its default of 0 keeps the host spacing instead of replacing it.
export const CODE_BLOCK_RADIUS = { min: 0, max: 24, defaultValue: 16 } as const
export const CODE_BLOCK_PADDING = { min: 0, max: 24, defaultValue: 22 } as const
export const CODE_BLOCK_MARGIN = { min: 0, max: 24, defaultValue: 0 } as const
export const CODE_BLOCK_PADDING_TOP = { min: 0, max: 24, defaultValue: 6 } as const
export const CODE_BLOCK_PADDING_BOTTOM = { min: 0, max: 24, defaultValue: 20 } as const
export const INLINE_CODE_RADIUS = { min: 0, max: 16, defaultValue: 8 } as const
export const INLINE_CODE_PADDING_X = { min: 0, max: 12, defaultValue: 5 } as const
export const INLINE_CODE_PADDING_Y = { min: 0, max: 8, defaultValue: 0 } as const
export const INLINE_CODE_LINE_HEIGHT = { min: 1, max: 2, defaultValue: 1.55 } as const

// Each spacing control owns one gap and starts at the host's own value, so the
// plugin reproduces the host rhythm until the reader moves a control.
export const BLOCK_SPACING = { min: 0, max: 32, defaultValue: 16 } as const
export const HEADING_SPACING = { min: 0, max: 48, defaultValue: 16 } as const
export const LIST_ITEM_SPACING = { min: 0, max: 24, defaultValue: 6 } as const
export const NESTED_LIST_SPACING = { min: 0, max: 24, defaultValue: 4 } as const
export const DIVIDER_SPACING = { min: 0, max: 64, defaultValue: 32 } as const

export type Gate = "viewport" | "device"
export type NavMode = "rail" | "drawer" | "topbar"
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
  navSize: number
  drawerWidth: number
  settingsFullscreen: boolean
  compactHeader: boolean
  hideSubtitles: boolean
  compactButtons: boolean
  hidePresetDescriptions: boolean
  denseSettings: boolean
  hideOwnSubtitles: boolean
  hidePluginPageSubtitles: boolean
  inputRadius: number
  inputFontSize: number
  hideComposerMeta: boolean
  codeBlockRadius: number
  codeBlockPadding: number
  codeBlockMargin: number
  codeBlockPaddingTop: number
  codeBlockPaddingBottom: number
  inlineCodeRadius: number
  inlineCodePaddingX: number
  inlineCodePaddingY: number
  inlineCodeLineHeight: number
  messageRadius: number
  messagePadX: number
  messagePadY: number
  messageMargin: number
  bodyFontSize: number
  overrideBodyFont: boolean
  lineHeightScale: number
  blockSpacing: number
  headingSpacing: number
  listItemSpacing: number
  nestedListSpacing: number
  dividerSpacing: number
  safeArea: boolean
  customCss: string
  rawCss: boolean
  preview: PreviewSettings
  updatedAt: number
}

const GATES: readonly Gate[] = ["viewport", "device"]
const NAV_MODES: readonly NavMode[] = ["rail", "drawer", "topbar"]
const DEVICE_IDS: readonly string[] = ["390x844", "375x667", "412x915", "768x1024"]

export const NAV_SIZE_MIN = 40
export const NAV_SIZE_MAX = 72
export const NAV_SIZE_DEFAULT = 56
export const DRAWER_WIDTH_MIN = 60
export const DRAWER_WIDTH_MAX = 100

export function createDefaultSettings(): SettingsV1 {
  return {
    version: SETTINGS_VERSION,
    enabled: true,
    useBuiltinSkin: true,
    breakpoint: 768,
    gate: "viewport",
    navMode: "rail",
    navSize: NAV_SIZE_DEFAULT,
    drawerWidth: DRAWER_WIDTH_MAX,
    settingsFullscreen: true,
    compactHeader: false,
    hideSubtitles: false,
    compactButtons: false,
    hidePresetDescriptions: false,
    denseSettings: false,
    hideOwnSubtitles: false,
    hidePluginPageSubtitles: false,
    inputRadius: INPUT_RADIUS.defaultValue,
    inputFontSize: INPUT_FONT_SIZE.defaultValue,
    hideComposerMeta: false,
    codeBlockRadius: CODE_BLOCK_RADIUS.defaultValue,
    codeBlockPadding: CODE_BLOCK_PADDING.defaultValue,
    codeBlockMargin: CODE_BLOCK_MARGIN.defaultValue,
    codeBlockPaddingTop: CODE_BLOCK_PADDING_TOP.defaultValue,
    codeBlockPaddingBottom: CODE_BLOCK_PADDING_BOTTOM.defaultValue,
    inlineCodeRadius: INLINE_CODE_RADIUS.defaultValue,
    inlineCodePaddingX: INLINE_CODE_PADDING_X.defaultValue,
    inlineCodePaddingY: INLINE_CODE_PADDING_Y.defaultValue,
    inlineCodeLineHeight: INLINE_CODE_LINE_HEIGHT.defaultValue,
    messageRadius: MESSAGE_RADIUS.defaultValue,
    messagePadX: MESSAGE_PAD_X.defaultValue,
    messagePadY: MESSAGE_PAD_Y.defaultValue,
    messageMargin: MESSAGE_MARGIN.defaultValue,
    bodyFontSize: 14,
    overrideBodyFont: false,
    lineHeightScale: 1,
    blockSpacing: BLOCK_SPACING.defaultValue,
    headingSpacing: HEADING_SPACING.defaultValue,
    listItemSpacing: LIST_ITEM_SPACING.defaultValue,
    nestedListSpacing: NESTED_LIST_SPACING.defaultValue,
    dividerSpacing: DIVIDER_SPACING.defaultValue,
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

function readFloat(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback
  return Math.round(Math.min(max, Math.max(min, value)) * 100) / 100
}

function clampRound(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)))
}

function readNavSize(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return NAV_SIZE_DEFAULT
  return clampRound(value, NAV_SIZE_MIN, NAV_SIZE_MAX)
}

function readDrawerWidth(value: unknown, legacySidebarWidth: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampRound(value, DRAWER_WIDTH_MIN, DRAWER_WIDTH_MAX)
  }
  // States written before the width slider stored the drawer width as "full" | "86vw".
  return legacySidebarWidth === "86vw" ? 86 : DRAWER_WIDTH_MAX
}

function readBreakpoint(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 768
  return Math.min(1024, Math.max(480, Math.round(value)))
}

function readClamped(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.round(value)))
}

function readFontSize(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 14
  return Math.min(20, Math.max(10, Math.round(value)))
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
    navSize: readNavSize(value.navSize),
    drawerWidth: readDrawerWidth(value.drawerWidth, value.sidebarWidth),
    settingsFullscreen: readBoolean(value.settingsFullscreen, defaults.settingsFullscreen),
    compactHeader: readBoolean(value.compactHeader, defaults.compactHeader),
    hideSubtitles: readBoolean(value.hideSubtitles, defaults.hideSubtitles),
    compactButtons: readBoolean(value.compactButtons, defaults.compactButtons),
    hidePresetDescriptions: readBoolean(value.hidePresetDescriptions, defaults.hidePresetDescriptions),
    denseSettings: readBoolean(value.denseSettings, defaults.denseSettings),
    hideOwnSubtitles: readBoolean(value.hideOwnSubtitles, defaults.hideOwnSubtitles),
    hidePluginPageSubtitles: readBoolean(value.hidePluginPageSubtitles, defaults.hidePluginPageSubtitles),
    inputRadius: readClamped(value.inputRadius, defaults.inputRadius, INPUT_RADIUS.min, INPUT_RADIUS.max),
    inputFontSize: readClamped(value.inputFontSize, defaults.inputFontSize, INPUT_FONT_SIZE.min, INPUT_FONT_SIZE.max),
    hideComposerMeta: readBoolean(value.hideComposerMeta, defaults.hideComposerMeta),
    codeBlockRadius: readClamped(value.codeBlockRadius, defaults.codeBlockRadius, CODE_BLOCK_RADIUS.min, CODE_BLOCK_RADIUS.max),
    codeBlockPadding: readClamped(value.codeBlockPadding, defaults.codeBlockPadding, CODE_BLOCK_PADDING.min, CODE_BLOCK_PADDING.max),
    codeBlockMargin: readClamped(value.codeBlockMargin, defaults.codeBlockMargin, CODE_BLOCK_MARGIN.min, CODE_BLOCK_MARGIN.max),
    codeBlockPaddingTop: readClamped(value.codeBlockPaddingTop, defaults.codeBlockPaddingTop, CODE_BLOCK_PADDING_TOP.min, CODE_BLOCK_PADDING_TOP.max),
    codeBlockPaddingBottom: readClamped(value.codeBlockPaddingBottom, defaults.codeBlockPaddingBottom, CODE_BLOCK_PADDING_BOTTOM.min, CODE_BLOCK_PADDING_BOTTOM.max),
    inlineCodeRadius: readClamped(value.inlineCodeRadius, defaults.inlineCodeRadius, INLINE_CODE_RADIUS.min, INLINE_CODE_RADIUS.max),
    inlineCodePaddingX: readClamped(value.inlineCodePaddingX, defaults.inlineCodePaddingX, INLINE_CODE_PADDING_X.min, INLINE_CODE_PADDING_X.max),
    inlineCodePaddingY: readClamped(value.inlineCodePaddingY, defaults.inlineCodePaddingY, INLINE_CODE_PADDING_Y.min, INLINE_CODE_PADDING_Y.max),
    inlineCodeLineHeight: readClamped(value.inlineCodeLineHeight, defaults.inlineCodeLineHeight, INLINE_CODE_LINE_HEIGHT.min, INLINE_CODE_LINE_HEIGHT.max),
    messageRadius: readClamped(value.messageRadius, defaults.messageRadius, MESSAGE_RADIUS.min, MESSAGE_RADIUS.max),
    messagePadX: readClamped(value.messagePadX, defaults.messagePadX, MESSAGE_PAD_X.min, MESSAGE_PAD_X.max),
    messagePadY: readClamped(value.messagePadY, defaults.messagePadY, MESSAGE_PAD_Y.min, MESSAGE_PAD_Y.max),
    messageMargin: readClamped(value.messageMargin, defaults.messageMargin, MESSAGE_MARGIN.min, MESSAGE_MARGIN.max),
    bodyFontSize: readFontSize(value.bodyFontSize),
    overrideBodyFont: readBoolean(value.overrideBodyFont, defaults.overrideBodyFont),
    lineHeightScale: readFloat(value.lineHeightScale, defaults.lineHeightScale, 0.8, 1.6),
    blockSpacing: readClamped(value.blockSpacing, defaults.blockSpacing, BLOCK_SPACING.min, BLOCK_SPACING.max),
    headingSpacing: readClamped(value.headingSpacing, defaults.headingSpacing, HEADING_SPACING.min, HEADING_SPACING.max),
    listItemSpacing: readClamped(value.listItemSpacing, defaults.listItemSpacing, LIST_ITEM_SPACING.min, LIST_ITEM_SPACING.max),
    nestedListSpacing: readClamped(value.nestedListSpacing, defaults.nestedListSpacing, NESTED_LIST_SPACING.min, NESTED_LIST_SPACING.max),
    dividerSpacing: readClamped(value.dividerSpacing, defaults.dividerSpacing, DIVIDER_SPACING.min, DIVIDER_SPACING.max),
    safeArea: readBoolean(value.safeArea, defaults.safeArea),
    customCss: readString(value.customCss, defaults.customCss),
    rawCss: readBoolean(value.rawCss, defaults.rawCss),
    preview: readPreview(value.preview, defaults.preview),
    updatedAt: typeof value.updatedAt === "number" && Number.isFinite(value.updatedAt)
      ? Math.max(0, value.updatedAt)
      : defaults.updatedAt,
  }
}
