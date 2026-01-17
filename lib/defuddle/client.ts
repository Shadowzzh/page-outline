import Defuddle from "defuddle"

export interface DefuddleResult {
	title: string
	content: string
}

/**
 * Extract main content from the current document using Defuddle
 */
export function extractContent(doc: Document): DefuddleResult {
	const result = new Defuddle(doc).parse()
	return {
		title: result.title || doc.title || "",
		content: result.content || "",
	}
}

/**
 * Parse HTML string and extract headings
 */
export function parseHtmlForHeadings(html: string): HTMLElement[] {
	const parser = new DOMParser()
	const doc = parser.parseFromString(html, "text/html")
	const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6")
	return Array.from(headings) as HTMLElement[]
}
