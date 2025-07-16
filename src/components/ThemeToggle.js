import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} me-2`}></i>
      {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
}
