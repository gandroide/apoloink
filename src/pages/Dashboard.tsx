import { useEffect, useState } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';
import { Stats } from '../components/Stats'; // Importamos Stats de nuevo

export const Dashboard = () => {
  const { fetchWorks, works, loading: loadingWorks } = useAccounting();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

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
  }, [fetchWorks]);

  const now = new Date();
  const currentMonthWorks = works.filter(w => {
    const d = new Date(w.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Cálculos
  const totalIncome = currentMonthWorks.reduce((sum, w) => sum + w.total_price, 0);
  const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const studioGross = currentMonthWorks.reduce((sum, w) => {
    const commission = (w.artist_profile?.commission_percentage || 50) / 100;
    return sum + (w.total_price * (1 - commission));
  }, 0);

  const netProfit = studioGross - totalExpenses;

  if (loadingWorks || loadingExpenses) return <div className="p-20 text-center text-zinc-500">Sincronizando...</div>;

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <header>
        <h2 className="text-2xl font-black italic">DASHBOARD</h2>
        <p className="text-zinc-500 text-xs uppercase">{now.toLocaleString('es-CO', { month: 'long' })}</p>
      </header>

      {/* 1. UTILIDAD REAL (Lo que queda después de pagar artistas Y gastos) */}
      <section className="bg-white p-6 rounded-3xl text-black">
        <p className="text-[10px] font-bold uppercase opacity-60">Balance Neto Real</p>
        <h3 className="text-4xl font-black tabular-nums">
          {formatterCOP.format(netProfit)}
        </h3>
      </section>

      {/* 2. STATS (Desglose de Ingresos y Comisiones) */}
      <section className="space-y-2">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Desglose de Producción</p>
        <Stats works={currentMonthWorks} />
      </section>

      {/* 3. GASTOS TOTALES */}
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
        <p className="text-zinc-500 text-xs font-bold uppercase">Gastos del Mes</p>
        <p className="text-red-400 font-mono font-bold">{formatterCOP.format(totalExpenses)}</p>
      </div>
    </div>
  );
};