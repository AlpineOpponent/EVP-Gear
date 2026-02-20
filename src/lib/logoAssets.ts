/**
 * This module uses Vite's glob import feature to create a dictionary
 * of all available brand logos at build/runtime.
 * This avoids 404 network errors and browser filesystem limitations.
 */

// Import all images from the brands folder using a relative path
const logoModules = import.meta.glob('../assets/brands/*.{png,jpg,jpeg,svg,webp}', { eager: true, query: '?url', import: 'default' });

/**
 * Normalizes a string for robust matching:
 * 1. Lowercase
 * 2. Remove diacritics (e.g. fjällraven -> fjallraven)
 * 3. Remove all non-alphanumeric characters (spaces, underscores, hyphens)
 */
const normalize = (str: string) => {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
};

// Create a lookup dictionary: { "carinthia": "/src/assets/brands/carinthia.png" }
const logoDictionary: Record<string, string> = {};

Object.entries(logoModules).forEach(([path, url]) => {
    // Extract filename without extension and folder path
    const filename = path.split('/').pop()?.split('.').shift();
    if (filename) {
        // We store the normalized filename as the key
        const key = normalize(filename);
        logoDictionary[key] = url as string;
    }
});

/**
 * Returns the URL of the brand logo if it exists in the assets folder.
 * Matches are case-insensitive and resilient to spaces/underscores/special characters.
 */
export const getBrandLogo = (brand: string): string | null => {
    if (!brand) return null;
    const key = normalize(brand);
    return logoDictionary[key] || null;
};

/**
 * Returns a list of all brands that have an associated logo.
 */
export const getAvailableLogoBrands = (): string[] => {
    return Object.keys(logoDictionary);
};
