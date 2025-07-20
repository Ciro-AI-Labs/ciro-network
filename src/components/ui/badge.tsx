import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-ciro-primary text-white hover:bg-ciro-primary-dark shadow',
        secondary: 'bg-ciro-secondary text-ciro-dark hover:bg-ciro-secondary-dark shadow',
        accent: 'bg-ciro-accent text-white hover:bg-ciro-accent-dark shadow',
        destructive: 'bg-red-500 text-white hover:bg-red-600 shadow',
        success: 'bg-green-500 text-white hover:bg-green-600 shadow',
        warning: 'bg-yellow-500 text-ciro-dark hover:bg-yellow-600 shadow',
        outline: 'text-ciro-text-primary border border-ciro-primary',
        ghost: 'text-ciro-text-primary hover:bg-ciro-dark-surface',
        glass: 'glass text-ciro-text-primary border border-ciro-primary/30',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  closable?: boolean
  onClose?: () => void
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, icon, closable, onClose, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {icon && (
          <span className="mr-1" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
        {closable && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-1 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            aria-label="Remove badge"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    )
  }
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants } 