import * as React from "react"

import { cn } from "@/lib/utils"

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? "none presentation" : "separator"}
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-purple-600/20",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Divider.displayName = "Divider"

export { Divider }
