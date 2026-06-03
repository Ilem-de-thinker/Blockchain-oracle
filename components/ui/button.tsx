import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-primary-hover text-white hover:-translate-y-0.5",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white  hover:-translate-y-0.5",
        outline:
          "border-2 border-primary/20 bg-transparent text-text  hover:border-primary/40 hover:bg-primary/5 hover:text-text",
        secondary:
          "bg-secondary/10 text-secondary-foreground  hover:bg-secondary/20 border border-secondary/20",
        ghost: "text-text-secondary hover:bg-primary/10 hover:text-text",
        link: "text-text underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-amber-500 to-orange-600 text-white  hover:-translate-y-0.5",
        success: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-2",
        xs: "h-7 rounded-lg px-2 text-[10px]",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-2xl px-10 text-base font-bold",
        xl: "h-16 rounded-2xl px-12 text-lg font-bold",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
    if (asChild && !React.isValidElement(children)) {
      throw new Error('Button with asChild must have a single React element child')
    }
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
