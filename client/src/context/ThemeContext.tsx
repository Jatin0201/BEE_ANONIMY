import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSizePref = 'compact' | 'standard' | 'relaxed';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (theme: ThemeMode) => void;
  fontSizePref: FontSizePref;
  setFontSizePref: (pref: FontSizePref) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'anonimy_theme';
const FONT_SIZE_STORAGE_KEY = 'anonimy_font_size';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'light';
  });

  const [fontSizePref, setFontSizePrefState] = useState<FontSizePref>(() => {
    try {
      const saved = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
      if (saved === 'compact' || saved === 'standard' || saved === 'relaxed') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'standard';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Watch for OS theme changes when in 'system' mode
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    themeMode === 'system' ? (systemIsDark ? 'dark' : 'light') : themeMode;

  // Apply theme class and data-theme attribute on documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolvedTheme]);

  // Apply font size scaling on documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', fontSizePref);
    if (fontSizePref === 'compact') {
      root.style.fontSize = '14px';
    } else if (fontSizePref === 'relaxed') {
      root.style.fontSize = '16px';
    } else {
      root.style.fontSize = '15px';
    }
  }, [fontSizePref]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  };

  const setFontSizePref = (pref: FontSizePref) => {
    setFontSizePrefState(pref);
    try {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, pref);
    } catch {
      // ignore
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        fontSizePref,
        setFontSizePref,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
