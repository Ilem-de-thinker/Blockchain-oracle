import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardExtendedVariants = cva(
  "relative overflow-hidden rounded-lg border bg-surface shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-border",
        interactive:
          "cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
        hoverable:
          "cursor-pointer hover:border-green-500/30 hover:shadow-md hover:shadow-green-500/10",
        elevated:
          "border-0 bg-surface shadow-lg shadow-black/5",
        glass:
          "border-0 bg-surface/60 backdrop-blur-xl shadow-xl shadow-primary/5",
        bordered:
          "border-2 border-border bg-transparent shadow-none",
      },
      hover: {
        none: "",
        scale: "hover:scale-[1.02]",
        translate: "hover:-translate-y-1",
        glow: "hover:shadow-lg hover:shadow-primary/20",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
      size: "default",
    },
  }
)

export interface CardExtendedProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardExtendedVariants> {
  asChild?: boolean
}

const CardExtended = React.forwardRef<HTMLDivElement, CardExtendedProps>(
  ({ className, variant, hover, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "div" : "div"
    return (
      <Comp
        ref={ref}
        className={cn(
          cardExtendedVariants({ variant, hover, size }),
          className
        )}
        {...props}
      />
    )
  }
)
CardExtended.displayName = "CardExtended"

const CardExtendedHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
CardExtendedHeader.displayName = "CardExtendedHeader"

const CardExtendedTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-text",
      className
    )}
    {...props}
  />
))
CardExtendedTitle.displayName = "CardExtendedTitle"

const CardExtendedDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-text-secondary", className)}
    {...props}
  />
))
CardExtendedDescription.displayName = "CardExtendedDescription"

const CardExtendedContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-4", className)} {...props} />
))
CardExtendedContent.displayName = "CardExtendedContent"

const CardExtendedFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
))
CardExtendedFooter.displayName = "CardExtendedFooter"

export {
  CardExtended,
  CardExtendedHeader,
  CardExtendedTitle,
  CardExtendedDescription,
  CardExtendedContent,
  CardExtendedFooter,
  cardExtendedVariants,
}
