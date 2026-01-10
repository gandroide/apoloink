import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const CATEGORIES = ['Servicios', 'Renta', 'Marketing', 'Mantenimiento', 'Insumos', 'Otros'];

export const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el formulario
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Servicios');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para el Custom Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      setExpenses(data || []);
    } catch (err) {
      console.error("Error cargando gastos en AXIS.ops:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setExpenseDate(expense.date.split('T')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDescription('');
    setAmount('');
    setCategory('Servicios');
    setExpenseDate(new Date().toISOString().split('T')[0]);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || isSaving) return;

    setIsSaving(true);
    try {
      const expenseData = {
        description,
        amount: parseFloat(amount),
        category,
        date: `${expenseDate}T12:00:00Z`
      };

      let error;

      if (editingId) {
        const { error: updateError } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('expenses')
          .insert([expenseData]);
        error = insertError;
      }

      if (error) throw error;

      cancelEdit();
      await fetchExpenses();
    } catch (err) {
      console.error("Error al guardar gasto:", err);
      alert("Error guardando el gasto. Revisa la consola.");
    } finally {
      setIsSaving(false);
    }
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen animate-in fade-in duration-700 pb-24 px-4 md:px-10 text-left">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 py-10 mb-10">
        <div>
          <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.8]">
            Gastos<span className="text-red-600">.</span>
          </h2>
          <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mt-4 ml-1">
            AXIS.ops • Control de Egresos
          </p>
        </div>
        
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center gap-6 min-w-[280px] shadow-2xl">
          <div className="h-12 w-12 bg-red-900/10 rounded-full flex items-center justify-center border border-red-900/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <span className="text-red-500 text-xl font-black italic">↓</span>
          </div>
          <div>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Salida Acumulada</p>
            <p className="text-3xl font-black text-white font-mono tracking-tighter">
              {formatterCOP.format(totalExpenses)}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LISTA DE GASTOS */}
        <section className="lg:col-span-8 space-y-6 order-2 lg:order-1">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic">Flujo de Caja Negativo</h3>
            <div className="h-px flex-1 bg-zinc-800 opacity-30"></div>
          </div>

          {loading ? (
            <div className="py-20 text-center animate-pulse text-zinc-800 text-xs font-black uppercase tracking-[0.5em]">
              Sincronizando AXIS.ops...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {expenses.length === 0 ? (
                <div className="py-20 border-2 border-dashed border-zinc-900 rounded-[3rem] text-center">
                   <p className="text-zinc-700 font-black uppercase text-[10px] tracking-widest">Sin egresos registrados</p>
                </div>
              ) : (
                expenses.map((exp) => (
                  <div 
                    key={exp.id} 
                    className={`bg-zinc-900/30 border border-zinc-900 p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start md:items-center group hover:bg-zinc-900/60 transition-all duration-300 gap-4 ${editingId === exp.id ? 'border-red-500/50 bg-red-900/10' : ''}`}
                  >
                    <div className="flex items-center gap-5 w-full md:w-auto">
                      <button 
                        onClick={() => startEdit(exp)}
                        className="h-12 w-12 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center font-black text-zinc-600 hover:text-white hover:bg-zinc-800 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg"
                        title="Editar Gasto"
                      >
                         ✎
                      </button>

                      <div>
                        <h4 className="font-black text-lg uppercase text-zinc-200 tracking-tight leading-none mb-2 group-hover:text-white transition-colors">
                          {exp.description}
                        </h4>
                        <div className="flex gap-3 items-center flex-wrap">
                          <span className="text-[8px] bg-zinc-800/80 px-3 py-1 rounded-full text-zinc-500 font-black uppercase tracking-widest border border-zinc-700/50">
                            {exp.category}
                          </span>
                          <span className="text-[9px] text-zinc-600 font-bold uppercase italic tracking-tighter">
                            {new Date(exp.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between w-full md:w-auto pl-16 md:pl-0">
                      <p className="text-2xl font-black text-red-500 font-mono tracking-tighter">
                        -{formatterCOP.format(exp.amount)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* FORMULARIO */}
        <aside className="lg:col-span-4 order-1 lg:order-2">
          <div className="lg:sticky lg:top-28">
            {/* CORRECCIÓN: Eliminado 'overflow-hidden' para permitir que el dropdown sobresalga */}
            <section className={`bg-zinc-900 border ${editingId ? 'border-red-500/50' : 'border-zinc-800'} p-8 rounded-[3.5rem] shadow-2xl space-y-8 relative transition-colors duration-500`}>
              
              <div className="text-left relative flex justify-between items-start">
                <div>
                  <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-1">AXIS.ops Ops</h3>
                  <p className="text-2xl font-black italic text-white uppercase tracking-tighter">
                    {editingId ? 'Modificar Gasto' : 'Registrar Salida'}
                  </p>
                </div>
                {editingId && (
                  <button 
                    onClick={cancelEdit}
                    className="bg-zinc-800 text-zinc-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 hover:text-white transition-all"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-4 text-left relative">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Descripción</label>
                  <input 
                    className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-sm focus:border-red-900/50 outline-none transition-all text-white font-bold"
                    placeholder="Ej: Insumos de limpieza"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Monto COP</label>
                    <input 
                      type="number"
                      className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-sm font-mono text-white outline-none"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase ml-2 tracking-widest italic">Fecha del Pago</label>
                    <input 
                      type="date"
                      className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-sm text-white font-bold outline-none cursor-pointer font-mono"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* --- CUSTOM DROPDOWN (Con Z-Index alto) --- */}
                <div className="space-y-2 relative z-50" ref={dropdownRef}>
                  <label className="text-[9px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Categoría</label>
                  
                  {/* Botón Trigger */}
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full bg-black border ${isDropdownOpen ? 'border-white' : 'border-zinc-800'} p-5 rounded-2xl text-[10px] font-black uppercase text-white outline-none cursor-pointer flex justify-between items-center transition-all hover:border-zinc-600`}
                  >
                    <span>{category}</span>
                    {/* Flecha animada */}
                    <svg 
                        className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Lista Desplegable */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
                      {CATEGORIES.map((cat) => (
                        <div 
                          key={cat}
                          onClick={() => {
                            setCategory(cat);
                            setIsDropdownOpen(false);
                          }}
                          className={`p-4 hover:bg-zinc-900 cursor-pointer transition-colors text-[10px] uppercase font-black tracking-wider border-b border-zinc-900 last:border-0 ${category === cat ? 'text-white bg-zinc-900' : 'text-zinc-400'}`}
                        >
                          {cat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  disabled={isSaving}
                  // CORRECCIÓN: Z-Index bajo para que no tape al dropdown
                  className={`w-full py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50 mt-4 relative z-0 ${
                    editingId 
                      ? 'bg-red-600 text-white hover:bg-red-500' 
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {isSaving ? 'Guardando...' : editingId ? 'Actualizar Registro' : 'Confirmar Gasto'}
                </button>
              </form>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
};