import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { FileQuestion } from "lucide-react"

import { cn } from "@/lib/utils"

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center",
  {
    variants: {
      size: {
        default: "py-12 px-4",
        sm: "py-8 px-4",
        lg: "py-16 px-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      size,
      icon,
      title,
      description,
      action,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(emptyStateVariants({ size }), className)}
      {...props}
    >
      {icon && (
        <div className="mb-4 rounded-full bg-purple-600/10 p-3">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        {title}
      </h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-gray-600">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
)
EmptyState.displayName = "EmptyState"

export { EmptyState, emptyStateVariants }
