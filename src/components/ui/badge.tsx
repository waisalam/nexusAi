import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-surface-2 text-foreground",
        active: "border-emerald-600/40 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400",
        paused: "border-amber-600/40 bg-amber-600/10 text-amber-600 dark:text-amber-400",
        archived: "border-border bg-surface text-muted-foreground",
        accent: "border-accent/40 bg-accent/10 text-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
