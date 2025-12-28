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
  const [isSaving, setIsSaving] = useState(false);

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
    if (!description || !amount || isSaving) return;

    setIsSaving(true);
    const { error } = await supabase.from('expenses').insert([
      { description, amount: parseFloat(amount), category }
    ]);

    if (!error) {
      setDescription(''); 
      setAmount('');
      fetchExpenses();
    }
    setIsSaving(false);
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen animate-in fade-in duration-700 pb-24 px-4 md:px-10">
      
      {/* HEADER PROFESIONAL CON TOTAL */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 py-10 mb-10 text-left">
        <div>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
            Gastos
          </h2>
          <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mt-4 ml-1"> Control de Egresos y Costos Operativos </p>
        </div>
        
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center gap-6 min-w-[280px]">
          <div className="h-10 w-10 bg-red-900/20 rounded-full flex items-center justify-center border border-red-900/30">
            <span className="text-red-500 text-xl font-black">↓</span>
          </div>
          <div>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Salida Acumulada</p>
            <p className="text-3xl font-black text-white font-mono tracking-tighter">
              {formatterCOP.format(totalExpenses)}
            </p>
          </div>
        </div>
      </header>

      {/* GRID DE TRABAJO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* COLUMNA IZQUIERDA: HISTORIAL (8/12) */}
        <section className="lg:col-span-8 space-y-6 order-2 lg:order-1">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic">Historial de Transacciones</h3>
            <div className="h-px flex-1 bg-zinc-800 opacity-30"></div>
          </div>

          {loading ? (
            <div className="py-20 text-center animate-pulse text-zinc-700 text-xs font-black uppercase tracking-[0.3em]">
              Sincronizando flujos de caja...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {expenses.map((exp) => (
                <div 
                  key={exp.id} 
                  className="bg-zinc-900/30 border border-zinc-900 p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start md:items-center group hover:bg-zinc-900/60 hover:border-red-900/20 transition-all duration-300 gap-4"
                >
                  <div className="flex items-center gap-5 text-left">
                    <div className="h-12 w-12 bg-zinc-800/50 rounded-full flex items-center justify-center font-black text-zinc-600 group-hover:text-red-500 transition-colors uppercase text-xs border border-zinc-800">
                      {exp.category.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-black text-base uppercase text-zinc-200 tracking-tight leading-none mb-2 group-hover:text-white">
                        {exp.description}
                      </h4>
                      <div className="flex gap-3 items-center">
                        <span className="text-[8px] bg-zinc-800/80 px-3 py-1 rounded-full text-zinc-500 font-black uppercase tracking-widest border border-zinc-700/50">
                          {exp.category}
                        </span>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase italic tracking-tighter">
                          {new Date(exp.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-auto text-left md:text-right border-t md:border-t-0 border-zinc-800/50 pt-3 md:pt-0">
                    <p className="text-xl font-black text-red-500 font-mono tracking-tighter">
                      -{formatterCOP.format(exp.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* COLUMNA DERECHA: FORMULARIO (4/12) */}
        <aside className="lg:col-span-4 order-1 lg:order-2">
          <div className="lg:sticky lg:top-28">
            <section className="bg-zinc-900/50 p-8 rounded-[3rem] border border-zinc-800 shadow-2xl space-y-8">
              <div className="text-left">
                <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-1">Caja Chica / Local</h3>
                <p className="text-xl font-black italic text-white uppercase tracking-tighter">Registrar Salida</p>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-4 text-left">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Descripción del Gasto</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm focus:border-red-900 outline-none transition-all text-white placeholder:text-zinc-800 font-bold"
                    placeholder="Ej: Pago de Luz Diciembre"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Monto (COP)</label>
                    <input 
                      type="number"
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-mono text-white focus:border-red-900 outline-none"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Categoría</label>
                    <select 
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-[10px] font-black uppercase text-zinc-400 outline-none cursor-pointer appearance-none"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Servicios">Servicios</option>
                      <option value="Renta">Renta</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                      <option value="Insumos">Insumos</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                </div>

                <button 
                  disabled={isSaving}
                  className="w-full bg-red-600 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-[0_15px_30px_rgba(220,38,38,0.2)] hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 mt-4"
                >
                  {isSaving ? 'REGISTRANDO...' : 'CONFIRMAR GASTO'}
                </button>
              </form>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
};