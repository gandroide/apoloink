import { useEffect, useState } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';
import { Stats } from '../components/Stats';
import { generateAccountingReport } from '../lib/reports';

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

  const totalGrossSales = works.reduce((sum, w) => sum + (w.total_price || 0), 0);
  const studioGross = works.reduce((sum, w) => {
    const artistCommission = w.artist_profile?.commission_percentage || 50;
    const studioPercentage = (100 - artistCommission) / 100;
    return sum + (w.total_price * studioPercentage);
  }, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = studioGross - totalExpenses;

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* HEADER DINÁMICO */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 pb-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none">
            Apolo<span className="text-zinc-700">.</span>Control
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mt-2">Gestión de Estudio Lisbon</p>
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

      {/* GRID DE CONTROL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: MÉTRICAS Y ARTISTAS (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Card Ventas Brutas (Diseño estirado profesional) */}
          <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[3rem] flex flex-col md:flex-row md:items-center justify-between group hover:bg-zinc-900/50 transition-all">
            <div>
              <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.3em] mb-2">Ventas Brutas Totales</p>
              <p className="text-4xl md:text-5xl font-black font-mono text-white tracking-tighter">
                {formatterCOP.format(totalGrossSales)}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4">
               <div className="h-12 w-24 bg-zinc-800/50 rounded-full flex items-center justify-center border border-zinc-700/50">
                  <span className="text-xs font-black text-zinc-500">CASHFLOW</span>
               </div>
               <span className="text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">💰</span>
            </div>
          </div>

          {/* Listado de Artistas con mayor comodidad visual */}
          <section className="bg-zinc-900/10 border border-zinc-800/30 p-8 rounded-[3rem]">
            <div className="flex justify-between items-center mb-6">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Rendimiento Individual</p>
              <div className="h-px flex-1 bg-zinc-800 mx-4 opacity-30"></div>
            </div>
            <Stats works={works} />
          </section>
        </div>

        {/* COLUMNA DERECHA: FINANZAS Y REPORTES (4/12) */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          
          {/* Main Profit Card */}
          <section className={`p-10 rounded-[3rem] shadow-2xl transition-all duration-500 flex flex-col justify-between min-h-[220px] ${
            netProfit >= 0 ? 'bg-white text-black' : 'bg-red-600 text-white shadow-red-900/20'
          }`}>
            <div className="flex justify-between items-start">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">Utilidad Real</p>
              <span className="text-xs font-black px-3 py-1 bg-black/5 rounded-full uppercase tracking-tighter">{MONTHS[selectedMonth]}</span>
            </div>
            <h3 className="text-5xl font-black tabular-nums tracking-tighter leading-none my-4">
              {formatterCOP.format(netProfit)}
            </h3>
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 italic">Balance neto después de gastos</p>
          </section>

          {/* Mini Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] hover:border-emerald-900/50 transition-colors">
              <p className="text-emerald-500/60 text-[9px] uppercase font-black mb-1">Bruto Estudio</p>
              <p className="text-xl font-black font-mono text-emerald-500">
                {formatterCOP.format(studioGross)}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] hover:border-red-900/50 transition-colors">
              <p className="text-red-500/60 text-[9px] uppercase font-black mb-1">Gastos Mes</p>
              <p className="text-xl font-black font-mono text-red-400">
                {formatterCOP.format(totalExpenses)}
              </p>
            </div>
          </div>

          {/* Botón Reporte Profesional */}
          <button 
            onClick={() => generateAccountingReport(works, expenses, MONTHS[selectedMonth], selectedYear)}
            className="w-full bg-white/5 hover:bg-white hover:text-black border border-white/10 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
          >
            📊 Reporte Contador CSV
          </button>
        </aside>
      </div>

      <footer className="pt-12 border-t border-zinc-900 text-center">
        <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.8em] italic">Apolo Ink • Lisbon Studio • Management System 2.0</p>
      </footer>
    </div>
  );
};