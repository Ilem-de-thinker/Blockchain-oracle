import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const heroVariants = cva(
  "relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-gray-50 to-white",
        primary: "bg-gradient-to-r from-purple-900/20 via-purple-800/10 to-green-900/20",
        centered: "bg-transparent",
      },
      padding: {
        none: "",
        default: "py-16 md:py-24 lg:py-32",
        compact: "py-12 md:py-16",
        spacious: "py-20 md:py-32 lg:py-48",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

export interface HeroProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof heroVariants> {
  title: React.ReactNode
  subtitle?: React.ReactNode
  description?: string
  image?: string
  imageAlt?: string
  ctaText?: string
  ctaHref?: string
  secondaryCtaText?: string
  secondaryCtaHref?: string
  align?: "left" | "center" | "right"
}

const Hero = React.forwardRef<HTMLDivElement, HeroProps>(
  (
    {
      className,
      variant,
      padding,
      title,
      subtitle,
      description,
      image,
      imageAlt,
      ctaText,
      ctaHref,
      secondaryCtaText,
      secondaryCtaHref,
      align = "left",
      children,
      ...props
    },
    ref
  ) => {
    const alignmentClasses = {
      left: "items-start text-left",
      center: "items-center text-center",
      right: "items-end text-right",
    }

    return (
      <section
        ref={ref}
        className={cn(heroVariants({ variant, padding }), className)}
        {...props}
      >
        <div className="container mx-auto px-4">
          <div
            className={cn(
              "flex flex-col gap-8",
              image ? "lg:flex-row lg:items-center lg:justify-between" : "",
              alignmentClasses[align]
            )}
          >
            <div className="flex-1 max-w-3xl">
              {subtitle && (
                <div className="mb-4 inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-sm text-purple-600">
                  {subtitle}
                </div>
              )}
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
                {title}
              </h1>
              {description && (
                <p className="mt-6 max-w-2xl text-lg text-gray-600">
                  {description}
                </p>
              )}
              {(ctaText || secondaryCtaText || children) && (
                <div
                  className={cn(
                    "mt-8 flex flex-wrap gap-4",
                    align === "center" && "justify-center",
                    align === "right" && "justify-end"
                  )}
                >
                  {ctaText && ctaHref && (
                    <Button asChild>
                      <a href={ctaHref}>
                        {ctaText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {secondaryCtaText && secondaryCtaHref && (
                    <Button variant="outline" asChild>
                      <a href={secondaryCtaHref}>{secondaryCtaText}</a>
                    </Button>
                  )}
                  {children}
                </div>
              )}
            </div>
            {image && (
              <div className="flex-1 lg:max-w-lg">
                <div className="relative overflow-hidden rounded-2xl border border-purple-500/10 bg-gradient-to-br from-purple-500/5 to-green-500/5">
                  <img
                    src={image}
                    alt={imageAlt || ""}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }
)
Hero.displayName = "Hero"

export { Hero, heroVariants }