// src/pages/Accounting.tsx
import { useState, useEffect } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { WorkForm } from '../components/WorkForm';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';

export const Accounting = () => {
  // Ahora traemos 'artists' y 'works' correctamente desde el hook
  const { fetchWorks, works, artists, loading } = useAccounting();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');

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
    
    await supabase.from('store_expenses').insert([
      { description: expDesc, amount: parseFloat(expAmount) }
    ]);
    
    setExpDesc(''); 
    setExpAmount('');
    fetchExpenses();
  };

  useEffect(() => {
    fetchWorks();
    fetchExpenses();
  }, [fetchWorks]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* SECCIÓN 1: TRABAJOS */}
      <section className="space-y-4">
        <h2 className="text-xl font-black italic tracking-tight">REGISTRAR TATUAJE</h2>
        <WorkForm artists={artists} onSuccess={fetchWorks} />
        
        {/* Usamos 'works' aquí para ver los ingresos recientes */}
        <div className="space-y-2 mt-4">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ingresos Recientes</p>
          {works.slice(0, 3).map(work => (
            <div key={work.id} className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex justify-between items-center">
              <span className="text-sm font-medium">{work.client_name || 'Tatuaje'}</span>
              <span className="text-green-500 font-mono font-bold">{formatterCOP.format(work.total_price)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2: GASTOS */}
      <section className="space-y-4 pt-6 border-t border-zinc-900">
        <h2 className="text-xl font-black italic tracking-tight text-red-500">GASTOS DEL ESTUDIO</h2>
        <form onSubmit={handleAddExpense} className="flex gap-2">
          <input 
            className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-sm focus:border-red-500 outline-none transition-all" 
            placeholder="Ej: Pago de Luz" 
            value={expDesc} 
            onChange={e => setExpDesc(e.target.value)}
          />
          <input 
            className="w-28 bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-sm font-mono focus:border-red-500 outline-none" 
            type="number" 
            placeholder="Monto" 
            value={expAmount} 
            onChange={e => setExpAmount(e.target.value)}
          />
          <button className="bg-red-500 text-white px-4 rounded-xl font-bold hover:bg-red-600 transition-colors">
            +
          </button>
        </form>

        <div className="space-y-2">
          {expenses.length === 0 && <p className="text-center text-zinc-600 text-xs py-4">No hay gastos hoy</p>}
          {expenses.map(exp => (
            <div key={exp.id} className="flex justify-between items-center bg-zinc-900/30 p-3 rounded-xl border border-zinc-900">
              <span className="text-sm text-zinc-400">{exp.description}</span>
              <span className="text-sm font-bold text-zinc-200">{formatterCOP.format(exp.amount)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};