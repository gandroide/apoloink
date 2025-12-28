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
    // 1. Cargar trabajos del mes seleccionado vía Hook
    await fetchWorks(selectedMonth, selectedYear);

    // 2. Cargar gastos del mes seleccionado
    const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
    const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59).toISOString();
    
    const { data } = await supabase
      .from('store_expenses')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);
    
    setExpenses(data || []);
    setLoadingExpenses(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  // Cálculos precisos
  const totalIncome = works.reduce((sum, w) => sum + w.total_price, 0);
  const studioGross = works.reduce((sum, w) => {
    const artistCommission = w.artist_profile?.commission_percentage || 50;
    const studioPercentage = (100 - artistCommission) / 100;
    return sum + (w.total_price * studioPercentage);
  }, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
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
            className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-2xl text-xs font-bold uppercase text-zinc-300 outline-none focus:border-zinc-600"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select 
            className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl text-xs font-bold uppercase text-zinc-300 outline-none focus:border-zinc-600"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      {/* Card Principal de Utilidad */}
      <section className={`p-8 rounded-[2.5rem] shadow-2xl transition-all duration-500 ${
        netProfit >= 0 ? 'bg-white text-black' : 'bg-red-600 text-white'
      }`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Utilidad Real {MONTHS[selectedMonth]}</p>
        <h3 className="text-4xl font-black tabular-nums tracking-tighter">
          {formatterCOP.format(netProfit)}
        </h3>
      </section>

      {/* Desglose de Producción */}
      <section className="space-y-2">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Rendimiento de Artistas</p>
        <Stats works={works} />
      </section>

      {/* Comparativa Ventas vs Gastos */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <p className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Ventas Brutas</p>
          <p className="text-sm font-bold font-mono text-zinc-200">{formatterCOP.format(totalIncome)}</p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <p className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Gastos Totales</p>
          <p className="text-sm font-bold font-mono text-red-400">{formatterCOP.format(totalExpenses)}</p>
        </div>
      </section>

      {/* Footer Estratégico */}
      <footer className="text-center py-4">
        <p className="text-[9px] text-zinc-700 uppercase tracking-[0.4em] font-medium">Apolo Ink • Lisbon Studio</p>
      </footer>
    </div>
  );
};