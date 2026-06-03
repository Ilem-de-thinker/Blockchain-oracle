"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

const popoverContentVariants = cva(
  "z-50 w-72 rounded-lg border border-purple-600/20 bg-gray-900/95 backdrop-blur-md p-4 text-gray-100 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      align: {
        center: "center",
        start: "start",
        end: "end",
      },
      side: {
        top: "bottom-auto",
        right: "left-auto",
        bottom: "top-auto",
        left: "right-auto",
      },
    },
    defaultVariants: {
      align: "center",
      side: "bottom",
    },
  }
)

interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
    VariantProps<typeof popoverContentVariants> {}

type PopoverAlign = NonNullable<VariantProps<typeof popoverContentVariants>["align"]>
type PopoverSide = NonNullable<VariantProps<typeof popoverContentVariants>["side"]>

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ align = "center" as PopoverAlign, side = "bottom" as PopoverSide, className, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      side={side}
      className={cn(popoverContentVariants({ align, side }), className)}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
