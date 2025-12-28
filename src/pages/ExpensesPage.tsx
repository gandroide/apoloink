import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Formulario
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Servicios');

  const fetchExpenses = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    setExpenses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const { error } = await supabase.from('expenses').insert([
      { description, amount: parseFloat(amount), category }
    ]);

    if (!error) {
      setDescription(''); setAmount('');
      fetchExpenses();
    }
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-md mx-auto space-y-8 pb-24 px-4 animate-in fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">Egresos</h2>
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Gastos Operativos</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">Total Gastado</p>
          <p className="text-xl font-mono font-black text-white">{formatterCOP.format(totalExpenses)}</p>
        </div>
      </header>

      {/* Formulario de Gasto */}
      <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] shadow-2xl">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <input 
            className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm outline-none focus:border-zinc-500 text-white"
            placeholder="¿En qué se gastó? (Ej: Renta Enero)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="number"
              className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-mono text-white"
              placeholder="Monto $"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <select 
              className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm text-zinc-400 outline-none appearance-none font-bold uppercase tracking-tighter"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Servicios">Servicios</option>
              <option value="Renta">Renta</option>
              <option value="Marketing">Marketing</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          <button className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-[0_10px_20px_rgba(220,38,38,0.1)]">
            REGISTRAR GASTO
          </button>
        </form>
      </section>

      {/* Historial de Gastos */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] ml-2">Historial Reciente</h3>
        {loading ? (
            <div className="text-center py-10 animate-pulse text-zinc-800 font-black uppercase text-xs">Calculando pérdidas...</div>
        ) : (
          expenses.map((exp) => (
            <div key={exp.id} className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-[2rem] flex justify-between items-center group hover:border-red-900/30 transition-all">
              <div className="space-y-1">
                <h4 className="font-bold text-sm uppercase text-zinc-200 leading-none">{exp.description}</h4>
                <div className="flex gap-2 items-center">
                    <span className="text-[7px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 font-black uppercase">{exp.category}</span>
                    <span className="text-[8px] text-zinc-600 font-mono italic">{exp.date}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-red-400 font-mono">-{formatterCOP.format(exp.amount)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};