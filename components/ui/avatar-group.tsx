import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const avatarGroupVariants = cva("flex items-center", {
  variants: {
    size: {
      sm: "[&_span]:h-8 [&_span]:w-8 [&_span]:text-xs",
      md: "[&_span]:h-10 [&_span]:w-10 [&_span]:text-sm",
      lg: "[&_span]:h-12 [&_span]:w-12 [&_span]:text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export interface AvatarGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarGroupVariants> {
  max?: number
  total?: number
  children: React.ReactNode
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, size, max, total, children, ...props }, ref) => {
    const childArray = React.Children.toArray(children)
    const displayCount = max ? Math.min(max, childArray.length) : childArray.length
    const remaining = total || childArray.length - displayCount

    return (
      <div
        ref={ref}
        className={cn(avatarGroupVariants({ size }), className)}
        {...props}
      >
        {childArray.slice(0, displayCount).map((child, index) => (
          <div
            key={index}
            className="relative -ml-2 first:ml-0 ring-2 ring-white"
            style={{ zIndex: displayCount - index }}
          >
            {child}
          </div>
        ))}
        {remaining > 0 && (
          <div
            className={cn(
              "relative -ml-2 flex items-center justify-center rounded-full border border-purple-600/20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 text-purple-400 font-medium ring-2 ring-white",
              size === "sm" && "h-8 w-8 text-xs",
              size === "md" && "h-10 w-10 text-sm",
              size === "lg" && "h-12 w-12 text-base"
            )}
          >
            +{remaining}
          </div>
        )}
      </div>
    )
  }
)
AvatarGroup.displayName = "AvatarGroup"

export { AvatarGroup }
