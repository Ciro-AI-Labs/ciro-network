import { Variants, Transition } from 'framer-motion'

// Common easing curves
export const easing = {
  smooth: [0.25, 0.1, 0.25, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  ease: [0.4, 0, 0.2, 1],
  sharp: [0.4, 0, 0.6, 1],
  gentle: [0.25, 0.46, 0.45, 0.94],
} as const

// Common transition presets
export const transitions = {
  smooth: {
    type: 'tween',
    duration: 0.4,
    ease: easing.smooth,
  },
  fast: {
    type: 'tween',
    duration: 0.2,
    ease: easing.ease,
  },
  slow: {
    type: 'tween',
    duration: 0.6,
    ease: easing.gentle,
  },
  bounce: {
    type: 'spring',
    damping: 15,
    stiffness: 300,
  },
  spring: {
    type: 'spring',
    damping: 20,
    stiffness: 400,
  },
  gentleSpring: {
    type: 'spring',
    damping: 25,
    stiffness: 200,
  },
} as const

// Animation variants for common patterns
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    y: -30,
    transition: transitions.fast,
  },
}

export const fadeInDown: Variants = {
  initial: {
    opacity: 0,
    y: -30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    y: 30,
    transition: transitions.fast,
  },
}

export const fadeInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -30,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: transitions.fast,
  },
}

export const fadeInRight: Variants = {
  initial: {
    opacity: 0,
    x: 30,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    x: -30,
    transition: transitions.fast,
  },
}

export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.bounce,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: transitions.fast,
  },
}

export const slideInUp: Variants = {
  initial: {
    y: '100%',
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: transitions.fast,
  },
}

export const slideInDown: Variants = {
  initial: {
    y: '-100%',
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: {
    y: '-100%',
    opacity: 0,
    transition: transitions.fast,
  },
}

// Stagger animation for lists
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
}

// GPU-accelerated animations for performance
export const gpuAcceleration = {
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden',
  perspective: 1000,
} as const

// Hover animations
export const hoverScale: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.95,
    transition: transitions.fast,
  },
}

export const hoverLift: Variants = {
  initial: {
    y: 0,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  hover: {
    y: -4,
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transition: transitions.fast,
  },
}

export const hoverGlow: Variants = {
  initial: {
    filter: 'brightness(1)',
  },
  hover: {
    filter: 'brightness(1.1)',
    transition: transitions.fast,
  },
}

// Page transition variants
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easing.smooth,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: easing.ease,
    },
  },
}

// Loading animations
export const loadingSpinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

export const loadingPulse: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: easing.gentle,
    },
  },
}

// Utility function to create responsive variants
export const createResponsiveVariant = (
  mobile: any,
  tablet: any,
  desktop: any
) => ({
  initial: mobile.initial,
  animate: {
    ...mobile.animate,
    transition: {
      ...mobile.animate.transition,
      when: 'beforeChildren',
    },
  },
  // Add media query-based variants if needed
})

// Reduced motion variants
export const reducedMotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.01 } },
  exit: { opacity: 0, transition: { duration: 0.01 } },
}

// Utility to respect user's motion preferences
export const respectMotionPreference = (variants: Variants): Variants => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return reducedMotionVariants
  }
  return variants
} 