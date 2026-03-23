import { TooltipProvider } from "@/components/ui/tooltip"
import { usePanelStore } from "@/store/panel-store"
import { X } from "lucide-react"

export function PanelHeader() {
	const startDrag = usePanelStore(s => s.startDrag)
	const close = usePanelStore(s => s.close)

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
				<button
					type="button"
					className="cursor-pointer size-6 p-0 bg-transparent hover:bg-crt-bg-hover flex items-center justify-center transition-colors"
					onClick={close}
				>
					<X className="size-3 text-crt-dim hover:text-crt-hover" />
				</button>
			</div>
		</TooltipProvider>
	)
}
