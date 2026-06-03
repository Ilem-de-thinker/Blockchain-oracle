import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Button } from "./button"

const profileCardVariants = cva(
  "relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all",
  {
    variants: {
      variant: {
        default: "",
        featured:
          "border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-green-500/5",
        compact: "p-4",
        spacious: "p-8",
      },
      size: {
        default: "",
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        full: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ProfileCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof profileCardVariants> {
  avatar?: string
  avatarFallback?: string
  name: string
  role?: string
  bio?: string
  email?: string
  phone?: string
  location?: string
  website?: string
  socials?: Array<{
    platform: string
    url: string
    icon?: React.ReactNode
  }>
  actions?: React.ReactNode
}

const ProfileCard = React.forwardRef<HTMLDivElement, ProfileCardProps>(
  (
    {
      className,
      variant,
      size,
      avatar,
      avatarFallback,
      name,
      role,
      bio,
      email,
      phone,
      location,
      website,
      socials,
      actions,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(profileCardVariants({ variant, size }), className)}
        {...props}
      >
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-purple-500/20">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-green-500 text-white">
              {avatarFallback || name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">
              {name}
            </h3>
            {role && (
              <p className="text-sm text-purple-600">
                {role}
              </p>
            )}
          </div>
        </div>

        {bio && (
          <p className="mt-4 text-sm text-gray-600">{bio}</p>
        )}

        {(email || phone || location || website) && (
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            {email && (
              <p className="flex items-center gap-2">
                <span className="font-medium">Email:</span> {email}
              </p>
            )}
            {phone && (
              <p className="flex items-center gap-2">
                <span className="font-medium">Phone:</span> {phone}
              </p>
            )}
            {location && (
              <p className="flex items-center gap-2">
                <span className="font-medium">Location:</span> {location}
              </p>
            )}
            {website && (
              <p className="flex items-center gap-2">
                <span className="font-medium">Website:</span> {website}
              </p>
            )}
          </div>
        )}

        {socials && socials.length > 0 && (
          <div className="mt-4 flex gap-2">
            {socials.map((social, index) => (
              <Button key={index} variant="ghost" size="icon" asChild>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                >
                  {social.icon}
                </a>
              </Button>
            ))}
          </div>
        )}

        {actions && <div className="mt-4">{actions}</div>}
      </div>
    )
  }
)
ProfileCard.displayName = "ProfileCard"

export { ProfileCard, profileCardVariants }