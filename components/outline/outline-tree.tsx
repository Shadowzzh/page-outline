import type { HeadingNode } from "@/types"
import { TreeNode } from "./tree-node"

interface FlattenedNode extends HeadingNode {
	depth: number
	parentId: string | null
	ancestorIds: string[]  // 所有祖先节点的 ID，用于判断可见性
}

interface OutlineTreeProps {
	tree: HeadingNode[]
}

function flattenTree(
	nodes: HeadingNode[],
	depth = 0,
	parentId: string | null = null,
	ancestorIds: string[] = []
): FlattenedNode[] {
	const result: FlattenedNode[] = []

	for (const node of nodes) {
		result.push({
			...node,
			depth,
			parentId,
			ancestorIds,
		})

		if (node.children.length > 0) {
			result.push(
				...flattenTree(node.children, depth + 1, node.id, [...ancestorIds, node.id])
			)
		}
	}

	return result
}

export function OutlineTree({ tree }: OutlineTreeProps) {
	if (tree.length === 0) {
		return (
			<div className="flex items-center justify-center h-full text-muted-foreground text-sm">
				No headings found
			</div>
		)
	}

	const flattenedNodes = flattenTree(tree)

	return (
		<div className="">
			{flattenedNodes.map(node => (
				<TreeNode
					key={node.id}
					node={node}
					depth={node.depth}
					ancestorIds={node.ancestorIds}
				/>
			))}
		</div>
	)
}
