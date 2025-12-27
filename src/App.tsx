import { useEffect } from 'react';
import { useAccounting } from './hooks/useAccounting';
import { WorkForm } from './components/WorkForm';
import { Stats } from './components/Stats'; // Importamos el nuevo componente
import { supabase } from './lib/supabase';
import { useState } from 'react';
import { Inventory } from './components/Inventory';

function App() {
  const [artists, setArtists] = useState<any[]>([]);
  const [view, setView] = useState<'accounting' | 'inventory'>('accounting');
  const { fetchWorks, works, loading } = useAccounting();

  const loadInitialData = async () => {
    // 1. Cargamos artistas para el formulario
    const { data } = await supabase.from('artist_profile').select('*');
    setArtists(data || []);
    // 2. Cargamos los trabajos para las estadísticas
    await fetchWorks();
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const formatterCOP = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4">
      {/* Botones de Navegación */}
      <nav className="flex gap-4 mb-6 border-b border-zinc-900 pb-4">
        <button 
          onClick={() => setView('accounting')}
          className={`px-4 py-2 rounded-full text-sm ${view === 'accounting' ? 'bg-white text-black' : 'text-zinc-500'}`}
        >
          Contabilidad
        </button>
        <button 
          onClick={() => setView('inventory')}
          className={`px-4 py-2 rounded-full text-sm ${view === 'inventory' ? 'bg-white text-black' : 'text-zinc-500'}`}
        >
          Inventario
        </button>
      </nav>

      <main className="max-w-md mx-auto">
        {view === 'accounting' ? (
          <div className="space-y-6">
            <Stats works={works} />
            <WorkForm artists={artists} onSuccess={fetchWorks} />
            {/* ... tu lista de trabajos con COP ... */}
          </div>
        ) : (
          <Inventory />
        )}
      </main>
    </div>
  );
}

export default App;