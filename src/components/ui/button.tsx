import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-white text-black shadow hover:bg-zinc-200",
        primary:
          "bg-linear-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-900/40 hover:from-indigo-400 hover:to-violet-400 hover:shadow-indigo-700/40",
        destructive: "bg-red-950 text-red-300 border border-red-900/60 hover:bg-red-900/60",
        outline:
          "border border-zinc-700 bg-transparent text-zinc-100 hover:border-indigo-500/60 hover:bg-indigo-950/30 hover:text-white",
        ghost: "text-zinc-400 hover:bg-zinc-800/70 hover:text-white",
        link: "text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-7 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
