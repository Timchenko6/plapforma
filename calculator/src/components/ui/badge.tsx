import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-[hsl(45_100%_30%)] border border-primary/30',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-success/10 text-success border border-success/30',
        outline: 'border border-border-strong text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
