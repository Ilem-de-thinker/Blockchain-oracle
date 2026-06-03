import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-lg border p-4 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border-purple-600/20 bg-purple-900/90 text-purple-100",
        success: "border-green-600/20 bg-green-900/90 text-green-100",
        warning: "border-amber-600/20 bg-amber-900/90 text-amber-100",
        destructive: "border-red-600/20 bg-red-900/90 text-red-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, onClose, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        {children}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:bg-white/10 hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = "Toast"

export interface ToastActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-white/20 bg-transparent px-3 text-xs font-medium transition-colors hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)
ToastAction.displayName = "ToastAction"

export { Toast, toastVariants, ToastAction }
