"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  Moon,
  Sun,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"

const navbarVariants = cva(
  "sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-purple-600/20 bg-gray-900/95 backdrop-blur-md px-4 md:px-6 transition-all",
  {
    variants: {
      variant: {
        default: "bg-gray-900/95",
        blur: "bg-gray-900/80 backdrop-blur-xl",
        solid: "bg-gray-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface NavbarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof navbarVariants> {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export interface NavbarSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

const NavbarSearch = React.forwardRef<HTMLInputElement, NavbarSearchProps>(
  ({ className, icon, placeholder = "Search...", ...props }, ref) => {
    return (
      <div className="relative flex-1 max-w-md">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          {icon || <Search className="h-4 w-4" />}
        </div>
        <input
          type="search"
          placeholder={placeholder}
          className={cn(
            "w-full h-9 pl-10 pr-4 rounded-lg bg-gray-800/50 border border-purple-600/20",
            "text-sm text-gray-200 placeholder:text-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50",
            "transition-all",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
NavbarSearch.displayName = "NavbarSearch"

export interface NavbarActionsProps {
  children: React.ReactNode
  className?: string
}

const NavbarActions: React.FC<NavbarActionsProps> = ({ children, className }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  )
}

export interface NavbarNotificationProps {
  count?: number
  onClick?: () => void
}

const NavbarNotification: React.FC<NavbarNotificationProps> = ({ count, onClick }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-gray-400 hover:text-purple-400 hover:bg-purple-600/10"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {count && count > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-green-600 text-white text-xs font-medium rounded-full">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  )
}

export interface NavbarUserProps {
  name?: string
  email?: string
  avatar?: string
  onLogout?: () => void
  onSettings?: () => void
}

const NavbarUser: React.FC<NavbarUserProps> = ({
  name = "User",
  email = "user@example.com",
  onLogout,
  onSettings,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 py-1.5 hover:bg-purple-600/10"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium text-white">{name}</span>
            <span className="text-xs text-gray-500">{email}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-purple-600/20">
        <DropdownMenuLabel className="text-gray-200">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-purple-600/20" />
        <DropdownMenuItem className="text-gray-300 hover:text-purple-400 hover:bg-purple-600/10 cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-gray-300 hover:text-purple-400 hover:bg-purple-600/10 cursor-pointer"
          onClick={onSettings}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-purple-600/20" />
        <DropdownMenuItem
          className="text-red-400 hover:text-red-300 hover:bg-red-600/10 cursor-pointer"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const Navbar = React.forwardRef<HTMLDivElement, NavbarProps>(
  ({ className, variant, onMenuClick, showMenuButton = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(navbarVariants({ variant, className }))}
        {...props}
      >
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-400 hover:text-purple-400"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {children}
        </div>
        
        <div className="flex flex-1 items-center justify-end gap-2">
          <NavbarSearch />
          <NavbarActions>
            <NavbarNotification count={5} />
            <NavbarUser name="User" email="user@example.com" />
          </NavbarActions>
        </div>
      </div>
    )
  }
)
Navbar.displayName = "Navbar"

export { Navbar, navbarVariants, NavbarSearch, NavbarActions, NavbarNotification, NavbarUser }