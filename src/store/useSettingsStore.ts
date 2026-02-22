import { create } from 'zustand';

export type ThemeType = 'dark' | 'nature' | 'light';

interface SettingsState {
  theme: ThemeType;
  units: 'metric' | 'imperial';
  setTheme: (theme: ThemeType) => void;
  toggleUnits: () => void;
}

// Check local storage for initial values
const getInitialTheme = (): ThemeType => {
  const saved = localStorage.getItem('evp-theme') as ThemeType;
  return ['dark', 'nature', 'light'].includes(saved) ? saved : 'dark'; // Default to dark
};

const getInitialUnits = (): 'metric' | 'imperial' => {
  const saved = localStorage.getItem('evp-units');
  return saved === 'imperial' ? 'imperial' : 'metric'; // Default to metric
};

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: getInitialTheme(),
  units: getInitialUnits(),
  setTheme: (newTheme: ThemeType) => set((state) => {
    localStorage.setItem('evp-theme', newTheme);

    // Remove old themes
    document.documentElement.classList.remove('dark', 'nature');

    // Add new theme if not light
    if (newTheme !== 'light') {
      document.documentElement.classList.add(newTheme);
    }

    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = `/evp.logo.${newTheme}.svg`;
    }

    return { theme: newTheme };
  }),
  toggleUnits: () => set((state) => {
    const newUnits = state.units === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem('evp-units', newUnits);
    return { units: newUnits };
  })
}));
