import { useState, useEffect } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { WorkForm } from '../components/WorkForm';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';

export const Accounting = () => {
  // Ahora usamos 'loading' para mejorar la experiencia visual
  const { fetchWorks, works, artists, loading } = useAccounting();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  const fetchExpenses = async () => {
    const { data } = await supabase
      .from('store_expenses')
      .select('*')
      .order('created_at', { ascending: false });
    setExpenses(data || []);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc || !expAmount) return;
    
    setIsSavingExpense(true);
    await supabase.from('store_expenses').insert([
      { description: expDesc, amount: parseFloat(expAmount) }
    ]);
    
    setExpDesc(''); 
    setExpAmount('');
    await fetchExpenses();
    setIsSavingExpense(false);
  };

  useEffect(() => {
    fetchWorks();
    fetchExpenses();
  }, [fetchWorks]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* SECCIÓN 1: TRABAJOS */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-black italic tracking-tight uppercase">Registrar Tatuaje</h2>
          {/* USANDO LA VARIABLE LOADING AQUÍ */}
          {loading && (
            <span className="text-[10px] text-zinc-500 animate-pulse font-bold tracking-widest">
              ACTUALIZANDO...
            </span>
          )}
        </div>
        
        <WorkForm artists={artists} onSuccess={fetchWorks} />
        
        <div className="space-y-2 mt-4">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Ingresos Recientes</p>
          {works.slice(0, 3).map(work => (
            <div key={work.id} className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800 flex justify-between items-center transition-all hover:border-zinc-700">
              <span className="text-sm font-medium text-zinc-300">{work.client_name || 'Tatuaje'}</span>
              <span className="text-green-500 font-mono font-bold text-sm">{formatterCOP.format(work.total_price)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2: GASTOS */}
      <section className="space-y-4 pt-6 border-t border-zinc-900">
        <h2 className="text-xl font-black italic tracking-tight text-red-500 uppercase">Gastos del Estudio</h2>
        <form onSubmit={handleAddExpense} className="flex gap-2">
          <input 
            className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-sm focus:border-red-500 outline-none transition-all placeholder:text-zinc-700" 
            placeholder="Ej: Insumos o Arriendo" 
            value={expDesc} 
            onChange={e => setExpDesc(e.target.value)}
          />
          <input 
            className="w-28 bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-sm font-mono focus:border-red-500 outline-none placeholder:text-zinc-700" 
            type="number" 
            placeholder="Monto" 
            value={expAmount} 
            onChange={e => setExpAmount(e.target.value)}
          />
          <button 
            disabled={isSavingExpense}
            className="bg-red-600 text-white px-5 rounded-xl font-bold hover:bg-red-500 transition-colors disabled:opacity-50"
          >
            {isSavingExpense ? '...' : '+'}
          </button>
        </form>

        <div className="space-y-2">
          {expenses.length === 0 && !loading && (
            <p className="text-center text-zinc-700 text-xs py-8 border border-dashed border-zinc-900 rounded-2xl">
              No hay gastos registrados este mes
            </p>
          )}
          {expenses.map(exp => (
            <div key={exp.id} className="flex justify-between items-center bg-zinc-900/20 p-3 rounded-xl border border-zinc-900/50">
              <span className="text-sm text-zinc-500">{exp.description}</span>
              <span className="text-sm font-bold text-zinc-400 font-mono">{formatterCOP.format(exp.amount)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Visual de Estado */}
      <div className="text-center pt-4">
        <p className="text-[9px] text-zinc-800 uppercase tracking-[0.3em]">Apolo Ink • Sistema de Gestión de Insumos</p>
      </div>
    </div>
  );
};