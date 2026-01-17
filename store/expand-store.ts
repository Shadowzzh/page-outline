import { getExpandedNodes, setExpandedNodes } from "@/lib/browser/storage"
import { getParentNodeIds } from "@/lib/tree/traverse"
import type { HeadingNode } from "@/types"
import { create } from "zustand"

interface ExpandState {
	expandedNodes: Set<string>
}

interface ExpandActions {
	toggleNode: (nodeId: string) => void
	expandAll: (tree: HeadingNode[]) => void
	collapseAll: () => void
	isExpanded: (nodeId: string) => boolean
	loadExpandedNodes: () => Promise<void>
}

export const useExpandStore = create<ExpandState & ExpandActions>(
	(set, get) => ({
		expandedNodes: new Set(),

		toggleNode: nodeId => {
			const { expandedNodes } = get()
			const newSet = new Set(expandedNodes)

			if (newSet.has(nodeId)) {
				newSet.delete(nodeId)
			} else {
				newSet.add(nodeId)
			}

			set({ expandedNodes: newSet })
			setExpandedNodes(Array.from(newSet))
		},

		expandAll: tree => {
			const parentIds = getParentNodeIds(tree)
			const newSet = new Set(parentIds)
			set({ expandedNodes: newSet })
			setExpandedNodes(Array.from(newSet))
		},

		collapseAll: () => {
			set({ expandedNodes: new Set() })
			setExpandedNodes([])
		},

		isExpanded: nodeId => {
			return get().expandedNodes.has(nodeId)
		},

		loadExpandedNodes: async () => {
			const nodeIds = await getExpandedNodes()
			set({ expandedNodes: new Set(nodeIds) })
		},
	})
)
