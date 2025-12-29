import { useState, useEffect } from 'react';

const themes = [
  { name: 'AXIS Dark', id: 'dark', colors: { primary: '#ffffff', bg: '#000000', surface: '#09090b', accent: '#10b981' } },
  { name: 'Studio Light', id: 'light', colors: { primary: '#000000', bg: '#ffffff', surface: '#f4f4f5', accent: '#059669' } },
  { name: 'Brutal Ops', id: 'brutal', colors: { primary: '#000000', bg: '#facc15', surface: '#eab308', accent: '#000000' } }
];

export const ThemeSelector = () => {
  const [activeTheme, setActiveTheme] = useState('dark');

  const applyTheme = (themeId: string) => {
    const root = document.documentElement;
    const theme = themes.find(t => t.id === themeId);
    
    if (theme) {
      root.style.setProperty('--brand-primary', theme.colors.primary);
      root.style.setProperty('--brand-bg', theme.colors.bg);
      root.style.setProperty('--brand-surface', theme.colors.surface);
      root.style.setProperty('--brand-accent', theme.colors.accent);
      setActiveTheme(themeId);
    }
  };

  return (
    <div className="flex gap-2 bg-brand-surface p-2 rounded-2xl border border-brand-border">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => applyTheme(t.id)}
          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
            activeTheme === t.id 
              ? 'bg-brand-primary text-brand-bg shadow-lg' 
              : 'text-brand-muted hover:text-brand-primary'
          }`}
        >
          {t.name}
        </button>
      ))}
    </div>
  );
};