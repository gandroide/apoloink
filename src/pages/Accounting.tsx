import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccounting } from '../hooks/useAccounting';
import { supabase } from '../lib/supabase'; // Importante para cargar gastos
import { formatterCOP } from '../lib/formatterCOP';
import { generateAccountingReport } from '../lib/reports';

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const Accounting = () => {
  const navigate = useNavigate();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  const { fetchWorks, works, loading: loadingWorks } = useAccounting();
  const [expenses, setExpenses] = useState<any[]>([]); // Estado para los gastos
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  const loadData = async () => {
    setLoadingExpenses(true);
    // 1. Cargar trabajos
    await fetchWorks(selectedMonth, selectedYear);

    // 2. Cargar gastos para el reporte del contador
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

  const totalStudioGross = works.reduce((sum, w) => {
    const artistCommission = w.artist_profile?.commission_percentage || 50;
    const studioPercentage = (100 - artistCommission) / 100;
    return sum + (w.total_price * studioPercentage);
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <header className="space-y-4">
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter text-left">Liquidación Artistas</h2>
        
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

      {/* Resumen y Botón Contador */}
      <section className="space-y-3">
        <div className="bg-white p-6 rounded-[2rem] text-black shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Bruto Estudio</p>
          <h3 className="text-3xl font-black tabular-nums">{formatterCOP.format(totalStudioGross)}</h3>
        </div>

        {/* BOTÓN PARA EL CONTADOR */}
        <button 
          onClick={() => generateAccountingReport(works, expenses, MONTHS[selectedMonth], selectedYear)}
          disabled={loadingWorks || loadingExpenses}
          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          {loadingExpenses ? 'Cargando Datos...' : '📊 Reporte para Contador (.CSV)'}
        </button>
      </section>

      {/* HISTORIAL DE INGRESOS */}
      <section className="space-y-3">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Ingresos del mes</p>
        <div className="space-y-2">
          {works.map((work) => (
            <button
              key={work.id}
              onClick={() => navigate(`/edit-work/${work.id}`)}
              className="w-full bg-zinc-900/50 border border-zinc-900 p-4 rounded-2xl flex justify-between items-center hover:border-zinc-700 transition-all"
            >
              <div className="text-left">
                <p className="text-white font-black uppercase italic text-xs tracking-tighter">
                  {work.artist_profile?.name || 'Artista'}
                </p>
                <p className="text-[9px] text-zinc-500 font-bold uppercase">
                  {new Date(work.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-zinc-200 font-mono">
                  {formatterCOP.format(work.total_price)}
                </p>
                <p className="text-[8px] text-zinc-600 font-bold uppercase">Editar</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};