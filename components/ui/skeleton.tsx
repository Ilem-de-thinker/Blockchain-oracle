import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const skeletonVariants = cva("animate-pulse rounded-md", {
  variants: {
    variant: {
      default:
        "bg-gradient-to-r from-primary/10 to-primary-hover/10 border border-primary/10",
      circular: "rounded-full",
      text: "rounded h-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  )
)
Skeleton.displayName = "Skeleton"

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
}

const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ className, lines = 3, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            skeletonVariants({ variant: "text" }),
            i === lines - 1 && "w-3/4"
          )}
        />
      ))}
    </div>
  )
)
SkeletonText.displayName = "SkeletonText"

export interface SkeletonAvatarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg"
}

const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ className, size = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-full bg-gradient-to-r from-primary/10 to-primary-hover/10",
        {
          "h-8 w-8": size === "sm",
          "h-10 w-10": size === "default",
          "h-12 w-12": size === "lg",
        },
        className
      )}
      {...props}
    />
  )
)
SkeletonAvatar.displayName = "SkeletonAvatar"

export { Skeleton, skeletonVariants, SkeletonText, SkeletonAvatar }
