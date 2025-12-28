import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAccounting } from '../hooks/useAccounting';

export const ArtistsPage = () => {
  const { artists, fetchWorks } = useAccounting();
  const navigate = useNavigate();
  
  const [newName, setNewName] = useState('');
  const [newCommission, setNewCommission] = useState('50');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { 
    fetchWorks(); 
  }, [fetchWorks]);

  // Solo mostramos los que están activos
  const activeArtists = artists.filter(a => a.is_active !== false);

  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || isSaving) return;

    setIsSaving(true);
    const { error } = await supabase.from('artist_profile').insert([
      { 
        name: newName, 
        type: 'residente', 
        commission_percentage: parseFloat(newCommission),
        is_active: true 
      }
    ]);

    if (!error) {
      setNewName('');
      setNewCommission('50');
      fetchWorks();
    }
    setIsSaving(false);
  };

  const archiveArtist = async (id: string, name: string) => {
    if (!confirm(`¿Quieres archivar a ${name}?`)) return;
  
    try {
      const { data, error } = await supabase
        .from('artist_profile')
        .update({ is_active: false })
        .eq('id', id)
        .select();
  
      if (error) {
        console.error("Error técnico al archivar:", error.message);
        alert("Error de base de datos: " + error.message);
        return;
      }
  
      if (data && data[0].is_active === false) {
        await fetchWorks(); 
      } else {
        console.warn("La DB no guardó el cambio. Revisa los permisos RLS.");
      }
    } catch (err) {
      console.error("Error inesperado:", err);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen animate-in fade-in duration-700 pb-24 px-4 md:px-10">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 py-10 mb-10 text-left">
        <div>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
            Equipo
          </h2>
          <div className="flex items-center gap-4 mt-4">
            <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] ml-1">
              Talento Activo
            </p>
            <button 
              onClick={() => navigate('/team/archived')}
              className="text-[9px] font-black bg-zinc-900 border border-zinc-800 text-zinc-500 px-3 py-1 rounded-full hover:text-white hover:border-zinc-600 transition-all uppercase tracking-widest"
            >
              Ver Archivo
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LISTADO DE ACTIVOS */}
        <section className="lg:col-span-8 space-y-6 order-2 lg:order-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {activeArtists.map((artist) => (
              <div key={artist.id} className="group bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-[2.5rem] flex justify-between items-center hover:bg-zinc-900/60 transition-all">
                <Link to={`/team/${artist.id}`} className="flex-1 flex items-center gap-5">
                  <div className="h-14 w-14 bg-zinc-800 rounded-full flex items-center justify-center font-black text-zinc-600 group-hover:bg-white group-hover:text-black transition-all uppercase italic text-xl">
                    {artist.name.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-black text-lg uppercase text-zinc-100 tracking-tighter">{artist.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{artist.commission_percentage}% Comisión</p>
                  </div>
                </Link>
                
                <div className="relative group/tooltip">
                  <button 
                    onClick={() => archiveArtist(artist.id, artist.name)}
                    className="text-zinc-800 hover:text-orange-500 transition-colors p-4"
                  >
                    <span className="text-xl">📥</span>
                  </button>
                  
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none text-left">
                    <p className="text-[9px] font-black text-white uppercase tracking-widest leading-relaxed">
                      Archivar artista: Se moverá a la lista de antiguos pero mantendrá sus registros.
                    </p>
                    <div className="absolute top-full right-5 w-2 h-2 bg-zinc-900 border-r border-b border-zinc-800 rotate-45 -translate-y-1"></div>
                  </div>
                </div>
              </div>
            ))}
            {activeArtists.length === 0 && (
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest py-10">No hay artistas activos registrados.</p>
            )}
          </div>
        </section>

        {/* REGISTRO */}
        <aside className="lg:col-span-4 order-1 lg:order-2">
          <div className="lg:sticky lg:top-28">
            <section className="bg-zinc-900/50 p-8 rounded-[3rem] border border-zinc-800 shadow-2xl space-y-6">
              <div className="text-left">
                <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-1">Registro Nuevo</h3>
                <p className="text-xl font-black italic text-white uppercase tracking-tighter">Incorporar Artista</p>
              </div>

              <form onSubmit={handleAddArtist} className="space-y-5 text-left">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase ml-1 tracking-[0.2em]">Nombre Artístico</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm focus:border-zinc-500 outline-none transition-all text-white font-bold"
                    placeholder="Ej: Apolo Ink"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  {/* TEXTO ACTUALIZADO AQUÍ */}
                  <label className="text-[9px] font-black text-zinc-600 uppercase ml-1 tracking-[0.2em] italic">
                    % de comisión para el artista
                  </label>
                  <input 
                    type="number"
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-mono text-white outline-none focus:border-zinc-500"
                    value={newCommission}
                    onChange={(e) => setNewCommission(e.target.value)}
                  />
                  <p className="text-[8px] text-zinc-600 font-bold uppercase ml-1 opacity-50 tracking-tighter">
                    * El sistema asignará el resto automáticamente al estudio.
                  </p>
                </div>

                <button 
                  disabled={isSaving}
                  className="w-full bg-white text-black py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-zinc-200 transition-all disabled:opacity-50 mt-4 active:scale-95"
                >
                  {isSaving ? 'PROCESANDO...' : 'REGISTRAR TALENTO'}
                </button>
              </form>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
};