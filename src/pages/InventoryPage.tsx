import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';

export const InventoryPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .order('item_name', { ascending: true });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header>
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Inventario</h2>
        <p className="text-zinc-500 text-xs uppercase tracking-widest">Control de insumos del estudio</p>
      </header>

      {loading ? (
        <div className="py-20 text-center text-zinc-600 text-xs uppercase animate-pulse">Cargando stock...</div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center group active:scale-[0.98] transition-all"
            >
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-tight">
                  {item.item_name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.quantity > 5 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <p className="text-xs text-zinc-500 font-medium">
                    {item.quantity} unidades disponibles
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-zinc-400">Costo Ref.</p>
                <p className="font-bold text-zinc-100">
                  {formatterCOP.format(item.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón de Ayuda Visual */}
      <footer className="p-4 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
        <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
          TIP: Mantén el stock de guantes y agujas siempre por encima de 5 unidades para evitar pausas en la producción.
        </p>
      </footer>
    </div>
  );
};