import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-white",
      h2: "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 text-white",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight text-white",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight text-white",
      h5: "scroll-m-20 text-lg font-semibold tracking-tight text-white",
      h6: "scroll-m-20 text-base font-semibold tracking-tight text-white",
      lead: "text-xl text-gray-400",
      large: "text-lg text-gray-300",
      base: "text-base text-gray-300",
      small: "text-sm text-gray-400",
      xs: "text-xs text-gray-500",
      muted: "text-sm text-gray-500",
      p: "text-base leading-7 text-gray-300",
      blockquote: "border-l-2 border-purple-600/30 pl-4 italic text-gray-400",
      code: "relative rounded bg-purple-600/10 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-purple-400",
    },
  },
  defaultVariants: {
    variant: "base",
  },
})

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: React.ElementType
}

type TextVariant = NonNullable<VariantProps<typeof textVariants>["variant"]>

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, variant = "base" as TextVariant, as, children, ...props }, ref) => {
    const Component = as || "p"
    return (
      <Component ref={ref} className={cn(textVariants({ variant }), className)} {...props}>
        {children}
      </Component>
    )
  }
)
Text.displayName = "Text"

export { Text, textVariants }
