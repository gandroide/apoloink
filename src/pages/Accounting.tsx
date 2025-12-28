import { useState, useEffect } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import { WorkForm } from '../components/WorkForm';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';

export const Accounting = () => {
  const { fetchWorks, works, artists, loading } = useAccounting();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    
    setIsSaving(true);
    await supabase.from('store_expenses').insert([
      { description: expDesc, amount: parseFloat(expAmount) }
    ]);
    
    setExpDesc(''); 
    setExpAmount('');
    await fetchExpenses();
    setIsSaving(false);
  };

  useEffect(() => {
    fetchWorks();
    fetchExpenses();
  }, [fetchWorks]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Cuentas</h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Registros Diarios</p>
        </div>
        {loading && (
          <div className="bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 animate-pulse">
            <span className="text-[10px] font-black text-zinc-500 uppercase">Sincronizando</span>
          </div>
        )}
      </header>

      {/* Formulario de registro de tatuajes */}
      <section className="space-y-4">
        <WorkForm artists={artists} onSuccess={fetchWorks} />
        
        {/* Usamos 'works' para mostrar el historial reciente y evitar errores de build */}
        <div className="space-y-2 mt-4">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-1">Ingresos de Hoy ({works.length})</p>
          {works.slice(0, 3).map(work => (
            <div key={work.id} className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800 flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-300">{work.client_name}</span>
              <span className={`font-mono font-bold text-sm ${work.is_canvas ? 'text-blue-400' : 'text-green-500'}`}>
                {work.is_canvas ? 'LIENZO' : formatterCOP.format(work.total_price)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Formulario de Gastos */}
      <section className="space-y-4 pt-6 border-t border-zinc-900">
        <h3 className="text-xl font-black italic tracking-tight text-red-500 uppercase">Gastos del Local</h3>
        <form onSubmit={handleAddExpense} className="flex gap-2">
          <input 
            className="flex-1 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-sm focus:border-red-500 outline-none transition-all" 
            placeholder="Insumos, Luz, Arriendo..." 
            value={expDesc} 
            onChange={e => setExpDesc(e.target.value)}
          />
          <input 
            className="w-28 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-sm font-mono focus:border-red-500 outline-none" 
            type="number" 
            placeholder="$" 
            value={expAmount} 
            onChange={e => setExpAmount(e.target.value)}
          />
          <button 
            disabled={isSaving}
            className="bg-red-600 text-white px-5 rounded-2xl font-bold hover:bg-red-500 transition-colors disabled:opacity-50"
          >
            {isSaving ? '...' : '+'}
          </button>
        </form>

        <div className="space-y-2">
          {expenses.slice(0, 5).map(exp => (
            <div key={exp.id} className="flex justify-between items-center bg-zinc-900/20 p-3 rounded-xl border border-zinc-900/50">
              <span className="text-sm text-zinc-500">{exp.description}</span>
              <span className="text-sm font-bold text-zinc-400 font-mono">{formatterCOP.format(exp.amount)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};