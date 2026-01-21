import { usePanelStore } from "@/store/panel-store"
import ReactDOM from "react-dom/client"
import { App } from "./App"
import rawStyles from "./styles/globals.css?inline"
import { processCssForShadowDom } from "./utils/shadow-dom-css"

// 处理后的样式
const styles = processCssForShadowDom(rawStyles)

export default defineContentScript({
	matches: ["<all_urls>"],
	cssInjectionMode: "manual",

	async main(ctx) {
		let ui: Awaited<ReturnType<typeof createShadowRootUi>> | null = null

		// 延迟初始化 UI
		const initUI = async () => {
			if (ui) return

			ui = await createShadowRootUi(ctx, {
				name: "page-outline",
				position: "inline",
				anchor: "body",
				onMount: (container, shadow) => {
					// 设置基准字体大小，使 em 单位有正确参考值
					container.style.fontSize = "14px"
					container.style.color = "#4b4b4b"

					// 注入处理后的样式到 Shadow DOM
					const styleEl = document.createElement("style")
					styleEl.textContent = styles
					shadow.appendChild(styleEl)

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
