import * as React from "react"
import { Search, X } from "lucide-react"

import { cva, type VariantProps, cn } from "@/lib/utils"

const searchInputVariants = cva(
  "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base text-gray-900 ring-offset-transparent placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "",
        error:
          "border-red-500 focus-visible:ring-red-500",
        success:
          "border-green-500 focus-visible:ring-green-500",
      },
      size: {
        default: "",
        sm: "h-8 text-sm px-2",
        lg: "h-12 text-lg px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof searchInputVariants> {
  onSearch?: (value: string) => void
  showClear?: boolean
  debounce?: number
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { className, variant, size, onSearch, showClear = true, debounce, value, onChange, ...props },
    ref
  ) => {
    const [localValue, setLocalValue] = React.useState(value as string || "")
    const debounceRef = React.useRef<NodeJS.Timeout>()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)

      if (debounce && onSearch) {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => onSearch(newValue), debounce)
      } else {
        onSearch?.(newValue)
      }
    }

    const handleClear = () => {
      setLocalValue("")
      onSearch?.("")
    }

    React.useEffect(() => {
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
      }
    }, [])

    return (
      <div className="relative">
        <input
          ref={ref}
          type="search"
          value={localValue}
          onChange={handleChange}
          className={cn(
            searchInputVariants({ variant, size, className }),
            showClear && localValue && "pr-8"
          )}
          {...props}
        />
        {showClear && localValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput, searchInputVariants }
