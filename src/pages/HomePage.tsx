import React from 'react';
import { Package, List, Eye } from 'lucide-react';
import { Button } from '../components/shared/Button';
import { type PageType } from '../components/layout/Navbar';

interface HomePageProps {
  onNavigate: (page: PageType) => void;
  onStartTour?: () => void;
}

export const HomePage = ({ onNavigate, onStartTour }: HomePageProps) => {
  return (
    <div className="flex flex-col items-center justify-start pt-[100px] pb-[48px] px-[40px] h-full overflow-auto bg-background">
      <div className="flex flex-col gap-12 w-full max-w-[800px] text-center items-center">
        <div className="space-y-6">
          <h1 className="text-[56px] font-display font-normal tracking-[-2px] text-primary-foreground leading-tight">
            Welcome to <span className="text-primary">EVP-GEAR</span>
          </h1>
          <p className="text-lg text-text-muted max-w-[600px] mx-auto leading-relaxed">
            The ultimate gear management Tool optimized for Backpacking. Organize your inventory, categorize your items, build the perfect pack for your next adventure, view detailed weight statistics, and export your pack lists to PDF.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="bg-card p-6 rounded-[12px] border border-border/50 shadow-sm flex flex-col gap-4 hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <List className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-primary-foreground mb-1">1. Add Gear</h3>
              <p className="text-sm text-text-muted">Enter your items, weights, and categorize them using our dynamic tagging system.</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-[12px] border border-border/50 shadow-sm flex flex-col gap-4 hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-primary-foreground mb-1">2. View & Organize</h3>
              <p className="text-sm text-text-muted">Search, sort, and filter your entire inventory to find exactly what you need.</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-[12px] border border-border/50 shadow-sm flex flex-col gap-4 hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-primary-foreground mb-1">3. Build Packs</h3>
              <p className="text-sm text-text-muted">Assemble gear into loadouts, analyze weight distributions, and export to PDF.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button onClick={onStartTour} className="px-8 py-6 text-base shadow-lg shadow-primary/20 cursor-pointer">
            Get Started (Tour)
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('edit')} className="px-8 py-6 text-base cursor-pointer">
            Skip Tour
          </Button>
        </div>
      </div>
    </div>
  );
};