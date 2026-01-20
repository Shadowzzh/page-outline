import { PANEL_CONFIG } from "@/config"
import { clampToViewport } from "@/lib/browser/viewport"
import type { Position, Size } from "@/types"

export type DragCallback = (position: Position) => void

/**
 * Handle panel dragging with boundary constraints
 */
export class DragController {
	private isDragging = false
	private startPosition: Position = { x: 0, y: 0 }
	private startPanelPosition: Position = { x: 0, y: 0 }
	private panelSize: Size = PANEL_CONFIG.DEFAULT_SIZE
	private callback: DragCallback
	private rafId: number | null = null
	private pendingDelta: Position | null = null

	constructor(callback: DragCallback) {
		this.callback = callback
		this.handleMouseMove = this.handleMouseMove.bind(this)
		this.handleMouseUp = this.handleMouseUp.bind(this)
	}

	/**
	 * Set panel size for boundary calculations
	 */
	setPanelSize(size: Size): void {
		this.panelSize = size
	}

	/**
	 * Start dragging
	 */
	startDrag(event: MouseEvent, currentPosition: Position): void {
		this.isDragging = true
		this.startPosition = { x: event.clientX, y: event.clientY }
		this.startPanelPosition = currentPosition

		document.addEventListener("mousemove", this.handleMouseMove)
		document.addEventListener("mouseup", this.handleMouseUp)
	}

	/**
	 * Handle mouse movement during drag
	 */
	private handleMouseMove(event: MouseEvent): void {
		if (!this.isDragging) return

		this.pendingDelta = {
			x: event.clientX - this.startPosition.x,
			y: event.clientY - this.startPosition.y,
		}

		if (this.rafId === null) {
			this.rafId = requestAnimationFrame(() => {
				if (this.pendingDelta) {
					const position = clampToViewport(
						{
							x: this.startPanelPosition.x + this.pendingDelta.x,
							y: this.startPanelPosition.y + this.pendingDelta.y,
						},
						this.panelSize
					)
					this.callback(position)
				}
				this.rafId = null
			})
		}
	}

	/**
	 * End dragging
	 */
	private handleMouseUp(): void {
		this.isDragging = false
		document.removeEventListener("mousemove", this.handleMouseMove)
		document.removeEventListener("mouseup", this.handleMouseUp)
	}

	/**
	 * Clean up event listeners
	 */
	destroy(): void {
		this.handleMouseUp()
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId)
			this.rafId = null
		}
		this.pendingDelta = null
	}
}
