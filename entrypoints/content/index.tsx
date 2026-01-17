import { usePanelStore } from "@/store/panel-store"
import ReactDOM from "react-dom/client"
import { App } from "./App"
import styles from "./styles/globals.css?inline"

export default defineContentScript({
	matches: ["<all_urls>"],
	cssInjectionMode: "ui",

	async main(ctx) {
		// Create shadow DOM UI
		const ui = await createShadowRootUi(ctx, {
			name: "page-outline",
			position: "inline",
			anchor: "body",
			append: "last",
			onMount: (container, shadow) => {
				// Inject styles
				const styleEl = document.createElement("style")
				styleEl.textContent = styles
				shadow.appendChild(styleEl)

				// Create React root
				const host = shadow.host as HTMLElement
				const root = ReactDOM.createRoot(container)
				root.render(<App host={host} />)

				return { root, host }
			},
			onRemove: elements => {
				elements?.root.unmount()
			},
		})

		ui.mount()

		// Listen for toggle message from background
		browser.runtime.onMessage.addListener(message => {
			if (message.type === "toggle-panel") {
				usePanelStore.getState().toggle()
			}
		})
	},
})
