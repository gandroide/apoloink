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
  
  // Estados para el formulario
  const [editingId, setEditingId] = useState<string | null>(null); // ID del gasto en edición
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Servicios');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

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

  // Función para cargar los datos en el formulario
  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    // Ajustamos la fecha para que el input type="date" la lea bien (YYYY-MM-DD)
    setExpenseDate(expense.date.split('T')[0]);
    
    // Scroll suave hacia arriba para móviles
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
        date: `${expenseDate}T12:00:00Z` // Hora fija para evitar desfases
      };

      let error;

      if (editingId) {
        // MODO EDICIÓN: Actualizamos el registro existente
        const { error: updateError } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingId);
        error = updateError;
      } else {
        // MODO CREACIÓN: Insertamos uno nuevo
        const { error: insertError } = await supabase
          .from('expenses')
          .insert([expenseData]);
        error = insertError;
      }

      if (error) throw error;

      // Limpiar y recargar
      cancelEdit(); // Resetea formulario y estado de edición
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
      
      {/* HEADER CON TOTALIZADOR */}
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
        
        {/* HISTORIAL */}
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
                      {/* BOTÓN DE EDITAR (Visible al hacer hover en Desktop, siempre visible en móvil si se desea ajustar) */}
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
            <section className={`bg-zinc-900 border ${editingId ? 'border-red-500/50' : 'border-zinc-800'} p-8 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden transition-colors duration-500`}>
              
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

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Categoría</label>
                  <select 
                    className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-[10px] font-black uppercase text-zinc-400 outline-none cursor-pointer appearance-none"
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

                <button 
                  disabled={isSaving}
                  className={`w-full py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50 mt-4 ${
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