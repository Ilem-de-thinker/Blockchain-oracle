import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const statsVariants = cva("", {
  variants: {
    variant: {
      default: "",
      gradient: "bg-gradient-to-br from-purple-600/10 to-green-600/10",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface StatsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statsVariants> {
  icon?: LucideIcon
  value: string | number
  label: string
  trend?: {
    value: number
    direction: "up" | "down"
  }
}

const Stats = React.forwardRef<HTMLDivElement, StatsProps>(
  ({ className, variant, icon: Icon, value, label, trend, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(statsVariants({ variant }), className)}
      {...props}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10">
            <Icon className="h-6 w-6 text-purple-500" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center text-sm font-medium",
              trend.direction === "up" ? "text-green-500" : "text-red-500"
            )}
          >
            <span>{trend.direction === "up" ? "↑" : "↓"}</span>
            <span className="ml-1">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
)
Stats.displayName = "Stats"

export { Stats }
