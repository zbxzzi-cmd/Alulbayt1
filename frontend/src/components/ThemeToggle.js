import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('light');

  // Initialize theme on component mount
  useEffect(() => {
    // Priority: localStorage > system preference > default light
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let initialTheme = 'light';
    if (savedTheme) {
      initialTheme = savedTheme;
    } else if (systemPrefersDark) {
      initialTheme = 'dark';
    }
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  // Apply theme to DOM
  const applyTheme = (newTheme) => {
    const html = document.documentElement;
    html.setAttribute('data-theme', newTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#0f1419' : '#c3ffff');
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="ds-theme-toggle"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="ds-theme-toggle-text">
        {theme === 'light' ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

export default ThemeToggle;