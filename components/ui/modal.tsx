import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const modalVariants = cva("", {
  variants: {
    size: {
      default: "max-w-md",
      sm: "max-w-sm",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      full: "max-w-[90vw]",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export interface ModalProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  size?: VariantProps<typeof modalVariants>["size"]
}

const Modal = Dialog

const ModalTrigger = DialogTrigger

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent> &
    VariantProps<typeof modalVariants>
>(({ className, size, children, ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn(modalVariants({ size, className }))}
    {...props}
  >
    {children}
  </DialogContent>
))
ModalContent.displayName = "ModalContent"

const ModalHeader = DialogHeader

const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <DialogFooter className={cn("mt-4", className)} {...props} />
)

const ModalTitle = DialogTitle

const ModalDescription = DialogDescription

export {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
}
