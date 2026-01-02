import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';

// Definimos la interfaz correcta para que no haya errores de tipo
interface InventoryItem {
  id: string;
  name: string;
  total_stock: number;
  cost_per_unit: number;
  unit_type: 'box' | 'unit' | 'mix';
  units_per_box: number;
}

export const Inventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    // CORRECCIÓN 1: Usamos los nombres reales de la BD ('name' en vez de 'item_name')
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .order('name', { ascending: true });
      
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // CORRECCIÓN 2: Cálculo financiero con las columnas nuevas (total_stock * cost_per_unit)
  const totalInventoryValue = items.reduce((acc, curr) => acc + (curr.cost_per_unit * curr.total_stock), 0);
  
  // CORRECCIÓN 3: Alerta de stock crítico
  // (Consideramos crítico si quedan menos de 5 unidades totales)
  const criticalStockCount = items.filter(i => i.total_stock < 5).length;

  // Helper para mostrar la cantidad bonita (Cajas vs Unidades)
  const formatQuantity = (item: InventoryItem) => {
    if (item.unit_type === 'unit') return item.total_stock;
    
    // Si es caja, calculamos cuántas cajas quedan (ej: 1.5 Cajas)
    const factor = item.units_per_box || 1;
    const boxes = item.total_stock / factor;
    return Number.isInteger(boxes) ? boxes : boxes.toFixed(1);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen animate-in fade-in duration-700 pb-24 px-4 md:px-10 text-left">
      
      {/* HEADER PROFESIONAL */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 py-10 mb-10">
        <div>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
            Stock<span className="text-zinc-700">.</span>Insumos
          </h2>
          <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mt-4 ml-1">
            Control de Materiales AXIS ops
          </p>
        </div>
        
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2rem] min-w-[250px]">
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Inversión en Almacén</p>
          <p className="text-2xl font-black text-white font-mono">{formatterCOP.format(totalInventoryValue)}</p>
        </div>
      </header>

      {/* GRID DE INVENTARIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LISTADO (8/12) */}
        <section className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic">Existencias Actuales</h3>
            <div className="h-px flex-1 bg-zinc-800 opacity-30"></div>
          </div>

          {loading ? (
            <div className="py-20 text-center animate-pulse text-zinc-800 font-black uppercase text-xs">Sincronizando estanterías...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(item => (
                <div key={item.id} className="bg-zinc-900/30 border border-zinc-900 p-6 rounded-[2.5rem] flex justify-between items-center group hover:bg-zinc-900/60 transition-all">
                  <div className="flex items-center gap-5">
                    {/* CÍRCULO DE CANTIDAD */}
                    <div className={`h-14 w-14 rounded-full flex flex-col items-center justify-center font-black border ${
                      item.total_stock < 5 ? 'bg-red-900/20 border-red-900/50 text-red-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                    }`}>
                      <span className="text-lg leading-none">{formatQuantity(item)}</span>
                      <span className="text-[7px] uppercase opacity-60">
                        {item.unit_type === 'unit' ? 'Uds' : 'Cajas'}
                      </span>
                    </div>
                    
                    <div>
                      {/* CORRECCIÓN 4: item.name en vez de item_name */}
                      <h4 className="font-black text-base uppercase text-zinc-100 tracking-tighter leading-none mb-1 group-hover:text-white">
                        {item.name}
                      </h4>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                        {item.unit_type === 'mix' ? 'Kit Mixto' : item.unit_type === 'box' ? 'Caja Cerrada' : 'Unidad Individual'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {/* CORRECCIÓN 5: item.cost_per_unit en vez de price */}
                    <p className="text-sm font-black text-zinc-400 font-mono">
                      {formatterCOP.format(item.cost_per_unit)}
                    </p>
                    <p className="text-[8px] text-zinc-700 font-bold uppercase">Costo unitario</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* COLUMNA STATUS (4/12) */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
          <section className={`p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between min-h-[220px] transition-all ${
            criticalStockCount > 0 ? 'bg-orange-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-white'
          }`}>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60 italic mb-4">Alertas de Stock</p>
              <h3 className="text-6xl font-black tabular-nums tracking-tighter leading-none">
                {criticalStockCount}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest mt-2">Productos por agotarse</p>
            </div>
          </section>

          {/* Botón visualmente presente (sin lógica de navegación en este componente simple) */}
          <button className="w-full bg-white text-black py-6 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.3em] hover:bg-zinc-200 transition-all shadow-xl active:scale-95">
            📦 Control de Stock
          </button>
        </aside>
      </div>
    </div>
  );
};