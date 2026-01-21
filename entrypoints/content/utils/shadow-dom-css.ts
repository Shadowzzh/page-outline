/**
 * 处理 CSS 使其兼容 Shadow DOM
 *
 * 主要解决 Tailwind CSS v4 在 Shadow DOM 中的兼容性问题：
 * 1. :root 选择器在 Shadow DOM 中不工作 → 替换为 :host
 * 2. @property 声明在 Shadow DOM 中不工作 → 提取并转换为普通 CSS 变量
 *
 * @see https://github.com/tailwindlabs/tailwindcss/discussions/16772
 */
export function processCssForShadowDom(css: string): string {
	// 1. 提取 @property 声明的初始值
	const propertyDefaults: Array<{ name: string; value: string }> = []
	const propertyRegex =
		/@property\s+(--[\w-]+)\s*\{[^}]*initial-value:\s*([^;}]+)[^}]*\}/g
	let match: RegExpExecArray | null = propertyRegex.exec(css)
	while (match !== null) {
		propertyDefaults.push({ name: match[1], value: match[2].trim() })
		match = propertyRegex.exec(css)
	}

	// 2. 生成变量回退声明（因为 @property 在 Shadow DOM 中不工作）
	let fallbackCss = ""
	if (propertyDefaults.length > 0) {
		const fallbackDecls = propertyDefaults
			.map(({ name, value }) => `${name}: ${value};`)
			.join("\n  ")
		fallbackCss = `*, ::before, ::after {\n  ${fallbackDecls}\n}\n`
	}

	// 3. 替换选择器
	const processedCss = css
		.replace(/:root(?![a-zA-Z-])/g, ":host") // :root → :host
		.replace(/(?<![:\w])\.dark(?![a-zA-Z-])/g, ":host(.dark)") // .dark → :host(.dark)
		.replace(/(\d*\.?\d+)rem\b/g, "$1em") // rem → em (Shadow DOM 隔离)

	return fallbackCss + processedCss
}
