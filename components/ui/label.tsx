import * as React from "react"

import { cva, type VariantProps, cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text",
  {
    variants: {
      variant: {
        default: "",
        error: "text-red-500",
        success: "text-green-500",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  required?: boolean
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, size, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(labelVariants({ variant, size, className }))}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )
  }
)
Label.displayName = "Label"

export { Label, labelVariants }
