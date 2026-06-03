import * as React from "react"

import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "lg", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        {
          "max-w-sm": size === "sm",
          "max-w-md": size === "md",
          "max-w-lg": size === "lg",
          "max-w-xl": size === "xl",
          "max-w-full": size === "full",
        },
        className
      )}
      {...props}
    />
  )
)
Container.displayName = "Container"

export { Container }
