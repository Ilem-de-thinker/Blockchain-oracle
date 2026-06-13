import * as React from "react"

import { cva, type VariantProps, cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-md border bg-surface px-3 py-2 text-base text-text ring-offset-transparent placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
  "border-border",
  {
    variants: {
      variant: {
        default: "",
        error:
          "border-red-500 focus-visible:ring-red-500",
        success:
          "border-green-500 focus-visible:ring-green-500",
      },
      size: {
        default: "",
        sm: "text-sm min-h-[60px]",
        lg: "text-lg min-h-[120px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          textareaVariants({
            variant: error ? "error" : variant,
            size,
            className,
          })
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
