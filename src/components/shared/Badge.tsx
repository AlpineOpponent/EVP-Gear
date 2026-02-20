import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge = ({ children, className }: BadgeProps) => {
  return (
    <div className={cn(
      "inline-flex items-center rounded-full bg-primary/10 px-[10px] py-[4px] text-[11px] font-medium text-primary",
      className
    )}>
      {children}
    </div>
  );
};
