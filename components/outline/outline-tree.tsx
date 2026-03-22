import type { HeadingNode } from "@/types"
import { TreeNode } from "./tree-node"

interface FlattenedNode extends HeadingNode {
	depth: number
	parentId: string | null
	ancestorIds: string[] // 所有祖先节点的 ID，用于判断可见性
	isLast: boolean // 是否是同级最后一个节点
	ancestorIsLast: boolean[] // 每层祖先是否是最后一个（用于绘制连接线）
}

interface OutlineTreeProps {
	tree: HeadingNode[]
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
					isLast={node.isLast}
					ancestorIsLast={node.ancestorIsLast}
				/>
			))}
		</div>
	)
}
