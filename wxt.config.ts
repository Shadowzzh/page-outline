import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		name: "Page Outline",
		description: "Generate table of contents for any webpage",
		permissions: ["storage"],
		action: {
			default_title: "Toggle Page Outline",
		},
	},
	modules: ["@wxt-dev/module-react"],
	vite: () => ({
		plugins: [tailwindcss()],
	}),
})
