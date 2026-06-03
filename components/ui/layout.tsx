"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Shell } from "./shell"
import { Navbar } from "./navbar"
import { BottomNav } from "./bottom-nav"
import { Footer } from "./footer"

const layoutVariants = cva("min-h-screen bg-white", {
  variants: {
    variant: {
      default: "",
      dashboard: "dashboard-layout",
      landing: "landing-layout",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface LayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof layoutVariants> {
  showNavbar?: boolean
  showFooter?: boolean
  showBottomNav?: boolean
  showSidebar?: boolean
  sidebarCollapsible?: boolean
  navbarProps?: React.ComponentProps<typeof Navbar>
  footerProps?: React.ComponentProps<typeof Footer>
  children?: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({
  className,
  variant,
  showNavbar = true,
  showFooter = true,
  showBottomNav = false,
  showSidebar = false,
  sidebarCollapsible = true,
  navbarProps,
  footerProps,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(layoutVariants({ variant, className }))}
      {...props}
    >
      {showNavbar && <Navbar {...navbarProps} />}
      
      {showSidebar ? (
        <Shell sidebar={showSidebar} sidebarCollapsible={sidebarCollapsible}>
          {children}
        </Shell>
      ) : (
        <div className="min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      )}
      
      {showFooter && <Footer {...footerProps} />}
      
      {showBottomNav && <BottomNav />}
    </div>
  )
}

export interface LayoutMainProps extends React.HTMLAttributes<HTMLDivElement> {
  fullWidth?: boolean
}

const LayoutMain: React.FC<LayoutMainProps> = ({
  className,
  fullWidth = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex-1 min-h-screen",
        !fullWidth && "container mx-auto px-4 md:px-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface LayoutSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
}

const LayoutSection: React.FC<LayoutSectionProps> = ({
  className,
  as: Component = "section",
  children,
  ...props
}) => {
  return (
    <Component className={cn("py-8 md:py-12", className)} {...props}>
      {children}
    </Component>
  )
}

export interface LayoutContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

const LayoutContainer: React.FC<LayoutContainerProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("container mx-auto px-4 md:px-6", className)} {...props}>
      {children}
    </div>
  )
}

export { Layout, layoutVariants, LayoutMain, LayoutSection, LayoutContainer }
