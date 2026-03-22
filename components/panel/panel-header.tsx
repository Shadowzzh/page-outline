import { Button } from "@/components/ui/button"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePanelStore } from "@/store/panel-store"
import { GripVertical, X } from "lucide-react"

export function PanelHeader() {
	const startDrag = usePanelStore(s => s.startDrag)
	const close = usePanelStore(s => s.close)

	const handleMouseDown = (e: React.MouseEvent) => {
		startDrag(e.nativeEvent)
	}

	return (
		<TooltipProvider delayDuration={300}>
			<div
				className="flex items-center justify-between gap-1 px-2 cursor-move select-none border-b border-dashed border-[#333333]"
				onMouseDown={handleMouseDown}
			>
				<div />
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							className="cursor-pointer size-6 p-0 bg-transparent hover:bg-[#333333] text-[#888888] hover:text-[#ffffff]"
							variant="ghost"
							size="icon-sm"
							onClick={close}
						>
							<X className="size-3" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">关闭</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	)
}
