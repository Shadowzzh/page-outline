import type { Position, Size, Theme } from "@/types"

/** Panel 默认配置 */
export const PANEL_CONFIG = {
	/** 默认面板位置 */
	DEFAULT_POSITION: { x: 20, y: 100 } as Position,

	/** 默认面板尺寸 */
	DEFAULT_SIZE: { width: 280, height: 480 } as Size,
} as const

/** Storage 默认值 */
export const STORAGE_DEFAULTS = {
	/** 默认缩放级别 */
	ZOOM_LEVEL: 6,

	/** 默认主题 */
	THEME: "system" as Theme,
} as const

/** Storage keys */
export const STORAGE_KEYS = {
	PANEL_STATE: "page-outline-panel",
	THEME: "page-outline-theme",
	EXPANDED_NODES: "page-outline-expanded",
	ZOOM_LEVEL: "page-outline-zoom",
} as const

/** 统一导出 */
export const CONFIG = {
	PANEL: PANEL_CONFIG,
	STORAGE_DEFAULTS,
	STORAGE_KEYS,
} as const
