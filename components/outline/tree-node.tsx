import { scrollToElement } from "@/lib/browser/dom"
import { cn } from "@/lib/utils"
import { useExpandStore } from "@/store/expand-store"
import { useScrollStore } from "@/store/scroll-store"
import type { HeadingNode } from "@/types"
import { ChevronRight } from "lucide-react"

interface TreeNodeProps {
	node: HeadingNode
	depth: number
	ancestorIds: string[]  // 所有祖先节点的 ID
}

export function TreeNode({ node, depth, ancestorIds }: TreeNodeProps) {
	const activeNodeId = useScrollStore(s => s.activeNodeId)
	// 直接订阅 expandedNodes，确保状态变化时重新渲染
	const expandedNodes = useExpandStore(s => s.expandedNodes)
	const toggleNode = useExpandStore(s => s.toggleNode)

	const isActive = activeNodeId === node.id
	const hasChildren = node.children.length > 0
	const expanded = expandedNodes.has(node.id)

	// 检查所有祖先是否都已展开
	const isVisible = ancestorIds.every(id => expandedNodes.has(id))

	if (!isVisible) {
		return null
	}

	const handleClick = () => {
		scrollToElement(node.element)
	}

	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation()
		toggleNode(node.id)
	}

	return (
		<div>
			<div
				className={cn(
					"gap-1 px-2 h-9 rounded cursor-pointer text-sm transition-colors",
					"hover:bg-accent",
					"flex items-center  ",
					isActive && "bg-accent font-medium"
				)}
				style={{ paddingLeft: `${depth * 12 + 8}px` }}
				onClick={handleClick}
				onKeyDown={e => {
					if (e.key === "Enter" || e.key === " ") {
						handleClick()
					}
				}}
			>
				{hasChildren ? (
					<button
						type="button"
						className="p-0.5 hover:bg-muted rounded"
						onClick={handleToggle}
					>
						<ChevronRight
							className={cn(
								"h-3 w-3 transition-transform",
								expanded && "rotate-90"
							)}
						/>
					</button>
				) : (
					<span className="w-4" />
				)}
				<span className="truncate flex-1">{node.text}</span>
			</div>
		</div>
	)
}
