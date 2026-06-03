import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const menuVariants = cva(
  "relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-green-700 to-blue-600 text-white shadow-lg hover:from-purple-600 hover:to-purple-500 hover:shadow-purple-500/30",
        outline:
          "border border-purple-600/20 bg-transparent shadow-sm hover:bg-purple-600/10 hover:text-purple-400 text-gray-300",
        ghost: "hover:bg-purple-600/10 hover:text-purple-400 text-gray-400",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface MenuProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof menuVariants> {
  asChild?: boolean
}

const Menu = React.forwardRef<HTMLButtonElement, MenuProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(menuVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {props.children}
        <ChevronDown className="h-4 w-4" />
      </Comp>
    )
  }
)
Menu.displayName = "Menu"

const MenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 min-w-[12rem] overflow-hidden rounded-md border border-purple-600/20 bg-[#0a0c0b] p-1 text-gray-100 shadow-lg",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
MenuContent.displayName = "MenuContent"

const MenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors focus:bg-purple-600/10 focus:text-purple-400 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenuItem.displayName = "MenuItem"

const MenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-purple-600/20", className)}
    {...props}
  />
))
MenuSeparator.displayName = "MenuSeparator"

const MenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-xs font-bold uppercase tracking-widest text-purple-400",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenuLabel.displayName = "MenuLabel"

export {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuLabel,
  menuVariants,
}
