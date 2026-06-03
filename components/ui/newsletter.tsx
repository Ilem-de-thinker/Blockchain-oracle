import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Mail, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"

const newsletterVariants = cva(
  "relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6",
  {
    variants: {
      variant: {
        default: "",
        gradient:
          "border-transparent bg-gradient-to-br from-purple-500/10 to-green-500/10",
        minimal: "border-0 bg-transparent p-0",
        compact: "p-4",
        spacious: "p-8",
      },
      layout: {
        default: "",
        horizontal: "lg:flex lg:items-center lg:justify-between lg:gap-8",
      },
    },
    defaultVariants: {
      variant: "default",
      layout: "default",
    },
  }
)

export interface NewsletterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof newsletterVariants> {
  title: string
  description?: string
  placeholder?: string
  buttonText?: string
  onSubmit?: (email: string) => void
  successMessage?: string
  privacyText?: string
}

const Newsletter = React.forwardRef<HTMLDivElement, NewsletterProps>(
  (
    {
      className,
      variant,
      layout,
      title,
      description,
      placeholder = "Enter your email",
      buttonText = "Subscribe",
      onSubmit,
      successMessage = "Thanks for subscribing!",
      privacyText,
      ...props
    },
    ref
  ) => {
    const [email, setEmail] = React.useState("")
    const [isSubmitted, setIsSubmitted] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!email) return

      setIsLoading(true)
      try {
        await onSubmit?.(email)
        setIsSubmitted(true)
        setEmail("")
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(newsletterVariants({ variant, layout }), className)}
        {...props}
      >
        <div className={cn("space-y-4", layout === "horizontal" && "lg:flex-1")}>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-600">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {title}
            </h3>
          </div>

          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>

        {layout === "horizontal" && <div className="hidden lg:block lg:w-px lg:self-stretch lg:bg-gray-200" />}

        <div className={cn("mt-4", layout === "horizontal" && "lg:mt-0 lg:w-80")}>
          {isSubmitted ? (
            <div className="rounded-md bg-green-50 p-4 text-center text-green-800">
              {successMessage}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                placeholder={placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {buttonText}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {privacyText && (
            <p className="mt-2 text-xs text-gray-500">
              {privacyText}
            </p>
          )}
        </div>
      </div>
    )
  }
)
Newsletter.displayName = "Newsletter"

export { Newsletter, newsletterVariants }