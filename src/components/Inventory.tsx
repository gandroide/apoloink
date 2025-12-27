import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const Inventory = () => {
  const [items, setItems] = useState<any[]>([]);
  const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

  useEffect(() => {
    const fetchInventory = async () => {
      const { data } = await supabase.from('inventory').select('*').order('item_name');
      setItems(data || []);
    };
    fetchInventory();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold border-b border-zinc-800 pb-2">Inventario del Estudio</h2>
      <div className="grid gap-2">
        {items.map(item => (
          <div key={item.id} className="flex justify-between items-center bg-zinc-900 p-3 rounded-lg border border-zinc-800">
            <div>
              <p className="font-medium">{item.item_name}</p>
              <p className="text-xs text-zinc-500">Stock: {item.quantity} unidades</p>
            </div>
            <p className="text-zinc-300 font-mono text-sm">{formatter.format(item.price)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};