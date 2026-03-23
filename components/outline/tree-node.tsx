import { scrollToElement } from "@/lib/browser/dom"
import { cn } from "@/lib/utils"
import { useExpandStore } from "@/store/expand-store"
import { useScrollStore } from "@/store/scroll-store"
import type { HeadingNode } from "@/types"

interface TreeNodeProps {
	node: HeadingNode
	depth: number
	ancestorIds: string[]
	isLast: boolean
	ancestorIsLast: boolean[]
}

function buildPrefix(
	ancestorIsLast: boolean[],
	isLast: boolean,
	depth: number
): string {
	if (depth === 0) return ""
	const connectors = ancestorIsLast.map(last => (last ? "   " : "│  ")).join("")
	const branch = isLast ? "└─" : "├─"
	return connectors + branch
}

export function TreeNode({
	node,
	depth,
	ancestorIds,
	isLast,
	ancestorIsLast,
}: TreeNodeProps) {
	const activeNodeId = useScrollStore(s => s.activeNodeId)
	const setActiveNode = useScrollStore(s => s.setActiveNode)
	const expandedNodes = useExpandStore(s => s.expandedNodes)
	const toggleNode = useExpandStore(s => s.toggleNode)

	const isActive = activeNodeId === node.id
	const hasChildren = node.children.length > 0
	const expanded = expandedNodes.has(node.id)

	const isVisible = ancestorIds.every(id => expandedNodes.has(id))

	if (!isVisible) {
		return null
	}

	const handleClick = () => {
		setActiveNode(node.id)
		scrollToElement(node.element)
	}

	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation()
		toggleNode(node.id)
	}

	const prefix = buildPrefix(ancestorIsLast, isLast, depth)
	const toggleIndicator = hasChildren ? (expanded ? "[-]" : "[+]") : "   "

	return (
		<div
			className={cn(
				"group flex items-center h-4.5 px-2 cursor-pointer font-mono",
				"hover:bg-crt-bg-hover",
				"transition-colors",
				isActive && "bg-crt-bg-active text-crt-active"
			)}
			style={{ textShadow: "0 0 1px #ffb300, 0 0 8px rgba(255, 179, 0, 0.4)" }}
			onClick={handleClick}
			onKeyDown={e => {
				if (e.key === "Enter" || e.key === " ") {
					handleClick()
				}
			}}
		>
			{/* 标志部分：连接线 + 展开/折叠指示器 */}
			<div
				className={cn(
					"flex items-center text-sm",
					!isActive && "text-crt-dim",
					isActive && "text-crt-active",
					"group-hover:text-crt-hover"
				)}
			>
				<span className="whitespace-pre">{prefix}</span>
				{hasChildren ? (
					<span
						className="cursor-pointer"
						onClick={handleToggle}
						onKeyDown={e => {
							if (e.key === "Enter" || e.key === " ") {
								e.stopPropagation()
								toggleNode(node.id)
							}
						}}
					>
						{toggleIndicator}
					</span>
				) : (
					<span>{toggleIndicator}</span>
				)}
			</div>
			{/* 标题部分 */}
			<div
				className={cn(
					"ml-1 truncate text-xs",
					!isActive && "text-crt-dim",
					isActive && "text-crt-active",
					"group-hover:text-crt-hover"
				)}
			>
				{node.text}
			</div>
		</div>
	)
}
