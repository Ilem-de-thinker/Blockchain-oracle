import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cva, type VariantProps } from "@/lib/utils"
import { cn } from "@/lib/utils"

const checkboxVariants = cva(
  "peer h-5 w-5 shrink-0 rounded-md border border-border ring-offset-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-white",
  {
    variants: {
      variant: {
        default: "",
        error: "border-red-500 data-[state=checked]:bg-red-500",
        success: "border-green-500 data-[state=checked]:bg-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  label?: string
  error?: boolean
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant, label, error, id, ...props }, ref) => {
  const checkboxId = React.useId() || id

  return (
    <div className="flex items-center gap-2">
      <CheckboxPrimitive.Root
        id={checkboxId}
        ref={ref}
        className={cn(
          checkboxVariants({
            variant: error ? "error" : variant,
            className,
          })
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn("flex items-center justify-center text-current")}
        >
          <Check className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label
          htmlFor={checkboxId}
          className="text-sm font-medium text-text cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
    </div>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox, checkboxVariants }
