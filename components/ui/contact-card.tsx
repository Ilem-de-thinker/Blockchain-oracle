import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Mail, Phone, MapPin, Globe, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const contactCardVariants = cva(
  "relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all",
  {
    variants: {
      variant: {
        default: "",
        featured:
          "border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-green-500/5",
        card: "",
        minimal: "border-0 bg-transparent p-0 shadow-none",
        compact: "p-4",
      },
      size: {
        default: "",
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ContactCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof contactCardVariants> {
  title?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  hours?: string
  mapUrl?: string
  showIcon?: boolean
  items?: Array<{
    icon?: React.ReactNode
    label: string
    value: string
    href?: string
  }>
  ctaText?: string
  ctaHref?: string
}

const ContactCard = React.forwardRef<HTMLDivElement, ContactCardProps>(
  (
    {
      className,
      variant,
      size,
      title,
      email,
      phone,
      address,
      website,
      hours,
      mapUrl,
      showIcon = true,
      items,
      ctaText,
      ctaHref,
      ...props
    },
    ref
  ) => {
    const defaultItems = [
      email && {
        icon: showIcon ? <Mail className="h-5 w-5" /> : undefined,
        label: "Email",
        value: email,
        href: `mailto:${email}`,
      },
      phone && {
        icon: showIcon ? <Phone className="h-5 w-5" /> : undefined,
        label: "Phone",
        value: phone,
        href: `tel:${phone}`,
      },
      address && {
        icon: showIcon ? <MapPin className="h-5 w-5" /> : undefined,
        label: "Address",
        value: address,
        href: mapUrl,
      },
      website && {
        icon: showIcon ? <Globe className="h-5 w-5" /> : undefined,
        label: "Website",
        value: website,
        href: website.startsWith("http") ? website : `https://${website}`,
      },
      hours && {
        icon: showIcon ? <Clock className="h-5 w-5" /> : undefined,
        label: "Hours",
        value: hours,
      },
    ].filter(Boolean) as Array<{
      icon?: React.ReactNode
      label: string
      value: string
      href?: string
    }>

    const contactItems = items || defaultItems

    return (
      <div
        ref={ref}
        className={cn(contactCardVariants({ variant, size }), className)}
        {...props}
      >
        {title && (
          <h3 className="mb-4 text-xl font-bold text-gray-900">
            {title}
          </h3>
        )}

        <div className="space-y-4">
          {contactItems.map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              {item.icon && (
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-600">
                  {item.icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-gray-900 hover:text-purple-600"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-gray-900">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {ctaText && ctaHref && (
          <Button className="mt-6 w-full" asChild>
            <a href={ctaHref}>{ctaText}</a>
          </Button>
        )}
      </div>
    )
  }
)
ContactCard.displayName = "ContactCard"

export { ContactCard, contactCardVariants }