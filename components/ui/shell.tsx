"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"
import { Button } from "./button"

const shellVariants = cva(
  "relative min-h-screen bg-gray-50",
  {
    variants: {
      variant: {
        default: "",
        bordered: "border-x border-purple-600/20",
        card: "bg-gray-900/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ShellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof shellVariants> {
  sidebar?: boolean
  sidebarCollapsible?: boolean
  sidebarWidth?: "default" | "collapsed" | "expanded"
  children?: React.ReactNode
}

const ShellContent: React.FC<{
  sidebarWidth?: "default" | "collapsed" | "expanded"
  sidebarCollapsible?: boolean
  children?: React.ReactNode
  className?: string
}> = ({ sidebarWidth, sidebarCollapsible, children, className }) => {
  return (
    <div className={cn("flex min-h-screen", className)}>
      <Sidebar
        width={sidebarWidth}
        collapsible={sidebarCollapsible}
        className="hidden md:flex"
      />
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  )
}

const Shell: React.FC<ShellProps> = ({
  className,
  variant,
  sidebar = true,
  sidebarCollapsible = true,
  sidebarWidth = "default",
  children,
  ...props
}) => {
  return (
    <div
      className={cn(shellVariants({ variant, className }))}
      {...props}
    >
      <ShellContent
        sidebarWidth={sidebarWidth}
        sidebarCollapsible={sidebarCollapsible}
        sidebar={sidebar}
      >
        {children}
      </ShellContent>
    </div>
  )
}

export interface ShellMainProps extends React.HTMLAttributes<HTMLDivElement> {
  withSidebar?: boolean
}

const ShellMain: React.FC<ShellMainProps> = ({
  className,
  withSidebar = true,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex-1 min-h-screen",
        withSidebar && "md:ml-64",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Shell, shellVariants, ShellMain }