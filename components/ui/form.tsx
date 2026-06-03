import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cva, type VariantProps, cn } from "@/lib/utils"

const formVariants = cva("space-y-4", {
  variants: {
    layout: {
      default: "space-y-4",
      inline: "flex items-center gap-4",
      grid: "grid gap-4",
    },
    size: {
      default: "",
      sm: "text-sm",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    layout: "default",
    size: "default",
  },
})

const formFieldVariants = cva("space-y-2", {
  variants: {
    orientation: {
      default: "space-y-2",
      horizontal: "flex items-center gap-4",
    },
  },
  defaultVariants: {
    orientation: "default",
  },
})

export interface FormProps
  extends React.FormHTMLAttributes<HTMLFormElement>,
    VariantProps<typeof formVariants> {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, layout, size, onSubmit, ...props }, ref) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      onSubmit?.(e)
    }

    return (
      <form
        ref={ref}
        className={cn(formVariants({ layout, size }), className)}
        onSubmit={handleSubmit}
        {...props}
      />
    )
  }
)
Form.displayName = "Form"

export interface FormFieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formFieldVariants> {
  name: string
  label?: string
  error?: string
  hint?: string
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, orientation, label, error, hint, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(formFieldVariants({ orientation }), className)}
        {...props}
      >
        {label && (
          <Label htmlFor={props.name} variant={error ? "error" : "default"}>
            {label}
          </Label>
        )}
        {children}
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-500">{hint}</p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

export interface FormButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "link" | "secondary" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

const FormButton = React.forwardRef<HTMLButtonElement, FormButtonProps>(
  ({ className, asChild, variant = "default", size = "default", ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          "bg-purple-600 text-white hover:bg-purple-700",
          className
        )}
        {...props}
      />
    )
  }
)
FormButton.displayName = "FormButton"

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium text-gray-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
Label.displayName = "Label"

export { Form, FormField, FormButton, formVariants, formFieldVariants }
