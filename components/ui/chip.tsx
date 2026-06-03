import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const chipVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-purple-600/20 text-purple-400 border border-purple-600/30",
        secondary:
          "bg-gray-600/20 text-gray-400 border border-gray-600/30",
        success:
          "bg-green-600/20 text-green-400 border border-green-600/30",
        warning:
          "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30",
        destructive:
          "bg-red-600/20 text-red-400 border border-red-600/30",
        outline:
          "border border-purple-600/30 text-purple-400 hover:bg-purple-600/10",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5",
        default: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {
  onRemove?: () => void
}

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, variant, size, onRemove, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(chipVariants({ variant, size }), className)} {...props}>
        {children}
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="ml-0.5 rounded-full hover:bg-purple-600/30 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
    )
  }
)
Chip.displayName = "Chip"

export { Chip, chipVariants }
