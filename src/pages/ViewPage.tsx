import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useSearchStore, type SearchMode } from '../store/useSearchStore';
import { useGearSearch } from '../hooks/useGearSearch';
import { Search, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type GearItem } from '../types/gear';
import { getBrandLogo } from '../lib/logoAssets';
import { useSettingsStore } from '../store/useSettingsStore';
import { formatWeight } from '../lib/gearUtils';

const BrandLogo = ({ brand, className }: { brand?: string; className?: string }) => {
  const [error, setError] = useState(false);
  const logoUrl = brand ? getBrandLogo(brand) : null;

  if (logoUrl && !error) {
    return (
        <div className="bg-white/5 p-1.5 rounded border border-white/10 flex items-center justify-center min-w-[56px] h-9">
            <img
                src={logoUrl}
                alt={brand}
                onError={() => setError(true)}
                className={cn("h-5 w-auto object-contain opacity-100", className)}
            />
        </div>
    );
  }

  return (
    <div className="px-2 py-0.5 rounded border border-white/10 bg-white/5 min-w-[40px] h-6 flex items-center justify-center">
        <span className={cn("text-[10px] font-bold text-text-tertiary uppercase tracking-tight whitespace-nowrap", className)}>
            {brand || 'No Brand'}
        </span>
    </div>
  );
};

export const ViewPage = ({ onEdit }: { onEdit?: (item: GearItem) => void }) => {
  const { query, mode, setQuery, setMode } = useSearchStore();
  const { units } = useSettingsStore();
  const gear = useGearSearch() || [];
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const groupedGear = useMemo(() => {
    const groups: Record<string, Record<string, Record<string, Record<string, GearItem[]>>>> = {};

    gear.forEach(item => {
      let l1 = 'Other', l2 = 'General', l3 = 'Item', l4 = 'All';

      if (mode === 'tag') {
        l1 = item.tagPath.tt;
        l2 = item.tagPath.mt || 'General';
        l3 = item.tagPath.bt || 'Other';
        l4 = 'All';
      } else if (mode === 'brand') {
        l1 = item.brand || 'No Brand';
        l2 = item.tagPath.tt;
        l3 = item.tagPath.mt || 'General';
        l4 = item.tagPath.bt || 'Other';
      } else if (mode === 'name') {
        l1 = item.name.charAt(0).toUpperCase();
        l2 = 'Items';
        l3 = 'All';
        l4 = 'All';
      }

      if (!groups[l1]) groups[l1] = {};
      if (!groups[l1][l2]) groups[l1][l2] = {};
      if (!groups[l1][l2][l3]) groups[l1][l2][l3] = {};
      if (!groups[l1][l2][l3][l4]) groups[l1][l2][l3][l4] = [];
      groups[l1][l2][l3][l4].push(item);
    });

    return groups;
  }, [gear, mode]);

  const modes: { id: SearchMode; label: string }[] = [
    { id: 'tag', label: 'By Tag' },
    { id: 'name', label: 'By Name' },
    { id: 'brand', label: 'By Brand' },
  ];

  // Update slider position when mode changes
  useEffect(() => {
    const activeIndex = modes.findIndex(m => m.id === mode);
    const activeButton = tabsRef.current[activeIndex];
    if (activeButton) {
      setSliderStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth
      });
    }
  }, [mode]);

  return (
    <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-[48px] h-full overflow-auto bg-background">
      <div className="flex flex-col gap-2">
        <h1 className="text-[38px] font-display font-normal tracking-[-1px] text-primary-foreground">
          Gear Database
        </h1>
      </div>

      <div id="tour-view-search" className="flex flex-col">
        {/* Tabs */}
        <div className="flex relative">
          {modes.map((m, i) => (
            <button
              key={m.id}
              ref={el => { tabsRef.current[i] = el; }}
              onClick={() => setMode(m.id)}
              className={cn(
                "px-6 py-2 text-[13px] font-medium rounded-t-lg transition-colors border-x border-t",
                mode === m.id
                  ? "bg-card text-foreground border-border"
                  : "bg-transparent text-text-muted border-transparent hover:text-foreground"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Search Input Container */}
        <div className="relative group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-border" />
          {/* Active Tab Indicator Border Overlay */}
          <div
            className="absolute top-0 h-[1.5px] bg-primary transition-all duration-300 ease-in-out"
            style={{
              left: `${sliderStyle.left}px`,
              width: `${sliderStyle.width}px`
            }}
          />

          <div className="mt-[1px] flex items-center gap-3 bg-card border-x border-b border-border rounded-b-lg px-4 py-3 shadow-sm">
            <Search className="w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search items by ${mode}...`}
              className="bg-transparent border-none outline-none text-[14px] w-full placeholder:text-text-tertiary"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-12 mt-4">
        {Object.entries(groupedGear).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted">
            <p className="text-lg italic">No items found matching your search.</p>
          </div>
        ) : (
          Object.entries(groupedGear).sort().map(([l1, l2s]) => (
            <div key={l1} className="flex flex-col gap-6">
              <h2 className="text-[38px] font-display font-normal tracking-[-1px] text-primary">
                {l1}
              </h2>

              <div className="flex flex-col gap-10">
                {Object.entries(l2s).sort().map(([l2, l3s]) => (
                  <div key={l2} className={cn(
                      "bg-card border border-border rounded-[12px] p-4 md:p-6 flex flex-col gap-6",
                      l2 === 'Items' && "bg-transparent border-none p-0 shadow-none"
                  )}>
                    {l2 !== 'Items' && (
                        <h3 className="text-[30px] font-display font-normal tracking-[-1px] text-primary-foreground border-b border-white/5 pb-2">
                            {l2}
                        </h3>
                    )}

                    <div className="flex flex-col gap-8">
                        {Object.entries(l3s).sort().map(([l3, l4s]) => (
                            <div key={l3} className={cn("flex flex-col gap-4 ml-2", l3 === 'All' && "ml-0")}>
                                {l3 !== 'All' && (
                                    <h5 className="text-[16px] font-display text-primary-foreground/80 italic">{l3}</h5>
                                )}

                                <div className="flex flex-col gap-6">
                                    {Object.entries(l4s).sort().map(([l4, items]) => (
                                        <div key={l4} className={cn("flex flex-col gap-3 ml-2", l4 === 'All' && "ml-0")}>
                                            {l4 !== 'All' && (
                                                <div className="flex items-center gap-3">
                                                    <div className="h-[1px] w-4 bg-primary/30" />
                                                    <span className="text-[12px] font-bold text-text-muted uppercase tracking-widest">{l4}</span>
                                                </div>
                                            )}

                                            <div className="grid gap-3">
                                                {items.map(item => (
                                                    <div
                                                        key={item.id}
                                                        className="bg-surface-elevated border border-border/50 rounded-lg p-4 flex items-center justify-between group hover:border-primary/50 transition-all hover:bg-surface-elevated/80"
                                                    >
                                                        <div className="flex items-center gap-6">
                                                            <BrandLogo brand={item.brand} />
                                                            <div className="flex flex-col">
                                                                <span className="text-[15px] font-medium text-primary-foreground leading-tight">{item.name}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-[14px] font-mono text-text-secondary">
                                                                {formatWeight(item.weight, units)}
                                                            </div>
                                                            <button
                                                                onClick={() => onEdit?.(item)}
                                                                className="p-2 rounded-md hover:bg-accent text-text-muted hover:text-primary transition-colors"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
