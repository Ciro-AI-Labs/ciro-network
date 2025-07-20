'use client'

import * as React from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from './button'
import { hoverScale, hoverLift } from '@/lib/motion'

export interface AnimatedButtonProps extends ButtonProps {
  magnetic?: boolean
  ripple?: boolean
  glow?: boolean
  particle?: boolean
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    magnetic = false, 
    ripple = false, 
    glow = false, 
    particle = false,
    className,
    children,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const [ripples, setRipples] = React.useState<Array<{id: number, x: number, y: number}>>([])
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    
    // Magnetic effect
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const springX = useSpring(x, { stiffness: 300, damping: 30 })
    const springY = useSpring(y, { stiffness: 300, damping: 30 })

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (magnetic && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const deltaX = e.clientX - centerX
        const deltaY = e.clientY - centerY
        
        x.set(deltaX * 0.1)
        y.set(deltaY * 0.1)
      }
      
      onMouseMove?.(e)
    }

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(true)
      onMouseEnter?.(e)
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(false)
      if (magnetic) {
        x.set(0)
        y.set(0)
      }
      onMouseLeave?.(e)
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const rippleX = e.clientX - rect.left
        const rippleY = e.clientY - rect.top
        const newRipple = {
          id: Date.now(),
          x: rippleX,
          y: rippleY,
        }
        
        setRipples(prev => [...prev, newRipple])
        
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id))
        }, 600)
      }
      
      props.onClick?.(e)
    }

    return (
      <motion.div
        style={{
          x: magnetic ? springX : 0,
          y: magnetic ? springY : 0,
        }}
        variants={hoverLift}
        initial="initial"
        whileHover="hover"
        className="relative inline-block"
      >
        <Button
          ref={buttonRef}
          className={cn(
            'relative overflow-hidden',
            glow && 'transition-shadow duration-300',
            glow && isHovered && 'shadow-lg shadow-ciro-primary/25',
            className
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          {...props}
        >
          {/* Glow effect */}
          {glow && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-ciro-primary/0 via-ciro-primary/20 to-ciro-primary/0 opacity-0"
              animate={{
                opacity: isHovered ? 1 : 0,
                x: isHovered ? ['0%', '100%'] : '0%',
              }}
              transition={{
                opacity: { duration: 0.3 },
                x: { duration: 1.5, repeat: Infinity, ease: 'linear' }
              }}
            />
          )}
          
          {/* Ripple effects */}
          {ripple && ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              className="absolute rounded-full bg-white/30 pointer-events-none"
              style={{
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ))}
          
          {/* Particle effect */}
          {particle && isHovered && (
            <ParticleEffect />
          )}
          
          {children}
        </Button>
      </motion.div>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'

// Particle effect component
const ParticleEffect = () => {
  const particles = Array.from({ length: 6 }, (_, i) => i)
  
  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-1 h-1 bg-ciro-secondary rounded-full pointer-events-none"
          initial={{
            x: '50%',
            y: '50%',
            scale: 0,
            opacity: 0,
          }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 200}%`,
            y: `${50 + (Math.random() - 0.5) * 200}%`,
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: particle * 0.1,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      ))}
    </>
  )
}

// Preset animated button variants
export const MagneticButton = (props: Omit<AnimatedButtonProps, 'magnetic'>) => (
  <AnimatedButton magnetic {...props} />
)

export const RippleButton = (props: Omit<AnimatedButtonProps, 'ripple'>) => (
  <AnimatedButton ripple {...props} />
)

export const GlowButton = (props: Omit<AnimatedButtonProps, 'glow'>) => (
  <AnimatedButton glow {...props} />
)

export const ParticleButton = (props: Omit<AnimatedButtonProps, 'particle'>) => (
  <AnimatedButton particle {...props} />
)

export const SuperButton = (props: Omit<AnimatedButtonProps, 'magnetic' | 'ripple' | 'glow'>) => (
  <AnimatedButton magnetic ripple glow {...props} />
) 