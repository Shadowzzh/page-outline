import { TooltipProvider } from "@/components/ui/tooltip"
import { useContentStore } from "@/store/content-store"
import { useExpandStore } from "@/store/expand-store"
import { usePanelStore } from "@/store/panel-store"
import { Minus, Plus, X } from "lucide-react"
import { useMemo } from "react"

const DEFAULT_MAX_LEVEL = 6

export function PanelHeader() {
	const startDrag = usePanelStore(s => s.startDrag)
	const close = usePanelStore(s => s.close)
	const tree = useContentStore(s => s.tree)
	const expandLevel = useExpandStore(s => s.expandLevel)
	const increaseLevel = useExpandStore(s => s.increaseLevel)
	const decreaseLevel = useExpandStore(s => s.decreaseLevel)
	const getMaxLevel = useExpandStore(s => s.getMaxLevel)

	const maxLevel = useMemo(
		() => (tree.length > 0 ? getMaxLevel(tree) : DEFAULT_MAX_LEVEL),
		[tree, getMaxLevel]
	)
	const canIncrease = expandLevel < maxLevel
	const canDecrease = expandLevel > 0

	const handleMouseDown = (e: React.MouseEvent) => {
		startDrag(e.nativeEvent)
	}

	return (
		<TooltipProvider delayDuration={300}>
			<div
				className="flex items-center justify-between gap-1 cursor-move select-none"
				onMouseDown={handleMouseDown}
			>
				<div />
				<div className="flex items-center gap-1">
					<button
						type="button"
						className="cursor-pointer size-6 p-0 bg-transparent hover:bg-crt-bg-hover flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
						onClick={e => {
							e.stopPropagation()
							decreaseLevel(tree)
						}}
						disabled={!canDecrease}
					>
						<Minus className="size-3 text-crt-dim hover:text-crt-hover" />
					</button>
					<button
						type="button"
						className="cursor-pointer size-6 p-0 bg-transparent hover:bg-crt-bg-hover flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
						onClick={e => {
							e.stopPropagation()
							increaseLevel(tree)
						}}
						disabled={!canIncrease}
					>
						<Plus className="size-3 text-crt-dim hover:text-crt-hover" />
					</button>
					<button
						type="button"
						className="cursor-pointer size-6 p-0 bg-transparent hover:bg-crt-bg-hover flex items-center justify-center transition-colors"
						onClick={close}
					>
						<X className="size-3 text-crt-dim hover:text-crt-hover" />
					</button>
				</div>
			</div>
		</TooltipProvider>
	)
}
