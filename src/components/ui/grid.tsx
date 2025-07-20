import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const gridVariants = cva(
  'grid',
  {
    variants: {
      cols: {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        12: 'grid-cols-12',
        auto: 'grid-cols-auto',
        responsive: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      },
      gap: {
        none: 'gap-0',
        sm: 'gap-2',
        default: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
      },
      rows: {
        1: 'grid-rows-1',
        2: 'grid-rows-2',
        3: 'grid-rows-3',
        4: 'grid-rows-4',
        auto: 'grid-rows-auto',
        none: 'grid-rows-none',
      },
    },
    defaultVariants: {
      cols: 'responsive',
      gap: 'default',
      rows: 'auto',
    },
  }
)

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, rows, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(gridVariants({ cols, gap, rows, className }))}
      {...props}
    />
  )
)
Grid.displayName = 'Grid'

export { Grid, gridVariants } 