import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useAccounting } from './hooks/useAccounting';
import { WorkForm } from './components/WorkForm';
import { Stats } from './components/Stats';
import { Inventory } from './components/Inventory';

// Formateador global para Pesos Colombianos
const formatterCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
});

function App() {
  const [view, setView] = useState<'accounting' | 'inventory'>('accounting');
  const [artists, setArtists] = useState<any[]>([]);
  const { fetchWorks, works, loading } = useAccounting();

  // Carga inicial de datos
  const loadInitialData = async () => {
    const { data: artistsData } = await supabase.from('artist_profile').select('*');
    setArtists(artistsData || []);
    await fetchWorks();
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header Estilo Studio */}
      <header className="p-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tighter italic">APOLO INK</h1>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </header>

      {/* Navegación Principal */}
      <nav className="max-w-md mx-auto p-4 flex gap-2">
        <button 
          onClick={() => setView('accounting')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            view === 'accounting' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
          }`}
        >
          Contabilidad
        </button>
        <button 
          onClick={() => setView('inventory')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            view === 'inventory' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
          }`}
        >
          Inventario
        </button>
      </nav>

      <main className="max-w-md mx-auto p-4 pb-20">
        {view === 'accounting' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Resumen de Dinero */}
            <Stats works={works} />

            {/* Formulario de Registro */}
            <WorkForm 
              artists={artists} 
              onSuccess={() => fetchWorks()} 
            />

            {/* Listado de Últimos Trabajos en COP */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Registros Recientes</h2>
              <div className="space-y-2">
                {loading && <p className="text-center text-zinc-600 py-4">Sincronizando...</p>}
                
                {works.length === 0 && !loading && (
                  <div className="text-center p-8 border border-dashed border-zinc-800 rounded-xl text-zinc-600 text-sm">
                    No hay trabajos registrados hoy
                  </div>
                )}

                {works.map((work) => (
                  <div key={work.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{work.client_name || 'Cliente General'}</p>
                      <p className="text-xs text-zinc-500">
                        {work.artist_profile?.name} • {new Date(work.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <p className="font-mono text-green-400 font-bold">
                      {formatterCOP.format(work.total_price)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right duration-300">
            <Inventory />
          </div>
        )}
      </main>

      {/* Footer Minimalista */}
      <footer className="max-w-md mx-auto p-6 text-center">
        <p className="text-[10px] text-zinc-700 uppercase tracking-[0.2em]">
          Designed for Stability & Growth
        </p>
      </footer>
    </div>
  );
}

export default App;