import { generateId, getHeadingLevel } from "@/lib/browser/dom"
import type { HeadingNode } from "@/types"

/**
 * Build a hierarchical tree from a flat list of heading elements
 */
export class TreeBuilder {
	/**
	 * Build tree from heading elements
	 */
	build(headings: HTMLElement[]): HeadingNode[] {
		const nodes = this.createNodes(headings)
		return this.buildHierarchy(nodes)
	}

	/**
	 * Create flat list of nodes from elements
	 */
	private createNodes(headings: HTMLElement[]): HeadingNode[] {
		return headings.map((el, index) => ({
			id: generateId(el, index),
			text: el.textContent?.trim() || "",
			level: getHeadingLevel(el),
			element: el,
			children: [],
		}))
	}

	/**
	 * Build hierarchical structure using a stack algorithm
	 */
	private buildHierarchy(nodes: HeadingNode[]): HeadingNode[] {
		if (nodes.length === 0) return []

		const root: HeadingNode[] = []
		const stack: HeadingNode[] = []

		for (const node of nodes) {
			// Pop nodes from stack that are not parents of current node
			while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
				stack.pop()
			}

			if (stack.length === 0) {
				// No parent, add to root
				root.push(node)
			} else {
				// Add as child of top of stack
				stack[stack.length - 1].children.push(node)
			}

			stack.push(node)
		}

		return root
	}
}
