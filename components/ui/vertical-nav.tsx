import * as React from "react"
import { Link, useLocation } from "react-router"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const verticalNavVariants = cva(
  "flex flex-col gap-1 w-64",
  {
    variants: {
      variant: {
        default: "bg-purple-600/5 border-r border-purple-600/20 p-2",
        plain: "bg-transparent p-0",
        card: "bg-[#0a0c0b] border border-purple-600/20 rounded-lg p-2",
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

export interface VerticalNavProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof verticalNavVariants> {
  collapsed?: boolean
}

export interface VerticalNavItemProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
  icon?: React.ReactNode
  activeClass?: string
  collapsed?: boolean
}

export interface VerticalNavGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  icon?: React.ReactNode
}

const VerticalNav = React.forwardRef<HTMLDivElement, VerticalNavProps>(
  ({ className, variant, size, collapsed, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn(
        verticalNavVariants({ variant, size, className }),
        collapsed && "w-16"
      )}
      {...props}
    />
  )
)
VerticalNav.displayName = "VerticalNav"

const VerticalNavItem = React.forwardRef<HTMLAnchorElement, VerticalNavItemProps>(
  ({ className, to, icon, activeClass, collapsed, children, ...props }, ref) => {
    const location = useLocation()
    const isActive = location.pathname === to || location.pathname.startsWith(to + "/")

    return (
      <Link
        ref={ref}
        to={to}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 font-medium transition-all",
          collapsed ? "justify-center px-2" : "px-3",
          isActive
            ? "bg-gradient-to-r from-green-700 to-blue-600 text-white shadow-sm"
            : "text-gray-400 hover:bg-purple-600/10 hover:text-purple-400",
          activeClass && isActive && activeClass,
          className
        )}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {!collapsed && <span>{children}</span>}
      </Link>
    )
  }
)
VerticalNavItem.displayName = "VerticalNavItem"

const VerticalNavGroup = React.forwardRef<HTMLDivElement, VerticalNavGroupProps>(
  ({ className, title, icon, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1", className)}
      {...props}
    >
      {title && (
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest text-purple-400">
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{title}</span>
        </div>
      )}
      {children}
    </div>
  )
)
VerticalNavGroup.displayName = "VerticalNavGroup"

const VerticalNavDivider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("my-2 h-px bg-purple-600/20", className)}
    {...props}
  />
))
VerticalNavDivider.displayName = "VerticalNavDivider"

export {
  VerticalNav,
  VerticalNavItem,
  VerticalNavGroup,
  VerticalNavDivider,
  verticalNavVariants,
}
