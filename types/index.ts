/** A heading node in the outline tree */
export interface HeadingNode {
	id: string
	text: string
	level: number
	element: HTMLElement
	children: HeadingNode[]
}

/** Position coordinates */
export interface Position {
	x: number
	y: number
}

/** Panel dimensions */
export interface Size {
	width: number
	height: number
}

/** Theme options */
export type Theme = "light" | "dark" | "system"

/** Panel state for persistence */
export interface PanelState {
	position: Position
	size: Size
	isOpen: boolean
}

/** Content extraction result */
export interface ExtractionResult {
	title: string
	tree: HeadingNode[]
	rawTree: HeadingNode[]
}
