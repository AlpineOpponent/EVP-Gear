import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NavItem = ({ icon: Icon, label, active, onClick, className }: NavItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 md:gap-3 px-3 md:px-[14px] py-2 md:py-3 rounded-md transition-colors w-fit text-left",
        active
          ? "bg-accent text-primary-foreground"
          : "text-text-tertiary hover:bg-accent/50 hover:text-primary-foreground",
        className
      )}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      <span className={cn(
        "text-[14px] font-medium whitespace-nowrap",
        !active && "hidden md:inline-block"
      )}>{label}</span>
    </button>
  );
};
