import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 shadow-sm transition-all [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-purple-600/20 bg-purple-600/5 text-purple-400",
        success:
          "border-green-600/20 bg-green-600/5 text-green-400 [&>svg]:text-green-500",
        warning:
          "border-amber-600/20 bg-amber-600/5 text-amber-400 [&>svg]:text-amber-500",
        destructive:
          "border-red-600/20 bg-red-600/5 text-red-400 [&>svg]:text-red-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, alertVariants, AlertTitle, AlertDescription }
