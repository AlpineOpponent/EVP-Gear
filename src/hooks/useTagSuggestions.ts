import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export interface TagSuggestions {
    tt: string[];
    mt: string[];
    bt: string[];
}

export const useTagSuggestions = (selectedTt?: string, selectedMt?: string) => {
    return useLiveQuery(async () => {
        const allItems = await db.gearItems.toArray();

        const tt = Array.from(new Set(allItems.map(i => i.tagPath.tt))).sort();

        let mt: string[] = [];
        if (selectedTt) {
            mt = Array.from(new Set(
                allItems
                    .filter(i => i.tagPath.tt === selectedTt && i.tagPath.mt)
                    .map(i => i.tagPath.mt as string)
            )).sort();
        }

        let bt: string[] = [];
        if (selectedMt) {
            bt = Array.from(new Set(
                allItems
                    .filter(i => i.tagPath.mt === selectedMt && i.tagPath.bt)
                    .map(i => i.tagPath.bt as string)
            )).sort();
        }

        return { tt, mt, bt };
    }, [selectedTt, selectedMt]);
};

/**
 * Given a BT, finds its parent MT and grandparent TT from existing data.
 * Useful for the "Child-Parent Auto-fill" logic.
 * 
 * FIX: Only auto-fills if the BT is globally unique to avoid collisions.
 */
export const findTagParents = async (bt: string) => {
    const items = await db.gearItems.where('tagPath.bt').equals(bt).toArray();

    // Only auto-fill if the BT is unique across all hierarchies
    if (items.length > 0) {
        const firstItem = items[0];
        const isUniqueHierarchy = items.every(item =>
            item.tagPath.tt === firstItem.tagPath.tt &&
            item.tagPath.mt === firstItem.tagPath.mt
        );

        if (isUniqueHierarchy) {
            return {
                tt: firstItem.tagPath.tt,
                mt: firstItem.tagPath.mt
            };
        }
    }
    return null;
};

/**
 * Checks if a Top-Tag string is brand new to the database.
 */
export const isNewTopTag = async (tt: string) => {
    const count = await db.gearItems.where('tagPath.tt').equals(tt).count();
    return count === 0;
};

/**
 * Returns all unique brands used in the database.
 */
export const useBrandSuggestions = () => {
    return useLiveQuery(async () => {
        const allItems = await db.gearItems.toArray();
        return Array.from(new Set(allItems.map(i => i.brand).filter(Boolean) as string[])).sort();
    }, []);
};
