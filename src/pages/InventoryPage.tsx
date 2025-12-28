import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';

interface InventoryItem {
  id: string;
  name: string;
  total_stock: number;
  cost_per_unit: number; // En este contexto, será costo por caja
}

export const InventoryPage = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setName(item.name);
    setStock(item.total_stock.toString());
    setCost(item.cost_per_unit.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (quantity: number) => {
    if (quantity === 0) return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]';
    if (quantity <= 3) return 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.5)]'; // Ajustado a 3 cajas para alerta
    return 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]';
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-500 pb-24 px-2">
      <header className="space-y-1">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">Stock por Cajas</h2>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold">Inventario Apolo Ink</p>
      </header>

      {/* Buscador */}
      <div className="relative group">
        <input 
          className="w-full bg-zinc-900/50 border border-zinc-800 p-4 pl-12 rounded-2xl text-sm outline-none focus:border-zinc-500 transition-all text-zinc-200 placeholder:text-zinc-700"
          placeholder="Buscar caja de..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
          🔍
        </div>
      </div>

      {/* Formulario de Cajas */}
      <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <span className="text-6xl font-black italic">BOX</span>
        </div>
        
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-5 ml-1 relative">
          {editingId ? 'Editar Detalles de Caja' : 'Ingresar Nueva Caja'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <input 
            className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm outline-none focus:border-zinc-600 text-zinc-200"
            placeholder="Descripción (Ej: Agujas 1205RL x50)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-zinc-600 uppercase ml-2 tracking-tighter">Nº de Cajas</label>
              <input 
                type="number"
                className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-mono text-zinc-200"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-zinc-600 uppercase ml-2 tracking-tighter">Costo por Caja</label>
              <input 
                type="number"
                className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-mono text-zinc-200"
                placeholder="$"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] active:scale-95 transition-all shadow-lg">
              {editingId ? 'Actualizar Caja' : 'Guardar en Stock'}
            </button>
            {editingId && (
              <button 
                type="button"
                onClick={() => { setEditingId(null); setName(''); setStock(''); setCost(''); }}
                className="bg-zinc-800 text-zinc-400 px-6 rounded-2xl font-black uppercase text-[10px]"
              >
                ×
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Lista de Cajas */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] ml-2">Cajas Disponibles</h3>
        
        {loading ? (
          <div className="text-center py-10 animate-pulse text-zinc-700 text-xs font-bold uppercase italic tracking-widest">Leyendo almacén...</div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-[2.5rem] flex flex-col gap-5 hover:border-zinc-800 transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${getStatusColor(item.total_stock)}`} />
                  <div onClick={() => startEdit(item)} className="cursor-pointer group">
                    <h4 className="font-bold text-sm uppercase text-zinc-200 tracking-tight group-hover:text-blue-400 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter mt-1">
                      Inversión Caja: {formatterCOP.format(item.cost_per_unit)}
                    </p>
                  </div>
                </div>
                <div className="bg-zinc-950 px-4 py-2 rounded-2xl border border-zinc-800 text-center min-w-[70px]">
                  <span className="text-2xl font-black text-white font-mono leading-none block">{item.total_stock}</span>
                  <span className="text-[7px] text-zinc-600 uppercase font-black tracking-widest">CAJAS</span>
                </div>
              </div>

              {/* Ajuste rápido por caja */}
              <div className="flex gap-2">
                <button 
                  onClick={() => quickAdjust(item.id, item.total_stock, -1)}
                  className="flex-1 bg-zinc-950 border border-zinc-900 text-zinc-500 py-3 rounded-xl font-black hover:text-red-500 hover:border-red-900/30 active:scale-95 transition-all text-xs"
                >
                  - 1 CAJA
                </button>
                <button 
                  onClick={() => quickAdjust(item.id, item.total_stock, 1)}
                  className="flex-1 bg-zinc-950 border border-zinc-900 text-zinc-500 py-3 rounded-xl font-black hover:text-green-500 hover:border-green-900/30 active:scale-95 transition-all text-xs"
                >
                  + 1 CAJA
                </button>
              </div>
            </div>
          ))
        )}
      </section>
      
      <p className="text-center text-[8px] text-zinc-800 font-black uppercase tracking-[0.4em]">Apolo Ink Warehouse Management</p>
    </div>
  );
};