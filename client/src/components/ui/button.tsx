import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

// --- Updated buttonVariants for "Digital Calligraphy" Theme ---
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary action button: Luminous Cyan background
        default:
          'bg-primary text-primary-foreground font-semibold shadow-lg shadow-cyan-500/20 hover:bg-primary/90 hover:shadow-cyan-500/30 active:scale-95',

        // Destructive action button
        destructive:
          'bg-destructive text-destructive-foreground font-semibold shadow-lg shadow-red-500/20 hover:bg-destructive/90 hover:shadow-red-500/30 active:scale-95',

        // The most common button: Transparent with a glowing border
        outline:
          'bg-transparent border border-white/20 text-gray-200 hover:bg-white/5 hover:text-white hover:border-white/40 active:bg-white/10',

        // Secondary button: A subtle, darker version
        secondary:
          'bg-white/5 border border-transparent text-gray-400 hover:bg-white/10 hover:text-gray-200',

        // Ghost button: For subtle actions, glows on hover
        ghost:
          'bg-transparent border border-transparent text-gray-400 hover:bg-white/10 hover:text-white',

        // Link style button
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 rounded-lg px-4',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
