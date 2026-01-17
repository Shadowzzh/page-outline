import type { HeadingNode } from "@/types"

/**
 * Deep clone a tree structure
 */
export function cloneTree(tree: HeadingNode[]): HeadingNode[] {
	return tree.map(node => ({
		...node,
		children: cloneTree(node.children),
	}))
}

/**
 * Filter tree by maximum heading level
 */
export function filterTreeByLevel(
	tree: HeadingNode[],
	maxLevel: number
): HeadingNode[] {
	function filterNode(node: HeadingNode): HeadingNode | null {
		if (node.level > maxLevel) return null

		const filteredChildren = node.children
			.map(filterNode)
			.filter((n): n is HeadingNode => n !== null)

		return {
			...node,
			children: filteredChildren,
		}
	}

	return tree.map(filterNode).filter((n): n is HeadingNode => n !== null)
}
