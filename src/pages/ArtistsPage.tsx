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
    <div className="space-y-8 animate-in fade-in pb-20">
      <header>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Equipo Apolo</h2>
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Gestión de Talento y Rendimiento</p>
      </header>

      {/* FORMULARIO DE REGISTRO */}
      <section className="bg-zinc-900/50 p-5 rounded-[2rem] border border-zinc-800 space-y-4">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nuevo Artista</h3>
        <form onSubmit={handleAddArtist} className="space-y-3">
          <input 
            className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm focus:border-zinc-600 outline-none transition-all"
            placeholder="Nombre artístico"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-600 uppercase ml-2">Tipo</label>
              <select 
                className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm text-zinc-300 outline-none"
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
              >
                <option value="residente">Residente</option>
                <option value="invitado">Invitado</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-600 uppercase ml-2">% Comisión</label>
              <input 
                type="number"
                className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm font-mono"
                placeholder="50"
                value={newCommission}
                onChange={(e) => setNewCommission(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-600 uppercase ml-2">Lienzos Gratuitos / Mes</label>
            <input 
              type="number"
              className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm font-mono"
              placeholder="Ej: 2"
              value={newMaxCanvases}
              onChange={(e) => setNewMaxCanvases(e.target.value)}
            />
          </div>

          <button 
            disabled={isSaving}
            className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'REGISTRANDO...' : 'AÑADIR AL EQUIPO'}
          </button>
        </form>
      </section>

      {/* LISTADO DE ARTISTAS */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Artistas Activos</h3>
        
        {loading && artists.length === 0 && (
          <div className="py-10 text-center animate-pulse text-zinc-700 text-xs font-bold uppercase tracking-widest">Cargando equipo...</div>
        )}

        {artists.map((artist) => (
          <div 
            key={artist.id} 
            className="group bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl flex justify-between items-center hover:border-zinc-700 transition-all active:scale-[0.98]"
          >
            <Link to={`/team/${artist.id}`} className="flex-1 flex items-center gap-4">
              <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center font-black text-zinc-600 group-hover:bg-zinc-100 group-hover:text-black transition-colors uppercase">
                {artist.name.substring(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm uppercase text-zinc-100">{artist.name}</h4>
                  <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                    artist.type === 'residente' ? 'bg-zinc-800 text-zinc-400' : 'bg-orange-900/30 text-orange-500'
                  }`}>
                    {artist.type}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-medium">
                  {artist.commission_percentage}% Comisión • {artist.max_canvases || 0} Lienzos/mes
                </p>
              </div>
            </Link>
            
            <button 
              onClick={() => handleDeleteArtist(artist.id, artist.name)}
              className="text-zinc-800 hover:text-red-500 transition-colors p-2"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        ))}
      </section>
    </div>
  );
};