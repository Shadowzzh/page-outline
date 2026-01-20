import { STORAGE_DEFAULTS, STORAGE_KEYS } from "@/config"
import type { PanelState } from "@/types"

/**
 * Get panel state from storage
 */
export async function getPanelState(): Promise<PanelState | null> {
	try {
		const result = await browser.storage.local.get(STORAGE_KEYS.PANEL_STATE)
		const state = result[STORAGE_KEYS.PANEL_STATE] as PanelState | undefined
		return state || null
	} catch {
		return null
	}
}

/**
 * Save panel state to storage
 */
export async function setPanelState(state: PanelState): Promise<void> {
	await browser.storage.local.set({ [STORAGE_KEYS.PANEL_STATE]: state })
}

/**
 * Get theme from storage
 */
export async function getTheme(): Promise<typeof STORAGE_DEFAULTS.THEME> {
	try {
		const result = await browser.storage.local.get(STORAGE_KEYS.THEME)
		const theme = result[STORAGE_KEYS.THEME] as typeof STORAGE_DEFAULTS.THEME | undefined
		return theme ?? STORAGE_DEFAULTS.THEME
	} catch {
		return STORAGE_DEFAULTS.THEME
	}
}

/**
 * Save theme to storage
 */
export async function setTheme(theme: typeof STORAGE_DEFAULTS.THEME): Promise<void> {
	await browser.storage.local.set({ [STORAGE_KEYS.THEME]: theme })
}

/**
 * Get expanded node IDs from storage
 */
export async function getExpandedNodes(): Promise<string[]> {
	try {
		const result = await browser.storage.local.get(STORAGE_KEYS.EXPANDED_NODES)
		const nodes = result[STORAGE_KEYS.EXPANDED_NODES] as string[] | undefined
		return nodes || []
	} catch {
		return []
	}
}

/**
 * Save expanded node IDs to storage
 */
export async function setExpandedNodes(nodeIds: string[]): Promise<void> {
	await browser.storage.local.set({ [STORAGE_KEYS.EXPANDED_NODES]: nodeIds })
}

/**
 * Get zoom level from storage
 */
export async function getZoomLevel(): Promise<number> {
	try {
		const result = await browser.storage.local.get(STORAGE_KEYS.ZOOM_LEVEL)
		const level = result[STORAGE_KEYS.ZOOM_LEVEL] as number | undefined
		return level ?? STORAGE_DEFAULTS.ZOOM_LEVEL
	} catch {
		return STORAGE_DEFAULTS.ZOOM_LEVEL
	}
}

/**
 * Save zoom level to storage
 */
export async function setZoomLevel(level: number): Promise<void> {
	await browser.storage.local.set({ [STORAGE_KEYS.ZOOM_LEVEL]: level })
}
