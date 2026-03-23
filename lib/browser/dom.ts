/**
 * Get the scrollable container element
 */
export function getScrollElement(): HTMLElement {
	return (document.scrollingElement as HTMLElement) || document.documentElement
}

/**
 * Get heading level from tag name (h1 -> 1, h2 -> 2, etc.)
 */
export function getHeadingLevel(element: HTMLElement): number {
	const match = element.tagName.match(/^H(\d)$/i)
	return match ? Number.parseInt(match[1], 10) : 0
}

/**
 * Generate a unique ID for an element
 */
export function generateId(element: HTMLElement, index: number): string {
	const text = element.textContent?.trim().slice(0, 30) || ""
	const slug = text
		.toLowerCase()
		.replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
		.replace(/^-|-$/g, "")
	return `po-${slug || "heading"}-${index}`
}

/**
 * Scroll an element into view instantly
 */
export function scrollToElement(element: HTMLElement): void {
	element.scrollIntoView({
		behavior: "instant",
		block: "start",
	})
}

/**
 * Find heading elements in the document
 */
export function findHeadings(
	root: Document | HTMLElement = document
): HTMLElement[] {
	const headings = root.querySelectorAll("h1, h2, h3, h4, h5, h6")
	return Array.from(headings) as HTMLElement[]
}
