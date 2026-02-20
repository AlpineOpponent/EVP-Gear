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
        "flex items-center gap-3 px-[14px] py-3 rounded-md transition-colors w-full text-left",
        active
          ? "bg-accent text-primary-foreground"
          : "text-text-tertiary hover:bg-accent/50 hover:text-primary-foreground",
        className
      )}
    >
      <Icon className="w-[18px] h-[18px]" />
      <span className="text-[14px]">{label}</span>
    </button>
  );
};
