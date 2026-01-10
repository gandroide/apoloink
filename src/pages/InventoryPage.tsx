import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Package, Droplets, Search, ChevronDown, ChevronUp, 
  Layers, Plus, Minus, Calendar, Trash2, X, DollarSign 
} from 'lucide-react';

// --- TIPOS ---
type UnitType = 'box' | 'unit' | 'mix';

interface InventoryItem {
  id: string;
  name: string;
  total_stock: number;
  cost_per_unit: number; 
  unit_type: UnitType;
  units_per_box: number;
  studio_id: string;
  brand?: string;
  color_hex?: string;
  size?: string;
  expiration_date?: string;
}

export const InventoryPage = () => {
  const navigate = useNavigate();
  
  // --- ESTADOS DE DATOS ---
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [studioId, setStudioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS DE UI ---
  const [activeTab, setActiveTab] = useState<'all' | 'consumables' | 'inks'>('all');
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // SELECCIÓN DE TINTA (Para el Modal Nuevo)
  const [selectedInk, setSelectedInk] = useState<InventoryItem | null>(null);
  
  // Modales
  const [showDeleteModal, setShowDeleteModal] = useState<{show: boolean, id: string, name: string} | null>(null);
  const [selectedQR, setSelectedQR] = useState<{id: string, name: string} | null>(null);

  // --- FORMULARIO ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [stockInput, setStockInput] = useState(''); 
  const [cost, setCost] = useState('');
  const [unitType, setUnitType] = useState<UnitType>('unit');
  const [unitsPerBox, setUnitsPerBox] = useState('1'); 
  const [isSaving, setIsSaving] = useState(false);
  
  // NUEVO: Estado para registrar gasto automático
  const [registerAsExpense, setRegisterAsExpense] = useState(false);

  // --- FORMULARIO: TINTAS ---
  const [inkBrand, setInkBrand] = useState('');
  const [inkColor, setInkColor] = useState('#000000');
  const [inkSize, setInkSize] = useState('1oz');
  const [inkExpiration, setInkExpiration] = useState('');

  // 1. CARGA INICIAL
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      const { data: memberData } = await supabase
        .from('studio_members')
        .select('studio_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberData) {
        setStudioId(memberData.studio_id);
        await fetchInventory(memberData.studio_id);
      }
      setLoading(false);
    };
    initData();
  }, [navigate]);

  const fetchInventory = async (activeStudioId: string) => {
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .eq('studio_id', activeStudioId)
      .order('name', { ascending: true });
    setItems(data || []);
  };

  // 2. LÓGICA FILTRADO
  const isInkItem = (item: InventoryItem) => {
    const n = item.name.toLowerCase();
    return (
      !!item.brand || 
      !!item.color_hex || 
      n.includes('tinta') || 
      n.includes('ink') || 
      n.includes('dynamic') || 
      n.includes('eternal') ||
      n.includes('solid ink')
    );
  };

  const filteredItems = useMemo(() => {
    let result = items;
    if (activeTab === 'inks') {
      result = result.filter(item => isInkItem(item));
    } else {
      result = result.filter(item => !isInkItem(item));
    }
    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return result;
  }, [items, searchTerm, activeTab]);

  const groupedInks = useMemo(() => {
    if (activeTab !== 'inks') return {};
    const groups: Record<string, InventoryItem[]> = {};
    filteredItems.forEach(item => {
      const brand = item.brand || 'Otras Marcas';
      if (!groups[brand]) groups[brand] = [];
      groups[brand].push(item);
    });
    return groups;
  }, [filteredItems, activeTab]);

  const isEditingWithStock = useMemo(() => {
    if (!editingId) return false;
    const item = items.find(i => i.id === editingId);
    return (item?.total_stock || 0) > 0;
  }, [editingId, items]);

  // 3. ACCIONES (GUARDAR, BORRAR, EDITAR)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || isSaving || !studioId) return;
    setIsSaving(true);

    const isInk = activeTab === 'inks';
    const inputQty = parseFloat(stockInput || '0');
    const inputCost = parseFloat(cost) || 0;
    
    const totalStock = isInk ? inputQty : Math.round(inputQty * (unitType === 'unit' ? 1 : parseInt(unitsPerBox)));

    const payload: any = { 
      name, 
      total_stock: totalStock, 
      cost_per_unit: inputCost,
      studio_id: studioId,
      unit_type: isInk ? 'unit' : unitType,
      units_per_box: isInk ? 1 : parseInt(unitsPerBox),
      brand: isInk ? inkBrand : null,
      color_hex: isInk ? inkColor : null,
      size: isInk ? inkSize : null,
      expiration_date: (isInk && inkExpiration) ? inkExpiration : null
    };

    const { error } = editingId 
      ? await supabase.from('inventory').update(payload).eq('id', editingId)
      : await supabase.from('inventory').insert([payload]);

    // --- REGISTRO DE GASTO AUTOMÁTICO (CORREGIDO) ---
    if (!error && registerAsExpense && inputCost > 0 && inputQty > 0) {
        const totalExpense = inputQty * inputCost;
        
        // Construimos una descripción detallada para el reporte
        let expenseDescription = '';
        if (isInk) {
            // Ej: "Tinta Eternal - Lipstick Red (1 u)"
            expenseDescription = `Tinta ${inkBrand} - ${name} (${inputQty} u)`;
        } else {
            // Ej: "Guantes Nitrilo (2 cajas)"
            expenseDescription = `Insumo: ${name} (${inputQty} ${unitType === 'box' ? 'cajas' : 'u'})`;
        }
        
        await supabase.from('expenses').insert({
            description: expenseDescription, // <--- Aquí va el texto claro
            amount: totalExpense,
            category: 'Insumos',
            date: new Date().toISOString(),
            studio_id: studioId
        });
    }

    if (!error) {
      resetForm();
      await fetchInventory(studioId);
    } else {
      alert("Error: " + error.message);
    }
    setIsSaving(false);
  };

  const resetForm = () => {
    setName(''); setStockInput(''); setCost(''); setEditingId(null);
    setUnitType('unit'); setUnitsPerBox('1');
    setInkBrand(''); setInkColor('#000000'); setInkSize('1oz'); setInkExpiration('');
    setRegisterAsExpense(false); 
    setSelectedInk(null);
  };

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setName(item.name);
    setCost(item.cost_per_unit > 0 ? item.cost_per_unit.toString() : '');
    
    if (activeTab === 'inks') {
        setStockInput(item.total_stock.toString());
        setInkBrand(item.brand || '');
        setInkColor(item.color_hex || '#000000');
        setInkSize(item.size || '1oz');
        setInkExpiration(item.expiration_date || '');
        setSelectedInk(null);
    } else {
        const factor = item.units_per_box || 1;
        const displayQty = item.unit_type === 'unit' ? item.total_stock : (item.total_stock / factor);
        setStockInput(displayQty.toString());
        setUnitType(item.unit_type);
        setUnitsPerBox(item.units_per_box.toString());
    }
    setRegisterAsExpense(false); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    if (!showDeleteModal || !studioId) return;
    const { error } = await supabase.from('inventory').delete().eq('id', showDeleteModal.id);
    if (!error) {
      setItems(items.filter(i => i.id !== showDeleteModal.id));
      setShowDeleteModal(null);
      setSelectedInk(null);
    }
  };

  const quickAdjust = async (item: InventoryItem, delta: number) => {
    let realDelta = delta;
    if (activeTab !== 'inks' && item.unit_type !== 'unit') {
        realDelta = delta * (item.units_per_box || 1);
    }
    const newStock = Math.max(0, item.total_stock + realDelta);
    
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, total_stock: newStock } : i));
    if (selectedInk && selectedInk.id === item.id) {
        setSelectedInk({ ...selectedInk, total_stock: newStock });
    }

    if (studioId) await supabase.from('inventory').update({ total_stock: newStock }).eq('id', item.id);
  };

  // --- HELPERS VISUALES ---
  const formatStockDisplay = (item: InventoryItem) => {
    if (item.unit_type === 'unit') return (
      <div className="flex flex-col items-end">
        <span>{item.total_stock}</span>
        <span className="text-sm text-[var(--brand-muted)] font-black mt-1">Unidades</span>
      </div>
    );
    const factor = item.units_per_box || 1;
    const boxes = item.total_stock / factor;
    const boxesFormatted = Number.isInteger(boxes) ? boxes : boxes.toFixed(1);
    return (
      <div className="flex flex-col items-end">
        <span>{boxesFormatted}</span>
        <span className="text-sm text-[var(--brand-muted)] font-black mt-1">{item.unit_type === 'mix' ? 'Kits' : 'Cajas'}</span>
      </div>
    );
  };

  const getStatusColor = (quantity: number) => {
    if (quantity === 0) return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse';
    if (quantity <= 5) return 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.5)]';
    return 'bg-[var(--brand-accent)] shadow-[0_0_10px_var(--brand-accent)]';
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen animate-in fade-in duration-700 pb-24 px-4 md:px-10 text-left text-[var(--brand-primary)]">
      
      {/* MODAL 1: BORRAR */}
      {showDeleteModal?.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
          <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-8 rounded-[3rem] w-full max-w-xs text-center space-y-6">
            <div className="w-20 h-20 bg-red-900/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl">⚠️</div>
            <h3 className="text-[var(--brand-primary)] font-black uppercase italic text-xl tracking-tighter">¿Borrar {showDeleteModal.name}?</h3>
            <div className="flex flex-col gap-2 pt-2">
              <button onClick={confirmDelete} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500">CONFIRMAR</button>
              <button onClick={() => setShowDeleteModal(null)} className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[var(--brand-muted)] py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-white">CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: QR */}
      {selectedQR && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedQR(null)}>
          <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-10 rounded-[4rem] max-w-sm w-full text-center space-y-8 animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black italic text-[var(--brand-primary)] uppercase tracking-tighter">{selectedQR.name}</h3>
            <div className="bg-white p-6 rounded-[3rem] inline-block shadow-2xl">
              <QRCodeSVG value={`axis-ops-inventory:${selectedQR.id}`} size={200} level={"H"} />
            </div>
            <div className="space-y-3">
              <button onClick={() => window.print()} className="w-full bg-[var(--brand-primary)] text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Imprimir</button>
              <button onClick={() => setSelectedQR(null)} className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[var(--brand-muted)] py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DETALLE TINTA */}
      {selectedInk && (
        <div 
            className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedInk(null)}
        >
            <div 
                className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-8 rounded-[3rem] w-full max-w-sm text-center relative shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={() => setSelectedInk(null)} className="absolute top-6 right-6 text-[var(--brand-muted)] hover:text-[var(--brand-primary)]"><X size={24} /></button>
                
                <div className="flex justify-center mb-6">
                    <div 
                        className="w-24 h-24 rounded-full border-4 shadow-xl" 
                        style={{ backgroundColor: selectedInk.color_hex || '#000', borderColor: 'var(--brand-border)' }} 
                    />
                </div>

                <div className="space-y-1 mb-8">
                    <h3 className="text-2xl font-black italic text-[var(--brand-primary)] uppercase tracking-tighter">{selectedInk.name}</h3>
                    <p className="text-sm font-bold text-[var(--brand-muted)] uppercase tracking-widest">{selectedInk.brand} • {selectedInk.size}</p>
                    {selectedInk.expiration_date && <p className="text-xs text-red-400 font-bold mt-2 bg-red-900/10 inline-block px-3 py-1 rounded-full">Exp: {selectedInk.expiration_date}</p>}
                </div>

                <div className="flex items-center justify-center gap-4 mb-8">
                    <button onClick={() => quickAdjust(selectedInk, -1)} className="w-16 h-16 rounded-2xl bg-[var(--brand-bg)] border border-[var(--brand-border)] flex items-center justify-center text-2xl font-black text-[var(--brand-muted)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] active:scale-95 transition-all"><Minus size={24} /></button>
                    <div className="text-center w-20">
                        <span className="text-4xl font-black font-mono text-[var(--brand-primary)] block">{selectedInk.total_stock}</span>
                        <span className="text-[9px] uppercase font-bold text-[var(--brand-muted)] tracking-widest">Botellas</span>
                    </div>
                    <button onClick={() => quickAdjust(selectedInk, 1)} className="w-16 h-16 rounded-2xl bg-[var(--brand-bg)] border border-[var(--brand-border)] flex items-center justify-center text-2xl font-black text-[var(--brand-accent)] hover:bg-[var(--brand-accent)] hover:text-black active:scale-95 transition-all"><Plus size={24} /></button>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => startEdit(selectedInk)} className="flex-1 py-4 bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-all">Editar</button>
                    <button onClick={() => { setSelectedInk(null); setShowDeleteModal({show: true, id: selectedInk.id, name: selectedInk.name}); }} className="w-14 bg-red-900/10 border border-red-900/20 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20} /></button>
                </div>
            </div>
        </div>
      )}

      {/* HEADER PAGE */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--brand-border)] py-10 mb-10">
        <div>
          <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-[var(--brand-primary)] leading-[0.8]">Stock<span className="text-[var(--brand-accent)]">.</span></h2>
          <p className="text-[10px] md:text-xs font-bold text-[var(--brand-muted)] uppercase tracking-[0.4em] mt-4 ml-1">AXIS.ops Supply Management</p>
        </div>
        <button onClick={() => navigate('/scan')} className="bg-[var(--brand-primary)] text-[var(--brand-bg)] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:opacity-90 transition-all active:scale-95 shadow-xl flex items-center gap-3"><span>📷</span> ESCANEAR SALIDA</button>
      </header>

      {/* TABS */}
      <div className="flex gap-4 overflow-x-auto pb-6 mb-4 scrollbar-hide">
        {['all', 'consumables', 'inks'].map((tab) => (
            <button 
                key={tab}
                onClick={() => { setActiveTab(tab as any); resetForm(); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[var(--brand-accent)] text-[var(--brand-bg)]' : 'bg-[var(--brand-surface)] border border-[var(--brand-border)] text-[var(--brand-muted)]'}`}
            >
                {tab === 'all' && <Layers size={14} />}
                {tab === 'consumables' && <Package size={14} />}
                {tab === 'inks' && <Droplets size={14} />}
                {tab === 'all' ? 'Todo' : tab === 'consumables' ? 'Consumibles' : 'Tintas'}
            </button>
        ))}
      </div>

      {/* BARRA BÚSQUEDA */}
      <div className="relative mb-8">
        <input 
            className="w-full bg-[var(--brand-surface)] border-2 border-[var(--brand-border)] p-6 pl-14 rounded-[2rem] text-sm outline-none focus:border-[var(--brand-accent)] transition-all text-[var(--brand-primary)] placeholder:text-[var(--brand-muted)]/30 font-bold"
            placeholder="FILTRAR MATERIAL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--brand-muted)]"><Search size={20} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* === LISTA (IZQUIERDA) === */}
        <section className="lg:col-span-8 order-2 lg:order-1 space-y-8">
          {loading ? (
            <div className="text-center py-20 animate-pulse text-[var(--brand-muted)] font-black uppercase text-xs tracking-[0.5em]">Sincronizando...</div>
          ) : (
            <>
                {/* --- VISTA TINTAS --- */}
                {activeTab === 'inks' ? (
                     <div className="space-y-6">
                        {Object.keys(groupedInks).length === 0 ? (
                            <div className="text-center py-20 text-[var(--brand-muted)] border-2 border-dashed border-[var(--brand-border)] rounded-[3rem]">No hay tintas registradas.</div>
                        ) : (
                            Object.entries(groupedInks).map(([brand, brandItems]) => (
                                <div key={brand} className="bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-[2rem] relative shadow-md transition-all">
                                    <button 
                                        onClick={() => setExpandedBrand(expandedBrand === brand ? null : brand)}
                                        className={`w-full flex items-center justify-between p-6 hover:bg-[var(--brand-primary)]/5 transition-colors ${expandedBrand === brand ? 'rounded-t-[2rem]' : 'rounded-[2rem]'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-[var(--brand-bg)] p-3 rounded-xl border border-[var(--brand-border)] text-[var(--brand-accent)]">
                                                <Droplets size={20} />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-black text-xl uppercase tracking-tight text-[var(--brand-primary)]">{brand}</h3>
                                                <span className="text-[10px] bg-[var(--brand-bg)] border border-[var(--brand-border)] px-2 py-1 rounded text-[var(--brand-muted)] font-bold">{brandItems.length} Colores</span>
                                            </div>
                                        </div>
                                        {expandedBrand === brand ? <ChevronUp size={20} className="text-[var(--brand-muted)]"/> : <ChevronDown size={20} className="text-[var(--brand-muted)]"/>}
                                    </button>

                                    {expandedBrand === brand && (
                                        <div className="p-6 pt-4 bg-[var(--brand-bg)] border-t border-[var(--brand-border)] rounded-b-[2rem] grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-y-8 gap-x-4">
                                            {brandItems.map((ink) => (
                                                <div key={ink.id} className="flex flex-col items-center gap-2 group relative">
                                                    <button 
                                                        onClick={() => setSelectedInk(ink)} 
                                                        className={`w-14 h-14 rounded-full border-2 shadow-lg transition-transform active:scale-95 relative ${ink.total_stock === 0 ? 'opacity-40 grayscale' : 'hover:scale-110'}`}
                                                        style={{ 
                                                            backgroundColor: ink.color_hex || '#000', 
                                                            borderColor: 'var(--brand-border)' 
                                                        }}
                                                    >
                                                        {ink.total_stock === 0 && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-0.5 bg-red-500 rotate-45 transform"></div></div>}
                                                    </button>
                                                    <span className="text-[9px] font-bold text-center leading-tight truncate w-full px-1 text-[var(--brand-muted)] group-hover:text-[var(--brand-primary)] transition-colors">
                                                        {ink.name}
                                                    </span>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => { resetForm(); setInkBrand(brand); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                className="w-14 h-14 rounded-full border-2 border-dashed border-[var(--brand-border)] flex items-center justify-center text-[var(--brand-muted)] hover:text-[var(--brand-accent)] hover:border-[var(--brand-accent)] transition-colors opacity-50 hover:opacity-100"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                     </div>
                ) : (
                    /* --- VISTA NORMAL (GENERAL) --- */
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
                                            <Trash2 size={14} />
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
                                    onClick={() => quickAdjust(item, -1)}
                                    className="flex-1 bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[var(--brand-muted)] py-4 rounded-2xl font-black text-[10px] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] active:scale-95 transition-all uppercase tracking-widest"
                                >
                                    -1 {item.unit_type === 'unit' ? 'Ud' : item.unit_type === 'box' ? 'Caja' : 'Kit'}
                                </button>
                                <button 
                                    onClick={() => quickAdjust(item, 1)}
                                    className="flex-1 bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[var(--brand-muted)] py-4 rounded-2xl font-black text-[10px] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] active:scale-95 transition-all uppercase tracking-widest"
                                >
                                    +1 {item.unit_type === 'unit' ? 'Ud' : item.unit_type === 'box' ? 'Caja' : 'Kit'}
                                </button>
                            </div>
                        </div>
                    ))}
                    </div>
                )}
            </>
          )}
        </section>

        {/* === FORMULARIO (DERECHA) === */}
        <aside className="lg:col-span-4 order-1 lg:order-2">
          <div className="lg:sticky lg:top-28 space-y-6">
            <section className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-8 rounded-[3rem] shadow-2xl relative">
              <div className="text-left mb-6">
                <h3 className="text-[11px] font-black text-[var(--brand-muted)] uppercase tracking-[0.3em] mb-1 italic">
                  {editingId ? 'Editar Item' : 'Nuevo Ingreso'}
                </h3>
                <p className="text-2xl font-black italic text-[var(--brand-primary)] uppercase tracking-tighter">
                    {activeTab === 'inks' ? 'Nueva Tinta' : 'Material'}
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                
                {activeTab === 'inks' ? (
                    /* FORMULARIO DE TINTAS */
                    <>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[var(--brand-muted)] uppercase ml-2 tracking-widest">Marca</label>
                            <input 
                                className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] p-4 rounded-2xl text-sm font-bold outline-none focus:border-[var(--brand-accent)] text-[var(--brand-primary)]"
                                placeholder="Ej: Dynamic..."
                                list="brands-list"
                                value={inkBrand}
                                onChange={(e) => setInkBrand(e.target.value)}
                                required
                            />
                            <datalist id="brands-list">
                                <option value="Dynamic" /><option value="Eternal Ink" /><option value="Intenze" /><option value="Solid Ink" />
                            </datalist>
                        </div>

                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-9 space-y-2">
                                <label className="text-[9px] font-black text-[var(--brand-muted)] uppercase ml-2 tracking-widest">Color</label>
                                <input 
                                    className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] p-4 rounded-2xl text-sm font-bold outline-none focus:border-[var(--brand-accent)] text-[var(--brand-primary)]"
                                    placeholder="Ej: Triple Black"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-span-3 space-y-2">
                                <label className="text-[9px] font-black text-[var(--brand-muted)] uppercase ml-2 tracking-widest text-center block">Pick</label>
                                <input 
                                    type="color"
                                    className="w-full h-[54px] bg-transparent cursor-pointer rounded-2xl overflow-hidden border border-[var(--brand-border)]"
                                    value={inkColor}
                                    onChange={(e) => setInkColor(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[var(--brand-muted)] uppercase ml-2 tracking-widest">Tamaño</label>
                                <select 
                                    className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] p-4 rounded-2xl text-sm font-bold outline-none focus:border-[var(--brand-accent)] text-[var(--brand-primary)] appearance-none"
                                    value={inkSize}
                                    onChange={(e) => setInkSize(e.target.value)}
                                >
                                    <option value="0.5oz">0.5 oz</option><option value="1oz">1 oz</option><option value="2oz">2 oz</option><option value="4oz">4 oz</option><option value="8oz">8 oz</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[var(--brand-muted)] uppercase ml-2 tracking-widest">Stock</label>
                                <input 
                                    type="number"
                                    className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] p-4 rounded-2xl text-sm font-mono text-[var(--brand-primary)] outline-none focus:border-[var(--brand-accent)]"
                                    placeholder="0"
                                    value={stockInput}
                                    onChange={(e) => setStockInput(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[var(--brand-muted)] uppercase ml-2 tracking-widest">Costo por Botella (Opcional)</label>
                            <input 
                                type="number"
                                className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] p-4 rounded-2xl text-sm font-mono text-[var(--brand-primary)] outline-none focus:border-[var(--brand-accent)]"
                                placeholder="0.00"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[var(--brand-muted)] uppercase ml-2 tracking-widest flex items-center gap-2">
                                <Calendar size={10} /> Vencimiento (Opcional)
                            </label>
                            <input 
                                type="date"
                                className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] p-4 rounded-2xl text-sm font-mono text-[var(--brand-primary)] outline-none focus:border-[var(--brand-accent)]"
                                value={inkExpiration}
                                onChange={(e) => setInkExpiration(e.target.value)}
                            />
                        </div>
                    </>
                ) : (
                    /* FORMULARIO DE CONSUMIBLES (Original) */
                    <>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[var(--brand-muted)] uppercase ml-2 tracking-widest">Descripción</label>
                            <input 
                                className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] p-4 rounded-2xl text-sm outline-none focus:border-[var(--brand-accent)] text-[var(--brand-primary)] font-bold"
                                placeholder="Ej: Agujas RL 1003"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className={`p-1 bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-xl flex gap-1 ${isEditingWithStock ? 'opacity-50 pointer-events-none' : ''}`}>
                            {(['unit', 'box', 'mix'] as UnitType[]).map((type) => (
                                <button key={type} type="button" onClick={() => setUnitType(type)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${unitType === type ? 'bg-[var(--brand-primary)] text-[var(--brand-bg)]' : 'text-[var(--brand-muted)] hover:text-[var(--brand-primary)]'}`}>
                                    {type === 'unit' ? 'Unidad' : type === 'box' ? 'Caja' : 'Mix'}
                                </button>
                            ))}
                        </div>

                        {(unitType === 'box' || unitType === 'mix') && (
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[var(--brand-accent)] uppercase ml-2 tracking-widest">Unidades por {unitType === 'box' ? 'Caja' : 'Kit'}</label>
                                <input 
                                    type="number"
                                    disabled={isEditingWithStock}
                                    className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] p-4 rounded-2xl text-sm font-mono text-[var(--brand-primary)] outline-none focus:border-[var(--brand-accent)]"
                                    placeholder="Ej: 20"
                                    value={unitsPerBox}
                                    onChange={(e) => setUnitsPerBox(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[var(--brand-muted)] uppercase ml-2 tracking-widest">Cantidad</label>
                                <input type="number" className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] p-4 rounded-2xl text-sm font-mono text-[var(--brand-primary)] outline-none focus:border-[var(--brand-accent)]" placeholder="0" value={stockInput} onChange={(e) => setStockInput(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-[var(--brand-muted)] uppercase ml-2 tracking-widest">Costo</label>
                                <input type="number" className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] p-4 rounded-2xl text-sm font-mono text-[var(--brand-primary)] outline-none focus:border-[var(--brand-accent)]" placeholder="0" value={cost} onChange={(e) => setCost(e.target.value)} />
                            </div>
                        </div>
                    </>
                )}

                {/* --- CHECKBOX: REGISTRAR GASTO AUTOMÁTICO --- */}
                <div className="flex items-center gap-3 bg-[var(--brand-bg)] p-3 rounded-2xl border border-[var(--brand-border)]">
                    <input 
                        type="checkbox" 
                        id="autoExpense"
                        checked={registerAsExpense}
                        onChange={(e) => setRegisterAsExpense(e.target.checked)}
                        className="w-5 h-5 rounded border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-accent)] focus:ring-[var(--brand-accent)] cursor-pointer"
                    />
                    <label htmlFor="autoExpense" className="text-[9px] font-bold text-[var(--brand-muted)] uppercase tracking-wide cursor-pointer flex items-center gap-1">
                        <DollarSign size={12} className="text-[var(--brand-accent)]" />
                        Registrar compra como Gasto
                    </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="flex-1 bg-[var(--brand-primary)] text-[var(--brand-bg)] py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all shadow-xl hover:opacity-90">
                    {editingId ? 'Guardar Cambios' : 'Registrar'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={resetForm} className="bg-[var(--brand-bg)] border border-[var(--brand-border)] text-[var(--brand-muted)] px-6 rounded-[2rem] font-black hover:text-[var(--brand-primary)] transition-colors">✕</button>
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