import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Native-style Skeleton component with smooth pulse animation.
 * Optimized for reduced layout shift (CLS).
 */
const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "animate-pulse rounded-md bg-surface-alt/80 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
})
Skeleton.displayName = "Skeleton"

export { Skeleton }
