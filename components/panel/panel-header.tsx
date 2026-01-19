import { Button } from "@/components/ui/button"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { useContentStore } from "@/store/content-store"
import { useExpandStore } from "@/store/expand-store"
import { usePanelStore } from "@/store/panel-store"
import { useThemeStore } from "@/store/theme-store"
import {
	GripVertical,
	Minus,
	Monitor,
	Moon,
	Plus,
	RefreshCw,
	Sun,
	X,
} from "lucide-react"

export function PanelHeader() {
	const { startDrag, close } = usePanelStore()
	const { title, refresh, zoomLevel, setZoomLevel, tree } = useContentStore()
	const { theme, setTheme } = useThemeStore()
	const { expandAll, collapseAll, expandedNodes } = useExpandStore()

	const handleMouseDown = (e: React.MouseEvent) => {
		startDrag(e.nativeEvent)
	}

	const handleThemeClick = () => {
		const themes: Array<"light" | "dark" | "system"> = [
			"light",
			"dark",
			"system",
		]
		const currentIndex = themes.indexOf(theme)
		const nextTheme = themes[(currentIndex + 1) % themes.length]
		setTheme(nextTheme)
	}

	const handleExpandToggle = () => {
		if (expandedNodes.size > 0) {
			collapseAll()
		} else {
			expandAll(tree)
		}
	}

	const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor

	return (
		<TooltipProvider delayDuration={300}>
			<div
				className="flex items-center gap-1 px-2 py-1.5 border-b border-border cursor-move select-none"
				onMouseDown={handleMouseDown}
			>
				<GripVertical className="h-4 w-4 text-muted-foreground" />

				<span className="flex-1 text-sm font-medium truncate px-1">
					{title || "Page Outline"}
				</span>

				<div className="flex items-center gap-0.5">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setZoomLevel(zoomLevel - 1)}
								disabled={zoomLevel <= 1}
							>
								<Minus className="h-3 w-3" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							H{zoomLevel - 1} 级以上
						</TooltipContent>
					</Tooltip>

					<span className="text-xs w-6 text-center">H{zoomLevel}</span>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setZoomLevel(zoomLevel + 1)}
								disabled={zoomLevel >= 6}
							>
								<Plus className="h-3 w-3" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							H{zoomLevel + 1} 级以下
						</TooltipContent>
					</Tooltip>
				</div>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" onClick={handleExpandToggle}>
							{expandedNodes.size > 0 ? (
								<Minus className="h-3 w-3" />
							) : (
								<Plus className="h-3 w-3" />
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						{expandedNodes.size > 0 ? "全部折叠" : "全部展开"}
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" onClick={handleThemeClick}>
							<ThemeIcon className="h-3 w-3" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">切换主题</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" onClick={() => refresh()}>
							<RefreshCw className="h-3 w-3" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">刷新大纲</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" onClick={close}>
							<X className="h-3 w-3" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">关闭</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	)
}
