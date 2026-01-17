import type { HeadingNode } from "@/types"

/**
 * Find a node by ID in the tree
 */
export function findNodeById(
	tree: HeadingNode[],
	id: string
): HeadingNode | null {
	for (const node of tree) {
		if (node.id === id) return node
		const found = findNodeById(node.children, id)
		if (found) return found
	}
	return null
}

/**
 * Get all node IDs in the tree
 */
export function getAllNodeIds(tree: HeadingNode[]): string[] {
	const ids: string[] = []

	function traverse(nodes: HeadingNode[]) {
		for (const node of nodes) {
			ids.push(node.id)
			traverse(node.children)
		}
	}

	traverse(tree)
	return ids
}

/**
 * Get all nodes that have children
 */
export function getParentNodeIds(tree: HeadingNode[]): string[] {
	const ids: string[] = []

	function traverse(nodes: HeadingNode[]) {
		for (const node of nodes) {
			if (node.children.length > 0) {
				ids.push(node.id)
			}
			traverse(node.children)
		}
	}

	traverse(tree)
	return ids
}

/**
 * Flatten tree to array
 */
export function flattenTree(tree: HeadingNode[]): HeadingNode[] {
	const result: HeadingNode[] = []

	function traverse(nodes: HeadingNode[]) {
		for (const node of nodes) {
			result.push(node)
			traverse(node.children)
		}
	}

	traverse(tree)
	return result
}
