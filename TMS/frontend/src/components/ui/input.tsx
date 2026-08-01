import * as React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn("h-11 w-full rounded-xl border border-border bg-white/70 px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-indigo-500/10 dark:bg-white/5", className)}
    {...props}
  />
));
Input.displayName = "Input";
