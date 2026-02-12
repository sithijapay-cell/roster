import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
        default: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden after:absolute after:inset-0 after:bg-white/20 after:translate-x-[-100%] hover:after:translate-x-[100%] after:transition-transform after:duration-700",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline: "border-2 border-slate-200 bg-transparent hover:bg-slate-50 hover:text-slate-900 transition-colors",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-primary underline-offset-4 hover:underline",
    }

    const sizes = {
        default: "h-11 px-6 py-2", // Larger touch target
        sm: "h-9 rounded-md px-4",
        lg: "h-14 rounded-full px-10 text-lg", // Prominent CTA
        icon: "h-11 w-11",
    }

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 tracking-wide group",
                variants[variant],
                sizes[size],
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button }
