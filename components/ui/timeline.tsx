import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

const timelineVariants = cva("relative space-y-4 pl-4", {
  variants: {
    variant: {
      default: "",
      connected: "border-l-2 border-purple-600/20",
    },
  },
  defaultVariants: {
    variant: "connected",
  },
})

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description?: string
  timestamp?: string
  isLast?: boolean
}

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, icon: Icon, title, description, timestamp, isLast, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative flex gap-4", !isLast && "pb-4", className)}
      {...props}
    >
      <div className="relative flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-600/20 bg-gradient-to-br from-purple-600/10 to-green-600/10">
          {Icon && <Icon className="h-5 w-5 text-purple-500" />}
        </div>
        {!isLast && <div className="h-full w-0.5 bg-purple-600/20" />}
      </div>
      <div className="flex-1 pb-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">{title}</h4>
          {timestamp && (
            <span className="text-xs text-gray-500">{timestamp}</span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
        {children}
      </div>
    </div>
  )
)
TimelineItem.displayName = "TimelineItem"

export interface TimelineProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof timelineVariants> {
  children: React.ReactNode
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, variant, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(timelineVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
)
Timeline.displayName = "Timeline"

export { Timeline, TimelineItem }
