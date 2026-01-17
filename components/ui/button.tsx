import { cn } from "@/lib/utils"
import * as React from "react"

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "ghost" | "outline"
	size?: "default" | "sm" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = "default", size = "default", ...props }, ref) => {
		return (
			<button
				className={cn(
					"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
					{
						"bg-primary text-primary-foreground hover:bg-primary/90":
							variant === "default",
						"hover:bg-accent hover:text-accent-foreground": variant === "ghost",
						"border border-border bg-background hover:bg-accent":
							variant === "outline",
					},
					{
						"h-9 px-4 py-2": size === "default",
						"h-8 px-3 text-xs": size === "sm",
						"h-8 w-8": size === "icon",
					},
					className
				)}
				ref={ref}
				{...props}
			/>
		)
	}
)
Button.displayName = "Button"

export { Button }
