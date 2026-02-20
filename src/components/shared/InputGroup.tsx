import React from 'react';
import { cn } from '@/lib/utils';

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
}

export const InputGroup = React.forwardRef<HTMLInputElement, InputGroupProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-2 w-full", className)}>
        <label className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            className="flex h-[40px] w-full rounded-md border border-border bg-card px-4 py-[10px] text-[13px] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
          />
        </div>
      </div>
    );
  }
);

InputGroup.displayName = "InputGroup";
