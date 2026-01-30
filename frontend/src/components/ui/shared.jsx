import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

// Button Component
const Button = forwardRef(({ className, variant = 'primary', size = 'default', isLoading, children, ...props }, ref) => {
    const variants = {
        primary: 'btn-primary-gradient',
        secondary: 'btn-secondary-glass',
        danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50',
        ghost: 'btn-ghost-premium',
    };

    const sizes = {
        default: 'h-11 px-6 py-2.5 text-sm',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-14 px-8 text-base',
        icon: 'h-11 w-11 p-2',
    };

    return (
        <motion.button
            ref={ref}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'inline-flex items-center justify-center rounded-xl font-semibold tracking-wide transition-all disabled:pointer-events-none disabled:opacity-70',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </motion.button>
    );
});
Button.displayName = 'Button';

// Input Component
const Input = forwardRef(({ className, error, label, ...props }, ref) => {
    return (
        <div className="w-full space-y-1.5">
            {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}
            <motion.div whileFocus={{ scale: 1.005 }}>
                <input
                    ref={ref}
                    className={cn(
                        'input-premium',
                        error && 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/50',
                        className
                    )}
                    {...props}
                />
            </motion.div>
            {error && (
                <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-medium text-red-500 ml-1 flex items-center"
                >
                    {error}
                </motion.span>
            )}
        </div>
    );
});
Input.displayName = 'Input';

// Card Component
export const Card = ({ className, children, hoverEffect = false, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }} // smooth ease
            whileHover={hoverEffect ? { y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" } : {}}
            className={cn(
                'bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden',
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const CardHeader = ({ className, children, ...props }) => (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className, children, ...props }) => (
    <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props}>
        {children}
    </h3>
);

export const CardContent = ({ className, children, ...props }) => (
    <div className={cn('p-6 pt-0', className)} {...props}>
        {children}
    </div>
);

export { Button, Input };
