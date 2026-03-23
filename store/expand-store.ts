import { getExpandedNodes, setExpandedNodes } from "@/lib/browser/storage"
import { getParentNodeIds } from "@/lib/tree/traverse"
import type { HeadingNode } from "@/types"
import { create } from "zustand"

interface ExpandState {
	expandedNodes: Set<string>
	expandLevel: number
}

interface ExpandActions {
	toggleNode: (nodeId: string) => void
	expandAll: (tree: HeadingNode[]) => void
	collapseAll: () => void
	isExpanded: (nodeId: string) => boolean
	loadExpandedNodes: () => Promise<void>
	expandToLevel: (tree: HeadingNode[], level: number) => void
	increaseLevel: (tree: HeadingNode[]) => void
	decreaseLevel: (tree: HeadingNode[]) => void
	getMaxLevel: (tree: HeadingNode[]) => number
}

export const useExpandStore = create<ExpandState & ExpandActions>(
	(set, get) => ({
		expandedNodes: new Set(),
		expandLevel: 2,

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

		expandToLevel: (tree, level) => {
			const nodesToExpand: string[] = []

			// Expand all parent nodes at or below the specified level
			function traverse(nodes: HeadingNode[]) {
				for (const node of nodes) {
					if (node.children.length > 0 && node.level <= level) {
						nodesToExpand.push(node.id)
					}
					traverse(node.children)
				}
			}

			traverse(tree)
			const newSet = new Set(nodesToExpand)
			set({ expandedNodes: newSet, expandLevel: level })
			setExpandedNodes(Array.from(newSet))
		},

		increaseLevel: tree => {
			const { expandLevel } = get()
			const maxLevel = get().getMaxLevel(tree)
			const newLevel = Math.min(expandLevel + 1, maxLevel)
			get().expandToLevel(tree, newLevel)
		},

		decreaseLevel: tree => {
			const { expandLevel } = get()
			const newLevel = Math.max(expandLevel - 1, 0)
			get().expandToLevel(tree, newLevel)
		},

		getMaxLevel: tree => {
			let max = 0

			function traverse(nodes: HeadingNode[]) {
				for (const node of nodes) {
					max = Math.max(max, node.level)
					traverse(node.children)
				}
			}

			traverse(tree)
			return max
		},
	})
)
