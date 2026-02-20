import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useSearchStore } from '../store/useSearchStore';
import { type GearItem } from '../types/gear';

export const useGearSearch = () => {
    const query = useSearchStore((state) => state.query);
    const mode = useSearchStore((state) => state.mode);

    return useLiveQuery(async () => {
        const lowerQuery = query.toLowerCase().trim();

        if (!lowerQuery) {
            return await db.gearItems.toArray();
        }

        const allItems = await db.gearItems.toArray();

        const sorted = allItems.filter((item) => {
            switch (mode) {
                case 'name':
                    return item.name.toLowerCase().includes(lowerQuery);
                case 'brand':
                    return (item.brand || '').toLowerCase().includes(lowerQuery);
                case 'tag':
                    return (
                        item.tagPath.tt.toLowerCase().includes(lowerQuery) ||
                        (item.tagPath.mt || '').toLowerCase().includes(lowerQuery) ||
                        (item.tagPath.bt || '').toLowerCase().includes(lowerQuery)
                    );
                default:
                    return true;
            }
        });

        return sorted.sort((a, b) => {
            if (mode === 'tag') {
                const tt = a.tagPath.tt.localeCompare(b.tagPath.tt);
                if (tt !== 0) return tt;
                const mt = (a.tagPath.mt || '').localeCompare(b.tagPath.mt || '');
                if (mt !== 0) return mt;
                const bt = (a.tagPath.bt || '').localeCompare(b.tagPath.bt || '');
                if (bt !== 0) return bt;
                return a.name.localeCompare(b.name);
            } else if (mode === 'brand') {
                const brand = (a.brand || '').localeCompare(b.brand || '');
                if (brand !== 0) return brand;
                return a.name.localeCompare(b.name);
            } else {
                return a.name.localeCompare(b.name);
            }
        });
    }, [query, mode]);
};
