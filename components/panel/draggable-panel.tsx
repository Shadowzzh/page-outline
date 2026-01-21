import { OutlineTree } from "@/components/outline/outline-tree"
import { cn } from "@/lib/utils"
import { useContentStore } from "@/store/content-store"
import { useExpandStore } from "@/store/expand-store"
import { usePanelStore } from "@/store/panel-store"
import { useScrollStore } from "@/store/scroll-store"
import { useThemeStore } from "@/store/theme-store"
import { useCallback, useEffect, useRef } from "react"
import { PanelFooter } from "./panel-footer"
import { PanelHeader } from "./panel-header"

interface DraggablePanelProps {
	host: HTMLElement
}

export function DraggablePanel({ host }: DraggablePanelProps) {
	const position = usePanelStore(s => s.position)
	const size = usePanelStore(s => s.size)
	const isOpen = usePanelStore(s => s.isOpen)
	const tree = useContentStore(s => s.tree)
	const resolvedTheme = useThemeStore(s => s.resolvedTheme)
	const setPanelScrollProgress = useScrollStore(s => s.setPanelScrollProgress)

	// Use ref to track if component has been initialized
	const initializedRef = useRef(false)
	// 滚动容器 ref
	const scrollContainerRef = useRef<HTMLDivElement>(null)

	// 处理滚动事件，计算进度
	const handleScroll = useCallback(() => {
		const container = scrollContainerRef.current
		if (!container) return

		const { scrollTop, scrollHeight, clientHeight } = container
		const maxScroll = scrollHeight - clientHeight
		const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0
		setPanelScrollProgress(progress)
	}, [setPanelScrollProgress])

	// Initialize on mount
	useEffect(() => {
		if (initializedRef.current) return
		initializedRef.current = true

		const initialize = async () => {
			await Promise.all([
				usePanelStore.getState().init(),
				useThemeStore.getState().loadTheme(),
				useContentStore.getState().loadZoomLevel(),
				useExpandStore.getState().loadExpandedNodes(),
			])
			await useContentStore.getState().extract()
		}

		initialize()

		return () => {
			usePanelStore.getState().destroy()
			useScrollStore.getState().stopTracking()
		}
	}, [])

	// Start tracking when tree changes
	useEffect(() => {
		if (tree.length > 0) {
			useScrollStore.getState().startTracking(tree)
			// Auto-expand all on first load
			useExpandStore.getState().expandAll(tree)
		}
	}, [tree])

	// Apply theme to host when theme changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: resolvedTheme triggers re-application
	useEffect(() => {
		useThemeStore.getState().applyTheme(host)
	}, [resolvedTheme, host])

	// 监听滚动容器滚动事件
	useEffect(() => {
		const container = scrollContainerRef.current
		if (!container) return

		container.addEventListener("scroll", handleScroll, { passive: true })
		// 初始化进度
		handleScroll()

		return () => {
			container.removeEventListener("scroll", handleScroll)
		}
	}, [handleScroll])

	if (!isOpen) {
		return null
	}

	return (
		<div
			className={cn(
				"fixed z-2147483647 bg-background border-border rounded-xl",
				"flex flex-col overflow-hidden"
			)}
			style={{
				left: `${position.x}px`,
				top: `${position.y}px`,
				width: `${size.width}px`,
				height: `${size.height}px`,
				boxShadow:
					resolvedTheme === "dark"
						? "rgba(0, 0, 0, 0.5) 0px 0px 0px 4px"
						: "rgba(0, 0, 0, 0.1) 0px 0px 0px 4px",
			}}
		>
			<PanelHeader />
			<div className="flex-1 overflow-hidden">
				<div
					ref={scrollContainerRef}
					className="h-full overflow-y-auto pl-4 pr-6 pt-2 -mt-1 -mr-4"
					style={{
						maskImage: 'linear-gradient(to bottom, transparent 0, black 18px, black calc(100% - 24px), transparent 100%)',
						WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, black 18px, black calc(100% - 24px), transparent 100%)',
					}}
				>
					<OutlineTree tree={tree} />
				</div>
			</div>
			<PanelFooter />
		</div>
	)
}
