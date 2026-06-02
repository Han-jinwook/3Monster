import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-2xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer",
    {
        variants: {
            variant: {
                default: "bg-primary text-white hover:bg-primary/90 shadow-premium",
                destructive: "bg-red-50 text-red-500 hover:bg-red-100",
                outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-600",
                secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
                ghost: "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
                link: "underline-offset-4 hover:underline text-primary",
                accent: "bg-[#6366F1] text-white hover:brightness-110 shadow-lg shadow-indigo-200",
            },
            size: {
                default: "h-12 px-6",
                sm: "h-9 px-4 rounded-xl text-xs",
                lg: "h-14 px-10 rounded-2xl text-base",
                icon: "h-12 w-12",
            },
            fullWidth: {
                true: "w-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            fullWidth: false,
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, fullWidth, isLoading, children, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, fullWidth, className }))}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
