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

export const Dashboard = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  const { fetchWorks, works, loading: loadingWorks } = useAccounting();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

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

  // --- LÓGICA DE PROCESAMIENTO PARA GRÁFICOS ---
  
  // 1. Rendimiento por Artista (Bar Chart)
  const artistChartData = useMemo(() => {
    const map: Record<string, number> = {};
    works.forEach(w => {
      const name = w.artist_profile?.name || 'Otro';
      map[name] = (map[name] || 0) + (w.total_price || 0);
    });
    return Object.entries(map).map(([name, total]) => ({ name: name.split(' ')[0], total }));
  }, [works]);

  // 2. Tendencia de Ventas Diarias (Line Chart)
const salesTrendData = useMemo(() => {
    // CORRECCIÓN: Añadida la 'D' de Date que faltaba
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      monto: 0
    }));
  
    works.forEach((w: any) => { // Usamos :any temporalmente para evitar el error de propiedad
      // CORRECCIÓN: Si tu columna no se llama 'date', cámbiala aquí por 'created_at'
      const fecha = w.date || w.created_at; 
      if (fecha) {
        const day = new Date(fecha).getDate();
        if (days[day - 1]) {
          days[day - 1].monto += (w.total_price || 0);
        }
      }
    });
    return days;
  }, [works, selectedMonth, selectedYear]);

  // --- CÁLCULOS FINANCIEROS ---
  const totalGrossSales = works.reduce((sum, w) => sum + (w.total_price || 0), 0);
  const studioGross = works.reduce((sum, w) => {
    const artistCommission = w.artist_profile?.commission_percentage || 50;
    const studioPercentage = (100 - artistCommission) / 100;
    return sum + (w.total_price * studioPercentage);
  }, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = studioGross - totalExpenses;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700 pb-32 text-left">
      
      {/* HEADER DINÁMICO */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 pb-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none">
            Dashboard
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mt-2 ml-1">Apolo Intel Intelligence</p>
        </div>
        
        <div className="flex gap-2 bg-zinc-900/50 p-2 rounded-3xl border border-zinc-800">
          <select 
            className="bg-transparent text-xs font-black uppercase text-zinc-300 px-4 py-2 outline-none appearance-none cursor-pointer"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={m} value={i} className="bg-zinc-900">{m}</option>)}
          </select>
          <select 
            className="bg-transparent text-xs font-black uppercase text-zinc-300 px-4 py-2 outline-none appearance-none cursor-pointer border-l border-zinc-800"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y} className="bg-zinc-900">{y}</option>)}
          </select>
        </div>
      </header>

      {/* MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-8 space-y-8">
          {/* Card de Ventas Brutas */}
          <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[3rem] flex flex-col md:flex-row md:items-center justify-between group hover:bg-zinc-900/50 transition-all">
            <div>
              <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.3em] mb-2">Ventas Brutas Totales</p>
              <p className="text-4xl md:text-6xl font-black font-mono text-white tracking-tighter italic">
                {formatterCOP.format(totalGrossSales)}
              </p>
            </div>
            <span className="text-5xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">📈</span>
          </div>

          {/* SECCIÓN DE GRÁFICOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico de Barras: Artistas */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2.5rem]">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 italic">Producción por Artista</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={artistChartData}>
                    <XAxis dataKey="name" stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#18181b', border: 'none', borderRadius: '12px'}} />
                    <Bar dataKey="total" fill="#ffffff" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Líneas: Tendencia Mensual */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2.5rem]">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 italic">Pulso del Mes</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrendData}>
                    <CartesianGrid stroke="#18181b" vertical={false} />
                    <XAxis dataKey="day" stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor: '#18181b', border: 'none', borderRadius: '12px'}} />
                    <Line type="monotone" dataKey="monto" stroke="#ffffff" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Stats de Artistas (Componente existente) */}
          <section className="bg-zinc-900/10 border border-zinc-800/30 p-8 rounded-[3rem]">
            <div className="flex justify-between items-center mb-6">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Rendimiento Detallado</p>
              <div className="h-px flex-1 bg-zinc-800 mx-4 opacity-30"></div>
            </div>
            <Stats works={works} />
          </section>
        </div>

        {/* COLUMNA DERECHA: FINANZAS */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          
          <section className={`p-10 rounded-[3.5rem] shadow-2xl flex flex-col justify-between min-h-[260px] ${
            netProfit >= 0 ? 'bg-white text-black' : 'bg-red-600 text-white'
          }`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Utilidad Neta</p>
              <h3 className="text-4xl xl:text-5xl font-black tabular-nums tracking-tighter leading-none mt-4">
                {formatterCOP.format(netProfit)}
              </h3>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 italic leading-tight">
              Calculado tras comisiones y gastos operativos.
            </p>
          </section>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem]">
              <p className="text-emerald-500/60 text-[9px] uppercase font-black mb-1">Caja Estudio</p>
              <p className="text-xl font-black font-mono text-emerald-500">
                {formatterCOP.format(studioGross)}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem]">
              <p className="text-red-500/60 text-[9px] uppercase font-black mb-1">Gastos Operativos</p>
              <p className="text-xl font-black font-mono text-red-400">
                {formatterCOP.format(totalExpenses)}
              </p>
            </div>
          </div>

          {/* BOTÓN REPORTE (Sin cambios significativos, solo ajuste estético) */}
          <button 
              onClick={() => generateAccountingReport(works, expenses, MONTHS[selectedMonth], selectedYear)}
              disabled={loadingWorks || loadingExpenses}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500 py-6 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 shadow-xl"
            >
              {loadingExpenses ? (
                <span className="animate-pulse tracking-widest text-[9px]">GENERANDO REPORTE...</span>
              ) : (
                <>📊 REPORTE CONTABLE CSV</>
              )}
            </button>

            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-[2.5rem] text-left">
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1 italic">Nota de Auditoría</p>
              <p className="text-zinc-500 text-[10px] leading-relaxed">
                Este reporte incluye todos los registros de tatuajes y gastos operativos del periodo seleccionado.
              </p>
            </div>
        </aside>
      </div>
    </div>
  );
};