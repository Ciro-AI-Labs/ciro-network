'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { fadeInUp, hoverScale, hoverGlow } from '@/lib/motion'

export interface AnimatedLogoProps {
  variant?: 'full' | 'icon' | 'white' | 'color'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  animate?: boolean
  href?: string
  onClick?: () => void
}

const logoSizes = {
  sm: { width: 120, height: 32 },
  md: { width: 200, height: 53 },
  lg: { width: 300, height: 80 },
  xl: { width: 400, height: 107 },
}

const logoVariants = {
  full: '/images/Ciro Color Full Logo.svg',
  icon: '/images/Ciro Icon Color.svg',
  white: '/images/Ciro White Full Logo.svg',
  color: '/images/Ciro Color Full Logo.svg',
}

export const AnimatedLogo = React.forwardRef<HTMLDivElement, AnimatedLogoProps>(
  ({ 
    variant = 'full', 
    size = 'md', 
    className, 
    animate = true,
    href,
    onClick,
    ...props 
  }, ref) => {
    const logoSrc = logoVariants[variant]
    const dimensions = logoSizes[size]
    
    const LogoComponent = (
      <motion.div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          onClick && 'cursor-pointer',
          className
        )}
        variants={animate ? fadeInUp : undefined}
        initial={animate ? 'initial' : undefined}
        animate={animate ? 'animate' : undefined}
        whileHover={onClick ? 'hover' : undefined}
        whileTap={onClick ? 'tap' : undefined}
        onClick={onClick}
        {...props}
      >
        <motion.div
          variants={onClick ? hoverScale : undefined}
          className="relative overflow-hidden rounded-lg"
        >
          <motion.div
            variants={onClick ? hoverGlow : undefined}
            className="relative"
          >
            <Image
              src={logoSrc}
              alt="Ciro Network"
              width={dimensions.width}
              height={dimensions.height}
              priority
              className="h-auto w-auto object-contain"
            />
            
            {/* Animated shine effect on hover */}
            {onClick && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                whileHover={{
                  x: '100%',
                  transition: { duration: 0.6, ease: 'easeInOut' }
                }}
              />
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    )

    if (href) {
      return (
        <a href={href} className="inline-block">
          {LogoComponent}
        </a>
      )
    }

    return LogoComponent
  }
)

AnimatedLogo.displayName = 'AnimatedLogo'

// Preset logo components for common use cases
export const HeaderLogo = (props: Omit<AnimatedLogoProps, 'size' | 'variant'>) => (
  <AnimatedLogo variant="full" size="md" {...props} />
)

export const FooterLogo = (props: Omit<AnimatedLogoProps, 'size' | 'variant'>) => (
  <AnimatedLogo variant="white" size="sm" {...props} />
)

export const HeroLogo = (props: Omit<AnimatedLogoProps, 'size' | 'variant'>) => (
  <AnimatedLogo variant="color" size="lg" {...props} />
)

export const IconLogo = (props: Omit<AnimatedLogoProps, 'variant'>) => (
  <AnimatedLogo variant="icon" {...props} />
) 