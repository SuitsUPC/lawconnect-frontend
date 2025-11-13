"use client"

import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseClasses = "font-semibold rounded-lg transition-all duration-300 focus:outline-none"

    const variantClasses = {
      primary: "button-primary",
      secondary: "button-secondary",
      ghost: "text-foreground hover:bg-neutral-700/50",
    }

    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    }

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    )
  },
)

Button.displayName = "Button"

export { Button }
export default Button
