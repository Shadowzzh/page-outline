import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		content_scripts: [
			{
				matches: ["<all_urls>"],
			},
		],
	},
	modules: ["@wxt-dev/module-react"],
})
