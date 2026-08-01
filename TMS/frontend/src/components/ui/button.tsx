import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-zinc-950 text-white shadow-soft hover:-translate-y-0.5 hover:shadow-lift dark:bg-white dark:text-zinc-950",
        outline: "border border-border bg-white/70 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10",
        ghost: "hover:bg-zinc-100 dark:hover:bg-white/10",
        indigo: "bg-primary text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
      },
      size: {
        default: "h-10 px-4",
        icon: "h-10 w-10 px-0",
        lg: "h-12 px-6 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
));
Button.displayName = "Button";
