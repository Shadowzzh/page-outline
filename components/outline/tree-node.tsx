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
				"flex items-center h-5 px-2 cursor-pointer font-mono text-sm",
				"hover:bg-[#ffffff] hover:text-[#000000]",
				"transition-colors",
				isActive && "bg-[#333333]"
			)}
			onClick={handleClick}
			onKeyDown={e => {
				if (e.key === "Enter" || e.key === " ") {
					handleClick()
				}
			}}
		>
			<span className="text-[#555555] whitespace-pre">{prefix}</span>
			{hasChildren ? (
				<span
					className="text-[#888888] cursor-pointer hover:text-[#ffffff]"
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
				<span className="text-[#555555]">{toggleIndicator}</span>
			)}
			<span className="ml-1 truncate">{node.text}</span>
		</div>
	)
}
