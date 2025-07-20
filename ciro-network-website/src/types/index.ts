import { type VariantProps } from 'class-variance-authority'
import * as React from 'react'

// Base component props
export interface BaseProps {
  className?: string
  children?: React.ReactNode
}

// Size variants used across components
export type SizeVariant = 'sm' | 'md' | 'lg' | 'xl'

// Color variants for Ciro brand
export type ColorVariant = 
  | 'primary' 
  | 'secondary' 
  | 'accent' 
  | 'neutral' 
  | 'success' 
  | 'warning' 
  | 'error'

// Button variants
export type ButtonVariant = 
  | 'default' 
  | 'destructive' 
  | 'outline' 
  | 'secondary' 
  | 'ghost' 
  | 'link'

// Animation variants
export type AnimationVariant = 
  | 'fade' 
  | 'slide' 
  | 'scale' 
  | 'bounce' 
  | 'none'

// Layout breakpoints
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// Component state types
export interface ComponentState {
  isLoading?: boolean
  isDisabled?: boolean
  isError?: boolean
  isSuccess?: boolean
}

// Accessibility props
export interface AccessibilityProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-pressed'?: boolean
  'aria-selected'?: boolean
  'aria-hidden'?: boolean
  role?: string
  tabIndex?: number
}

// Form field props
export interface FormFieldProps extends AccessibilityProps {
  id?: string
  name?: string
  value?: string | number
  defaultValue?: string | number
  placeholder?: string
  disabled?: boolean
  required?: boolean
  readOnly?: boolean
  autoComplete?: string
  autoFocus?: boolean
}

// Icon props
export interface IconProps extends BaseProps {
  size?: SizeVariant | number
  color?: ColorVariant | string
  strokeWidth?: number
}

// Modal/Dialog props
export interface DialogProps extends BaseProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
}

// Card props
export interface CardProps extends BaseProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'glass'
  padding?: SizeVariant
  interactive?: boolean
}

// Navigation props
export interface NavigationItem {
  id: string
  label: string
  href?: string
  icon?: React.ComponentType<IconProps>
  children?: NavigationItem[]
  isActive?: boolean
  isDisabled?: boolean
}

// Theme context types
export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

// Blockchain/Web3 related types
export interface WalletState {
  isConnected: boolean
  address?: string
  chainId?: number
  balance?: string
}

export interface TransactionState {
  hash?: string
  status: 'idle' | 'pending' | 'success' | 'error'
  error?: string
}

// API response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: 'idle' | 'loading' | 'success' | 'error'
}

// Animation spring configs
export interface SpringConfig {
  tension?: number
  friction?: number
  mass?: number
}

// Component ref types
export type ButtonRef = React.ElementRef<'button'>
export type InputRef = React.ElementRef<'input'>
export type DivRef = React.ElementRef<'div'>

// Polymorphic component props
export type PolymorphicProps<T extends React.ElementType> = {
  as?: T
} & React.ComponentPropsWithoutRef<T>

// Event handler types
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void
export type KeyHandler = (event: React.KeyboardEvent<HTMLElement>) => void
export type FocusHandler = (event: React.FocusEvent<HTMLElement>) => void
export type ChangeHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void

// Layout component types
export interface ContainerProps extends BaseProps {
  maxWidth?: Breakpoint | 'full'
  padding?: SizeVariant | 'none'
  center?: boolean
}

export interface GridProps extends BaseProps {
  cols?: number | Record<Breakpoint, number>
  gap?: SizeVariant
  rows?: number | Record<Breakpoint, number>
}

export interface FlexProps extends BaseProps {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse'
  gap?: SizeVariant
} 