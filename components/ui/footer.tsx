"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  TrendingUp,
  Mail,
  ExternalLink,
} from "lucide-react"

import { cn } from "@/lib/utils"

const footerVariants = cva(
  "border-t border-primary/20 bg-bg-secondary",
  {
    variants: {
      variant: {
        default: "",
        compact: "py-4",
        spacious: "py-12",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface FooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof footerVariants> {}

export interface FooterLink {
  title: string
  href: string
  isExternal?: boolean
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

interface SocialIconProps {
  name: string
  icon: React.ReactNode
  href: string
}

const SocialIcon: React.FC<SocialIconProps> = ({ name, icon, href }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-text-muted transition-all hover:bg-primary/20 hover:text-primary"
    >
      {icon}
    </a>
  )
}

const defaultSections: FooterSection[] = [
  {
    title: "Product",
    links: [
      { title: "Features", href: "/features" },
      { title: "Documentation", href: "/docs" },
      { title: "API", href: "/api" },
      { title: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "About", href: "/about" },
      { title: "Blog", href: "/blog" },
      { title: "Careers", href: "/careers" },
      { title: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { title: "Privacy", href: "/privacy" },
      { title: "Terms", href: "/terms" },
      { title: "Security", href: "/security" },
    ],
  },
]

const defaultSocials: SocialIconProps[] = [
  { name: "GitHub", icon: <span className="text-xs font-bold">GH</span>, href: "https://github.com" },
  { name: "Twitter", icon: <span className="text-xs font-bold">X</span>, href: "https://twitter.com" },
  { name: "LinkedIn", icon: <span className="text-xs font-bold">in</span>, href: "https://linkedin.com" },
  { name: "Email", icon: <Mail className="h-4 w-4" />, href: "mailto:contact@example.com" },
]

export interface FooterBottomProps {
  copyright?: string
  className?: string
}

const FooterBottom: React.FC<FooterBottomProps> = ({
  copyright = `© ${new Date().getFullYear()} Blo|&lt;Chain<span style={{ fontWeight: 300, fontSize: '1.2em' }}>0</span>racle. All rights reserved.`,
  className,
}) => {
  return (
    <div className={cn("mt-4 border-t border-primary/20 pt-8", className)}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>{copyright}</span>
        </div>
        <div className="flex items-center gap-6">
          {defaultSections[2].links.slice(0, 3).map((link) => (
            <a
              key={link.title}
              href={link.href}
              className="text-sm text-text-muted hover:text-primary transition-colors"
            >
              {link.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

const Footer: React.FC<FooterProps> = ({
  className,
  variant,
  children,
  ...props
}) => {
  return (
    <footer
      className={cn(footerVariants({ variant, className }))}
      {...props}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-600 to-purple-600 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-text">Oracle</span>
                <span className="block text-xs text-text-muted">Blockchain</span>
              </div>
            </div>
            <p className="text-sm text-text-muted mb-4">
              Secure and decentralized data oracle for blockchain applications.
            </p>
            <div className="flex gap-2">
              {defaultSocials.map((social) => (
                <SocialIcon key={social.name} {...social} />
              ))}
            </div>
          </div>
          
          {children || defaultSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-text mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.title}>
                    <a
                      href={link.href}
                      className="text-sm text-text-muted hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {link.title}
                      {link.isExternal && <ExternalLink className="h-3 w-3" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <FooterBottom />
      </div>
    </footer>
  )
}

export { Footer, footerVariants, FooterBottom }
