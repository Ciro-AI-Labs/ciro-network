'use client'

import * as React from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion'

export interface AnimatedTextProps {
  children: React.ReactNode
  className?: string
  variant?: 'fadeIn' | 'typewriter' | 'stagger' | 'gradient' | 'glitch'
  delay?: number
  duration?: number
  once?: boolean
}

export const AnimatedText = React.forwardRef<HTMLDivElement, AnimatedTextProps>(
  ({ 
    children, 
    className, 
    variant = 'fadeIn',
    delay = 0,
    duration = 0.6,
    once = true,
    ...props 
  }, ref) => {
    const controls = useAnimation()
    const textRef = React.useRef<HTMLDivElement>(null)
    const isInView = useInView(textRef, { once })

    React.useEffect(() => {
      if (isInView) {
        controls.start('animate')
      }
    }, [isInView, controls])

    const getVariant = () => {
      switch (variant) {
        case 'typewriter':
          return typewriterVariant
        case 'stagger':
          return staggerContainer
        case 'gradient':
          return gradientVariant
        case 'glitch':
          return glitchVariant
        default:
          return fadeInUp
      }
    }

    if (variant === 'stagger') {
      const words = typeof children === 'string' ? children.split(' ') : [children]
      
      return (
        <motion.div
          ref={ref}
          className={className}
          variants={staggerContainer}
          initial="initial"
          animate={controls}
          {...props}
        >
          <div ref={textRef} />
          {words.map((word, index) => (
            <motion.span
              key={index}
              variants={staggerItem}
              className="inline-block mr-1"
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      )
    }

    if (variant === 'typewriter') {
      return (
        <TypewriterText
          ref={ref}
          text={typeof children === 'string' ? children : ''}
          className={className}
          delay={delay}
          {...props}
        />
      )
    }

    return (
      <motion.div
        ref={ref}
        className={className}
        variants={getVariant()}
        initial="initial"
        animate={controls}
        transition={{ delay, duration }}
        {...props}
      >
        <div ref={textRef} />
        {children}
      </motion.div>
    )
  }
)

AnimatedText.displayName = 'AnimatedText'

// Typewriter component
interface TypewriterTextProps {
  text: string
  className?: string
  delay?: number
  speed?: number
}

const TypewriterText = React.forwardRef<HTMLDivElement, TypewriterTextProps>(
  ({ text, className, delay = 0, speed = 50 }, ref) => {
    const [displayText, setDisplayText] = React.useState('')
    const [currentIndex, setCurrentIndex] = React.useState(0)

    React.useEffect(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayText(prev => prev + text[currentIndex])
          setCurrentIndex(prev => prev + 1)
        }, speed)

        return () => clearTimeout(timeout)
      }
    }, [currentIndex, text, speed])

    React.useEffect(() => {
      const delayTimeout = setTimeout(() => {
        setCurrentIndex(0)
        setDisplayText('')
      }, delay)

      return () => clearTimeout(delayTimeout)
    }, [delay])

    return (
      <div ref={ref} className={className}>
        {displayText}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-0.5 h-[1em] bg-current ml-1 align-middle"
        />
      </div>
    )
  }
)

TypewriterText.displayName = 'TypewriterText'

// Animation variants
const typewriterVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 }
}

const gradientVariant = {
  initial: { 
    backgroundPosition: '0% 50%',
    opacity: 0,
  },
  animate: { 
    backgroundPosition: '100% 50%',
    opacity: 1,
    transition: {
      backgroundPosition: {
        duration: 3,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
      opacity: {
        duration: 0.6,
      }
    }
  }
}

const glitchVariant = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    x: [0, -2, 2, 0],
    filter: [
      'hue-rotate(0deg)',
      'hue-rotate(90deg)',
      'hue-rotate(180deg)',
      'hue-rotate(0deg)'
    ],
    transition: {
      x: {
        duration: 0.2,
        repeat: 3,
        repeatType: 'reverse' as const,
      },
      filter: {
        duration: 0.1,
        repeat: 3,
        repeatType: 'reverse' as const,
      }
    }
  }
}

// Preset text components
export const HeroTitle = ({ children, className, ...props }: Omit<AnimatedTextProps, 'variant'>) => (
  <AnimatedText
    variant="stagger"
    className={cn(
      'text-6xl md:text-8xl font-bold',
      className
    )}
    {...props}
  >
    {children}
  </AnimatedText>
)

export const SectionTitle = ({ children, className, ...props }: Omit<AnimatedTextProps, 'variant'>) => (
  <AnimatedText
    variant="fadeIn"
    className={cn(
      'text-3xl md:text-4xl font-bold text-gradient',
      className
    )}
    {...props}
  >
    {children}
  </AnimatedText>
)

export const TypewriterHeading = ({ children, className, ...props }: Omit<AnimatedTextProps, 'variant'>) => (
  <AnimatedText
    variant="typewriter"
    className={cn(
      'text-2xl md:text-3xl font-semibold text-ciro-text-primary',
      className
    )}
    {...props}
  >
    {children}
  </AnimatedText>
)

export const GradientText = ({ children, className, ...props }: Omit<AnimatedTextProps, 'variant'>) => (
  <AnimatedText
    variant="gradient"
    className={cn(
      'bg-gradient-to-r from-ciro-primary via-ciro-secondary to-ciro-accent bg-clip-text text-transparent bg-[length:200%_200%]',
      className
    )}
    {...props}
  >
    {children}
  </AnimatedText>
) 