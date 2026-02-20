import { create } from 'zustand';
import { type PackItem } from '../types/gear';
import { db } from '../db/db';

interface PackState {
    currentPackId: string | null;
    currentPackName: string;
    items: PackItem[];
    addItem: (gearId: string) => void;
    removeItem: (gearId: string) => void;
    updateQty: (gearId: string, qty: number) => void;
    updateOverrideWeight: (gearId: string, weight?: number) => void;
    updatePackName: (name: string) => void;
    clearPack: () => void;
    setPack: (packId: string, name: string, items: PackItem[]) => void;
    savePack: () => Promise<void>;
    createNewPack: (name: string) => void;
    loadPack: (packId: string, asEdit?: boolean) => Promise<void>;
    deletePack: (packId: string) => Promise<void>;
}

export const usePackStore = create<PackState>((set, get) => ({
    currentPackId: null,
    currentPackName: 'Untitled Pack',
    items: [],
    addItem: (gearId) => set((state) => {
        const existing = state.items.find(i => i.gearId === gearId);
        if (existing) {
            return {
                items: state.items.map(i => i.gearId === gearId ? { ...i, qty: i.qty + 1 } : i)
            };
        }
        return { items: [...state.items, { gearId, qty: 1 }] };
    }),
    removeItem: (gearId) => set((state) => ({
        items: state.items.filter(i => i.gearId !== gearId)
    })),
    updateQty: (gearId, qty) => set((state) => ({
        items: state.items.map(i => i.gearId === gearId ? { ...i, qty } : i)
    })),
    updateOverrideWeight: (gearId, weight) => set((state) => ({
        items: state.items.map(i => i.gearId === gearId ? { ...i, overrideWeight: weight } : i)
    })),
    updatePackName: (name) => set({ currentPackName: name }),
    clearPack: () => set({ items: [], currentPackId: null, currentPackName: 'Untitled Pack' }),
    setPack: (packId, name, items) => set({ currentPackId: packId, currentPackName: name, items }),
    savePack: async () => {
        let { currentPackId, currentPackName, items } = get();
        if (!currentPackId) {
            currentPackId = crypto.randomUUID();
            set({ currentPackId });
        }
        await db.packs.put({ id: currentPackId, packName: currentPackName, items });
    },
    createNewPack: (name) => {
        const newId = crypto.randomUUID();
        set({ currentPackId: newId, currentPackName: name, items: [] });
    },
    loadPack: async (packId, asEdit = false) => {
        const pack = await db.packs.get(packId);
        if (pack) {
            set({
                currentPackId: asEdit ? pack.id : null,
                currentPackName: asEdit ? pack.packName : `${pack.packName} (Copy)`,
                items: pack.items
            });
        }
    },
    deletePack: async (packId) => {
        await db.packs.delete(packId);
        if (get().currentPackId === packId) {
            set({ items: [], currentPackId: null, currentPackName: 'Untitled Pack' });
        }
    }
}));
