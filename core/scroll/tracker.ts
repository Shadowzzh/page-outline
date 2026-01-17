import {
	createHeadingObserver,
	disconnectObserver,
	observeElements,
} from "@/lib/browser/observer"
import { flattenTree } from "@/lib/tree/traverse"
import type { HeadingNode } from "@/types"

export type ActiveNodeCallback = (nodeId: string | null) => void

/**
 * Track scroll position and determine active heading
 */
export class ScrollTracker {
	private observer: IntersectionObserver | null = null
	private visibleNodes: Set<string> = new Set()
	private nodeOrder: string[] = []
	private callback: ActiveNodeCallback

	constructor(callback: ActiveNodeCallback) {
		this.callback = callback
	}

	/**
	 * Start tracking headings in the tree
	 */
	start(tree: HeadingNode[]): void {
		this.stop()

		const flatNodes = flattenTree(tree)
		this.nodeOrder = flatNodes.map(n => n.id)

		const elements = flatNodes.map(n => n.element)

		this.observer = createHeadingObserver(entries => {
			this.handleIntersection(entries, flatNodes)
		})

		observeElements(this.observer, elements)
	}

	/**
	 * Stop tracking
	 */
	stop(): void {
		if (this.observer) {
			disconnectObserver(this.observer)
			this.observer = null
		}
		this.visibleNodes.clear()
		this.nodeOrder = []
	}

	/**
	 * Handle intersection changes
	 */
	private handleIntersection(
		entries: IntersectionObserverEntry[],
		nodes: HeadingNode[]
	): void {
		const nodeMap = new Map(nodes.map(n => [n.element, n.id]))

		for (const entry of entries) {
			const nodeId = nodeMap.get(entry.target as HTMLElement)
			if (!nodeId) continue

			if (entry.isIntersecting) {
				this.visibleNodes.add(nodeId)
			} else {
				this.visibleNodes.delete(nodeId)
			}
		}

		this.updateActiveNode()
	}

	/**
	 * Determine and emit the active node (first visible in document order)
	 */
	private updateActiveNode(): void {
		const activeId =
			this.nodeOrder.find(id => this.visibleNodes.has(id)) || null
		this.callback(activeId)
	}
}
