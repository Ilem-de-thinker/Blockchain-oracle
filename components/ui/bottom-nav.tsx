"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  Home,
  User,
  Menu,
  ChevronDown,
} from "lucide-react"

import { cn } from "@/lib/utils"

const bottomNavVariants = cva(
  "glass-nav fixed inset-x-0 bottom-4 z-50 mx-auto flex h-[4.5rem] w-[calc(100%-1.5rem)] max-w-md items-center justify-around rounded-[1.75rem] border border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] px-2 shadow-[0_18px_48px_color-mix(in_srgb,var(--color-surface)_72%,transparent)] md:hidden",
  {
    variants: {
      variant: {
        default: "",
        blur: "backdrop-blur-3xl",
        solid: "bg-[var(--color-surface)] backdrop-blur-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BottomNavProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bottomNavVariants> {
  isExpanded?: boolean
  onToggle?: () => void
  items?: BottomNavItem[]
  activeIndex?: number
  onNavigate?: (index: number) => void
}

export interface BottomNavItem {
  label: string
  icon: React.ReactNode
  href?: string
  badge?: number
}

const defaultItems: BottomNavItem[] = [
  { label: "Home", icon: <Home className="h-5 w-5" />, href: "/" },
  { label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, href: "/dashboard" },
  { label: "Analytics", icon: <TrendingUp className="h-5 w-5" />, href: "/analytics" },
  { label: "Wallet", icon: <Wallet className="h-5 w-5" />, href: "/wallet", badge: 2 },
  { label: "Profile", icon: <User className="h-5 w-5" />, href: "/profile" },
]

const BottomNavToggle: React.FC<{ onClick: () => void; isExpanded: boolean }> = ({
  onClick,
  isExpanded,
}) => (
  <button
    onClick={onClick}
    className="fixed bottom-4 right-4 z-[60] w-14 h-14 rounded-full bg-accent shadow-lg flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
    aria-label={isExpanded ? "Close navigation" : "Open navigation"}
  >
    {isExpanded ? (
      <ChevronDown className="w-6 h-6" />
    ) : (
      <Menu className="w-6 h-6" />
    )}
  </button>
)

const BottomNavItemComponent: React.FC<{
  item: BottomNavItem
  isActive: boolean
  onClick?: () => void
}> = ({ item, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center justify-center rounded-2xl px-3 py-2 transition-all duration-200",
        "text-text-muted hover:bg-[color-mix(in_srgb,var(--color-surface-hover)_68%,transparent)] hover:text-text",
        isActive && "bg-[color-mix(in_srgb,var(--color-surface-active)_78%,transparent)] text-accent shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-text)_10%,transparent)]"
      )}
    >
      <div className="relative">
        {item.icon}
        {item.badge && item.badge > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-text-inverse">
            {item.badge}
          </span>
        )}
      </div>
      <span className={cn("mt-1 text-[10px] font-medium tracking-[0.02em]", isActive && "text-accent")}>
        {item.label}
      </span>
    </button>
  )
}

const BottomNav = React.forwardRef<HTMLDivElement, BottomNavProps>(
  ({ className, variant, isExpanded = false, onToggle, items = defaultItems, activeIndex = 0, onNavigate, ...props }, ref) => {
    const [active, setActive] = React.useState(activeIndex)

    const handleItemClick = (index: number) => {
      setActive(index)
      onNavigate?.(index)
    }

    return (
      <>
        <div
          ref={ref}
          className={cn(
            bottomNavVariants({ variant, className }),
            "transition-all duration-300 ease-out",
            isExpanded
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 opacity-0 scale-0 pointer-events-none"
          )}
          {...props}
        >
          {items.map((item, index) => (
            <BottomNavItemComponent
              key={index}
              item={item}
              isActive={active === index}
              onClick={() => handleItemClick(index)}
            />
          ))}
        </div>
        <BottomNavToggle onClick={onToggle} isExpanded={isExpanded} />
      </>
    )
  }
)
BottomNav.displayName = "BottomNav"

export { BottomNav, bottomNavVariants }
