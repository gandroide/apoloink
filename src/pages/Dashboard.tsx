import { useEffect, useState } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';
import { Stats } from '../components/Stats';

export const Dashboard = () => {
  const { fetchWorks, works, loading: loadingWorks } = useAccounting();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  // 1. Cargar trabajos y gastos al montar el componente
  useEffect(() => {
    const loadDashboardData = async () => {
      await fetchWorks();
      const { data } = await supabase
        .from('store_expenses')
        .select('*')
        .order('created_at', { ascending: false });
      
      setExpenses(data || []);
      setLoadingExpenses(false);
    };

    loadDashboardData();
  }, []);

  // 2. Lógica de filtrado por Mes Actual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthWorks = works.filter(w => {
    const d = new Date(w.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // 3. Cálculos Financieros
  const totalIncome = currentMonthWorks.reduce((sum, w) => sum + w.total_price, 0);
  const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Calculamos la utilidad del estudio (Ingreso Bruto - Pago a Artistas - Gastos)
  // Asumiendo que el estudio se queda con el 50% después de pagar al artista
  const studioGross = currentMonthWorks.reduce((sum, w) => {
    const commission = (w.artist_profile?.commission_percentage || 50) / 100;
    return sum + (w.total_price * (1 - commission));
  }, 0);

  const netProfit = studioGross - totalExpenses;

  if (loadingWorks || loadingExpenses) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-8 h-8 border-4 border-t-white border-zinc-800 rounded-full animate-spin"></div>
        <p className="text-zinc-500 text-xs uppercase tracking-widest">Calculando progreso...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Resumen del Mes */}
      <header>
        <h2 className="text-2xl font-black italic text-white">DASHBOARD</h2>
        <p className="text-zinc-500 text-xs uppercase tracking-tighter">
          Progreso de {now.toLocaleString('es-CO', { month: 'long' })} {currentYear}
        </p>
      </header>

      {/* Card de Utilidad Neta (La más importante) */}
      <section className="bg-white p-6 rounded-3xl text-black shadow-xl shadow-white/5">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">Utilidad Real (Estudio)</p>
        <h3 className="text-4xl font-black tabular-nums">
          {formatterCOP.format(netProfit)}
        </h3>
        <div className="mt-4 flex items-center gap-2">
          <div className={`h-1.5 flex-1 rounded-full bg-zinc-200 overflow-hidden`}>
            <div 
              className={`h-full ${netProfit >= 0 ? 'bg-green-600' : 'bg-red-600'}`} 
              style={{ width: `${Math.min(Math.max((netProfit / (totalIncome || 1)) * 100, 0), 100)}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-bold">{netProfit >= 0 ? 'SALDO POSITIVO' : 'EN RIESGO'}</span>
        </div>
      </section>

      {/* Desglose de Stats */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <p className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Ingresos Brutos</p>
          <p className="text-lg font-bold text-green-400 font-mono">
            {formatterCOP.format(totalIncome)}
          </p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <p className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Gastos Totales</p>
          <p className="text-lg font-bold text-red-400 font-mono">
            {formatterCOP.format(totalExpenses)}
          </p>
        </div>
      </section>

      {/* Visualización de Actividad Mensual */}
      <section className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800">
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Actividad del Mes</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 italic">Tatuajes realizados</span>
            <span className="font-bold">{currentMonthWorks.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 italic">Gastos registrados</span>
            <span className="font-bold">{currentMonthExpenses.length}</span>
          </div>
          <div className="pt-3 border-t border-zinc-800 flex justify-between items-center">
            <span className="text-zinc-400 italic">Promedio por trabajo</span>
            <span className="font-bold">
              {formatterCOP.format(totalIncome / (currentMonthWorks.length || 1))}
            </span>
          </div>
        </div>
      </section>

      {/* Nota de estrategia */}
      <footer className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
        <p className="text-[10px] text-zinc-500 leading-relaxed text-center italic">
          "La estabilidad financiera es la base de la libertad creativa."
        </p>
      </footer>
    </div>
  );
};