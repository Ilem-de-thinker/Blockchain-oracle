import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cva, type VariantProps, cn } from "@/lib/utils"

const passwordInputVariants = cva(
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

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">,
    VariantProps<typeof passwordInputVariants> {
  showStrengthIndicator?: boolean
  requirements?: { label: string; test: (password: string) => boolean }[]
}

const defaultRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => /[!@#$%^&*]/.test(p) },
]

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      variant,
      size,
      showStrengthIndicator,
      requirements = defaultRequirements,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [password, setPassword] = React.useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value)
      props.onChange?.(e)
    }

    const passedRequirements = requirements.map((r) => r.test(password))
    const strength = passedRequirements.filter(Boolean).length

    const getStrengthColor = () => {
      if (strength <= 2) return "bg-red-500"
      if (strength <= 3) return "bg-yellow-500"
      if (strength <= 4) return "bg-green-500"
      return "bg-green-500"
    }

    const getStrengthLabel = () => {
      if (strength <= 2) return "Weak"
      if (strength <= 3) return "Fair"
      if (strength <= 4) return "Good"
      return "Strong"
    }

    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={cn(
              passwordInputVariants({ variant, size, className }),
              "pr-10"
            )}
            onChange={handleChange}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {showStrengthIndicator && password && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    strength >= level ? getStrengthColor() : "bg-gray-200"
                  )}
                />
              ))}
            </div>
            <p
              className={cn(
                "text-xs",
                strength <= 2 && "text-red-500",
                strength === 3 && "text-yellow-500",
                strength >= 4 && "text-green-500"
              )}
            >
              {getStrengthLabel()}
            </p>
          </div>
        )}
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput, passwordInputVariants }
