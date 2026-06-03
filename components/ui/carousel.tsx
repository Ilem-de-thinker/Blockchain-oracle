"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const carouselVariants = cva("", {
  variants: {
    variant: {
      default: "",
      "compact": "",
      "spacing": "gap-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface CarouselProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof carouselVariants> {
  children: React.ReactNode
  options?: {
    loop?: boolean
    align?: "start" | "center" | "end"
    slidesToScroll?: number
  }
  showArrows?: boolean
  showDots?: boolean
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, variant, children, options, showArrows = true, showDots = true, ...props }, ref) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
      loop: options?.loop ?? false,
      align: options?.align ?? "start",
      slidesToScroll: options?.slidesToScroll ?? 1,
    })

    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const scrollChildren = React.Children.toArray(children)

    React.useEffect(() => {
      if (!emblaApi) return
      emblaApi.on("select", () => {
        setSelectedIndex(emblaApi.selectedScrollSnap())
      })
    }, [emblaApi])

    const scrollPrev = React.useCallback(() => {
      emblaApi?.scrollPrev()
    }, [emblaApi])

    const scrollNext = React.useCallback(() => {
      emblaApi?.scrollNext()
    }, [emblaApi])

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <div ref={emblaRef} className="overflow-hidden">
          <div className={cn("flex", variant === "compact" && "-ml-2", variant === "spacing" && "ml-2")}>
            {React.Children.map(children, (child, index) => (
              <div
                key={index}
                className={cn(
                  "flex-shrink-0",
                  variant === "compact" && "pl-2",
                  variant === "spacing" && "pl-4"
                )}
              >
                {child}
              </div>
            ))}
          </div>
        </div>

        {showArrows && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80"
              onClick={scrollNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {showDots && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {scrollChildren.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === selectedIndex
                    ? "w-6 bg-purple-600"
                    : "bg-gray-300"
                )}
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
)
Carousel.displayName = "Carousel"

export { Carousel }
