import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cva, type VariantProps } from "@/lib/utils"
import { cn } from "@/lib/utils"

const radioGroupVariants = cva("space-y-2", {
  variants: {
    orientation: {
      vertical: "space-y-2",
      horizontal: "flex gap-4",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

const radioVariants = cva(
  "peer h-5 w-5 shrink-0 rounded-full border border-gray-200 ring-offset-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600",
  {
    variants: {
      variant: {
        default: "",
        error: "border-red-500 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500",
        success:
          "border-green-500 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
    VariantProps<typeof radioGroupVariants> {
  label?: string
  error?: boolean
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, orientation, label, ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <span className="text-sm font-medium text-gray-900">
          {label}
        </span>
      )}
      <RadioGroupPrimitive.Root
        ref={ref}
        className={cn(radioGroupVariants({ orientation }), className)}
        {...props}
      />
    </div>
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

export interface RadioProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioVariants> {
  label?: string
}

const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioProps
>(({ className, variant, label, id, ...props }, ref) => {
  const radioId = React.useId() || id

  return (
    <div className="flex items-center gap-2">
      <RadioGroupPrimitive.Item
        ref={ref}
        id={radioId}
        className={cn(radioVariants({ variant, className }))}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="h-2.5 w-2.5 fill-white text-white" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      {label && (
        <label
          htmlFor={radioId}
          className="text-sm font-medium text-gray-900 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
    </div>
  )
})
Radio.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, Radio, radioVariants }
