import { OutlinePanel } from "@/components/outline/outline-panel"

interface AppProps {
	host: HTMLElement
}

export function App({ host }: AppProps) {
	return <OutlinePanel host={host} />
}
