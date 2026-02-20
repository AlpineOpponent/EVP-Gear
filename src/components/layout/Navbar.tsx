import { List, Eye, Package, User } from 'lucide-react';
import { NavItem } from '../shared/NavItem';
import { cn } from '@/lib/utils';

export type PageType = 'home' | 'edit' | 'view' | 'pack';

interface NavbarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onOpenSettings?: () => void;
}

export const Navbar = ({ currentPage, onPageChange, onOpenSettings }: NavbarProps) => {
  return (
    <nav className="h-[72px] w-full bg-card border-b border-border flex items-center justify-between px-[48px] shrink-0">
      <div className="flex items-center gap-[56px]">
        <button
          onClick={() => onPageChange('home')}
          className="text-[18px] font-mono font-semibold tracking-[3px] text-primary-foreground hover:text-primary transition-colors cursor-pointer"
        >
          EVP-GEAR
        </button>
        <div id="tour-navbar-tabs" className="flex items-center gap-2">
          <NavItem
            icon={List}
            label="Edit"
            active={currentPage === 'edit'}
            onClick={() => onPageChange('edit')}
            className="w-fit"
          />
          <NavItem
            icon={Eye}
            label="View"
            active={currentPage === 'view'}
            onClick={() => onPageChange('view')}
            className="w-fit"
          />
          <NavItem
            icon={Package}
            label="Pack"
            active={currentPage === 'pack'}
            onClick={() => onPageChange('pack')}
            className="w-fit"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
            id="tour-user-menu"
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-accent border border-border flex items-center justify-center hover:bg-accent/80 hover:border-primary/30 transition-all cursor-pointer group"
        >
          <User className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
        </button>
      </div>
    </nav>
  );
};
