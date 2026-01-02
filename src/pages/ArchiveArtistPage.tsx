import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAccounting } from '../hooks/useAccounting';
import { useEffect } from 'react';

export const ArchivedArtistsPage = () => {
  const { artists, fetchWorks } = useAccounting();
  const navigate = useNavigate();

  useEffect(() => { fetchWorks(); }, [fetchWorks]);

  const archivedArtists = artists.filter(a => a.is_active === false);

  const reactivateArtist = async (id: string, name: string) => {
    if (confirm(`¿Quieres reactivar a ${name}?`)) {
      // CORRECCIÓN AQUÍ: 'profiles'
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: true })
        .eq('id', id);
      
      if (!error) fetchWorks();
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto min-h-screen p-6 md:p-12 animate-in slide-in-from-bottom-4 duration-700 text-left">
      <header className="flex items-center gap-6 mb-16">
        <button 
          onClick={() => navigate('/team')}
          className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
        >
          ←
        </button>
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Archivo de Equipo</h2>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] mt-2">Historial de antiguos colaboradores</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {archivedArtists.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-900 rounded-[3rem]">
            <p className="text-zinc-800 font-black uppercase text-[10px] tracking-widest italic">El archivo está vacío</p>
          </div>
        ) : (
          archivedArtists.map((artist) => (
            <div key={artist.id} className="bg-zinc-950/50 border border-zinc-900 p-8 rounded-[3rem] flex justify-between items-center group">
              <div className="flex items-center gap-6 grayscale opacity-50">
                <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center font-black text-zinc-700 text-2xl italic">
                  {artist.name.substring(0, 2)}
                </div>
                <div>
                  <h4 className="font-black text-xl uppercase text-zinc-400 tracking-tighter">{artist.name}</h4>
                  <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">Inactivo</p>
                </div>
              </div>
              <button 
                onClick={() => reactivateArtist(artist.id, artist.name)}
                className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
              >
                Reincorporar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};