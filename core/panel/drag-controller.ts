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
	private panelSize: Size = { width: 300, height: 400 }
	private callback: DragCallback

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

		const deltaX = event.clientX - this.startPosition.x
		const deltaY = event.clientY - this.startPosition.y

		const newPosition: Position = {
			x: this.startPanelPosition.x + deltaX,
			y: this.startPanelPosition.y + deltaY,
		}

		const clampedPosition = clampToViewport(newPosition, this.panelSize)
		this.callback(clampedPosition)
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
	}
}
