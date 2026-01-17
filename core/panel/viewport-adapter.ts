import {
	clampToViewport,
	subscribeViewportChange,
} from "@/lib/browser/viewport"
import type { Position, Size } from "@/types"

export type PositionCallback = (position: Position) => void

/**
 * Adapt panel position to viewport changes (resize, zoom)
 */
export class ViewportAdapter {
	private unsubscribe: (() => void) | null = null
	private currentPosition: Position = { x: 0, y: 0 }
	private panelSize: Size = { width: 300, height: 400 }
	private callback: PositionCallback

	constructor(callback: PositionCallback) {
		this.callback = callback
	}

	/**
	 * Start listening to viewport changes
	 */
	start(initialPosition: Position, panelSize: Size): void {
		this.stop()
		this.currentPosition = initialPosition
		this.panelSize = panelSize

		this.unsubscribe = subscribeViewportChange(() => {
			this.reclampPosition()
		})
	}

	/**
	 * Update current position
	 */
	updatePosition(position: Position): void {
		this.currentPosition = position
	}

	/**
	 * Update panel size
	 */
	updateSize(size: Size): void {
		this.panelSize = size
	}

	/**
	 * Reclamp position to viewport and emit
	 */
	private reclampPosition(): void {
		const clamped = clampToViewport(this.currentPosition, this.panelSize)
		if (
			clamped.x !== this.currentPosition.x ||
			clamped.y !== this.currentPosition.y
		) {
			this.currentPosition = clamped
			this.callback(clamped)
		}
	}

	/**
	 * Stop listening
	 */
	stop(): void {
		if (this.unsubscribe) {
			this.unsubscribe()
			this.unsubscribe = null
		}
	}
}
