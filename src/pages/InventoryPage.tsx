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
  
  // Estado para el Modal de Confirmación Estilizado
  const [showDeleteModal, setShowDeleteModal] = useState<{show: boolean, id: string, name: string} | null>(null);

  // Estados para Formulario (Creación/Edición)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [stock, setStock] = useState('');
  const [cost, setCost] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) console.error("Error cargando inventario:", error.message);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchInventory(); }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !stock || isSaving) return;

    setIsSaving(true);
    const payload = { 
      name, 
      total_stock: parseInt(stock), 
      cost_per_unit: parseFloat(cost) || 0 
    };

    const { error } = editingId 
      ? await supabase.from('inventory').update(payload).eq('id', editingId)
      : await supabase.from('inventory').insert([payload]);

    if (!error) {
      setName(''); setStock(''); setCost('');
      setEditingId(null);
      await fetchInventory();
    }
    setIsSaving(false);
  };

  const quickAdjust = async (id: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    const { error } = await supabase
      .from('inventory')
      .update({ total_stock: newStock })
      .eq('id', id);
    
    if (!error) {
      setItems(items.map(item => item.id === id ? { ...item, total_stock: newStock } : item));
    }
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
    <div className="max-w-md mx-auto space-y-6 pb-24 px-4 animate-in fade-in duration-500 text-zinc-200">
      
      {/* MODAL DE CONFIRMACIÓN ESTILIZADO */}
      {showDeleteModal?.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,1)] w-full max-w-xs text-center space-y-6 border-b-4 border-b-red-600/20">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
              ⚠️
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-black uppercase italic text-xl tracking-tighter">¿Borrar de Stock?</h3>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                Vas a eliminar permanentemente <br/>
                <span className="text-red-400">"{showDeleteModal.name}"</span>
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={confirmDelete}
                className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-500 transition-all active:scale-95"
              >
                ELIMINAR AHORA
              </button>
              <button 
                onClick={() => setShowDeleteModal(null)}
                className="w-full bg-zinc-800 text-zinc-400 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-zinc-700 transition-all"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="space-y-1">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Almacén</h2>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-black italic opacity-50">Apolo Ink Sytems</p>
      </header>

      {/* Buscador de Alto Contraste */}
      <div className="relative group">
        <input 
          className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 pl-12 rounded-3xl text-sm outline-none focus:border-zinc-500 transition-all text-white placeholder:text-zinc-800 font-bold"
          placeholder="BUSCAR CAJA..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 font-black italic">/</div>
      </div>

      {/* Formulario de Registro/Edición */}
      <section className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 text-zinc-800/20 font-black text-6xl italic pointer-events-none group-focus-within:text-white/5 transition-colors">BOX</div>
        
        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-5 ml-1 relative">
          {editingId ? 'Editando Insumo' : 'Nuevo Ingreso de Cajas'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <input 
            className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm outline-none focus:border-zinc-600 text-white transition-all"
            placeholder="Descripción del material"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="number"
              className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-mono text-white outline-none focus:border-zinc-600"
              placeholder="Cajas"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
            <input 
              type="number"
              className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-mono text-white outline-none focus:border-zinc-600"
              placeholder="Costo $"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)]">
              {editingId ? 'GUARDAR CAMBIOS' : 'REGISTRAR STOCK'}
            </button>
            {editingId && (
              <button 
                type="button"
                onClick={() => { setEditingId(null); setName(''); setStock(''); setCost(''); }}
                className="bg-zinc-800 text-zinc-400 px-6 rounded-2xl font-black"
              >✕</button>
            )}
          </div>
        </form>
      </section>

      {/* Lista de Insumos */}
      <section className="space-y-4">
        {loading ? (
          <div className="text-center py-10 animate-pulse text-zinc-800 font-black uppercase text-xs tracking-[0.5em]">Actualizando...</div>
        ) : filteredItems.length === 0 ? (
            <p className="text-center text-zinc-800 text-[10px] font-black uppercase py-10 border-2 border-dashed border-zinc-900 rounded-[2.5rem]">No hay coincidencias</p>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-[2.5rem] flex flex-col gap-5 hover:border-zinc-800 transition-all relative overflow-hidden">
              
              <button 
                onClick={() => setShowDeleteModal({show: true, id: item.id, name: item.name})}
                className="absolute top-6 right-2 text-[8px] font-black text-zinc-800 hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Eliminar
              </button>

              <div className="flex justify-between items-start pr-12">
                <div className="flex items-start gap-4">
                  <div className={`mt-2 w-2.5 h-2.5 rounded-full transition-all duration-700 ${getStatusColor(item.total_stock)}`} />
                  <div onClick={() => startEdit(item)} className="cursor-pointer group">
                    <h4 className="font-bold text-base uppercase text-zinc-100 tracking-tight group-hover:text-zinc-400 transition-colors leading-none">
                        {item.name}
                    </h4>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter mt-1">
                      Inversión Caja: {formatterCOP.format(item.cost_per_unit)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-black font-mono leading-none ${item.total_stock <= 5 ? (item.total_stock === 0 ? 'text-red-500' : 'text-yellow-500') : 'text-white'}`}>
                    {item.total_stock}
                  </span>
                  <p className="text-[7px] text-zinc-700 uppercase font-black tracking-widest leading-none mt-1">Cajas</p>
                </div>
              </div>

              {/* Ajuste rápido */}
              <div className="flex gap-2">
                <button 
                  onClick={() => quickAdjust(item.id, item.total_stock, -1)}
                  className="flex-1 bg-zinc-950/50 border border-zinc-800 text-zinc-600 py-3 rounded-xl font-black text-[10px] hover:text-white hover:border-zinc-600 active:scale-95 transition-all uppercase tracking-widest"
                >
                  - 1 Caja
                </button>
                <button 
                  onClick={() => quickAdjust(item.id, item.total_stock, 1)}
                  className="flex-1 bg-zinc-950/50 border border-zinc-800 text-zinc-600 py-3 rounded-xl font-black text-[10px] hover:text-white hover:border-zinc-600 active:scale-95 transition-all uppercase tracking-widest"
                >
                  + 1 Caja
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};