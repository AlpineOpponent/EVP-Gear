import { create } from 'zustand';

export type SearchMode = 'name' | 'brand' | 'tag';

interface SearchState {
    query: string;
    mode: SearchMode;
    searchFocusTrigger: number;
    setQuery: (query: string) => void;
    setMode: (mode: SearchMode) => void;
    triggerSearchFocus: () => void;
    reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
    query: '',
    mode: 'tag',
    searchFocusTrigger: 0,
    setQuery: (query) => set({ query }),
    setMode: (mode) => set({ mode }),
    triggerSearchFocus: () => set((state) => ({ searchFocusTrigger: state.searchFocusTrigger + 1 })),
    reset: () => set({ query: '', mode: 'tag' }),
}));
