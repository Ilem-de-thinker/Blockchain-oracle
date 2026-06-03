import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ShoppingCart, Heart, Eye, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const productCardVariants = cva(
  "group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all",
  {
    variants: {
      variant: {
        default: "",
        featured:
          "border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-green-500/5",
        interactive:
          "hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10",
        minimal: "border-0 bg-transparent shadow-none",
      },
      hoverEffect: {
        none: "",
        scale: "hover:scale-[1.02]",
        lift: "hover:-translate-y-1",
      },
      size: {
        default: "",
        sm: "max-w-xs",
        lg: "max-w-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      hoverEffect: "none",
      size: "default",
    },
  }
)

export interface ProductCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof productCardVariants> {
  image: string
  imageAlt?: string
  name: string
  description?: string
  price: string | number
  originalPrice?: string | number
  currency?: string
  rating?: number
  reviews?: number
  tags?: string[]
  isInStock?: boolean
  isNew?: boolean
  isFeatured?: boolean
  onAddToCart?: () => void
  onAddToWishlist?: () => void
  onQuickView?: () => void
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  (
    {
      className,
      variant,
      hoverEffect,
      size,
      image,
      imageAlt,
      name,
      description,
      price,
      originalPrice,
      currency = "₦",
      rating = 0,
      reviews,
      tags,
      isInStock = true,
      isNew,
      isFeatured,
      onAddToCart,
      onAddToWishlist,
      onQuickView,
      ...props
    },
    ref
  ) => {
    const renderStars = () => {
      return Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-300 text-gray-300"
          )}
        />
      ))
    }

    return (
      <div
        ref={ref}
        className={cn(productCardVariants({ variant, hoverEffect, size }), className)}
        {...props}
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={imageAlt || name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {(isNew || isFeatured || tags) && (
            <div className="absolute left-3 top-3 flex flex-col gap-1">
              {isNew && (
                <span className="rounded-full bg-green-600 px-2 py-1 text-xs font-medium text-white">
                  New
                </span>
              )}
              {isFeatured && (
                <span className="rounded-full bg-purple-600 px-2 py-1 text-xs font-medium text-white">
                  Featured
                </span>
              )}
              {tags?.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-900/80 px-2 py-1 text-xs font-medium text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            {onAddToWishlist && (
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 bg-white shadow-md hover:bg-gray-50"
                onClick={(e) => {
                  e.preventDefault()
                  onAddToWishlist()
                }}
              >
                <Heart className="h-4 w-4" />
              </Button>
            )}
            {onQuickView && (
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 bg-white shadow-md hover:bg-gray-50"
                onClick={(e) => {
                  e.preventDefault()
                  onQuickView()
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-1">{renderStars()}</div>

          <h3 className="mt-2 font-semibold text-gray-900">
            {name}
          </h3>

          {description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {currency}{price}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {currency}{originalPrice}
              </span>
            )}
          </div>

          {onAddToCart && (
            <Button
              className="mt-4 w-full"
              onClick={(e) => {
                e.preventDefault()
                onAddToCart()
              }}
              disabled={!isInStock}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isInStock ? "Add to Cart" : "Out of Stock"}
            </Button>
          )}
        </div>
      </div>
    )
  }
)
ProductCard.displayName = "ProductCard"

export { ProductCard, productCardVariants }