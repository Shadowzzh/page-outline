import { useScrollStore } from "@/store/scroll-store"
import type { HeadingNode } from "@/types"
import { useEffect, useRef } from "react"
import { TreeNode } from "./tree-node"

// Wait for DOM updates before scrolling
const SCROLL_DELAY = 150

interface FlattenedNode extends HeadingNode {
	depth: number
	parentId: string | null
	ancestorIds: string[] // 所有祖先节点的 ID，用于判断可见性
	isLast: boolean // 是否是同级最后一个节点
	ancestorIsLast: boolean[] // 每层祖先是否是最后一个（用于绘制连接线）
}

interface OutlineTreeProps {
	tree: HeadingNode[]
	scrollContainerRef: React.RefObject<HTMLDivElement | null>
}

function flattenTree(
	nodes: HeadingNode[],
	depth = 0,
	parentId: string | null = null,
	ancestorIds: string[] = [],
	ancestorIsLast: boolean[] = []
): FlattenedNode[] {
	const result: FlattenedNode[] = []

	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i]
		const isLast = i === nodes.length - 1

		result.push({
			...node,
			depth,
			parentId,
			ancestorIds,
			isLast,
			ancestorIsLast,
		})

		if (node.children.length > 0) {
			result.push(
				...flattenTree(
					node.children,
					depth + 1,
					node.id,
					[...ancestorIds, node.id],
					[...ancestorIsLast, isLast]
				)
			)
		}
	}

	return result
}

export function OutlineTree({ tree, scrollContainerRef }: OutlineTreeProps) {
	const activeNodeId = useScrollStore(s => s.activeNodeId)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!activeNodeId || !containerRef.current || !scrollContainerRef.current)
			return

		const timer = setTimeout(() => {
			const element = containerRef.current?.querySelector(
				`[data-node-id="${activeNodeId}"]`
			)
			const scrollContainer = scrollContainerRef.current

			if (element && scrollContainer) {
				const elementRect = element.getBoundingClientRect()
				const containerRect = scrollContainer.getBoundingClientRect()

				const isVisible =
					elementRect.top >= containerRect.top &&
					elementRect.bottom <= containerRect.bottom

				if (!isVisible) {
					// 计算元素相对于滚动容器的位置
					let elementTop = 0
					let currentElement = element as HTMLElement
					while (currentElement && currentElement !== scrollContainer) {
						elementTop += currentElement.offsetTop
						currentElement = currentElement.offsetParent as HTMLElement
					}

					const containerHeight = scrollContainer.clientHeight
					const elementHeight = (element as HTMLElement).clientHeight

					const scrollTop = Math.max(
						0,
						elementTop - containerHeight / 2 + elementHeight / 2
					)

					scrollContainer.scrollTo({
						top: scrollTop,
						behavior: "smooth",
					})
				}
			}
		}, SCROLL_DELAY)

		return () => clearTimeout(timer)
	}, [activeNodeId, scrollContainerRef])

	if (tree.length === 0) {
		return (
			<div className="flex items-center justify-center h-full text-muted-foreground text-sm">
				No headings found
			</div>
		)
	}

	const flattenedNodes = flattenTree(tree)

	return (
		<div ref={containerRef} className="">
			{flattenedNodes.map(node => (
				<TreeNode
					key={node.id}
					node={node}
					depth={node.depth}
					ancestorIds={node.ancestorIds}
					isLast={node.isLast}
					ancestorIsLast={node.ancestorIsLast}
				/>
			))}
		</div>
	)
}
