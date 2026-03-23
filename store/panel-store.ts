import { PANEL_CONFIG } from "@/config"
import { DragController } from "@/core/panel/drag-controller"
import { ViewportAdapter } from "@/core/panel/viewport-adapter"
import { getPanelState, setPanelState } from "@/lib/browser/storage"
import { clampToViewport } from "@/lib/browser/viewport"
import type { Position, Size } from "@/types"
import { create } from "zustand"

const { DEFAULT_POSITION, DEFAULT_SIZE } = PANEL_CONFIG

interface PanelState {
	position: Position
	size: Size
	isOpen: boolean
	dragController: DragController | null
	viewportAdapter: ViewportAdapter | null
	initialized: boolean
}

interface PanelActions {
	init: () => Promise<void>
	setPosition: (position: Position) => void
	setSize: (size: Size) => void
	open: () => void
	close: () => void
	toggle: () => void
	startDrag: (event: MouseEvent) => void
	destroy: () => void
	saveState: () => void
}

export const usePanelStore = create<PanelState & PanelActions>((set, get) => ({
	position: DEFAULT_POSITION,
	size: DEFAULT_SIZE,
	isOpen: false,
	dragController: null,
	viewportAdapter: null,
	initialized: false,

	init: async () => {
		// Load saved state
		const savedState = await getPanelState()
		let position = savedState?.position || DEFAULT_POSITION
		const size = savedState?.size || DEFAULT_SIZE

		// Clamp to current viewport
		position = clampToViewport(position, size)

		// Create controllers
		const dragController = new DragController(pos => get().setPosition(pos))
		dragController.setPanelSize(size)

		const viewportAdapter = new ViewportAdapter(pos => {
			set({ position: pos })
			get().saveState()
		})
		viewportAdapter.start(position, size)

		set({ position, size, dragController, viewportAdapter, initialized: true })
	},

	setPosition: position => {
		const { viewportAdapter } = get()
		viewportAdapter?.updatePosition(position)
		set({ position })
		get().saveState()
	},

	setSize: size => {
		const { dragController, viewportAdapter, position } = get()
		dragController?.setPanelSize(size)
		viewportAdapter?.updateSize(size)

		// Reclamp position with new size
		const clampedPosition = clampToViewport(position, size)
		set({ size, position: clampedPosition })
		get().saveState()
	},

	open: () => {
		set({ isOpen: true })
		get().saveState()
	},

	close: () => {
		set({ isOpen: false })
		get().saveState()
	},

	toggle: () => {
		const { isOpen } = get()
		if (isOpen) {
			get().close()
		} else {
			get().open()
		}
	},

	startDrag: event => {
		const { dragController, position } = get()
		dragController?.startDrag(event, position)
	},

	destroy: () => {
		const { dragController, viewportAdapter } = get()
		dragController?.destroy()
		viewportAdapter?.stop()
		set({ dragController: null, viewportAdapter: null })
	},

	saveState: () => {
		const { position, size, isOpen, initialized } = get()
		if (!initialized) return
		setPanelState({ position, size, isOpen })
	},
}))
