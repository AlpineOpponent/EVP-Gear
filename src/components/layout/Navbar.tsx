import { List, Eye, Package, User } from 'lucide-react';
import { NavItem } from '../shared/NavItem';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '../../store/useSettingsStore';

export type PageType = 'home' | 'edit' | 'view' | 'pack';

interface NavbarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  onOpenSettings?: () => void;
}

export const Navbar = ({ currentPage, onPageChange, onOpenSettings }: NavbarProps) => {
  const { theme } = useSettingsStore();

  return (
    <nav className="h-[72px] w-full bg-card border-b border-border flex items-center justify-between px-4 md:px-[48px] shrink-0">
      <div className="flex items-center gap-4 md:gap-[56px]">
        <button
          onClick={() => onPageChange('home')}
          className="flex items-center gap-2 md:gap-3 text-[14px] md:text-[18px] font-mono font-semibold tracking-[2px] md:tracking-[3px] text-primary-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
        >
          <img
            src={`/evp.logo.${theme}.svg`}
            alt="EVP-Gear Logo"
            className="w-7 h-7 md:w-8 md:h-8 object-contain shrink-0"
          />
          <div className="flex flex-col items-start md:flex-row md:items-center text-left leading-[1.1] md:leading-normal">
            <span>EVP</span>
            <span className="hidden md:inline">-</span>
            <span>GEAR</span>
          </div>
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
