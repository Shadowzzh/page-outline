export type IntersectionCallback = (
	entries: IntersectionObserverEntry[]
) => void

export interface ObserverOptions {
	root?: Element | null
	rootMargin?: string
	threshold?: number | number[]
}

/**
 * Create an IntersectionObserver with default options for heading tracking
 */
export function createHeadingObserver(
	callback: IntersectionCallback,
	options: ObserverOptions = {}
): IntersectionObserver {
	const defaultOptions: ObserverOptions = {
		root: null,
		rootMargin: "-10% 0px -80% 0px",
		threshold: 0,
	}

	return new IntersectionObserver(callback, {
		...defaultOptions,
		...options,
	})
}

/**
 * Observe multiple elements with the same observer
 */
export function observeElements(
	observer: IntersectionObserver,
	elements: Element[]
): void {
	for (const el of elements) {
		observer.observe(el)
	}
}

/**
 * Unobserve all elements and disconnect
 */
export function disconnectObserver(observer: IntersectionObserver): void {
	observer.disconnect()
}
