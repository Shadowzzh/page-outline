import type { Position, Size } from "@/types"

/**
 * Get current viewport dimensions
 */
export function getViewportSize(): Size {
	return {
		width: window.innerWidth,
		height: window.innerHeight,
	}
}

/**
 * Clamp a position to stay within viewport bounds
 */
export function clampToViewport(
	position: Position,
	panelSize: Size,
	padding = 10
): Position {
	const viewport = getViewportSize()

	return {
		x: Math.max(
			padding,
			Math.min(position.x, viewport.width - panelSize.width - padding)
		),
		y: Math.max(
			padding,
			Math.min(position.y, viewport.height - panelSize.height - padding)
		),
	}
}

/**
 * Subscribe to viewport size changes (resize and zoom)
 */
export function subscribeViewportChange(
	callback: (size: Size) => void
): () => void {
	const handler = () => callback(getViewportSize())
	window.addEventListener("resize", handler)
	return () => window.removeEventListener("resize", handler)
}
