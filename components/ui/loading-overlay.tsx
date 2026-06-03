import * as React from "react"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export interface LoadingOverlayProps {
  isLoading: boolean
  children?: React.ReactNode
  className?: string
  message?: string
}

const LoadingOverlay = ({
  isLoading,
  children,
  className,
  message,
}: LoadingOverlayProps) => {
  if (!isLoading) return <>{children}</>

  return (
    <div className={cn("relative", className)}>
      {children && (
        <div className="pointer-events-none opacity-50 blur-[1px]">
          {children}
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-purple-500" />
          {message && (
            <p className="text-sm font-medium text-gray-600">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export { LoadingOverlay }
