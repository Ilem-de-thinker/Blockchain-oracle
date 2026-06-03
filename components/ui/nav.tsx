import * as React from "react"
import { Link, useLocation } from "react-router"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const navVariants = cva(
  "inline-flex items-center gap-1 rounded-md bg-primary/10 p-1 text-gray-400 border border-primary/20",
  {
    variants: {
      variant: {
        default: "bg-primary/10",
        underline: "bg-transparent border-none gap-0 p-0",
        pill: "rounded-full bg-transparent border-none gap-0 p-0",
      },
      size: {
        default: "h-10 text-sm",
        sm: "h-8 text-xs",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface NavProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof navVariants> {}

export interface NavLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
  activeClass?: string
}

const Nav = React.forwardRef<HTMLDivElement, NavProps>(
  ({ className, variant, size, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(navVariants({ variant, size, className }))}
      {...props}
    />
  )
)
Nav.displayName = "Nav"

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, to, activeClass, ...props }, ref) => {
    const location = useLocation()
    const isActive = location.pathname === to || location.pathname.startsWith(to + "/")

    return (
      <Link
        ref={ref}
        to={to}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "bg-gradient-to-r from-green-700 to-blue-600 text-white shadow-sm"
            : "hover:bg-primary/10 hover:text-primary",
          activeClass && isActive && activeClass,
          className
        )}
        {...props}
      />
    )
  }
)
NavLink.displayName = "NavLink"

const NavList = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex items-center gap-1", className)}
    {...props}
  />
))
NavList.displayName = "NavList"

const NavItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("list-none", className)} {...props} />
))
NavItem.displayName = "NavItem"

export { Nav, NavLink, NavList, NavItem, navVariants }
