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
				"flex items-center h-4.5 px-2 cursor-pointer font-mono",
				"hover:bg-amber-900",
				"transition-colors",
				isActive && "bg-amber-950 text-[#ffcc00]"
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
			<div className="flex items-center text-sm">
				<span className="whitespace-pre" style={{ color: "#b39000" }}>
					{prefix}
				</span>
				{hasChildren ? (
					<span
						className="cursor-pointer hover:text-[#ffcc00]"
						style={{ color: "#b39000" }}
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
					<span style={{ color: "#b39000" }}>{toggleIndicator}</span>
				)}
			</div>
			{/* 标题部分 */}
			<div
				className="ml-1 truncate text-xs hover:text-[#ffcc00]"
				style={{ color: "#b39000" }}
			>
				{node.text}
			</div>
		</div>
	)
}
