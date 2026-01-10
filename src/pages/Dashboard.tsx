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
import { useCurrency } from '../hooks/useCurrency';

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const THEMES = [
  { id: 'dark', name: 'Elegant Dark', colors: { bg: '#000000', surface: '#0a0a0a', primary: '#ffffff', accent: '#10b981', border: '#1a1a1a', danger: '#ef4444' } },
  { id: 'light', name: 'Business Light', colors: { bg: '#fafafa', surface: '#ffffff', primary: '#000000', accent: '#020617', border: '#e5e7eb', danger: '#ef4444' } }
];

export const Dashboard = () => {
  const { format } = useCurrency();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('axis-theme') || 'dark');
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'team'>('overview');
  
  // Nuevo Estado de Rol
  const [userRole, setUserRole] = useState<'owner' | 'independent' | null>(null);

  const { fetchWorks, works, loading: loadingWorks } = useAccounting();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  // 1. GESTIÓN DE TEMA
  const themeColors = useMemo(() => {
    return THEMES.find(t => t.id === currentTheme)?.colors || THEMES[0].colors;
  }, [currentTheme]);

  const applyTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--brand-${key}`, value);
      });
      localStorage.setItem('axis-theme', themeId);
      setCurrentTheme(themeId);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('axis-theme') || 'dark';
    applyTheme(savedTheme);
  }, []);

  // 2. CARGA DE DATOS Y ROL
  const loadData = async () => {
    setLoadingExpenses(true);
    
    // a) Detectar Rol
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('type, studio_id')
            .eq('id', user.id)
            .maybeSingle();
        
        setUserRole(profile?.type === 'owner' ? 'owner' : 'independent');
        
        // b) Cargar Trabajos
        await fetchWorks(selectedMonth, selectedYear);

        // c) Cargar Gastos
        const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
        const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59).toISOString();
        
        let expenseQuery = supabase.from('expenses').select('*').gte('date', startDate).lte('date', endDate);
        
        if (profile?.studio_id) {
            expenseQuery = expenseQuery.eq('studio_id', profile.studio_id);
        } else {
            // Si es independiente, filtramos por user_id
            expenseQuery = expenseQuery.eq('user_id', user.id);
        }
        
        const { data } = await expenseQuery;
        setExpenses(data || []);
    }
    setLoadingExpenses(false);
  };

  useEffect(() => { loadData(); }, [selectedMonth, selectedYear]);

  // 3. CÁLCULOS INTELIGENTES
  const financialData = useMemo(() => {
    const totalGrossSales = works.reduce((sum, w) => sum + (w.total_price || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    let effectiveIncome = 0; // Lo que entra al bolsillo del usuario

    if (userRole === 'independent') {
        // CASO INDEPENDIENTE: No hay split, todo es ingreso.
        effectiveIncome = totalGrossSales;
    } else {
        // CASO ESTUDIO: Calculamos split
        effectiveIncome = works.reduce((sum, w) => {
            const historicRate = w.snapshot_commission ?? w.artist_profile?.commission_percentage ?? 50;
            const studioShare = 100 - historicRate;
            return sum + (w.total_price * (studioShare / 100));
        }, 0);
    }

    const netProfit = effectiveIncome - totalExpenses;

    return { totalGrossSales, effectiveIncome, totalExpenses, netProfit };
  }, [works, expenses, userRole]);

  // Data Gráficos
  const chartData = useMemo(() => {
    // Gráfico Artistas (Solo para Owners)
    const artistsMap: Record<string, number> = {};
    works.forEach(w => {
      const name = w.artist_profile?.name || 'Desconocido';
      artistsMap[name] = (artistsMap[name] || 0) + (w.total_price || 0);
    });
    const artistData = Object.entries(artistsMap).map(([name, total]) => ({ name: name.split(' ')[0], total }));

    // Gráfico Pulso (Para todos)
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, monto: 0 }));
    works.forEach((w: any) => {
      const fecha = w.date || w.created_at; 
      if (fecha) {
        const day = new Date(fecha).getDate();
        if (days[day - 1]) days[day - 1].monto += (w.total_price || 0);
      }
    });

    return { artistData, salesTrend: days };
  }, [works, selectedMonth, selectedYear]);

  // Nota Contable Componente
  const AccountingNote = () => (
    <div className="mt-4 p-4 md:p-6 bg-[var(--brand-surface)]/30 border border-[var(--brand-border)] rounded-[2rem] w-full transition-all">
      <div className="flex items-start gap-3">
        <span className="text-[var(--brand-accent)] text-lg">💡</span>
        <div className="space-y-1 text-left">
          <p className="text-[10px] font-black text-[var(--brand-primary)] uppercase tracking-widest">
            Reporte para Contabilidad
          </p>
          <p className="text-[10px] md:text-xs text-[var(--brand-muted)] leading-relaxed font-medium opacity-60">
            Exporta el balance detallado de {MONTHS[selectedMonth]} para gestión externa.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-32 text-left bg-[var(--brand-bg)] text-[var(--brand-primary)] min-h-screen">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--brand-border)] pb-6">
        <div>
          <h1 className="text-4xl md:text-7xl font-black italic text-[var(--brand-primary)] uppercase tracking-tighter leading-none">
            {userRole === 'independent' ? 'Mi Balance' : 'Dashboard'}
          </h1>
          <p className="text-[9px] md:text-xs font-bold text-[var(--brand-muted)] opacity-50 uppercase tracking-[0.4em] mt-1">AXIS.ops Intelligence</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-start md:items-center">
          {/* Selector Tema */}
          <div className="flex bg-[var(--brand-surface)] border border-[var(--brand-border)] p-1 rounded-xl md:rounded-full gap-1">
            {THEMES.map((t) => (
              <button key={t.id} onClick={() => applyTheme(t.id)} className={`px-3 py-1.5 rounded-lg md:rounded-full text-[10px] font-black uppercase transition-all ${currentTheme === t.id ? 'bg-[var(--brand-primary)] text-[var(--brand-bg)]' : 'text-[var(--brand-muted)]'}`}>
                {t.id === 'dark' ? '🌙' : '☀️'} <span className="hidden sm:inline ml-1">{t.name}</span>
              </button>
            ))}
          </div>
          {/* Selector Fecha */}
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

      {/* TABS MÓVILES (Ocultamos 'Equipo' si es independiente) */}
      <div className="flex md:hidden bg-[var(--brand-surface)] border border-[var(--brand-border)] p-1 rounded-2xl overflow-hidden shadow-lg mb-6">
        <button onClick={() => setActiveTab('overview')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-[var(--brand-primary)] text-[var(--brand-bg)] rounded-xl' : 'text-[var(--brand-muted)]'}`}>Datos</button>
        <button onClick={() => setActiveTab('charts')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'charts' ? 'bg-[var(--brand-primary)] text-[var(--brand-bg)] rounded-xl' : 'text-[var(--brand-muted)]'}`}>Graficos</button>
        {userRole === 'owner' && (
            <button onClick={() => setActiveTab('team')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'team' ? 'bg-[var(--brand-primary)] text-[var(--brand-bg)] rounded-xl' : 'text-[var(--brand-muted)]'}`}>Equipo</button>
        )}
      </div>

      {(loadingWorks || loadingExpenses) && works.length === 0 ? (
        <div className="py-20 text-center animate-pulse text-[var(--brand-muted)] font-black uppercase text-xs tracking-[0.5em]">Sincronizando AXIS.ops...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* === COLUMNA IZQUIERDA (PRINCIPAL) === */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* --- SECCIÓN OVERVIEW --- */}
            <div className={`${activeTab === 'overview' ? 'block' : 'hidden md:block'} space-y-6`}>
                {/* TARJETA GRANDE DE INGRESO */}
                <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-6 md:p-8 rounded-[2.5rem] flex items-center justify-between group">
                  <div>
                    <p className="text-[var(--brand-muted)] text-[10px] uppercase font-black tracking-[0.3em] mb-1">
                        {userRole === 'independent' ? 'Ingresos Totales' : 'Ventas Brutas'}
                    </p>
                    <p className="text-3xl md:text-6xl font-black font-mono text-[var(--brand-primary)] tracking-tighter italic leading-none">
                      {format(financialData.totalGrossSales)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-[var(--brand-accent)]/10 rounded-full flex items-center justify-center text-xl">⚡</div>
                </div>

                {/* Tarjetas Pequeñas Móvil (Solo visibles en celular) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
                    <div className={`p-8 rounded-[2.5rem] ${financialData.netProfit >= 0 ? 'bg-[var(--brand-primary)] text-[var(--brand-bg)]' : 'bg-red-500 text-white'}`}>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Utilidad Neta</p>
                        <h3 className="text-2xl font-black mt-1 font-mono">{format(financialData.netProfit)}</h3>
                    </div>
                    {/* Solo mostramos Studio Gross si es Owner en móvil */}
                    {userRole === 'owner' && (
                      <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-8 rounded-[2.5rem]">
                          <p className="text-[var(--brand-accent)] text-[9px] font-black uppercase">Estudio Gross</p>
                          <p className="text-2xl font-black font-mono text-[var(--brand-accent)]">{format(financialData.effectiveIncome)}</p>
                      </div>
                    )}
                </div>
            </div>

            {/* --- SECCIÓN CHARTS --- */}
            <div className={`${activeTab === 'charts' ? 'block' : 'hidden md:block'} grid grid-cols-1 ${userRole === 'owner' ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
                
                {/* Gráfico de Artistas (SOLO OWNER) */}
                {userRole === 'owner' && (
                    <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-6 rounded-[2.5rem]">
                        <h3 className="text-[10px] font-black text-[var(--brand-muted)] uppercase tracking-widest mb-6 italic">Rendimiento Equipo</h3>
                        <div className="h-48 md:h-64">
                            <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.artistData}>
                                <XAxis dataKey="name" hide />
                                <Tooltip 
                                contentStyle={{ backgroundColor: themeColors.surface, borderColor: themeColors.border, borderRadius: '16px', color: themeColors.primary }}
                                itemStyle={{ color: themeColors.primary }}
                                />
                                <Bar dataKey="total" fill={themeColors.accent} radius={[4, 4, 0, 0]} />
                            </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Gráfico de Pulso (PARA TODOS - Full width si es independiente) */}
                <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-6 rounded-[2.5rem]">
                  <h3 className="text-[10px] font-black text-[var(--brand-muted)] uppercase tracking-widest mb-6 italic">Pulso de Ventas</h3>
                  <div className="h-48 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.salesTrend}>
                        <CartesianGrid stroke={themeColors.border} vertical={false} opacity={0.3} />
                        <XAxis dataKey="day" hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: themeColors.surface, borderColor: themeColors.border, borderRadius: '16px', color: themeColors.primary }}
                        />
                        <Line type="monotone" dataKey="monto" stroke={themeColors.primary} strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
            </div>

            {/* --- SECCIÓN TEAM STATS (SOLO OWNER) --- */}
            {userRole === 'owner' && (
                <div className={`${activeTab === 'team' ? 'block' : 'hidden md:block'}`}>
                <section className="bg-[var(--brand-surface)]/20 border border-[var(--brand-border)] p-4 md:p-8 rounded-[3rem]">
                    <Stats works={works} />
                </section>
                </div>
            )}
          </div>

          {/* --- BARRA LATERAL DERECHA (KPIs) --- */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            {/* TARJETA 1: UTILIDAD NETA (IMPORTANTE) */}
            <section className={`p-10 rounded-[3.5rem] shadow-2xl flex flex-col justify-between min-h-[260px] ${financialData.netProfit >= 0 ? 'bg-[var(--brand-primary)] text-[var(--brand-bg)]' : 'bg-red-500 text-white'}`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                    {userRole === 'independent' ? 'Ganancia Neta (Bolsillo)' : 'Utilidad Operativa'}
                </p>
                <h3 className="text-4xl xl:text-5xl font-black tabular-nums tracking-tighter leading-none mt-4">{format(financialData.netProfit)}</h3>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mt-4">
                  {userRole === 'independent' ? 'Disponible tras gastos' : 'Caja final estudio'}
              </p>
            </section>
            
            <div className="space-y-4">
              {/* TARJETA 2: ESTUDIO GROSS (SOLO OWNER) */}
              {/* Para independientes, esto sería redundante con Ingresos Totales, así que lo ocultamos */}
              {userRole === 'owner' && (
                  <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-6 rounded-[2rem]">
                    <p className="text-[var(--brand-accent)] text-[9px] uppercase font-black mb-1 opacity-60">
                        Estudio Gross
                    </p>
                    <p className="text-xl font-black font-mono text-[var(--brand-accent)]">{format(financialData.effectiveIncome)}</p>
                  </div>
              )}

              {/* TARJETA 3: GASTOS (PARA TODOS) */}
              <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-6 rounded-[2rem]">
                <p className="text-red-500 text-[9px] uppercase font-black mb-1 opacity-60">Gastos Registrados</p>
                <p className="text-xl font-black font-mono text-red-500">{format(financialData.totalExpenses)}</p>
              </div>
            </div>
            
            <button onClick={() => generateAccountingReport(works, expenses, MONTHS[selectedMonth], selectedYear)} className="w-full bg-[var(--brand-primary)] text-[var(--brand-bg)] py-6 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:opacity-90">
                📊 EXPORTAR CSV
            </button>
            
            <AccountingNote />
          </aside>

          {/* Botones Móvil */}
          <div className="lg:hidden w-full mt-4 flex flex-col gap-4">
             <button onClick={() => generateAccountingReport(works, expenses, MONTHS[selectedMonth], selectedYear)} className="w-full bg-[var(--brand-primary)] text-[var(--brand-bg)] py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em]">
                📊 EXPORTAR CSV
            </button>
            <AccountingNote />
          </div>
        </div>
      )}
    </div>
  );
};