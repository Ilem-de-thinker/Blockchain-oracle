import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Button } from "./button"

const teamCardVariants = cva(
  "group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "",
        interactive:
          "hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10",
        card: "",
        minimal: "border-0 bg-transparent p-0 shadow-none",
      },
      hoverEffect: {
        none: "",
        scale: "hover:scale-[1.02]",
        lift: "hover:-translate-y-2",
        glow: "hover:shadow-xl hover:shadow-purple-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
      hoverEffect: "none",
    },
  }
)

export interface TeamCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof teamCardVariants> {
  name: string
  role: string
  bio?: string
  avatar?: string
  avatarFallback?: string
  email?: string
  linkedin?: string
  twitter?: string
  github?: string
}

const TeamCard = React.forwardRef<HTMLDivElement, TeamCardProps>(
  (
    {
      className,
      variant,
      hoverEffect,
      name,
      role,
      bio,
      avatar,
      avatarFallback,
      email,
      linkedin,
      twitter,
      github,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(teamCardVariants({ variant, hoverEffect }), className)}
        {...props}
      >
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-green-500 text-2xl text-white">
                {avatarFallback || name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {(linkedin || twitter || github || email) && (
              <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {linkedin && (
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="text-xs font-bold"
                    >
                      in
                    </a>
                  </Button>
                )}
                {twitter && (
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <a
                      href={twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Twitter"
                      className="text-xs font-bold"
                    >
                      X
                    </a>
                  </Button>
                )}
                {github && (
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <a
                      href={github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      className="text-xs font-bold"
                    >
                      GH
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900">
            {name}
          </h3>
          <p className="text-sm text-purple-600">{role}</p>

          {bio && (
            <p className="mt-3 text-sm text-gray-600">{bio}</p>
          )}
        </div>
      </div>
    )
  }
)
TeamCard.displayName = "TeamCard"

export { TeamCard, teamCardVariants }