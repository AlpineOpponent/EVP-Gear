import React from 'react';
import { X, Settings, Database, Info, Shield, LogOut, Package, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../shared/Button';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { usePackStore } from '../../store/usePackStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { type PageType } from './Navbar';
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from '../ui/popover';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageType) => void;
}

export const SettingsSidebar = ({ isOpen, onClose, onNavigate }: SettingsSidebarProps) => {
  const packs = useLiveQuery(() => db.packs.toArray()) || [];
  const { loadPack, createNewPack, deletePack } = usePackStore();
  const { theme, units, setTheme, toggleUnits } = useSettingsStore();

  const handleExportData = async () => {
    try {
      const gearItems = await db.gearItems.toArray();
      const packs = await db.packs.toArray();
      const data = { gearItems, packs, version: '3.1.0', exportDate: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evp_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data:', err);
      alert('Failed to export database.');
    }
  };

  const handleClearData = async () => {
    if (confirm('WARNING: This will permanently delete ALL your gear and packs. Are you absolutely sure?')) {
      if (confirm('Last chance. Type OK to confirm or Cancel to back out.')) {
        try {
          await db.gearItems.clear();
          await db.packs.clear();
          onNavigate('home');
          onClose();
          alert('Database cleared successfully.');
        } catch (err) {
          console.error('Failed to clear data:', err);
          alert('Failed to clear database.');
        }
      }
    }
  };

  const handleLoadPack = async (packId: string) => {
    await loadPack(packId); // Default is false (load as copy)
    onNavigate('pack');
    onClose();
  };

  const handleEditPack = async (packId: string) => {
    await loadPack(packId, true); // true for asEdit
    onNavigate('pack');
    onClose();
  };

  const handleDeletePack = async (packId: string) => {
    if (confirm('Are you sure you want to delete this pack?')) {
      await deletePack(packId);
    }
  };

  const handleCreatePack = () => {
    const name = prompt('Enter name for new pack:', 'New Pack');
    if (name) {
      createNewPack(name);
      onNavigate('pack');
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        id="tour-settings-sidebar"
        className={cn(
          "fixed top-0 right-0 h-full w-[380px] bg-card border-l border-border z-[101] shadow-2xl transition-transform duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between bg-surface-recessed/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg font-display text-primary-foreground">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-md text-text-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">My Packs</h3>
                  <button
                      onClick={handleCreatePack}
                      className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-orange-light transition-colors uppercase tracking-wider"
                  >
                      <Plus className="w-3 h-3" /> New
                  </button>
              </div>
              <div className="space-y-2">
                {packs.map(pack => (
                  <div key={pack.id} className="w-full flex items-center justify-between p-3 bg-surface-recessed/50 hover:bg-surface-elevated rounded-lg border border-border/50 hover:border-primary/50 transition-all group">
                    <button
                      onClick={() => handleLoadPack(pack.id)}
                      className="flex-1 flex items-center justify-between text-left pr-2"
                    >
                      <div className="flex items-center gap-3">
                          <Package className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium text-primary-foreground">{pack.packName}</span>
                      </div>
                      <span className="text-[10px] text-text-tertiary">{pack.items.length} items</span>
                    </button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="p-1 hover:bg-accent rounded text-text-muted hover:text-primary transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-1 bg-card border border-border shadow-xl z-[105]" align="end">
                        <PopoverClose asChild>
                          <button
                            onClick={() => handleEditPack(pack.id)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded text-text-secondary hover:text-primary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" /> Edit Pack
                          </button>
                        </PopoverClose>
                        <PopoverClose asChild>
                          <button
                            onClick={() => handleDeletePack(pack.id)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-destructive/10 rounded text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Delete Pack
                          </button>
                        </PopoverClose>
                      </PopoverContent>
                    </Popover>
                  </div>
                ))}
                {packs.length === 0 && (
                    <div className="text-[12px] text-text-muted italic py-2">No packs saved yet.</div>
                )}
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Preferences</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-surface-recessed/50 rounded-lg border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-primary-foreground">Units</span>
                    <span className="text-[11px] text-text-muted">{units === 'metric' ? 'Metric (grams/kg)' : 'Imperial (oz/lbs)'}</span>
                  </div>
                  <Button variant="secondary" className="h-7 text-[11px] px-3" onClick={toggleUnits}>Toggle</Button>
                </div>
                <div className="flex flex-col gap-3 p-3 bg-surface-recessed/50 rounded-lg border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-primary-foreground">Theme</span>
                    <span className="text-[11px] text-text-muted">Choose your interface style</span>
                  </div>
                  <div className="flex p-1 bg-background border border-border rounded-lg relative">
                    <div
                        className="absolute top-1 bottom-1 bg-surface-elevated border border-border/50 rounded-md transition-all duration-300 ease-in-out shadow-sm z-0"
                        style={{
                            width: 'calc(33.333% - 2.6px)',
                            left: theme === 'dark' ? '4px' : theme === 'nature' ? 'calc(33.333% + 1.3px)' : 'calc(66.666% - 1.3px)'
                        }}
                    />
                    <button
                        onClick={() => setTheme('dark')}
                        className={cn(
                            "flex-1 py-1.5 text-[11px] font-medium transition-colors rounded-md relative z-10",
                            theme === 'dark' ? "text-primary-foreground" : "text-text-muted hover:text-text-secondary"
                        )}
                    >
                        Dark
                    </button>
                    <button
                        onClick={() => setTheme('nature')}
                        className={cn(
                            "flex-1 py-1.5 text-[11px] font-medium transition-colors rounded-md relative z-10",
                            theme === 'nature' ? "text-primary-foreground" : "text-text-muted hover:text-text-secondary"
                        )}
                    >
                        Nature
                    </button>
                    <button
                        onClick={() => setTheme('light')}
                        className={cn(
                            "flex-1 py-1.5 text-[11px] font-medium transition-colors rounded-md relative z-10",
                            theme === 'light' ? "text-primary-foreground" : "text-text-muted hover:text-text-secondary"
                        )}
                    >
                        Light
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Data Management</h3>
              <div className="space-y-1">
                <button
                    onClick={handleExportData}
                    className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg text-sm text-text-secondary transition-colors group cursor-pointer"
                >
                  <Database className="w-4 h-4 text-text-tertiary group-hover:text-primary transition-colors" />
                  <span>Export Database (JSON)</span>
                </button>
                <button
                    onClick={handleClearData}
                    className="w-full flex items-center gap-3 p-3 hover:bg-destructive/10 rounded-lg text-sm text-destructive/80 transition-colors group cursor-pointer hover:text-destructive"
                >
                  <Shield className="w-4 h-4 text-destructive/80 group-hover:text-destructive transition-colors" />
                  <span>Clear All Data</span>
                </button>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">App Info</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-3 p-3 text-sm text-text-secondary">
                  <Info className="w-4 h-4 text-text-tertiary" />
                  <div className="flex flex-col">
                    <span>EVP-Gear v3.1.0</span>
                    <span className="text-[10px] text-text-tertiary">Production Build</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-surface-recessed/30">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-accent/50 hover:bg-destructive/10 text-text-muted hover:text-destructive rounded-lg text-sm font-medium transition-all group">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
