import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';

interface InventoryItem {
  id: string;
  name: string;
  total_stock: number;
  cost_per_unit: number; 
}

export const InventoryPage = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<{show: boolean, id: string, name: string} | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [stock, setStock] = useState('');
  const [cost, setCost] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase.from('inventory').select('*').order('name', { ascending: true });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchInventory(); }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [items, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !stock || isSaving) return;
    setIsSaving(true);
    const payload = { name, total_stock: parseInt(stock), cost_per_unit: parseFloat(cost) || 0 };
    const { error } = editingId 
      ? await supabase.from('inventory').update(payload).eq('id', editingId)
      : await supabase.from('inventory').insert([payload]);
    if (!error) {
      setName(''); setStock(''); setCost(''); setEditingId(null);
      await fetchInventory();
    }
    setIsSaving(false);
  };

  const quickAdjust = async (id: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    const { error } = await supabase.from('inventory').update({ total_stock: newStock }).eq('id', id);
    if (!error) setItems(items.map(item => item.id === id ? { ...item, total_stock: newStock } : item));
  };

  const confirmDelete = async () => {
    if (!showDeleteModal) return;
    const { error } = await supabase.from('inventory').delete().eq('id', showDeleteModal.id);
    if (!error) {
      setItems(items.filter(i => i.id !== showDeleteModal.id));
      setShowDeleteModal(null);
    }
  };

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setName(item.name);
    setStock(item.total_stock.toString());
    setCost(item.cost_per_unit.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (quantity: number) => {
    if (quantity === 0) return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse';
    if (quantity <= 5) return 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.5)]';
    return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen animate-in fade-in duration-700 pb-24 px-4 md:px-10 text-left">
      
      {/* MODAL ELIMINAR */}
      {showDeleteModal?.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in zoom-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] w-full max-w-xs text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl">⚠️</div>
            <h3 className="text-white font-black uppercase italic text-xl tracking-tighter">¿Eliminar {showDeleteModal.name}?</h3>
            <div className="flex flex-col gap-2 pt-2">
              <button onClick={confirmDelete} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">ELIMINAR PERMANENTE</button>
              <button onClick={() => setShowDeleteModal(null)} className="w-full bg-zinc-800 text-zinc-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 py-10 mb-10">
        <div>
          <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.8]">
            Almacén<span className="text-zinc-700">.</span>Stock
          </h2>
          <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mt-4 ml-1">Apolo Ink Supply Management</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* COLUMNA IZQUIERDA: LISTADO */}
        <section className="lg:col-span-8 order-2 lg:order-1 space-y-8">
          
          <div className="relative">
            <input 
              className="w-full bg-zinc-900/50 border-2 border-zinc-800/50 p-6 pl-14 rounded-[2rem] text-sm outline-none focus:border-zinc-500 transition-all text-white placeholder:text-zinc-800 font-bold"
              placeholder="FILTRAR MATERIAL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 font-black italic text-xl">/</div>
          </div>

          {loading ? (
            <div className="text-center py-20 animate-pulse text-zinc-800 font-black uppercase text-xs tracking-[0.5em]">Actualizando...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-zinc-900/30 border border-zinc-900 p-8 rounded-[3rem] flex flex-col gap-6 group hover:bg-zinc-900/60 transition-all relative">
                  
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      {/* INDICADOR Y BOTÓN BASURA */}
                      <div className="flex flex-col gap-4 items-center">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${getStatusColor(item.total_stock)}`} />
                        <button 
                          onClick={() => setShowDeleteModal({show: true, id: item.id, name: item.name})}
                          className="w-10 h-10 bg-red-900/10 border border-red-900/20 text-red-500 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-90"
                          title="Eliminar ítem"
                        >
                          {/* ICONO SVG BASURA */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"/>
                          </svg>
                        </button>
                      </div>

                      <div onClick={() => startEdit(item)} className="cursor-pointer">
                        <h4 className="font-black text-xl uppercase text-zinc-100 tracking-tighter group-hover:text-white transition-colors leading-none mb-2">
                            {item.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                          Coste: {formatterCOP.format(item.cost_per_unit)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-4xl font-black font-mono leading-none tracking-tighter ${
                        item.total_stock <= 5 ? (item.total_stock === 0 ? 'text-red-500' : 'text-yellow-500') : 'text-white'
                      }`}>
                        {item.total_stock}
                      </p>
                      <p className="text-[8px] text-zinc-700 uppercase font-black tracking-widest mt-1">Cajas</p>
                    </div>
                  </div>

                  {/* AJUSTES RÁPIDOS */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => quickAdjust(item.id, item.total_stock, -1)}
                      className="flex-1 bg-zinc-950/80 border border-zinc-800 text-zinc-500 py-4 rounded-2xl font-black text-[10px] hover:text-white hover:border-zinc-500 active:scale-95 transition-all uppercase tracking-widest"
                    >
                      -1 Caja
                    </button>
                    <button 
                      onClick={() => quickAdjust(item.id, item.total_stock, 1)}
                      className="flex-1 bg-zinc-950/80 border border-zinc-800 text-zinc-500 py-4 rounded-2xl font-black text-[10px] hover:text-white hover:border-zinc-500 active:scale-95 transition-all uppercase tracking-widest"
                    >
                      +1 Caja
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* COLUMNA DERECHA: FORMULARIO */}
        <aside className="lg:col-span-4 order-1 lg:order-2">
          <div className="lg:sticky lg:top-28 space-y-6">
            <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="text-left mb-8">
                <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2 ml-1">
                  {editingId ? 'Modificar Registro' : 'Nuevo Ingreso'}
                </h3>
                <p className="text-2xl font-black italic text-white uppercase tracking-tighter">Entrada de Material</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Descripción</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl text-sm outline-none focus:border-zinc-500 text-white font-bold"
                    placeholder="Ej: Agujas RL 1003"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Cantidad</label>
                    <input 
                      type="number"
                      className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl text-sm font-mono text-white outline-none"
                      placeholder="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Costo Caja</label>
                    <input 
                      type="number"
                      className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl text-sm font-mono text-white outline-none"
                      placeholder="0.00"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button className="flex-1 bg-white text-black py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all shadow-xl">
                    {editingId ? 'Guardar Cambios' : 'Registrar Stock'}
                  </button>
                  {editingId && (
                    <button 
                      type="button"
                      onClick={() => { setEditingId(null); setName(''); setStock(''); setCost(''); }}
                      className="bg-zinc-800 text-zinc-400 px-6 rounded-[2rem] font-black"
                    >✕</button>
                  )}
                </div>
              </form>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
};