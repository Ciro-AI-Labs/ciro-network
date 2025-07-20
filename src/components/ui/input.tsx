'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

const inputVariants = cva(
  'flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ciro-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ciro-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-ciro-dark-border text-ciro-text-primary focus-visible:border-ciro-primary',
        success: 'border-green-500 text-ciro-text-primary focus-visible:border-green-500 focus-visible:ring-green-500',
        error: 'border-red-500 text-ciro-text-primary focus-visible:border-red-500 focus-visible:ring-red-500',
        glass: 'glass border-ciro-primary/30 text-ciro-text-primary focus-visible:border-ciro-primary',
      },
      size: {
        sm: 'h-9 px-2 text-xs',
        default: 'h-11 px-3',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  success?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant,
    size,
    type = 'text',
    label,
    error,
    success,
    hint,
    leftIcon,
    rightIcon,
    loading,
    id,
    disabled,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [inputId, setInputId] = React.useState(id)

    // Generate unique ID if not provided
    React.useEffect(() => {
      if (!id) {
        setInputId(`input-${Math.random().toString(36).substr(2, 9)}`)
      }
    }, [id])

    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    // Determine variant based on state
    const currentVariant = error ? 'error' : success ? 'success' : variant

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    return (
      <div className="w-full space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium text-ciro-text-primary leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-1" aria-label="required">*</span>
            )}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ciro-text-tertiary">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: currentVariant, size, className }),
              leftIcon && 'pl-10',
              (rightIcon || isPassword || loading || error || success) && 'pr-10'
            )}
            ref={ref}
            id={inputId}
            disabled={disabled || loading}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : 
              success ? `${inputId}-success` : 
              hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-ciro-primary border-t-transparent" />
            )}
            
            {!loading && success && (
              <CheckCircle 
                className="h-4 w-4 text-green-500" 
                aria-hidden="true"
              />
            )}
            
            {!loading && error && (
              <AlertCircle 
                className="h-4 w-4 text-red-500" 
                aria-hidden="true"
              />
            )}
            
            {!loading && isPassword && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-ciro-text-tertiary hover:text-ciro-text-secondary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
            
            {!loading && !isPassword && !error && !success && rightIcon && (
              <div className="text-ciro-text-tertiary">
                {rightIcon}
              </div>
            )}
          </div>
        </div>
        
        {error && (
          <p 
            id={`${inputId}-error`}
            className="text-sm text-red-500 flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            {error}
          </p>
        )}
        
        {success && !error && (
          <p 
            id={`${inputId}-success`}
            className="text-sm text-green-500 flex items-center gap-1"
            role="status"
            aria-live="polite"
          >
            <CheckCircle className="h-3 w-3" aria-hidden="true" />
            {success}
          </p>
        )}
        
        {hint && !error && !success && (
          <p 
            id={`${inputId}-hint`}
            className="text-sm text-ciro-text-tertiary"
          >
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input, inputVariants } 