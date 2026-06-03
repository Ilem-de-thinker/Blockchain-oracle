"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const tooltipContentVariants = cva(
  "z-50 overflow-hidden rounded-md border border-purple-600/20 bg-gray-900/95 backdrop-blur-md px-3 py-1.5 text-xs text-gray-100 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      variant: {
        default: "bg-gray-900/95 text-gray-100 border-purple-600/20",
        success: "bg-green-600/20 text-green-400 border-green-600/30",
        warning: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
        destructive: "bg-red-600/20 text-red-400 border-red-600/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipContentVariants> {}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, variant, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    className={cn(tooltipContentVariants({ variant }), className)}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
