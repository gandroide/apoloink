import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';
import { QRCodeSVG } from 'qrcode.react';

interface InventoryItem {
  id: string;
  name: string;
  total_stock: number;
  cost_per_unit: number; 
}

export const InventoryPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<{show: boolean, id: string, name: string} | null>(null);
  const [selectedQR, setSelectedQR] = useState<{id: string, name: string} | null>(null);
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

  useEffect(() => {
    fetchInventory();
  
    const channel = supabase
      .channel('cambios-inventario')
      .on(
        'postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'inventory' }, 
        (payload) => {
          const updatedRecord = payload.new as InventoryItem;
          setItems((currentItems) => 
            currentItems.map((item: InventoryItem) => 
              item.id === updatedRecord.id 
                ? { ...item, total_stock: updatedRecord.total_stock } 
                : item
            )
          );
        }
      )
      .subscribe();
  
    return () => { supabase.removeChannel(channel); };
  }, []);

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
    if (quantity === 0) return 'bg-brand-danger shadow-[0_0_15px_var(--brand-danger)] animate-pulse';
    if (quantity <= 5) return 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.5)]';
    return 'bg-brand-accent shadow-[0_0_10px_var(--brand-accent)]';
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen animate-in fade-in duration-700 pb-24 px-4 md:px-10 text-left bg-brand-bg text-brand-primary">
      
      {/* MODAL ELIMINAR */}
      {showDeleteModal?.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-bg/95 backdrop-blur-md">
          <div className="bg-brand-surface border border-brand-border p-8 rounded-[3rem] w-full max-w-xs text-center space-y-6">
            <div className="w-20 h-20 bg-brand-danger/10 text-brand-danger rounded-full flex items-center justify-center mx-auto text-3xl">⚠️</div>
            <h3 className="text-brand-primary font-black uppercase italic text-xl tracking-tighter">¿Eliminar {showDeleteModal.name}?</h3>
            <div className="flex flex-col gap-2 pt-2">
              <button onClick={confirmDelete} className="w-full bg-brand-danger text-brand-primary py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">ELIMINAR</button>
              <button onClick={() => setShowDeleteModal(null)} className="w-full bg-brand-bg border border-brand-border text-brand-muted py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QR */}
      {selectedQR && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-brand-bg/95 backdrop-blur-xl" onClick={() => setSelectedQR(null)}>
          <div className="bg-brand-surface border border-brand-border p-10 rounded-[4rem] max-w-sm w-full text-center space-y-8 animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black italic text-brand-primary uppercase tracking-tighter">{selectedQR.name}</h3>
            <div className="bg-white p-6 rounded-[3rem] inline-block shadow-2xl">
              <QRCodeSVG value={`axis-ops-inventory:${selectedQR.id}`} size={200} level={"H"} />
            </div>
            <div className="space-y-3">
              <button onClick={() => window.print()} className="w-full bg-brand-primary text-brand-bg py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Imprimir Etiqueta</button>
              <button onClick={() => setSelectedQR(null)} className="w-full bg-brand-bg border border-brand-border text-brand-muted py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-brand-border py-10 mb-10">
        <div>
          <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-brand-primary leading-[0.8]">
            Stock
          </h2>
          <p className="text-[10px] md:text-xs font-bold text-brand-muted uppercase tracking-[0.4em] mt-4 ml-1">AXIS.ops Supply Management</p>
        </div>
        
        <button 
          onClick={() => navigate('/scan')}
          className="bg-brand-primary text-brand-bg px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:opacity-90 transition-all active:scale-95 shadow-xl flex items-center gap-3"
        >
          <span>📷</span> ESCANEAR SALIDA
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        <section className="lg:col-span-8 order-2 lg:order-1 space-y-8">
          <div className="relative">
            <input 
              className="w-full bg-brand-surface border-2 border-brand-border p-6 pl-14 rounded-[2rem] text-sm outline-none focus:border-brand-accent transition-all text-brand-primary placeholder:text-brand-muted/30 font-bold"
              placeholder="FILTRAR MATERIAL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted font-black italic text-xl">/</div>
          </div>

          {loading ? (
            <div className="text-center py-20 animate-pulse text-brand-muted font-black uppercase text-xs tracking-[0.5em]">Actualizando AXIS.ops...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-brand-surface/40 border border-brand-border p-8 rounded-[3rem] flex flex-col gap-6 group hover:bg-brand-surface transition-all relative">
                  
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-4 items-center">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${getStatusColor(item.total_stock)}`} />
                        <button 
                          onClick={() => setShowDeleteModal({show: true, id: item.id, name: item.name})}
                          className="w-10 h-10 bg-brand-danger/10 border border-brand-danger/20 text-brand-danger rounded-full flex items-center justify-center hover:bg-brand-danger hover:text-brand-primary transition-all shadow-lg active:scale-90"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                        <button 
                          onClick={() => setSelectedQR({id: item.id, name: item.name})}
                          className="w-10 h-10 bg-brand-bg border border-brand-border text-brand-primary rounded-full flex items-center justify-center hover:bg-brand-primary hover:text-brand-bg transition-all shadow-lg active:scale-90"
                        >
                          <span className="text-[10px] font-black">QR</span>
                        </button>
                      </div>

                      <div onClick={() => startEdit(item)} className="cursor-pointer">
                        <h4 className="font-black text-xl uppercase text-brand-primary tracking-tighter leading-none mb-2">
                            {item.name}
                        </h4>
                        <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest italic">
                          Coste: {formatterCOP.format(item.cost_per_unit)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-4xl font-black font-mono leading-none tracking-tighter ${
                        item.total_stock <= 5 ? (item.total_stock === 0 ? 'text-brand-danger' : 'text-yellow-500') : 'text-brand-primary'
                      }`}>
                        {item.total_stock}
                      </p>
                      <p className="text-[8px] text-brand-muted uppercase font-black tracking-widest mt-1">Unidades</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => quickAdjust(item.id, item.total_stock, -1)}
                      className="flex-1 bg-brand-bg border border-brand-border text-brand-muted py-4 rounded-2xl font-black text-[10px] hover:text-brand-primary hover:border-brand-primary active:scale-95 transition-all uppercase tracking-widest"
                    >
                      -1 Unidad
                    </button>
                    <button 
                      onClick={() => quickAdjust(item.id, item.total_stock, 1)}
                      className="flex-1 bg-brand-bg border border-brand-border text-brand-muted py-4 rounded-2xl font-black text-[10px] hover:text-brand-primary hover:border-brand-primary active:scale-95 transition-all uppercase tracking-widest"
                    >
                      +1 Unidad
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="lg:col-span-4 order-1 lg:order-2">
          <div className="lg:sticky lg:top-28 space-y-6">
            <section className="bg-brand-surface border border-brand-border p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="text-left mb-8">
                <h3 className="text-[11px] font-black text-brand-muted uppercase tracking-[0.3em] mb-2 ml-1 italic">
                  {editingId ? 'Modificar Registro' : 'Nuevo Ingreso'}
                </h3>
                <p className="text-2xl font-black italic text-brand-primary uppercase tracking-tighter">Material Operativo</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-brand-muted uppercase ml-2 tracking-widest">Descripción</label>
                  <input 
                    className="w-full bg-brand-bg border border-brand-border p-5 rounded-2xl text-sm outline-none focus:border-brand-accent text-brand-primary font-bold placeholder:text-brand-muted/20"
                    placeholder="Ej: Agujas RL 1003"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-brand-muted uppercase ml-2 tracking-widest">Cantidad</label>
                    <input 
                      type="number"
                      className="w-full bg-brand-bg border border-brand-border p-5 rounded-2xl text-sm font-mono text-brand-primary outline-none focus:border-brand-accent"
                      placeholder="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-brand-muted uppercase ml-2 tracking-widest">Costo Caja</label>
                    <input 
                      type="number"
                      className="w-full bg-brand-bg border border-brand-border p-5 rounded-2xl text-sm font-mono text-brand-primary outline-none focus:border-brand-accent"
                      placeholder="0.00"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button className="flex-1 bg-brand-primary text-brand-bg py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all shadow-xl hover:opacity-90">
                    {editingId ? 'Guardar Cambios' : 'Registrar Stock'}
                  </button>
                  {editingId && (
                    <button 
                      type="button"
                      onClick={() => { setEditingId(null); setName(''); setStock(''); setCost(''); }}
                      className="bg-brand-bg border border-brand-border text-brand-muted px-6 rounded-[2rem] font-black hover:text-brand-primary transition-colors"
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