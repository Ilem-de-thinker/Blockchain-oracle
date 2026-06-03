import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const gridVariants = cva("grid", {
  variants: {
    gap: {
      none: "",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      "2xl": "gap-10",
      "3xl": "gap-12",
    },
    cols: {
      none: "",
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      7: "grid-cols-7",
      8: "grid-cols-8",
      9: "grid-cols-9",
      10: "grid-cols-10",
      11: "grid-cols-11",
      12: "grid-cols-12",
    },
  },
  defaultVariants: {
    gap: "md",
  },
})

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, gap, cols, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(gridVariants({ gap, cols: cols || undefined }), className)}
        {...props}
      />
    )
  }
)
Grid.displayName = "Grid"

const GridItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { span?: number }
>(({ className, span, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(className)}
    style={{ gridColumn: span ? `span ${span} / span ${span}` : undefined }}
    {...props}
  />
))
GridItem.displayName = "GridItem"

export { Grid, GridItem, gridVariants }
