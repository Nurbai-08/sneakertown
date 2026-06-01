/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { storage } from '../../shared/utils/storage.js';

const ThemeContext = createContext(null);
const THEME_KEY = 'sneakertown_theme';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => storage.get(THEME_KEY, 'light'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    storage.set(THEME_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
