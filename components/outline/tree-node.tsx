import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { scrollToElement } from "@/lib/browser/dom"
import { cn } from "@/lib/utils"
import { useExpandStore } from "@/store/expand-store"
import { useScrollStore } from "@/store/scroll-store"
import type { HeadingNode } from "@/types"
import { ChevronRight } from "lucide-react"

interface TreeNodeProps {
	node: HeadingNode
	depth?: number
}

export function TreeNode({ node, depth = 0 }: TreeNodeProps) {
	const activeNodeId = useScrollStore(s => s.activeNodeId)
	const isExpanded = useExpandStore(s => s.isExpanded)
	const toggleNode = useExpandStore(s => s.toggleNode)

	const isActive = activeNodeId === node.id
	const hasChildren = node.children.length > 0
	const expanded = isExpanded(node.id)

	const handleClick = () => {
		scrollToElement(node.element)
	}

	return (
		<Collapsible open={expanded} onOpenChange={() => toggleNode(node.id)}>
			<div className="w-full">
				<div
					className={cn(
						"flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-sm transition-colors",
						"hover:bg-accent",
						isActive && "bg-accent text-accent-foreground font-medium"
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
						<CollapsibleTrigger asChild>
							<button
								type="button"
								className="p-0.5 hover:bg-muted rounded"
								onClick={e => e.stopPropagation()}
							>
								<ChevronRight
									className={cn(
										"h-3 w-3 transition-transform",
										expanded && "rotate-90"
									)}
								/>
							</button>
						</CollapsibleTrigger>
					) : (
						<span className="w-4" />
					)}
					<span className="truncate flex-1">{node.text}</span>
				</div>

				{hasChildren && (
					<CollapsibleContent>
						{node.children.map(child => (
							<TreeNode key={child.id} node={child} depth={depth + 1} />
						))}
					</CollapsibleContent>
				)}
			</div>
		</Collapsible>
	)
}
