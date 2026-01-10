import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Artist {
    id: string;
    name: string;
    commission_percentage: number;
    is_active: boolean;
    type: string;
    studio_id: string;
  }

  
export const StudioTeamView = ({ currentUserId }: { currentUserId: string }) => {
    const navigate = useNavigate();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newCommission, setNewCommission] = useState('50');
    const [isSaving, setIsSaving] = useState(false);
  
    const fetchTeam = async () => {
      setLoading(true);
      try {
        // 1. Obtener mi studio_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('studio_id')
          .eq('id', currentUserId)
          .single();
  
        if (profile?.studio_id) {
          // 2. Obtener artistas vinculados
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('studio_id', profile.studio_id)
            .eq('type', 'residente')
            .order('name', { ascending: true });
          setArtists(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => { fetchTeam(); }, [currentUserId]);
  
    const handleAddArtist = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newName || isSaving) return;
      setIsSaving(true);
      try {
          const { data: profile } = await supabase.from('profiles').select('studio_id').eq('id', currentUserId).single();
          if (!profile?.studio_id) throw new Error("No tienes estudio asignado.");
  
          const { error } = await supabase.from('profiles').insert([{ 
              name: newName.toUpperCase(),
              type: 'residente',
              commission_percentage: parseFloat(newCommission),
              is_active: true,
              studio_id: profile.studio_id
          }]);
          if (error) throw error;
          setNewName(''); setNewCommission('50'); fetchTeam();
      } catch (error: any) { alert(error.message); } finally { setIsSaving(false); }
    };
  
    const archiveArtist = async (id: string, name: string) => {
      if (!confirm(`¿Archivar a ${name}?`)) return;
      await supabase.from('profiles').update({ is_active: false }).eq('id', id);
      fetchTeam();
    };
  
    const activeArtists = artists.filter(a => a.is_active !== false);
  
    return (
      <div className="animate-in fade-in duration-700">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 py-10 mb-10 text-left">
          <div>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">Equipo</h2>
            <div className="flex items-center gap-4 mt-4">
              <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] ml-1">Gestión de Talento</p>
              <button onClick={() => navigate('/team/archived')} className="text-[9px] font-black bg-zinc-900 border border-zinc-800 text-zinc-500 px-3 py-1 rounded-full hover:text-white hover:border-zinc-600 transition-all uppercase tracking-widest">Ver Archivo</button>
            </div>
          </div>
        </header>
  
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <section className="lg:col-span-8 space-y-6 order-2 lg:order-1">
            {loading ? <div className="text-center py-20 text-zinc-600 text-xs font-black animate-pulse uppercase tracking-widest">Cargando...</div> : (
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
                      <button onClick={() => archiveArtist(artist.id, artist.name)} className="text-zinc-800 hover:text-orange-500 p-4 transition-colors">📥</button>
                  </div>
                  ))}
              </div>
            )}
          </section>
  
          <aside className="lg:col-span-4 order-1 lg:order-2 lg:sticky lg:top-28">
              <section className="bg-zinc-900/50 p-8 rounded-[3rem] border border-zinc-800 shadow-2xl space-y-6">
                <div className="text-left">
                  <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-1">Registro Nuevo</h3>
                  <p className="text-xl font-black italic text-white uppercase tracking-tighter">Incorporar Artista</p>
                </div>
                <form onSubmit={handleAddArtist} className="space-y-5 text-left">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase ml-1 tracking-[0.2em]">Nombre</label>
                    <input className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm outline-none text-white font-bold" placeholder="Ej: Alex Ink" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase ml-1 tracking-[0.2em]">Comisión %</label>
                    <input type="number" min="0" max="100" className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-mono text-white outline-none" value={newCommission} onChange={(e) => setNewCommission(e.target.value)} />
                  </div>
                  <button disabled={isSaving} className="w-full bg-white text-black py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-zinc-200 transition-all disabled:opacity-50 mt-4 active:scale-95">{isSaving ? '...' : 'REGISTRAR'}</button>
                </form>
              </section>
          </aside>
        </div>
      </div>
    );
  };