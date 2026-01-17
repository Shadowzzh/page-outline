import { ScrollTracker } from "@/core/scroll/tracker"
import type { HeadingNode } from "@/types"
import { create } from "zustand"

interface ScrollState {
	activeNodeId: string | null
	tracker: ScrollTracker | null
}

interface ScrollActions {
	setActiveNode: (nodeId: string | null) => void
	startTracking: (tree: HeadingNode[]) => void
	stopTracking: () => void
}

export const useScrollStore = create<ScrollState & ScrollActions>(
	(set, get) => ({
		activeNodeId: null,
		tracker: null,

		setActiveNode: nodeId => {
			set({ activeNodeId: nodeId })
		},

		startTracking: tree => {
			const { tracker: existingTracker } = get()
			if (existingTracker) {
				existingTracker.stop()
			}

			const tracker = new ScrollTracker(nodeId => {
				set({ activeNodeId: nodeId })
			})

			tracker.start(tree)
			set({ tracker })
		},

		stopTracking: () => {
			const { tracker } = get()
			if (tracker) {
				tracker.stop()
				set({ tracker: null, activeNodeId: null })
			}
		},
	})
)
