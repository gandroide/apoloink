import { useEffect } from 'react';
import { useAccounting } from './hooks/useAccounting';
import { WorkForm } from './components/WorkForm';
import { Stats } from './components/Stats'; // Importamos el nuevo componente
import { supabase } from './lib/supabase';
import { useState } from 'react';

function App() {
  const [artists, setArtists] = useState<any[]>([]);
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <header className="py-4">
          <h1 className="text-2xl font-bold italic">APOLO INK STUDIO</h1>
        </header>

        {/* 1. MOSTRAR LAS ESTADÍSTICAS ARRIBA */}
        <Stats works={works} />

        {/* 2. FORMULARIO PARA REGISTRAR TRABAJOS */}
        <WorkForm 
          artists={artists} 
          onSuccess={() => fetchWorks()} // Esto actualiza los Stats automáticamente al guardar
        />

        {/* 3. LISTADO DE ÚLTIMOS TRABAJOS (Opcional) */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase">Últimos Registros</h2>
          {works.map((work) => (
            <div key={work.id} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 flex justify-between">
              <div>
                <p className="text-sm font-medium">{work.client_name || 'Cliente'}</p>
                <p className="text-xs text-zinc-500">{work.artist_profile?.name}</p>
              </div>
              <p className="font-mono text-green-500">€{work.total_price}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default App;