import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const pricingCardVariants = cva(
  "relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all",
  {
    variants: {
      variant: {
        default: "",
        featured:
          "border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-purple-500/10 shadow-lg shadow-green-500/10",
        compact: "p-4",
        spacious: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface PricingCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pricingCardVariants> {
  name: string
  description?: string
  price: string | number
  period?: string
  features: Array<{
    text: string
    included?: boolean
  }>
  ctaText?: string
  ctaHref?: string
  isPopular?: boolean
  badge?: string
}

const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  (
    {
      className,
      variant,
      name,
      description,
      price,
      period,
      features,
      ctaText = "Get Started",
      ctaHref,
      isPopular,
      badge,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(pricingCardVariants({ variant }), className)}
        {...props}
      >
        {(isPopular || badge) && (
          <div className="absolute -right-12 top-6 rotate-45">
            <div
              className={cn(
                "px-12 py-1 text-center text-xs font-semibold text-white",
                isPopular
                  ? "bg-gradient-to-r from-green-600 to-purple-600"
                  : "bg-gray-600"
              )}
            >
              {badge || "Popular"}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {name}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-gray-600">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">
              {typeof price === "number" ? `₦${price}` : price}
            </span>
            {period && (
              <span className="text-gray-600">
                /{period}
              </span>
            )}
          </div>

          <ul className="space-y-3 py-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                {feature.included !== false ? (
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                ) : (
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    feature.included !== false
                      ? "text-gray-700"
                      : "text-gray-400 line-through"
                  )}
                >
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          {ctaText && (
            <Button
              className="w-full"
              variant={isPopular ? "default" : "outline"}
              asChild={!!ctaHref}
            >
              {ctaHref ? <a href={ctaHref}>{ctaText}</a> : ctaText}
            </Button>
          )}
        </div>
      </div>
    )
  }
)
PricingCard.displayName = "PricingCard"

export { PricingCard, pricingCardVariants }