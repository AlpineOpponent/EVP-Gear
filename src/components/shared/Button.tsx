import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const Button = ({ variant = 'primary', className, children, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-[13px] font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 px-4 py-[10px] gap-2",
        variant === 'primary'
          ? "bg-primary text-primary-foreground hover:bg-orange-light"
          : "border border-border bg-transparent text-primary-foreground hover:bg-accent",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
