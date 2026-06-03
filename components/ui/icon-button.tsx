import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-green-700 to-blue-600 text-white shadow-lg hover:from-purple-600 hover:to-purple-500 hover:shadow-purple-500/30",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700",
        outline:
          "border border-purple-600/20 bg-transparent shadow-sm hover:bg-purple-600/10 hover:text-purple-400 text-gray-300",
        secondary:
          "bg-purple-600/10 text-purple-400 shadow-sm hover:bg-purple-600/20 border border-purple-600/20",
        ghost: "hover:bg-purple-600/10 hover:text-purple-400 text-gray-400",
        link: "text-purple-400 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 w-8",
        default: "h-9 w-9",
        lg: "h-10 w-10",
        xl: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(iconButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton, iconButtonVariants }
