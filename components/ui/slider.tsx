import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cva, type VariantProps } from "@/lib/utils"
import { cn } from "@/lib/utils"

const sliderVariants = cva(
  "relative flex w-full touch-none select-none items-center",
  {
    variants: {
      orientation: {
        horizontal: "w-full",
        vertical: "h-full flex-col",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

const sliderTrackVariants = cva(
  "relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200",
  {
    variants: {
      variant: {
        default: "",
        error: "bg-red-500/20",
        success: "bg-green-500/20",
      },
      size: {
        default: "h-2",
        sm: "h-1.5",
        lg: "h-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const sliderRangeVariants = cva("absolute h-full bg-purple-600", {
  variants: {
    variant: {
      default: "bg-purple-600",
      error: "bg-red-500",
      success: "bg-green-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const sliderThumbVariants = cva(
  "block h-5 w-5 rounded-full border-2 border-purple-600 bg-white ring-offset-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        error: "border-red-500",
        success: "border-green-500",
      },
      size: {
        default: "h-5 w-5",
        sm: "h-4 w-4",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof sliderTrackVariants> {
  label?: string
  showValue?: boolean
  formatValue?: (value: number) => string
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant, size, orientation, label, showValue, formatValue, value, ...props }, ref) => {
  const currentValue = value?.[0] ?? 0

  return (
    <div className="space-y-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-gray-900">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-medium text-purple-600">
              {formatValue ? formatValue(currentValue) : currentValue}
            </span>
          )}
        </div>
      )}
      <SliderPrimitive.Root
        ref={ref}
        orientation={orientation}
        className={cn(sliderVariants({ orientation }), className)}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(sliderTrackVariants({ variant, size }))}
        >
          <SliderPrimitive.Range
            className={cn(sliderRangeVariants({ variant }))}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(sliderThumbVariants({ variant, size }))}
        />
      </SliderPrimitive.Root>
    </div>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider, sliderVariants, sliderTrackVariants, sliderThumbVariants }
