import { type GearItem, type PackItem } from '../types/gear';

export interface WeightStats {
    total: number;
    base: number;
    worn: number;
    consumable: number;
}

export const calculateWeightStats = (
    packItems: PackItem[],
    gearCatalog: Map<string, GearItem>
): WeightStats => {
    const stats: WeightStats = {
        total: 0,
        base: 0,
        worn: 0,
        consumable: 0,
    };

    packItems.forEach((item) => {
        const gear = gearCatalog.get(item.gearId);
        if (!gear) return;

        // Use overrideWeight if provided, otherwise fallback to gear.weight
        const unitWeight = (gear.weightType === 'consumable' && item.overrideWeight !== undefined)
            ? item.overrideWeight
            : gear.weight;

        const itemTotalWeight = unitWeight * item.qty;
        stats.total += itemTotalWeight;

        switch (gear.weightType) {
            case 'worn':
                stats.worn += itemTotalWeight;
                break;
            case 'consumable':
                stats.consumable += itemTotalWeight;
                break;
            case 'standard':
            default:
                stats.base += itemTotalWeight;
                break;
        }
    });

    return stats;
};

/**
 * Formats weight in grams to a readable string (e.g., "1.2kg" or "800g")
 */
export const formatWeight = (grams: number): string => {
    if (grams >= 1000) {
        return `${(grams / 1000).toFixed(2)}kg`;
    }
    return `${grams}g`;
};

/**
 * Converts a DOM element (like a Nivo Chart SVG) to a Base64 PNG string.
 * This is intended to be used with @react-pdf/renderer's <Image> tag.
 */
export const elementToBase64 = async (element: HTMLElement): Promise<string> => {
    // Logic template: In real use, call htmlToImage.toPng(element)
    console.log('Converting element to Base64 for PDF export:', element);
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
};
