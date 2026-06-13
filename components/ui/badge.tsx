import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-primary-hover text-white shadow",
        secondary:
          "border-transparent bg-primary/20 text-primary border border-primary/30",
        destructive:
          "border-transparent bg-red-600/20 text-red-400 border border-red-600/30",
        outline:
          "border-primary/30 text-primary",
        success:
          "border-transparent bg-green-600/20 text-green-400 border border-green-600/30",
        warning:
          "border-transparent bg-amber-600/20 text-amber-400 border border-amber-600/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning"

export interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children?: React.ReactNode
  id?: string
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler<HTMLDivElement>
  title?: string
}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
