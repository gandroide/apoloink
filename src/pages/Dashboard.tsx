import { useEffect, useState, useMemo } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';
import { Stats } from '../components/Stats';
import { generateAccountingReport } from '../lib/reports';

// Importación de Recharts
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid 
} from 'recharts';

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// --- MOTOR DE TEMAS AXIS.ops ---
const THEMES = [
  { 
    id: 'dark', 
    name: 'Elegant Dark', 
    colors: { 
      bg: '#000000',           
      surface: '#0a0a0a',      
      primary: '#ffffff',      
      accent: '#10b981',       
      border: '#1a1a1a'        
    } 
  },
  { 
    id: 'light', 
    name: 'Business Light', 
    colors: { 
      bg: '#fafafa',           
      surface: '#ffffff',      
      primary: '#000000',      
      accent: '#020617',       
      border: '#e5e7eb'        
    } 
  }
];

export const Dashboard = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('axis-theme') || 'dark');
  
  // Ahora usamos loadingWorks del hook
  const { fetchWorks, works, loading: loadingWorks } = useAccounting();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  const applyTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty('--brand-bg', theme.colors.bg);
      root.style.setProperty('--brand-surface', theme.colors.surface);
      root.style.setProperty('--brand-primary', theme.colors.primary);
      root.style.setProperty('--brand-accent', theme.colors.accent);
      root.style.setProperty('--brand-border', theme.colors.border);
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
    const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
    const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59).toISOString();
    
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    
    setExpenses(data || []);
    setLoadingExpenses(false);
  };

  useEffect(() => { loadData(); }, [selectedMonth, selectedYear]);

  // --- LÓGICA DE GRÁFICOS ---
  const artistChartData = useMemo(() => {
    const map: Record<string, number> = {};
    works.forEach(w => {
      const name = w.artist_profile?.name || 'Otro';
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

  // --- CÁLCULOS ---
  const totalGrossSales = works.reduce((sum, w) => sum + (w.total_price || 0), 0);
  const studioGross = works.reduce((sum, w) => {
    const artistCommission = w.artist_profile?.commission_percentage || 50;
    return sum + (w.total_price * ((100 - artistCommission) / 100));
  }, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = studioGross - totalExpenses;

  const cardBase = "bg-brand-surface border border-brand-border p-8 rounded-[3rem] transition-all duration-500";

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700 pb-32 text-left bg-brand-bg text-brand-primary min-h-screen">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-brand-border pb-8">
        <div className="text-left">
          <h1 className="text-5xl md:text-7xl font-black italic text-brand-primary uppercase tracking-tighter leading-none">
            Dashboard
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-brand-muted uppercase tracking-[0.4em] mt-2 ml-1">
            AXIS.ops Intelligence
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start md:items-center justify-start md:justify-end gap-3 w-full md:w-auto">
          {/* Selector de Temas */}
          <div className="flex bg-brand-surface border border-brand-border p-1.5 rounded-2xl md:rounded-full gap-1 shadow-lg">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTheme(t.id)}
                className={`flex items-center justify-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-full transition-all duration-300 ${
                  currentTheme === t.id ? 'bg-brand-primary text-brand-bg scale-105' : 'text-brand-muted'
                }`}
              >
                <span className="text-sm">{t.id === 'dark' ? '🌙' : '☀️'}</span>
                <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">{t.name}</span>
              </button>
            ))}
          </div>

          {/* Filtros */}
          <div className="flex gap-2 bg-brand-surface p-1.5 rounded-2xl border border-brand-border shadow-lg">
            <select 
              className="bg-transparent text-[10px] font-black uppercase text-brand-primary px-3 py-2 outline-none appearance-none cursor-pointer"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {MONTHS.map((m, i) => <option key={m} value={i} className="bg-brand-surface">{m}</option>)}
            </select>
            <select 
              className="bg-transparent text-[10px] font-black uppercase text-brand-primary px-3 py-2 outline-none appearance-none cursor-pointer border-l border-brand-border"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y} className="bg-brand-surface">{y}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* Pantalla de Carga Global (Opcional) */}
      {(loadingWorks || loadingExpenses) && works.length === 0 ? (
        <div className="py-20 text-center animate-pulse text-brand-muted font-black uppercase text-xs tracking-[0.5em]">
          Sincronizando AXIS.ops...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            {/* Ventas Brutas */}
            <div className={`${cardBase} flex flex-col md:flex-row md:items-center justify-between group hover:border-brand-accent/40`}>
              <div>
                <p className="text-brand-muted text-[10px] uppercase font-black tracking-[0.3em] mb-2">Ventas Brutas Totales</p>
                <p className={`text-4xl md:text-6xl font-black font-mono text-brand-primary tracking-tighter italic ${loadingWorks ? 'opacity-20' : 'opacity-100'}`}>
                  {formatterCOP.format(totalGrossSales)}
                </p>
              </div>
              <div className={`h-16 w-16 bg-brand-accent/10 rounded-full flex items-center justify-center text-3xl ${loadingWorks ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`}>
                {loadingWorks ? '🔄' : '⚡'}
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-brand-surface border border-brand-border p-6 rounded-[2.5rem]">
                <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-6 italic">Producción por Artista</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={artistChartData}>
                      <XAxis dataKey="name" stroke="var(--brand-primary)" fontSize={10} axisLine={false} tickLine={false} opacity={0.3} />
                      <Tooltip cursor={{fill: 'var(--brand-bg)'}} contentStyle={{backgroundColor: 'var(--brand-surface)', border: '1px solid var(--brand-border)', borderRadius: '12px'}} />
                      <Bar dataKey="total" fill="var(--brand-accent)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-brand-surface border border-brand-border p-6 rounded-[2.5rem]">
                <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-6 italic">Tendencia Diaria</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesTrendData}>
                      <CartesianGrid stroke="var(--brand-border)" vertical={false} opacity={0.5} />
                      <XAxis dataKey="day" stroke="var(--brand-primary)" fontSize={10} axisLine={false} tickLine={false} opacity={0.3} />
                      <Tooltip contentStyle={{backgroundColor: 'var(--brand-surface)', border: '1px solid var(--brand-border)', borderRadius: '12px'}} />
                      <Line type="monotone" dataKey="monto" stroke="var(--brand-primary)" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <section className="bg-brand-surface/20 border border-brand-border p-8 rounded-[3rem]">
              <Stats works={works} />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <section className={`p-10 rounded-[3.5rem] shadow-2xl flex flex-col justify-between min-h-[260px] transition-all duration-500 ${
              netProfit >= 0 ? 'bg-brand-primary text-brand-bg' : 'bg-brand-danger text-brand-primary'
            }`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Utilidad Operativa Neta</p>
                <h3 className={`text-4xl xl:text-5xl font-black tabular-nums tracking-tighter leading-none mt-4 ${(loadingWorks || loadingExpenses) ? 'animate-pulse' : ''}`}>
                  {formatterCOP.format(netProfit)}
                </h3>
              </div>
            </section>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="bg-brand-surface border border-brand-border p-6 rounded-[2rem]">
                <p className="text-brand-accent text-[9px] uppercase font-black mb-1 opacity-60">Estudio Gross</p>
                <p className="text-xl font-black font-mono text-brand-accent">{formatterCOP.format(studioGross)}</p>
              </div>
              <div className="bg-brand-surface border border-brand-border p-6 rounded-[2rem]">
                <p className="text-brand-danger text-[9px] uppercase font-black mb-1 opacity-60">Gastos Totales</p>
                <p className="text-xl font-black font-mono text-brand-danger">{formatterCOP.format(totalExpenses)}</p>
              </div>
            </div>

            <button 
              onClick={() => generateAccountingReport(works, expenses, MONTHS[selectedMonth], selectedYear)}
              disabled={loadingWorks || loadingExpenses}
              className="w-full bg-brand-primary text-brand-bg py-6 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:opacity-90 transition-all disabled:opacity-50"
            >
              { (loadingWorks || loadingExpenses) ? 'Sincronizando...' : '📊 EXPORTAR AXIS.ops CSV' }
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};