import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const listVariants = cva("space-y-2", {
  variants: {
    variant: {
      default: "",
      bordered: "border border-purple-600/10 rounded-lg p-4",
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const listItemVariants = cva(
  "flex items-center gap-3 rounded-md p-3 transition-colors",
  {
    variants: {
      variant: {
        default: "hover:bg-purple-600/5",
        ghost: "hover:bg-purple-600/5",
        bordered: "border border-purple-600/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof listVariants> {
  children: React.ReactNode
}

const List = React.forwardRef<HTMLDivElement, ListProps>(
  ({ className, variant, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(listVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
)
List.displayName = "List"

export interface ListItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof listItemVariants> {
  startContent?: React.ReactNode
  endContent?: React.ReactNode
}

const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
  ({ className, variant, startContent, endContent, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(listItemVariants({ variant }), className)}
      {...props}
    >
      {startContent && <span className="flex-shrink-0">{startContent}</span>}
      <span className="flex-1">{children}</span>
      {endContent && <span className="flex-shrink-0">{endContent}</span>}
    </div>
  )
)
ListItem.displayName = "ListItem"

export { List, ListItem }
