import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';
import { QRCodeSVG } from 'qrcode.react';

// Tipos
type UnitType = 'box' | 'unit' | 'mix';

interface InventoryItem {
  id: string;
  name: string;
  total_stock: number;
  cost_per_unit: number; 
  unit_type: UnitType;
  units_per_box: number;
  studio_id: string;
}

export const InventoryPage = () => {
  const navigate = useNavigate();
  
  // Estados de datos
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [studioId, setStudioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados de UI y Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<{show: boolean, id: string, name: string} | null>(null);
  const [selectedQR, setSelectedQR] = useState<{id: string, name: string} | null>(null);

  // Estados del Formulario
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [stockInput, setStockInput] = useState(''); 
  const [cost, setCost] = useState('');
  const [unitType, setUnitType] = useState<UnitType>('unit');
  const [unitsPerBox, setUnitsPerBox] = useState('1'); 
  const [isSaving, setIsSaving] = useState(false);

  // 1. CARGA INICIAL
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: memberData, error: memberError } = await supabase
        .from('studio_members')
        .select('studio_id')
        .eq('user_id', user.id)
        .single();

      if (memberError || !memberData) {
        console.error("Error: No se encontró membresía.", memberError);
        setLoading(false);
        return;
      }

      const activeStudioId = memberData.studio_id;
      setStudioId(activeStudioId);
      
      await fetchInventory(activeStudioId);
      setLoading(false);
    };

    initData();
  }, [navigate]);

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    if (!studioId) return;

    const channel = supabase
      .channel('cambios-inventario')
      .on(
        'postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'inventory',
          filter: `studio_id=eq.${studioId}`
        }, 
        (payload) => {
          const updatedRecord = payload.new as InventoryItem;
          setItems((currentItems) => 
            currentItems.map((item) => item.id === updatedRecord.id ? { ...item, ...updatedRecord } : item)
          );
        }
      )
      .subscribe();
  
    return () => { supabase.removeChannel(channel); };
  }, [studioId]);

  const fetchInventory = async (activeStudioId: string) => {
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .eq('studio_id', activeStudioId)
      .order('name', { ascending: true });
    setItems(data || []);
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [items, searchTerm]);

  // 2. GUARDADO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !stockInput || isSaving) return;
    
    if (!studioId) {
      alert("Error crítico: No se ha identificado el Estudio. Recarga la página.");
      return;
    }

    setIsSaving(true);

    const inputQty = parseFloat(stockInput);
    const factor = unitType === 'unit' ? 1 : parseInt(unitsPerBox || '1');
    const totalStockUnits = Math.round(inputQty * factor); 

    const payload = { 
      name, 
      total_stock: totalStockUnits, 
      cost_per_unit: parseFloat(cost) || 0,
      unit_type: unitType,
      units_per_box: factor,
      studio_id: studioId
    };

    const { error } = editingId 
      ? await supabase.from('inventory').update(payload).eq('id', editingId).eq('studio_id', studioId)
      : await supabase.from('inventory').insert([payload]);

    if (!error) {
      resetForm();
      if (studioId) await fetchInventory(studioId);
    } else {
      console.error("Error guardando:", error.message);
      alert("Error al guardar: " + error.message);
    }
    setIsSaving(false);
  };

  const resetForm = () => {
    setName(''); 
    setStockInput(''); 
    setCost(''); 
    setEditingId(null);
    setUnitType('unit');
    setUnitsPerBox('1');
  };

  // =================================================================
  // FUNCIÓN INTELIGENTE DE SUMA/RESTA
  // =================================================================
  const quickAdjust = async (item: InventoryItem, isAdding: boolean) => {
    if (!studioId) return;

    // 1. Detectamos cuánto vale "1 movimiento"
    const factor = item.unit_type === 'unit' ? 1 : (item.units_per_box || 1);
    
    // 2. Calculamos delta
    const delta = isAdding ? factor : -factor;
    
    // 3. Calculamos nuevo stock
    const currentStock = item.total_stock;
    const newStock = Math.max(0, currentStock + delta);
    
    if (newStock === currentStock) return;

    // 4. Update visual
    setItems(items.map(i => i.id === item.id ? { ...i, total_stock: newStock } : i));

    // 5. Guardar en BD
    const { error } = await supabase
      .from('inventory')
      .update({ total_stock: newStock })
      .eq('id', item.id)
      .eq('studio_id', studioId);

    if (error) {
      setItems(items.map(i => i.id === item.id ? { ...i, total_stock: currentStock } : i));
      console.error(error);
    }
  };

  const confirmDelete = async () => {
    if (!showDeleteModal || !studioId) return;
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', showDeleteModal.id)
      .eq('studio_id', studioId);
      
    if (!error) {
      setItems(items.filter(i => i.id !== showDeleteModal.id));
      setShowDeleteModal(null);
    }
  };

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setName(item.name);
    
    const factor = item.units_per_box || 1;
    const displayQty = item.unit_type === 'unit' ? item.total_stock : (item.total_stock / factor);
    
    setStockInput(displayQty.toString());
    setCost(item.cost_per_unit.toString());
    setUnitType(item.unit_type || 'unit');
    setUnitsPerBox((item.units_per_box || 1).toString());
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (quantity: number) => {
    if (quantity === 0) return 'bg-[var(--brand-danger)] shadow-[0_0_15px_var(--brand-danger)] animate-pulse';
    if (quantity <= 5) return 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.5)]';
    return 'bg-[var(--brand-accent)] shadow-[0_0_10px_var(--brand-accent)]';
  };

  const formatStockDisplay = (item: InventoryItem) => {
    if (item.unit_type === 'unit') return `${item.total_stock} Unidades`;
    
    const factor = item.units_per_box || 1;
    const boxes = item.total_stock / factor;
    const boxesFormatted = Number.isInteger(boxes) ? boxes : boxes.toFixed(1);

    return (
      <div className="flex flex-col items-end">
        <span>{boxesFormatted} {item.unit_type === 'mix' ? 'Kits' : 'Cajas'}</span>
        <span className="text-sm text-[var(--brand-muted)] font-black mt-1">Total: {item.total_stock} unds</span>
      </div>
    );
  };

  // ------------------------------------------------------------------
  // LÓGICA DE BLOQUEO DE EDICIÓN (SOLUCIÓN "EDGE CASE")
  // ------------------------------------------------------------------
  // Si estamos editando y el producto tiene stock > 0, bloqueamos la config de caja.
  const isEditingWithStock = editingId !== null && items.find(i => i.id === editingId)?.total_stock! > 0;

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen animate-in fade-in duration-700 pb-24 px-4 md:px-10 text-left text-[var(--brand-primary)]">
      
      {/* MODALES */}
      {showDeleteModal?.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
          <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-8 rounded-[3rem] w-full max-w-xs text-center space-y-6">
            <div className="w-20 h-20 bg-red-900/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl">⚠️</div>
            <h3 className="text-[var(--brand-primary)] font-black uppercase italic text-xl tracking-tighter">¿Eliminar {showDeleteModal.name}?</h3>
            <div className="flex flex-col gap-2 pt-2">
              <button onClick={confirmDelete} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500">ELIMINAR</button>
              <button onClick={() => setShowDeleteModal(null)} className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[var(--brand-muted)] py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-white">CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {selectedQR && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedQR(null)}>
          <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-10 rounded-[4rem] max-w-sm w-full text-center space-y-8 animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black italic text-[var(--brand-primary)] uppercase tracking-tighter">{selectedQR.name}</h3>
            <div className="bg-white p-6 rounded-[3rem] inline-block shadow-2xl">
              <QRCodeSVG value={`axis-ops-inventory:${selectedQR.id}`} size={200} level={"H"} />
            </div>
            <div className="space-y-3">
              <button onClick={() => window.print()} className="w-full bg-[var(--brand-primary)] text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Imprimir Etiqueta</button>
              <button onClick={() => setSelectedQR(null)} className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[var(--brand-muted)] py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--brand-border)] py-10 mb-10">
        <div>
          <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-[var(--brand-primary)] leading-[0.8]">
            Stock<span className="text-[var(--brand-accent)]">.</span>
          </h2>
          <p className="text-[10px] md:text-xs font-bold text-[var(--brand-muted)] uppercase tracking-[0.4em] mt-4 ml-1">AXIS.ops Supply Management</p>
        </div>
        
        <button 
          onClick={() => navigate('/scan')}
          className="bg-[var(--brand-primary)] text-black px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:opacity-90 transition-all active:scale-95 shadow-xl flex items-center gap-3"
        >
          <span>📷</span> ESCANEAR SALIDA
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LISTA (IZQUIERDA) */}
        <section className="lg:col-span-8 order-2 lg:order-1 space-y-8">
          <div className="relative">
            <input 
              className="w-full bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] p-6 pl-14 rounded-[2rem] text-sm outline-none focus:border-[var(--brand-accent)] transition-all text-[var(--brand-primary)] placeholder:text-[var(--brand-muted)]/30 font-bold"
              placeholder="FILTRAR MATERIAL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--brand-muted)] font-black italic text-xl">/</div>
          </div>

          {loading ? (
            <div className="text-center py-20 animate-pulse text-[var(--brand-muted)] font-black uppercase text-xs tracking-[0.5em]">
              {studioId ? 'Sincronizando Inventario...' : 'Buscando Estudio...'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-[var(--brand-surface)]/40 border border-[var(--brand-border)] p-8 rounded-[3rem] flex flex-col gap-6 group hover:bg-[var(--brand-surface)] transition-all relative">
                  
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-4 items-center">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${getStatusColor(item.total_stock)}`} />
                        <button 
                          onClick={() => setShowDeleteModal({show: true, id: item.id, name: item.name})}
                          className="w-10 h-10 bg-red-900/10 border border-red-900/20 text-red-500 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-90"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                        <button 
                          onClick={() => setSelectedQR({id: item.id, name: item.name})}
                          className="w-10 h-10 bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[var(--brand-primary)] rounded-full flex items-center justify-center hover:bg-[var(--brand-primary)] hover:text-black transition-all shadow-lg active:scale-90"
                        >
                          <span className="text-[10px] font-black">QR</span>
                        </button>
                      </div>

                      <div onClick={() => startEdit(item)} className="cursor-pointer">
                        <h4 className="font-black text-xl uppercase text-[var(--brand-primary)] tracking-tighter leading-none mb-2 break-all">
                            {item.name}
                        </h4>
                        <div className="flex flex-col items-start gap-1">
                          <p className="text-[9px] text-[var(--brand-muted)] font-black uppercase tracking-widest italic">
                            {formatterCOP.format(item.cost_per_unit)}
                          </p>
                          <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${
                            item.unit_type === 'box' ? 'bg-[var(--brand-accent)]/20 text-[var(--brand-accent)]' : 
                            item.unit_type === 'mix' ? 'bg-purple-500/20 text-purple-400' : 'bg-[var(--brand-border)] text-[var(--brand-muted)]'
                          }`}>
                            {item.unit_type === 'mix' ? '📦 Mix Kit' : item.unit_type === 'box' ? '📦 Caja' : '⚡ Unidad'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <div className={`text-3xl md:text-4xl font-black font-mono leading-none tracking-tighter ${
                        item.total_stock <= 5 ? (item.total_stock === 0 ? 'text-red-500' : 'text-yellow-500') : 'text-[var(--brand-primary)]'
                      }`}>
                        {formatStockDisplay(item)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => quickAdjust(item, false)}
                      className="flex-1 bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[var(--brand-muted)] py-4 rounded-2xl font-black text-[10px] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] active:scale-95 transition-all uppercase tracking-widest"
                    >
                      -1 {item.unit_type === 'unit' ? 'Ud' : item.unit_type === 'box' ? 'Caja' : 'Kit'}
                    </button>
                    <button 
                      onClick={() => quickAdjust(item, true)}
                      className="flex-1 bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[var(--brand-muted)] py-4 rounded-2xl font-black text-[10px] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] active:scale-95 transition-all uppercase tracking-widest"
                    >
                      +1 {item.unit_type === 'unit' ? 'Ud' : item.unit_type === 'box' ? 'Caja' : 'Kit'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FORMULARIO (DERECHA) */}
        <aside className="lg:col-span-4 order-1 lg:order-2">
          <div className="lg:sticky lg:top-28 space-y-6">
            <section className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="text-left mb-8">
                <h3 className="text-[11px] font-black text-[var(--brand-muted)] uppercase tracking-[0.3em] mb-2 ml-1 italic">
                  {editingId ? 'Modificar Registro' : 'Nuevo Ingreso'}
                </h3>
                <p className="text-2xl font-black italic text-[var(--brand-primary)] uppercase tracking-tighter">Material Operativo</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                
                {/* Selector de Tipo (BLOQUEADO SI HAY STOCK) */}
                <div className={`p-1 bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-xl flex gap-1 ${isEditingWithStock ? 'opacity-50 pointer-events-none' : ''}`}>
                  {(['unit', 'box', 'mix'] as UnitType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUnitType(type)}
                      className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                        unitType === type 
                          ? 'bg-[var(--brand-primary)] text-black shadow-sm' 
                          : 'text-[var(--brand-muted)] hover:text-[var(--brand-primary)]'
                      }`}
                    >
                      {type === 'unit' ? 'Unidad' : type === 'box' ? 'Caja' : 'Mix'}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[var(--brand-muted)] uppercase ml-2 tracking-widest">Descripción</label>
                  <input 
                    className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] p-5 rounded-2xl text-sm outline-none focus:border-[var(--brand-accent)] text-[var(--brand-primary)] font-bold placeholder:text-[var(--brand-muted)]/20"
                    placeholder="Ej: Agujas RL 1003"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Unidades por Caja (PROTEGIDO) */}
                {(unitType === 'box' || unitType === 'mix') && (
                  <div className="space-y-2 relative">
                    <label className="text-[9px] font-black text-[var(--brand-accent)] uppercase ml-2 tracking-widest flex items-center justify-between">
                      Unidades por {unitType === 'box' ? 'Caja' : 'Kit'}
                      {/* AVISO VISUAL DE BLOQUEO */}
                      {isEditingWithStock && <span className="text-red-500 text-[8px] bg-red-900/20 px-2 rounded">BLOQUEADO</span>}
                    </label>
                    <input 
                      type="number"
                      disabled={isEditingWithStock} // <--- BLOQUEO REAL
                      className={`w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] p-5 rounded-2xl text-sm font-mono text-[var(--brand-primary)] outline-none focus:border-[var(--brand-accent)] ${isEditingWithStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Ej: 20"
                      value={unitsPerBox || ''}
                      onChange={(e) => setUnitsPerBox(e.target.value)}
                    />
                    {isEditingWithStock && (
                      <p className="text-[8px] text-[var(--brand-muted)] mt-1 ml-2">
                        * Para cambiar el tamaño de caja, primero debes dejar el stock en 0.
                      </p>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[var(--brand-muted)] uppercase ml-2 tracking-widest">
                      Cantidad ({unitType === 'unit' ? 'Uds' : unitType === 'box' ? 'Cajas' : 'Kits'})
                    </label>
                    <input 
                      type="number"
                      step="any"
                      className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] p-5 rounded-2xl text-sm font-mono text-[var(--brand-primary)] outline-none focus:border-[var(--brand-accent)]"
                      placeholder="0"
                      value={stockInput}
                      onChange={(e) => setStockInput(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[var(--brand-muted)] uppercase ml-2 tracking-widest">Costo {unitType === 'unit' ? 'Ud' : 'Caja'}</label>
                    <input 
                      type="number"
                      className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] p-5 rounded-2xl text-sm font-mono text-[var(--brand-primary)] outline-none focus:border-[var(--brand-accent)]"
                      placeholder="0.00"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button className="flex-1 bg-[var(--brand-primary)] text-black py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all shadow-xl hover:opacity-90">
                    {editingId ? 'Guardar Cambios' : 'Registrar Stock'}
                  </button>
                  {editingId && (
                    <button 
                      type="button"
                      onClick={resetForm}
                      className="bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[var(--brand-muted)] px-6 rounded-[2rem] font-black hover:text-[var(--brand-primary)] transition-colors"
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