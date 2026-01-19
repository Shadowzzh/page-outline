import { usePanelStore } from "@/store/panel-store"
import ReactDOM from "react-dom/client"
import { App } from "./App"
import styles from "./styles/globals.css?inline"

console.log("Content script loaded")

export default defineContentScript({
	matches: ["<all_urls>"],
	cssInjectionMode: "ui",

	async main(ctx) {
		let ui: Awaited<ReturnType<typeof createIntegratedUi>> | null = null

		// 延迟初始化 UI
		const initUI = async () => {
			console.log("Initializing UI...")
			if (ui) return

			ui = await createIntegratedUi(ctx, {
				position: "inline",
				anchor: "body",
				append: "last",
				onMount: container => {
					// 注入样式到容器
					const styleEl = document.createElement("style")
					styleEl.textContent = styles
					container.appendChild(styleEl)

					// 创建 React 根容器
					const rootContainer = document.createElement("div")
					container.appendChild(rootContainer)

					const root = ReactDOM.createRoot(rootContainer)
					root.render(<App host={container} />)

					return { root, host: container }
				},
				onRemove: elements => {
					elements?.root.unmount()
				},
			})

			ui.mount()
		}

		// 点击菜单按钮后才初始化
		browser.runtime.onMessage.addListener(async message => {
			if (message.type === "toggle-panel") {
				await initUI()
				usePanelStore.getState().toggle()
			}
		})
	},
})
