import type { HeadingNode } from "@/types"
import { TreeNode } from "./tree-node"

interface OutlineTreeProps {
	tree: HeadingNode[]
}

export function OutlineTree({ tree }: OutlineTreeProps) {
	if (tree.length === 0) {
		return (
			<div className="flex items-center justify-center h-full text-muted-foreground text-sm">
				No headings found
			</div>
		)
	}

	return (
		<div className="py-2">
			{tree.map(node => (
				<TreeNode key={node.id} node={node} />
			))}
		</div>
	)
}
