import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAccounting } from '../hooks/useAccounting';

export const ArtistsPage = () => {
  const { artists, fetchWorks, loading } = useAccounting();
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'residente' | 'invitado'>('residente');
  const [newCommission, setNewCommission] = useState('50');
  const [newMaxCanvases, setNewMaxCanvases] = useState('2');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { 
    fetchWorks(); 
  }, [fetchWorks]);

  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || isSaving) return;

    setIsSaving(true);
    const { error } = await supabase.from('artist_profile').insert([
      { 
        name: newName, 
        type: newType, 
        commission_percentage: parseFloat(newCommission),
        max_canvases: parseInt(newMaxCanvases)
      }
    ]);

    if (!error) {
      setNewName('');
      setNewCommission('50');
      setNewMaxCanvases('2');
      fetchWorks();
    }
    setIsSaving(false);
  };

  const handleDeleteArtist = async (id: string, name: string) => {
    if (confirm(`¿Seguro que quieres eliminar a ${name}? Esto podría afectar los registros históricos.`)) {
      await supabase.from('artist_profile').delete().eq('id', id);
      fetchWorks();
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen animate-in fade-in duration-700 pb-24 px-4 md:px-10">
      
      {/* HEADER PROFESIONAL */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 py-10 mb-10 text-left">
        <div>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
            Equipo<span className="text-zinc-700">.</span>Apolo
          </h2>
          <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mt-4 ml-1">
            Gestión de Talento y Rendimiento Profesional
          </p>
        </div>
        <div className="hidden md:block">
           <span className="text-xs font-black text-zinc-800 uppercase tracking-[0.5em] italic">Lisboa 2025</span>
        </div>
      </header>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* COLUMNA IZQUIERDA: LISTADO (8/12) */}
        <section className="lg:col-span-8 space-y-6 order-2 lg:order-1">
          <div className="flex items-center gap-4 mb-2">
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic">Artistas Activos</h3>
            <div className="h-px flex-1 bg-zinc-800 opacity-30"></div>
          </div>
          
          {loading && artists.length === 0 && (
            <div className="py-20 text-center animate-pulse text-zinc-700 text-xs font-bold uppercase tracking-widest">Cargando equipo...</div>
          )}

          {/* Grid de Artistas: 1 columna en móvil, 2 en pantallas medianas/grandes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {artists.map((artist) => (
              <div 
                key={artist.id} 
                className="group bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-[2.5rem] flex justify-between items-center hover:bg-zinc-900/60 hover:border-zinc-700 transition-all duration-300"
              >
                <Link to={`/team/${artist.id}`} className="flex-1 flex items-center gap-5">
                  <div className="h-14 w-14 bg-zinc-800 rounded-full flex items-center justify-center font-black text-zinc-600 group-hover:bg-white group-hover:text-black transition-all duration-500 uppercase text-xl italic shadow-inner">
                    {artist.name.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-black text-lg uppercase text-zinc-100 tracking-tighter">{artist.name}</h4>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                        artist.type === 'residente' ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-white text-black'
                      }`}>
                        {artist.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      {artist.commission_percentage}% Comisión • {artist.max_canvases || 0} Lienzos
                    </p>
                  </div>
                </Link>
                
                <button 
                  onClick={() => handleDeleteArtist(artist.id, artist.name)}
                  className="text-zinc-800 hover:text-red-500 transition-colors p-4 hover:scale-125 duration-300"
                >
                  <span className="text-2xl font-light">×</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* COLUMNA DERECHA: REGISTRO (4/12) */}
        <aside className="lg:col-span-4 order-1 lg:order-2">
          <div className="lg:sticky lg:top-28">
            <section className="bg-zinc-900/50 p-8 rounded-[3rem] border border-zinc-800 shadow-2xl space-y-6">
              <div className="text-left">
                <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-1">Registro Nuevo</h3>
                <p className="text-xl font-black italic text-white uppercase tracking-tighter">Incorporar Artista</p>
              </div>

              <form onSubmit={handleAddArtist} className="space-y-4 text-left">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Nombre Artístico</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm focus:border-zinc-500 outline-none transition-all text-white placeholder:text-zinc-800"
                    placeholder="Ej: Apolo Ink"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Status</label>
                    <select 
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-[10px] font-black uppercase text-zinc-300 outline-none appearance-none cursor-pointer"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                    >
                      <option value="residente">Residente</option>
                      <option value="invitado">Invitado</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">% Comisión</label>
                    <input 
                      type="number"
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-mono text-white"
                      value={newCommission}
                      onChange={(e) => setNewCommission(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Lienzos Mensuales</label>
                  <input 
                    type="number"
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-mono text-white"
                    value={newMaxCanvases}
                    onChange={(e) => setNewMaxCanvases(e.target.value)}
                  />
                </div>

                <button 
                  disabled={isSaving}
                  className="w-full bg-white text-black py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 mt-4"
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