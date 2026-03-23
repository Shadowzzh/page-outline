import { OutlineTree } from "@/components/outline/outline-tree"
import { cn } from "@/lib/utils"
import { useContentStore } from "@/store/content-store"
import { useExpandStore } from "@/store/expand-store"
import { usePanelStore } from "@/store/panel-store"
import { useScrollStore } from "@/store/scroll-store"
import { useThemeStore } from "@/store/theme-store"
import { useEffect, useRef } from "react"
import { PanelHeader } from "./panel-header"

interface DraggablePanelProps {
	host: HTMLElement
}

export function DraggablePanel({ host }: DraggablePanelProps) {
	const isOpen = usePanelStore(s => s.isOpen)
	const position = usePanelStore(s => s.position)
	const size = usePanelStore(s => s.size)
	const tree = useContentStore(s => s.tree)
	const resolvedTheme = useThemeStore(s => s.resolvedTheme)

	// Use ref to track if component has been initialized
	const initializedRef = useRef(false)

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

	if (!isOpen) {
		return null
	}

	return (
		<div
			className={cn(
				"fixed z-2147483647",
				"flex flex-col",
				"bg-black/85 backdrop-blur-md text-[#a0a0a0] border border-[#333333]",
				"font-mono",
				"crt-panel"
			)}
			style={{
				left: position.x,
				top: position.y,
				width: size.width,
				height: size.height,
			}}
		>
			<PanelHeader />
			<div className="flex-1 overflow-auto">
				<div>
					<OutlineTree tree={tree} />
				</div>
			</div>
		</div>
	)
}
