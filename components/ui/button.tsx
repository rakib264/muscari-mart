import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        // Primary variant - Burnt Sienna (#E35336)
        default: 'bg-primary text-primary-foreground hover:bg-primary-700 hover:shadow-lg focus:ring-primary/50 active:bg-primary-800 shadow-md',

        // Secondary variant - Saddle Brown (#A0522D)
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-700 hover:shadow-lg focus:ring-secondary/50 active:bg-secondary-800 shadow-md',

        // Supporting color variants
        beige: 'bg-beige-300 text-secondary-800 hover:bg-beige-400 hover:shadow-lg focus:ring-beige/50 active:bg-beige-500 border border-sandy-200',
        sandy: 'bg-sandy text-secondary-900 hover:bg-sandy-400 hover:shadow-lg focus:ring-sandy/50 active:bg-sandy-500 shadow-md',

        // Semantic variants
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg focus:ring-destructive/50',
        success: 'bg-success text-success-foreground hover:bg-success/90 hover:shadow-lg focus:ring-success/50',
        warning: 'bg-sandy-600 text-white hover:bg-sandy-700 hover:shadow-lg focus:ring-sandy/50',
        info: 'bg-info text-info-foreground hover:bg-info/90 hover:shadow-lg focus:ring-info/50',

        // Outline variants
        outline: 'border-2 border-primary bg-transparent text-gray-700 hover:bg-primary hover:text-white hover:border-white focus:ring-primary/50 transition-colors',
        'outline-secondary': 'border-2 border-secondary bg-transparent text-gray-700 hover:bg-secondary hover:text-white hover:border-white focus:ring-secondary/50 transition-colors',
        'outline-beige': 'border-2 border-beige-400 bg-transparent text-gray-700 hover:bg-beige-100 hover:border-beige-500 focus:ring-beige/50',
        'outline-sandy': 'border-2 border-sandy bg-transparent text-gray-700 hover:bg-sandy-100 hover:border-sandy-400 focus:ring-sandy/50',
        'outline-destructive': 'border-2 border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground focus:ring-destructive/50',

        // Ghost variants
        ghost: 'bg-transparent text-primary hover:bg-primary-100 hover:text-primary-800 focus:ring-primary/50',
        'ghost-secondary': 'bg-transparent text-secondary hover:bg-secondary-100 hover:text-secondary-800 focus:ring-secondary/50',
        'ghost-beige': 'bg-transparent text-secondary-700 hover:bg-beige-100 hover:text-secondary-800 focus:ring-beige/50',
        'ghost-sandy': 'bg-transparent text-sandy-700 hover:bg-sandy-100 hover:text-sandy-800 focus:ring-sandy/50',

        // Link variants
        link: 'bg-transparent text-primary underline-offset-4 hover:underline hover:text-primary-700 focus:ring-primary/50',
        'link-secondary': 'bg-transparent text-secondary underline-offset-4 hover:underline hover:text-secondary-700 focus:ring-secondary/50',

        // Special gradient variants using burnt sienna palette
        gradient: 'bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-700 hover:to-secondary-700 hover:shadow-lg focus:ring-primary/50 active:scale-95 shadow-md',
        'gradient-warm': 'bg-gradient-to-r from-sandy to-primary text-white hover:from-sandy-400 hover:to-primary-700 hover:shadow-lg focus:ring-sandy/50 active:scale-95 shadow-md',
        'gradient-earth': 'bg-gradient-to-r from-secondary to-sandy text-white hover:from-secondary-700 hover:to-sandy-400 hover:shadow-lg focus:ring-secondary/50 active:scale-95 shadow-md',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        default: 'h-10 px-4 py-2 text-sm',
        lg: 'h-11 px-8 text-base rounded-lg',
        xl: 'h-12 px-10 text-lg rounded-lg',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
