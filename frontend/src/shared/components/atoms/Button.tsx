// shared/components/atoms/Button.tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    {
        variants: {
            variant: {
                default: 'bg-blue-600 text-white hover:bg-blue-700',
                destructive: 'bg-red-600 text-white hover:bg-red-700',
                outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
                secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
                ghost: 'bg-transparent hover:bg-gray-100',
            },
            size: {
                default: 'h-10 py-2 px-4',
                sm: 'h-9 px-3 text-sm',
                lg: 'h-11 px-8',
                icon: 'h-10 w-10',
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
    loading?: boolean;
    fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, loading, fullWidth, children, disabled, ...props }, ref) => {
        return (
            <button
                className={cn(
                    buttonVariants({ variant, size, className }),
                    fullWidth && 'w-full'
                )}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <span className="mr-2 animate-spin">⏳</span>
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';