import { useEffect, useState, useMemo } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';
import { Stats } from '../components/Stats';
import { generateAccountingReport } from '../lib/reports';

import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid 
} from 'recharts';

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const THEMES = [
  { id: 'dark', name: 'Elegant Dark', colors: { bg: '#000000', surface: '#0a0a0a', primary: '#ffffff', accent: '#10b981', border: '#1a1a1a', danger: '#ef4444' } },
  { id: 'light', name: 'Business Light', colors: { bg: '#fafafa', surface: '#ffffff', primary: '#000000', accent: '#020617', border: '#e5e7eb', danger: '#ef4444' } }
];

export const Dashboard = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('axis-theme') || 'dark');
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'team'>('overview');
  
  const { fetchWorks, works, loading: loadingWorks } = useAccounting();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  // 1. SOLUCIÓN GRÁFICOS: Obtenemos los colores reales (HEX)
  const themeColors = useMemo(() => {
    return THEMES.find(t => t.id === currentTheme)?.colors || THEMES[0].colors;
  }, [currentTheme]);

  const applyTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty('--brand-bg', theme.colors.bg);
      root.style.setProperty('--brand-surface', theme.colors.surface);
      root.style.setProperty('--brand-primary', theme.colors.primary);
      root.style.setProperty('--brand-accent', theme.colors.accent);
      root.style.setProperty('--brand-border', theme.colors.border);
      root.style.setProperty('--brand-danger', theme.colors.danger || '#ef4444');
      localStorage.setItem('axis-theme', themeId);
      setCurrentTheme(themeId);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('axis-theme') || 'dark';
    applyTheme(savedTheme);
  }, []);

  const loadData = async () => {
    setLoadingExpenses(true);
    await fetchWorks(selectedMonth, selectedYear);
    
    // Cargamos gastos
    const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
    const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59).toISOString();
    
    const { data } = await supabase.from('expenses').select('*').gte('date', startDate).lte('date', endDate);
    setExpenses(data || []);
    setLoadingExpenses(false);
  };

  useEffect(() => { loadData(); }, [selectedMonth, selectedYear]);

  // 2. DATA GRÁFICOS
  const artistChartData = useMemo(() => {
    const map: Record<string, number> = {};
    works.forEach(w => {
      const name = w.artist_profile?.name || 'Desconocido';
      map[name] = (map[name] || 0) + (w.total_price || 0);
    });
    return Object.entries(map).map(([name, total]) => ({ name: name.split(' ')[0], total }));
  }, [works]);

  const salesTrendData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, monto: 0 }));
    works.forEach((w: any) => {
      const fecha = w.date || w.created_at; 
      if (fecha) {
        const day = new Date(fecha).getDate();
        if (days[day - 1]) days[day - 1].monto += (w.total_price || 0);
      }
    });
    return days;
  }, [works, selectedMonth, selectedYear]);

  const totalGrossSales = works.reduce((sum, w) => sum + (w.total_price || 0), 0);
  
  // 3. CÁLCULO DE UTILIDAD (Con Lógica Snapshot para evitar errores históricos)
  const studioGross = works.reduce((sum, w) => {
    // PRIORIDAD: 
    // 1. Usar 'snapshot_commission' (histórico congelado en DB)
    // 2. Si no existe, usar el perfil actual (w.artist_profile.commission_percentage)
    // 3. Si todo falla, asumir 50%
    const historicRate = w.snapshot_commission ?? w.artist_profile?.commission_percentage ?? 50;
    
    // Calculamos cuánto se queda el estudio (100% - % del Artista)
    const studioShare = 100 - historicRate;
    
    return sum + (w.total_price * (studioShare / 100));
  }, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = studioGross - totalExpenses;

  // Componente de nota
  const AccountingNote = () => (
    <div className="mt-4 p-4 md:p-6 bg-[var(--brand-surface)]/30 border border-[var(--brand-border)] rounded-[2rem] w-full transition-all">
      <div className="flex items-start gap-3">
        <span className="text-[var(--brand-accent)] text-lg">💡</span>
        <div className="space-y-1 text-left">
          <p className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest">
            Reporte para Contabilidad
          </p>
          <p className="text-[10px] md:text-xs text-[var(--brand-muted)] leading-relaxed font-medium opacity-60">
            Este archivo exporta el balance detallado. Diseñado para tu contador.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-32 text-left bg-[var(--brand-bg)] text-[var(--brand-primary)] min-h-screen">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--brand-border)] pb-6">
        <div>
          <h1 className="text-4xl md:text-7xl font-black italic text-[var(--brand-primary)] uppercase tracking-tighter leading-none">Dashboard</h1>
          <p className="text-[9px] md:text-xs font-bold text-[var(--brand-muted)] opacity-50 uppercase tracking-[0.4em] mt-1">AXIS.ops Intelligence</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-start md:items-center">
          <div className="flex bg-[var(--brand-surface)] border border-[var(--brand-border)] p-1 rounded-xl md:rounded-full gap-1">
            {THEMES.map((t) => (
              <button key={t.id} onClick={() => applyTheme(t.id)} className={`px-3 py-1.5 rounded-lg md:rounded-full text-[10px] font-black uppercase transition-all ${currentTheme === t.id ? 'bg-[var(--brand-primary)] text-[var(--brand-bg)]' : 'text-[var(--brand-muted)]'}`}>
                {t.id === 'dark' ? '🌙' : '☀️'} <span className="hidden sm:inline ml-1">{t.name}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 bg-[var(--brand-surface)] p-1 rounded-xl border border-[var(--brand-border)] w-full sm:w-auto">
            <select className="bg-transparent text-[10px] font-black uppercase text-[var(--brand-primary)] px-2 py-1.5 outline-none flex-1" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
              {MONTHS.map((m, i) => <option key={m} value={i} className="bg-black text-white">{m}</option>)}
            </select>
            <select className="bg-transparent text-[10px] font-black uppercase text-[var(--brand-primary)] px-2 py-1.5 outline-none border-l border-[var(--brand-border)]" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y} className="bg-black text-white">{y}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* TABS MÓVILES */}
      <div className="flex md:hidden bg-[var(--brand-surface)] border border-[var(--brand-border)] p-1 rounded-2xl overflow-hidden shadow-lg mb-6">
        <button onClick={() => setActiveTab('overview')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-[var(--brand-primary)] text-[var(--brand-bg)] rounded-xl' : 'text-[var(--brand-muted)]'}`}>Datos</button>
        <button onClick={() => setActiveTab('charts')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'charts' ? 'bg-[var(--brand-primary)] text-[var(--brand-bg)] rounded-xl' : 'text-[var(--brand-muted)]'}`}>Graficos</button>
        <button onClick={() => setActiveTab('team')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'team' ? 'bg-[var(--brand-primary)] text-[var(--brand-bg)] rounded-xl' : 'text-[var(--brand-muted)]'}`}>Equipo</button>
      </div>

      {(loadingWorks || loadingExpenses) && works.length === 0 ? (
        <div className="py-20 text-center animate-pulse text-[var(--brand-muted)] font-black uppercase text-xs tracking-[0.5em]">Sincronizando AXIS.ops...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8">
            <div className={`${activeTab === 'overview' ? 'block' : 'hidden md:block'} space-y-6`}>
                <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-6 md:p-8 rounded-[2.5rem] flex items-center justify-between group">
                  <div>
                    <p className="text-[var(--brand-muted)] text-[10px] uppercase font-black tracking-[0.3em] mb-1">Ventas Brutas</p>
                    <p className="text-3xl md:text-6xl font-black font-mono text-[var(--brand-primary)] tracking-tighter italic leading-none">
                      {formatterCOP.format(totalGrossSales)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-[var(--brand-accent)]/10 rounded-full flex items-center justify-center text-xl">⚡</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
                    <div className={`p-8 rounded-[2.5rem] ${netProfit >= 0 ? 'bg-[var(--brand-primary)] text-[var(--brand-bg)]' : 'bg-red-500 text-white'}`}>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Utilidad Neta</p>
                        <h3 className="text-2xl font-black mt-1 font-mono">{formatterCOP.format(netProfit)}</h3>
                    </div>
                    <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-8 rounded-[2.5rem]">
                        <p className="text-[var(--brand-accent)] text-[9px] font-black uppercase">Estudio Gross</p>
                        <p className="text-2xl font-black font-mono text-[var(--brand-accent)]">{formatterCOP.format(studioGross)}</p>
                    </div>
                </div>
            </div>

            <div className={`${activeTab === 'charts' ? 'block' : 'hidden md:block'} grid grid-cols-1 md:grid-cols-2 gap-6`}>
                <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-6 rounded-[2.5rem]">
                  <h3 className="text-[10px] font-black text-[var(--brand-muted)] uppercase tracking-widest mb-6 italic">Artistas</h3>
                  <div className="h-48 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={artistChartData}>
                        <XAxis dataKey="name" hide />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: themeColors.surface, 
                            borderColor: themeColors.border, 
                            borderRadius: '16px',
                            color: themeColors.primary
                          }}
                          itemStyle={{ color: themeColors.primary }}
                        />
                        <Bar dataKey="total" fill={themeColors.accent} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-6 rounded-[2.5rem]">
                  <h3 className="text-[10px] font-black text-[var(--brand-muted)] uppercase tracking-widest mb-6 italic">Pulso</h3>
                  <div className="h-48 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesTrendData}>
                        <CartesianGrid stroke={themeColors.border} vertical={false} opacity={0.3} />
                        <XAxis dataKey="day" hide />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: themeColors.surface, 
                            borderColor: themeColors.border, 
                            borderRadius: '16px',
                            color: themeColors.primary
                          }}
                        />
                        <Line type="monotone" dataKey="monto" stroke={themeColors.primary} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
            </div>

            <div className={`${activeTab === 'team' ? 'block' : 'hidden md:block'}`}>
              <section className="bg-[var(--brand-surface)]/20 border border-[var(--brand-border)] p-4 md:p-8 rounded-[3rem]">
                <Stats works={works} />
              </section>
            </div>
          </div>

          <aside className="hidden lg:block lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <section className={`p-10 rounded-[3.5rem] shadow-2xl flex flex-col justify-between min-h-[260px] ${netProfit >= 0 ? 'bg-[var(--brand-primary)] text-[var(--brand-bg)]' : 'bg-red-500 text-white'}`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Utilidad Operativa Neta</p>
                <h3 className="text-4xl xl:text-5xl font-black tabular-nums tracking-tighter leading-none mt-4">{formatterCOP.format(netProfit)}</h3>
              </div>
            </section>
            <div className="space-y-4">
              <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-6 rounded-[2rem]">
                <p className="text-[var(--brand-accent)] text-[9px] uppercase font-black mb-1 opacity-60">Estudio Gross</p>
                <p className="text-xl font-black font-mono text-[var(--brand-accent)]">{formatterCOP.format(studioGross)}</p>
              </div>
              <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-6 rounded-[2rem]">
                <p className="text-red-500 text-[9px] uppercase font-black mb-1 opacity-60">Gastos Totales</p>
                <p className="text-xl font-black font-mono text-red-500">{formatterCOP.format(totalExpenses)}</p>
              </div>
            </div>
            <button onClick={() => generateAccountingReport(works, expenses, MONTHS[selectedMonth], selectedYear)} className="w-full bg-[var(--brand-primary)] text-[var(--brand-bg)] py-6 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:opacity-90">
                📊 EXPORTAR CSV
            </button>
            
            <AccountingNote />
          </aside>

          <div className="lg:hidden w-full mt-4 flex flex-col gap-4">
             <button onClick={() => generateAccountingReport(works, expenses, MONTHS[selectedMonth], selectedYear)} className="w-full bg-[var(--brand-primary)] text-[var(--brand-bg)] py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em]">
                📊 EXPORTAR AXIS.ops CSV
            </button>
            
            <AccountingNote />
          </div>
        </div>
      )}
    </div>
  );
};