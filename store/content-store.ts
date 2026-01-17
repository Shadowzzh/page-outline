import { TreeBuilder } from "@/core/tree/builder"
import { findHeadings } from "@/lib/browser/dom"
import {
	getZoomLevel,
	setZoomLevel as saveZoomLevel,
} from "@/lib/browser/storage"
import { extractContent } from "@/lib/defuddle/client"
import { cloneTree, filterTreeByLevel } from "@/lib/tree/filter"
import type { HeadingNode } from "@/types"
import { create } from "zustand"

interface ContentState {
	title: string
	tree: HeadingNode[]
	rawTree: HeadingNode[]
	zoomLevel: number
	isLoading: boolean
	error: string | null
}

interface ContentActions {
	extract: () => Promise<void>
	refresh: () => Promise<void>
	setZoomLevel: (level: number) => void
	loadZoomLevel: () => Promise<void>
}

export const useContentStore = create<ContentState & ContentActions>(
	(set, get) => ({
		title: "",
		tree: [],
		rawTree: [],
		zoomLevel: 6,
		isLoading: false,
		error: null,

		extract: async () => {
			set({ isLoading: true, error: null })

			try {
				// Try Defuddle first, fallback to document headings
				let headings: HTMLElement[]
				let title = document.title

				try {
					const result = extractContent(document)
					title = result.title || document.title
					// For now, just use document headings
					headings = findHeadings(document)
				} catch {
					headings = findHeadings(document)
				}

				const builder = new TreeBuilder()
				const rawTree = builder.build(headings)
				const { zoomLevel } = get()
				const tree = filterTreeByLevel(cloneTree(rawTree), zoomLevel)

				set({ title, tree, rawTree, isLoading: false })
			} catch (error) {
				set({
					error: error instanceof Error ? error.message : "Extraction failed",
					isLoading: false,
				})
			}
		},

		refresh: async () => {
			await get().extract()
		},

		setZoomLevel: (level: number) => {
			const clampedLevel = Math.max(1, Math.min(6, level))
			const { rawTree } = get()
			const tree = filterTreeByLevel(cloneTree(rawTree), clampedLevel)
			set({ zoomLevel: clampedLevel, tree })
			saveZoomLevel(clampedLevel)
		},

		loadZoomLevel: async () => {
			const level = await getZoomLevel()
			const { rawTree } = get()
			if (rawTree.length > 0) {
				const tree = filterTreeByLevel(cloneTree(rawTree), level)
				set({ zoomLevel: level, tree })
			} else {
				set({ zoomLevel: level })
			}
		},
	})
)
