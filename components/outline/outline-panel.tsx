import { DraggablePanel } from "@/components/panel/draggable-panel"

interface OutlinePanelProps {
	host: HTMLElement
}

export function OutlinePanel({ host }: OutlinePanelProps) {
	return <DraggablePanel host={host} />
}
