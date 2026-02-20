import { create } from 'zustand';

export type SearchMode = 'name' | 'brand' | 'tag';

interface SearchState {
    query: string;
    mode: SearchMode;
    setQuery: (query: string) => void;
    setMode: (mode: SearchMode) => void;
    reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
    query: '',
    mode: 'tag',
    setQuery: (query) => set({ query }),
    setMode: (mode) => set({ mode }),
    reset: () => set({ query: '', mode: 'tag' }),
}));
