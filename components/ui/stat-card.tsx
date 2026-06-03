import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const statCardVariants = cva(
  "relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        gradient:
          "border-transparent bg-gradient-to-br from-purple-500/10 to-green-500/10",
        outlined:
          "border-2 border-gray-200 bg-transparent",
        minimal: "border-0 bg-transparent p-0 shadow-none",
      },
      size: {
        default: "",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  label: string
  value: string | number
  description?: string
  change?: number
  changeLabel?: string
  trend?: "up" | "down" | "neutral"
  sparklineData?: number[]
  icon?: React.ReactNode
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      variant,
      size,
      label,
      value,
      description,
      change,
      changeLabel,
      trend = "neutral",
      sparklineData,
      icon,
      ...props
    },
    ref
  ) => {
    const getTrendIcon = () => {
      if (trend === "up") return <TrendingUp className="h-4 w-4" />
      if (trend === "down") return <TrendingDown className="h-4 w-4" />
      return <Minus className="h-4 w-4" />
    }

    const getTrendColor = () => {
      if (trend === "up") return "text-green-600"
      if (trend === "down") return "text-red-600"
      return "text-gray-600"
    }

    const renderSparkline = () => {
      if (!sparklineData || sparklineData.length === 0) return null

      const max = Math.max(...sparklineData)
      const min = Math.min(...sparklineData)
      const range = max - min || 1
      const width = 120
      const height = 40

      const points = sparklineData
        .map((val, i) => {
          const x = (i / (sparklineData.length - 1)) * width
          const y = height - ((val - min) / range) * height
          return `${x},${y}`
        })
        .join(" ")

      const isPositive =
        sparklineData[sparklineData.length - 1] >= sparklineData[0]

      return (
        <svg width={width} height={height} className="overflow-visible">
          <polyline
            fill="none"
            stroke={isPositive ? "#16a34a" : "#dc2626"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(statCardVariants({ variant, size }), className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">
              {label}
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {value}
            </p>
            {description && (
              <p className="text-sm text-gray-500">
                {description}
              </p>
            )}
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-600">
              {icon}
            </div>
          )}
        </div>

        {sparklineData && (
          <div className="mt-4">
            <div className="h-10">{renderSparkline()}</div>
          </div>
        )}

        {(change !== undefined || changeLabel) && (
          <div className="mt-4 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-sm font-medium",
                getTrendColor()
              )}
            >
              {getTrendIcon()}
              {change !== undefined && `${change > 0 ? "+" : ""}${change}%`}
            </span>
            {changeLabel && (
              <span className="text-sm text-gray-500">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard, statCardVariants }