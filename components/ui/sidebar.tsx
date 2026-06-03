"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  FileText,
  Bell,
  Users,
  Wallet,
  TrendingUp,
  Menu,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Link } from "react-router-dom"

const sidebarVariants = cva(
  "fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-900/95 backdrop-blur-md border-r border-purple-600/20 transition-all duration-300",
  {
    variants: {
      width: {
        default: "w-64",
        collapsed: "w-20",
        expanded: "w-72",
      },
      collapsed: {
        true: "w-20",
        false: "",
      },
    },
    defaultVariants: {
      width: "default",
      collapsed: false,
    },
  }
)

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  collapsible?: boolean
}

interface NavItem {
  title: string
  href?: string
  icon?: React.ReactNode
  badge?: number
  children?: NavItem[]
}

interface SidebarSection {
  title?: string
  items: NavItem[]
}

const defaultNavItems: SidebarSection[] = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
      { title: "Analytics", href: "/analytics", icon: <TrendingUp className="h-5 w-5" /> },
      { title: "Wallet", href: "/wallet", icon: <Wallet className="h-5 w-5" /> },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Events", href: "/events", icon: <FileText className="h-5 w-5" />, badge: 3 },
      { title: "Notifications", href: "/notifications", icon: <Bell className="h-5 w-5" />, badge: 5 },
      { title: "Users", href: "/users", icon: <Users className="h-5 w-5" /> },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
    ],
  },
]

interface SidebarContentProps {
  sections?: SidebarSection[]
  collapsed?: boolean
  className?: string
}

const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ sections = defaultNavItems, collapsed, className }, ref) => {
    return (
      <div ref={ref} className={cn("flex flex-col h-full py-4", className)}>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={cn("mb-6", collapsed && "px-2")}>
            {!collapsed && section.title && (
              <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <a
                    href={item.href || "#"}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all",
                      "text-gray-400 hover:text-purple-400 hover:bg-purple-600/10 rounded-lg mx-2",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }
)
SidebarContent.displayName = "SidebarContent"

export interface SidebarLogoProps {
  logo?: React.ReactNode
  collapsed?: boolean
  className?: string
}

const SidebarLogo: React.FC<SidebarLogoProps> = ({ logo, collapsed, className }) => {
  const defaultLogo = (
    <div className="flex items-center gap-3 px-4">
      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-600 to-purple-600 flex items-center justify-center">
        <TrendingUp className="h-6 w-6 text-white" />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-lg font-bold text-white">Oracle</span>
          <span className="text-xs text-gray-400">Blockchain</span>
        </div>
      )}
    </div>
  )

  return (
    <Link to="/" className={cn("block py-4 border-b border-purple-600/20", collapsed ? "px-2" : "px-4", className)}>
      {logo || defaultLogo}
    </Link>
  )
}

export interface SidebarFooterProps {
  children?: React.ReactNode
  collapsed?: boolean
  className?: string
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ children, collapsed, className }) => {
  return (
    <div className={cn("mt-auto pt-4 border-t border-purple-600/20", className)}>
      {children || (
        <div className={cn("px-4", collapsed && "px-2")}>
          <div className={cn("flex items-center gap-3 p-2 rounded-lg", collapsed && "justify-center")}>
            {!collapsed && (
              <>
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-green-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  U
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">User Name</p>
                  <p className="text-xs text-gray-500 truncate">user@example.com</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, width, collapsed: controlledCollapsed, collapsible = true, children, ...props }, ref) => {
    const [collapsed, setCollapsed] = React.useState(false)
    const isCollapsed = controlledCollapsed ?? collapsed

    return (
      <div
        ref={ref}
        className={cn(
          sidebarVariants({ width, collapsed: isCollapsed, className })
        )}
        {...props}
      >
        <SidebarLogo collapsed={isCollapsed} />
        
        {children || <SidebarContent sections={defaultNavItems} collapsed={isCollapsed} />}
        
        {collapsible && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute -right-3 top-20 h-6 w-6 rounded-full border border-purple-600/30 bg-gray-900",
              "hover:bg-purple-600/20 hover:text-purple-400",
              isCollapsed && "rotate-180"
            )}
            onClick={() => setCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        )}
        
        <SidebarFooter collapsed={isCollapsed} />
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

export { Sidebar, sidebarVariants, SidebarContent, SidebarLogo, SidebarFooter }