import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const containerVariants = cva(
  'w-full',
  {
    variants: {
      maxWidth: {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl',
        full: 'max-w-full',
      },
      padding: {
        none: 'px-0',
        sm: 'px-4',
        default: 'px-6',
        lg: 'px-8',
        xl: 'px-10',
      },
      center: {
        true: 'mx-auto',
        false: '',
      },
    },
    defaultVariants: {
      maxWidth: 'xl',
      padding: 'default',
      center: true,
    },
  }
)

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth, padding, center, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(containerVariants({ maxWidth, padding, center, className }))}
      {...props}
    />
  )
)
Container.displayName = 'Container'

export { Container, containerVariants } 