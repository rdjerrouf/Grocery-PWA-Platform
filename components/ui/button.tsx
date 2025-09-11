import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-green-500 text-white hover:bg-green-600": variant === "default",
            "border border-gray-300 hover:bg-gray-50": variant === "outline",
            "hover:bg-gray-100": variant === "ghost"
          },
          {
            "h-9 px-3 text-sm": size === "sm",
            "h-10 px-4 py-2": size === "md",
            "h-11 px-8 text-lg": size === "lg"
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
