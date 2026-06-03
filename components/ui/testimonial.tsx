import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Quote } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

const testimonialVariants = cva(
  "relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        featured:
          "border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-green-500/5",
        minimal: "border-0 bg-transparent p-0 shadow-none",
        card: "",
      },
      size: {
        default: "",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TestimonialProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof testimonialVariants> {
  quote: string
  author: string
  role?: string
  company?: string
  avatar?: string
  avatarFallback?: string
  rating?: number
  showQuoteIcon?: boolean
}

const Testimonial = React.forwardRef<HTMLDivElement, TestimonialProps>(
  (
    {
      className,
      variant,
      size,
      quote,
      author,
      role,
      company,
      avatar,
      avatarFallback,
      rating = 5,
      showQuoteIcon = true,
      ...props
    },
    ref
  ) => {
    const renderStars = () => {
      return Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "text-lg",
            i < rating ? "text-yellow-400" : "text-gray-300"
          )}
        >
          ★
        </span>
      ))
    }

    return (
      <div
        ref={ref}
        className={cn(testimonialVariants({ variant, size }), className)}
        {...props}
      >
        {showQuoteIcon && (
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-600">
            <Quote className="h-5 w-5" />
          </div>
        )}

        {variant !== "minimal" && (
          <div className="mb-4 flex">{renderStars()}</div>
        )}

        <blockquote className="relative">
          <p
            className={cn(
              "text-gray-700",
              variant === "minimal" ? "text-lg" : "text-base"
            )}
          >
            "{quote}"
          </p>
        </blockquote>

        <div className="mt-6 flex items-center gap-4">
          {avatar && (
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatar} alt={author} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-green-500 text-white">
                {avatarFallback || author.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <p className="font-semibold text-gray-900">
              {author}
            </p>
            {(role || company) && (
              <p className="text-sm text-gray-600">
                {role}
                {role && company && " at "}
                {company}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }
)
Testimonial.displayName = "Testimonial"

export { Testimonial, testimonialVariants }