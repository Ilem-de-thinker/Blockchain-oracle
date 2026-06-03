import * as React from "react"
import { Link } from "react-router"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {}

export interface BreadcrumbItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  isActive?: boolean
}

export interface BreadcrumbLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean
}

export interface BreadcrumbSeparatorProps extends React.HTMLAttributes<HTMLLIElement> {}

const Breadcrumb = React.forwardRef<
  HTMLElement,
  BreadcrumbProps
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label="breadcrumb"
    className={cn("flex", className)}
    {...props}
  />
))
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.OlHTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-text-muted sm:gap-2.5",
      className
    )}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  BreadcrumbItemProps
>(({ className, isActive, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  BreadcrumbLinkProps
>(({ className, asChild, ...props }, ref) => {
  return (
    <a
      ref={ref}
      className={cn(
        "transition-colors hover:text-primary focus:text-primary",
        className
      )}
      {...props}
    />
  )
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("font-medium text-primary", className)}
    {...props}
  />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  BreadcrumbSeparatorProps
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    role="presentation"
    className={cn("[&>svg]:size-3.5", className)}
    {...props}
  >
    <ChevronRight className="text-text-muted" />
  </li>
))
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
}
