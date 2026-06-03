import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Bell, CheckCircle2, Clock, X } from "lucide-react"

import { cn } from "@/lib/utils"

const notificationVariants = cva(
  "relative flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-surface",
        success: "border-green-600/20 bg-surface",
        warning: "border-amber-600/20 bg-surface",
        error: "border-red-600/20 bg-surface",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  icon?: "bell" | "success" | "clock"
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ className, variant, icon = "bell", children, ...props }, ref) => {
    const Icon = {
      bell: Bell,
      success: CheckCircle2,
      clock: Clock,
    }[icon]

    return (
      <div
        ref={ref}
        className={cn(notificationVariants({ variant }), className)}
        {...props}
      >
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    )
  }
)
Notification.displayName = "Notification"

export interface NotificationTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

const NotificationTitle = React.forwardRef<
  HTMLHeadingElement,
  NotificationTitleProps
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn("font-medium text-text", className)}
    {...props}
  />
))
NotificationTitle.displayName = "NotificationTitle"

export interface NotificationDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const NotificationDescription = React.forwardRef<
  HTMLParagraphElement,
  NotificationDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-text-secondary", className)}
    {...props}
  />
))
NotificationDescription.displayName = "NotificationDescription"

export interface NotificationActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const NotificationAction = React.forwardRef<
  HTMLbuttonElement,
  NotificationActionProps
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "text-sm font-medium text-primary hover:text-primary-dark transition-colors",
      className
    )}
    {...props}
  />
))
NotificationAction.displayName = "NotificationAction"

export {
  Notification,
  notificationVariants,
  NotificationTitle,
  NotificationDescription,
  NotificationAction,
}
