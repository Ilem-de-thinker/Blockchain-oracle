import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariants = cva("", {
  variants: {
    variant: {
      default: "bg-primary/10 border-primary/20",
      success: "bg-green-600/10 border-green-600/20",
      warning: "bg-amber-600/10 border-amber-600/20",
      destructive: "bg-red-600/10 border-red-600/20",
    },
    size: {
      default: "h-2",
      sm: "h-1",
      lg: "h-3",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

const indicatorVariants: Record<NonNullable<VariantProps<typeof progressVariants>["variant"]>, string> = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-amber-600",
  destructive: "bg-red-600",
}

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof progressVariants> {
  value?: number
  indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, variant = "default", size, indicatorClassName, ...props }, ref) => {
    const safeValue = Math.max(0, Math.min(100, value))

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-full border bg-transparent transition-all",
          progressVariants({ variant, size }),
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all", 
            indicatorVariants[variant || "default"],
            indicatorClassName
          )}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress, progressVariants }
