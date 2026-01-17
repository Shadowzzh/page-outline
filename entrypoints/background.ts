export default defineBackground(() => {
	// Toggle panel when extension icon is clicked
	browser.action.onClicked.addListener(async tab => {
		if (tab.id) {
			await browser.tabs.sendMessage(tab.id, { type: "toggle-panel" })
		}
	})
})
