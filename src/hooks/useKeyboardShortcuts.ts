import { useEffect } from 'react';

interface ShortcutMap {
  [key: string]: (e: KeyboardEvent) => void;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutMap, active: boolean = true) => {
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Build a key string like "ctrl+s" or "meta+k" or "escape"
      let key = e.key.toLowerCase();
      if (modifier && key !== 'control' && key !== 'meta') {
        key = `${isMac ? 'meta' : 'ctrl'}+${key}`;
      }

      if (shortcuts[key]) {
        // Only prevent default if it's a known shortcut with a modifier or Escape
        if (modifier || key === 'escape') {
          e.preventDefault();
        }
        shortcuts[key](e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, active]);
};
