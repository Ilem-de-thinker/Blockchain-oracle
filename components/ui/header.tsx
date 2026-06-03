"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronRight, Home, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"

const headerVariants = cva(
  "flex flex-col gap-4 py-6",
  {
    variants: {
      size: {
        default: "",
        sm: "py-4",
        lg: "py-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface HeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof headerVariants> {}

export interface BreadcrumbItem {
  title: string
  href?: string
  isActive?: boolean
}

export interface HeaderBreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

const HeaderBreadcrumbs: React.FC<HeaderBreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav className={cn("flex items-center gap-1 text-sm", className)} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5">
        <li>
          <a
            href="/"
            className="text-gray-500 hover:text-purple-400 transition-colors"
          >
            <Home className="h-4 w-4" />
          </a>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
            {item.isActive ? (
              <span className="text-gray-300 font-medium">{item.title}</span>
            ) : (
              <a
                href={item.href || "#"}
                className="text-gray-500 hover:text-purple-400 transition-colors"
              >
                {item.title}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export interface HeaderTitleProps {
  title: string
  description?: string
  className?: string
}

const HeaderTitle: React.FC<HeaderTitleProps> = ({ title, description, className }) => {
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-gray-400">{description}</p>
      )}
    </div>
  )
}

export interface HeaderActionsProps {
  children: React.ReactNode
  className?: string
}

const HeaderActions: React.FC<HeaderActionsProps> = ({ children, className }) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {children}
    </div>
  )
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({ className, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(headerVariants({ size, className }))}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Header.displayName = "Header"

export { Header, headerVariants, HeaderBreadcrumbs, HeaderTitle, HeaderActions }