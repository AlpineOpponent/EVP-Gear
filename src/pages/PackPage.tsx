import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { usePackStore } from '../store/usePackStore';
import { useGearSearch } from '../hooks/useGearSearch';
import { useSearchStore } from '../store/useSearchStore';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  FileDown,
  Save,
  Pencil,
  RotateCcw,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { getBrandLogo } from '../lib/logoAssets';
import { type GearItem } from '../types/gear';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { Input } from '../components/ui/input';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PackExport } from '../components/PackExport';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '../components/ui/dialog';
import { Button } from '../components/shared/Button';

const BrandLogo = ({ brand, className }: { brand?: string; className?: string }) => {
  const [error, setError] = useState(false);
  const logoUrl = brand ? getBrandLogo(brand) : null;

  if (logoUrl && !error) {
    return (
        <div className="bg-white/5 p-1 rounded border border-white/10 flex items-center justify-center min-w-[48px] h-7">
            <img
                src={logoUrl}
                alt={brand}
                onError={() => setError(true)}
                className={cn("h-4 w-auto object-contain opacity-100", className)}
            />
        </div>
    );
  }

  return (
    <div className="px-1.5 py-0 rounded border border-white/10 bg-white/5 min-w-[48px] h-7 flex items-center justify-center">
        <span className={cn("text-[9px] font-bold text-text-tertiary uppercase tracking-tight whitespace-nowrap", className)}>
            {brand || '...'}
        </span>
    </div>
  );
};

const WeightOverridePopover = ({
    gearId,
    currentOverride,
    baseWeight,
    onUpdate
}: {
    gearId: string;
    currentOverride?: number;
    baseWeight: number;
    onUpdate: (gearId: string, weight?: number) => void;
}) => {
    const [value, setValue] = React.useState(currentOverride?.toString() || '');

    const handleSave = () => {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            onUpdate(gearId, num);
        } else if (value === '') {
            onUpdate(gearId, undefined);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="p-1 hover:bg-accent rounded text-text-muted transition-colors">
                    <Settings2 className="w-3.5 h-3.5" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-60 bg-card border-border p-4 shadow-xl">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                            Override Weight (g)
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={`${baseWeight}g`}
                                className="h-8 text-xs bg-surface-recessed"
                            />
                            <button
                                onClick={handleSave}
                                className="px-3 h-8 bg-primary text-primary-foreground rounded text-[11px] font-bold hover:bg-orange-light transition-colors"
                            >
                                Set
                            </button>
                        </div>
                    </div>
                    {currentOverride !== undefined && (
                        <button
                            onClick={() => {
                                setValue('');
                                onUpdate(gearId, undefined);
                            }}
                            className="text-[10px] text-text-muted hover:text-primary transition-colors text-left font-medium"
                        >
                            Reset to original ({baseWeight}g)
                        </button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export const PackPage = () => {
  const {
    currentPackId,
    currentPackName,
    items: packedItems,
    addItem,
    removeItem,
    updateQty,
    updateOverrideWeight,
    savePack,
    createNewPack,
    updatePackName
  } = usePackStore();

  const { query, mode, setQuery, setMode } = useSearchStore();
  const inventory = useGearSearch() || [];

  const allGear = useLiveQuery(() => db.gearItems.toArray()) || [];

  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [showWtChart, setShowWtChart] = useState(false);
  const [drillDown, setDrillDown] = useState<{ tt?: string; mt?: string }>({});
  const [newName, setNewName] = useState(currentPackName);

  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const modes: { id: 'tag' | 'name' | 'brand'; label: string }[] = [
    { id: 'tag', label: 'By Tag' },
    { id: 'name', label: 'By Name' },
    { id: 'brand', label: 'By Brand' },
  ];

  useEffect(() => {
    setNewName(currentPackName);
  }, [currentPackName]);

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

  // Resolve packed items with their gear data
  const resolvedItems = useMemo(() => {
    return packedItems.map(p => {
      const gear = allGear.find(g => g.id === p.gearId);
      return { ...p, gear };
    }).filter(i => i.gear);
  }, [packedItems, allGear]);

  // Group inventory items by selected mode for the left panel
  const groupedInventory = useMemo(() => {
    const groups: Record<string, typeof inventory> = {};
    inventory.forEach(item => {
        let l1 = 'Other';
        if (mode === 'tag') l1 = item.tagPath.tt;
        else if (mode === 'brand') l1 = item.brand || 'No Brand';
        else if (mode === 'name') l1 = item.name.charAt(0).toUpperCase();

        if (!groups[l1]) groups[l1] = [];
        groups[l1].push(item);
    });
    return groups;
  }, [inventory, mode]);

  // Calculate Stats
  const stats = useMemo(() => {
    let total = 0;
    let worn = 0;
    let consumable = 0;

    resolvedItems.forEach(item => {
      const weight = item.overrideWeight ?? item.gear!.weight;
      const itemTotal = weight * item.qty;
      total += itemTotal;
      if (item.gear!.weightType === 'worn') worn += itemTotal;
      if (item.gear!.weightType === 'consumable') consumable += itemTotal;
    });

    return {
      total,
      worn,
      consumable,
      base: total - worn - consumable
    };
  }, [resolvedItems]);

  // Prepare Pie Data
  const pieData = useMemo(() => {
    if (drillDown.mt) {
        // Show BT breakdown within MT
        const items = resolvedItems.filter(i => i.gear!.tagPath.tt === drillDown.tt && i.gear!.tagPath.mt === drillDown.mt);
        const btMap: Record<string, number> = {};
        items.forEach(i => {
            const bt = i.gear!.tagPath.bt || 'Other';
            const weight = (i.overrideWeight ?? i.gear!.weight) * i.qty;
            btMap[bt] = (btMap[bt] || 0) + weight;
        });
        return Object.entries(btMap).map(([id, value]) => ({ id, label: id, value }));
    }

    if (drillDown.tt) {
      // Show MT breakdown within TT
      const items = resolvedItems.filter(i => i.gear!.tagPath.tt === drillDown.tt);
      const mtMap: Record<string, number> = {};
      items.forEach(i => {
        const mt = i.gear!.tagPath.mt || 'Other';
        const weight = (i.overrideWeight ?? i.gear!.weight) * i.qty;
        mtMap[mt] = (mtMap[mt] || 0) + weight;
      });
      return Object.entries(mtMap).map(([id, value]) => ({ id, label: id, value }));
    }

    // Default: Show TT breakdown
    const ttMap: Record<string, number> = {};
    resolvedItems.forEach(i => {
      const tt = i.gear!.tagPath.tt;
      const weight = (i.overrideWeight ?? i.gear!.weight) * i.qty;
      ttMap[tt] = (ttMap[tt] || 0) + weight;
    });
    return Object.entries(ttMap).map(([id, value]) => ({ id, label: id, value }));
  }, [resolvedItems, drillDown]);

  const wtPieData = useMemo(() => [
    { id: 'Base', label: 'Base', value: stats.base },
    { id: 'Worn', label: 'Worn', value: stats.worn },
    { id: 'Consumable', label: 'Consumable', value: stats.consumable },
  ].filter(d => d.value > 0), [stats]);

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-background">
      {/* Left Panel: Inventory */}
      <div
        className={cn(
          "bg-card border-b md:border-b-0 md:border-r border-border transition-all duration-300 flex flex-col",
          isLeftCollapsed ? "h-0 md:w-0 md:h-full overflow-hidden border-none" : "h-1/2 md:h-full md:w-1/2"
        )}
      >
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display text-primary-foreground">Inventory</h2>
            <button
              onClick={() => setIsLeftCollapsed(true)}
              className="p-1 hover:bg-accent rounded-md text-text-muted"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col">
            <div className="flex relative">
              {modes.map((m, i) => (
                <button
                  key={m.id}
                  ref={el => { tabsRef.current[i] = el; }}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "px-4 py-1.5 text-[11px] font-medium rounded-t-lg transition-colors border-x border-t",
                    mode === m.id
                      ? "bg-card text-foreground border-border"
                      : "bg-transparent text-text-muted border-transparent hover:text-foreground"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="relative group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-border" />
              <div
                className="absolute top-0 h-[1.5px] bg-primary transition-all duration-300 ease-in-out"
                style={{
                  left: `${sliderStyle.left}px`,
                  width: `${sliderStyle.width}px`
                }}
              />
              <div className="mt-[1px] flex items-center gap-2 bg-card border-x border-b border-border rounded-b-lg px-3 py-2 shadow-sm">
                <Search className="w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={`Search by ${mode}...`}
                  className="bg-transparent border-none outline-none text-[13px] w-full placeholder:text-text-tertiary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 pt-0 space-y-6">
          {Object.entries(groupedInventory).sort().map(([groupName, items]) => (
            <div key={groupName} className="space-y-3">
              <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest sticky top-0 bg-card py-1 z-10">{groupName}</h3>
              <div className="space-y-3">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item.id)}
                    className="w-full bg-surface-elevated border border-border/50 rounded-lg p-3 flex items-center justify-between hover:border-primary/50 transition-all group active:scale-[0.98]"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium text-primary-foreground line-clamp-1">{item.name}</span>
                      <span className="text-[10px] text-text-tertiary uppercase tracking-tight line-clamp-1">
                          {item.brand} • {item.tagPath.tt}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-text-secondary">{item.weight}g</span>
                      <Plus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Builder */}
      <div id="tour-pack-builder" className="flex-1 flex flex-col bg-surface-recessed relative overflow-hidden">
        {isLeftCollapsed && (
          <button
            onClick={() => setIsLeftCollapsed(false)}
            className="absolute left-1/2 top-0 -translate-x-1/2 md:left-0 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 bg-card border border-border border-t-0 md:border-t md:border-l-0 rounded-b-md md:rounded-r-md md:rounded-b-none p-1 text-text-muted hover:text-primary z-10"
          >
            <ChevronRight className="w-5 h-5 hidden md:block" />
            <div className="w-5 h-5 flex items-center justify-center md:hidden font-bold">↓</div>
          </button>
        )}

        {/* Header */}
        <div className="bg-card border-b border-border p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-display text-primary-foreground">{currentPackName}</h2>
            <Dialog>
                <DialogTrigger asChild>
                    <button className="p-1 text-text-muted hover:text-primary cursor-pointer">
                        <Pencil className="w-4 h-4" />
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Pack</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Pack name..."
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button onClick={() => updatePackName(newName)}>
                                Save Changes
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center gap-2">
            <PDFDownloadLink
                document={<PackExport packName={currentPackName} items={resolvedItems as any} stats={stats} />}
                fileName={`${currentPackName.replace(/\s+/g, '_')}.pdf`}
                className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-xs font-medium hover:bg-accent transition-colors text-foreground no-underline"
            >
              {({ loading }) => (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  {loading ? 'Preparing...' : 'Export PDF'}
                </>
              )}
            </PDFDownloadLink>
            <button
                onClick={savePack}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-orange-light transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save Pack
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 space-y-8">
          {/* Visualization Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">Visualization</h3>
                <div className="flex items-center gap-2 text-xs font-medium">
                    <span
                        className={cn("cursor-pointer hover:text-primary transition-colors", !drillDown.tt && "text-primary")}
                        onClick={() => setDrillDown({})}
                    >
                        Total
                    </span>
                    {drillDown.tt && (
                        <>
                            <ChevronRight className="w-3 h-3 text-text-tertiary" />
                            <span
                                className={cn("cursor-pointer hover:text-primary transition-colors", !drillDown.mt && "text-primary")}
                                onClick={() => setDrillDown({ tt: drillDown.tt })}
                            >
                                {drillDown.tt}
                            </span>
                        </>
                    )}
                    {drillDown.mt && (
                        <>
                            <ChevronRight className="w-3 h-3 text-text-tertiary" />
                            <span className="text-primary">{drillDown.mt}</span>
                        </>
                    )}
                    {(drillDown.tt || drillDown.mt) && (
                         <button
                            onClick={() => setDrillDown({})}
                            className="ml-2 p-1 hover:bg-accent rounded text-text-muted"
                        >
                            <RotateCcw className="w-3 h-3" />
                        </button>
                    )}
                    <button
                        onClick={() => setShowWtChart(!showWtChart)}
                        className="ml-2 p-1 hover:bg-accent rounded text-text-muted transition-colors"
                        title="Toggle Weight Type Distribution"
                    >
                        <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", showWtChart && "rotate-180")} />
                    </button>
                </div>
            </div>
            <div className={cn("h-[240px] w-full flex transition-all duration-500 ease-in-out", showWtChart ? "gap-4" : "gap-0")}>
              <div className={cn("h-full transition-all duration-500", showWtChart ? "w-1/2" : "w-full")}>
                {pieData.length > 0 ? (
                  <ResponsivePie
                      data={pieData}
                      margin={{ top: 20, right: showWtChart ? 40 : 80, bottom: 20, left: showWtChart ? 40 : 80 }}
                      innerRadius={0.6}
                      padAngle={2}
                      cornerRadius={4}
                      activeOuterRadiusOffset={8}
                      colors={{ scheme: 'category10' }}
                      borderWidth={0}
                      enableArcLinkLabels={!showWtChart}
                      arcLinkLabelsSkipAngle={10}
                      arcLinkLabelsTextColor="#ADADB0"
                      arcLinkLabelsThickness={2}
                      arcLinkLabelsColor={{ from: 'color' }}
                      arcLabelsSkipAngle={10}
                      arcLabelsTextColor="#FFFFFF"
                      theme={{
                          tooltip: {
                              container: {
                                  background: '#1A1A1D',
                                  color: '#FFFFFF',
                                  fontSize: '12px',
                                  borderRadius: '6px',
                                  border: '1px solid #2A2A2E'
                              }
                          }
                      }}
                      onClick={(node) => {
                          if (!drillDown.tt) setDrillDown({ tt: node.id as string });
                          else if (!drillDown.mt) setDrillDown({ ...drillDown, mt: node.id as string });
                      }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-text-muted italic text-sm">
                    Add items to visualize distribution
                  </div>
                )}
              </div>

              {showWtChart && (
                <div className="h-full w-1/2 animate-in fade-in slide-in-from-right-4 duration-500">
                  {wtPieData.length > 0 ? (
                    <ResponsivePie
                        data={wtPieData}
                        margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
                        innerRadius={0.6}
                        padAngle={2}
                        cornerRadius={4}
                        activeOuterRadiusOffset={8}
                        colors={['#1f77b4', '#ff7f0e', '#2ca02c']}
                        borderWidth={0}
                        enableArcLinkLabels={false}
                        arcLabelsSkipAngle={10}
                        arcLabelsTextColor="#FFFFFF"
                        theme={{
                            tooltip: {
                                container: {
                                    background: '#1A1A1D',
                                    color: '#FFFFFF',
                                    fontSize: '12px',
                                    borderRadius: '6px',
                                    border: '1px solid #2A2A2E'
                                }
                            }
                        }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-text-muted italic text-sm">
                      No weight type data
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pack List */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-2xl font-display text-primary-foreground mb-6">Packed Gear</h3>
            <div className="space-y-2">
              {resolvedItems.length > 0 ? (
                resolvedItems.sort((a, b) => a.gear!.name.localeCompare(b.gear!.name)).map(item => (
                  <div key={item.gearId} className="flex items-center justify-between p-3 bg-surface-elevated border border-white/5 rounded-lg group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <BrandLogo brand={item.gear!.brand} />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-primary-foreground">{item.gear!.name}</span>
                        <span className="text-[10px] text-text-tertiary uppercase tracking-tight mt-0.5">
                          {[item.gear!.tagPath.tt, item.gear!.tagPath.mt, item.gear!.tagPath.bt].filter(Boolean).join(' / ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <WeightOverridePopover
                                gearId={item.gearId}
                                currentOverride={item.overrideWeight}
                                baseWeight={item.gear!.weight}
                                onUpdate={updateOverrideWeight}
                            />
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-mono text-text-secondary">
                                    {(item.overrideWeight ?? item.gear!.weight) * item.qty}g
                                </span>
                                {item.overrideWeight !== undefined && (
                                    <span className="text-[9px] text-orange-light">Override applied</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-surface-recessed rounded-md p-1 border border-white/5">
                            <button
                                onClick={() => updateQty(item.gearId, Math.max(1, item.qty - 1))}
                                className="p-1 hover:bg-accent rounded text-text-muted"
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono w-4 text-center">{item.qty}</span>
                            <button
                                onClick={() => updateQty(item.gearId, item.qty + 1)}
                                className="p-1 hover:bg-accent rounded text-text-muted"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                        <button
                            onClick={() => removeItem(item.gearId)}
                            className="p-1.5 text-text-muted hover:text-destructive hover:bg-destructive/10 rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-text-muted italic text-sm">
                    No items in your pack. Select gear from the inventory.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="bg-card border-t border-border p-4 md:p-6 flex flex-wrap items-center justify-between md:justify-start gap-4 md:gap-12 shrink-0">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-tertiary uppercase">Total Weight</span>
            <span className="text-xl font-mono text-primary-foreground">{stats.total}g</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-tertiary uppercase">Base Weight</span>
            <span className="text-xl font-mono text-primary">{stats.base}g</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-tertiary uppercase">Worn</span>
            <span className="text-lg font-mono text-text-secondary">{stats.worn}g</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-tertiary uppercase">Consumable</span>
            <span className="text-lg font-mono text-text-secondary">{stats.consumable}g</span>
          </div>
        </div>
      </div>
    </div>
  );
};
