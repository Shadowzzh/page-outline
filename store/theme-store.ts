import { getTheme, setTheme as saveTheme } from "@/lib/browser/storage"
import type { Theme } from "@/types"
import { create } from "zustand"

interface ThemeState {
	theme: Theme
	resolvedTheme: "light" | "dark"
}

interface ThemeActions {
	setTheme: (theme: Theme) => void
	loadTheme: () => Promise<void>
	applyTheme: (host: HTMLElement) => void
}

function getSystemTheme(): "light" | "dark" {
	if (typeof window === "undefined") return "light"
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light"
}

function resolveTheme(theme: Theme): "light" | "dark" {
	return theme === "system" ? getSystemTheme() : theme
}

export const useThemeStore = create<ThemeState & ThemeActions>((set, get) => ({
	theme: "system",
	resolvedTheme: getSystemTheme(),

	setTheme: theme => {
		const resolvedTheme = resolveTheme(theme)
		set({ theme, resolvedTheme })
		saveTheme(theme)
	},

	loadTheme: async () => {
		const theme = await getTheme()
		const resolvedTheme = resolveTheme(theme)
		set({ theme, resolvedTheme })
	},

	applyTheme: host => {
		const { resolvedTheme } = get()
		if (resolvedTheme === "dark") {
			host.classList.add("dark")
		} else {
			host.classList.remove("dark")
		}
	},
}))

// Listen to system theme changes
if (typeof window !== "undefined") {
	window
		.matchMedia("(prefers-color-scheme: dark)")
		.addEventListener("change", () => {
			const { theme, setTheme } = useThemeStore.getState()
			if (theme === "system") {
				setTheme("system") // Re-resolve
			}
		})
}
