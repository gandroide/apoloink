import { useEffect, useState } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';
import { Stats } from '../components/Stats';

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

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  // Lógica Financiera
  const totalGrossSales = works.reduce((sum, w) => sum + (w.total_price || 0), 0);

  const studioGross = works.reduce((sum, w) => {
    const artistCommission = w.artist_profile?.commission_percentage || 50;
    const studioPercentage = (100 - artistCommission) / 100;
    return sum + (w.total_price * studioPercentage);
  }, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = studioGross - totalExpenses;

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <header className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Balance Mensual</h2>
          {(loadingWorks || loadingExpenses) && (
            <div className="h-4 w-4 border-2 border-t-white border-zinc-800 rounded-full animate-spin"></div>
          )}
        </div>
        
        {/* Selectores de Período */}
        <div className="flex gap-2">
          <select 
            className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-2xl text-xs font-bold uppercase text-zinc-300 outline-none"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select 
            className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl text-xs font-bold uppercase text-zinc-300 outline-none"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      {/* 1. Card Principal: Ganancia Neta (Utilidad Real) */}
      <section className={`p-8 rounded-[2.5rem] shadow-2xl transition-all duration-500 ${
        netProfit >= 0 ? 'bg-white text-black' : 'bg-red-600 text-white'
      }`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">
          Utilidad Real {MONTHS[selectedMonth]}
        </p>
        <h3 className="text-4xl font-black tabular-nums tracking-tighter">
          {formatterCOP.format(netProfit)}
        </h3>
      </section>

      {/* 2. Resumen de Flujo de Caja */}
      <div className="space-y-3">
        {/* Ventas Brutas: Total Facturado en el local */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-[2rem] flex justify-between items-center">
          <div>
            <p className="text-zinc-500 text-[9px] uppercase font-black tracking-widest mb-1">Ventas Brutas Totales</p>
            <p className="text-xl font-bold font-mono text-zinc-300">{formatterCOP.format(totalGrossSales)}</p>
          </div>
          <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center text-lg">💰</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Bruto Estudio: El margen que el local retiene */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
            <p className="text-emerald-500/60 text-[9px] uppercase font-black mb-1">Bruto Estudio</p>
            <p className="text-sm font-bold font-mono text-emerald-500">
              {formatterCOP.format(studioGross)}
            </p>
          </div>

          {/* Gastos: Renta, Servicios, Insumos */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
            <p className="text-red-500/60 text-[9px] uppercase font-black mb-1">Gastos Operativos</p>
            <p className="text-sm font-bold font-mono text-red-400">
              {formatterCOP.format(totalExpenses)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Rendimiento Individual (Stats de Artistas) */}
      <section className="space-y-2 pt-2">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1 text-left">Producción por Equipo</p>
        <Stats works={works} />
      </section>

      <footer className="text-center py-6">
        <p className="text-[9px] text-zinc-800 uppercase tracking-[0.4em] font-black italic">Apolo Ink • Lisbon Studio</p>
      </footer>
    </div>
  );
};