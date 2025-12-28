import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const EditWorkPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [price, setPrice] = useState('');
  const [artistId, setArtistId] = useState('');
  const [artists, setArtists] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // 1. Cargar lista de artistas (Tabla: artist_profile)
      const { data: artistsData } = await supabase
        .from('artist_profile') 
        .select('*');
      setArtists(artistsData || []);

      // 2. Cargar los datos del trabajo actual (Tabla: artist_works)
      const { data: work, error } = await supabase
        .from('artist_works')
        .select('*')
        .eq('id', id)
        .single();

      if (work) {
        // Usamos total_price que es el nombre que tienes en tu lógica
        setPrice(work.total_price.toString());
        setArtistId(work.artist_id);
      }
      
      if (error) {
        console.error("Error al cargar trabajo:", error.message);
        navigate('/accounting');
      }
      setLoading(false);
    };

    loadData();
  }, [id, navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Actualizamos en la tabla correcta: artist_works
    const { error } = await supabase
      .from('artist_works')
      .update({
        total_price: parseFloat(price),
        artist_id: artistId
      })
      .eq('id', id);

    if (!error) {
      navigate('/accounting');
    } else {
      console.error("Error al actualizar:", error.message);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const confirm = window.confirm("¿Seguro que quieres eliminar este ingreso?");
    if (!confirm) return;

    // Eliminamos en la tabla correcta: artist_works
    const { error } = await supabase
      .from('artist_works')
      .delete()
      .eq('id', id);
      
    if (!error) navigate('/accounting');
  };

  if (loading) return <div className="p-10 text-center text-zinc-500 animate-pulse font-black italic uppercase">Cargando Registro...</div>;

  return (
    <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center px-2">
        <button onClick={() => navigate('/accounting')} className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">← Cancelar</button>
        <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Editar Trabajo</h2>
      </header>

      <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute -right-6 -top-6 text-zinc-800/20 font-black text-7xl italic pointer-events-none uppercase">WORK</div>
        
        <form onSubmit={handleUpdate} className="space-y-6 relative">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Monto Total</label>
            <input 
              type="number"
              className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-xl font-mono text-white outline-none focus:border-zinc-500 transition-all"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Asignar a Artista</label>
            <select 
              className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-bold uppercase text-white outline-none appearance-none"
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
              required
            >
              {artists.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 space-y-3">
            <button 
              disabled={saving}
              className="w-full bg-white text-black py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] active:scale-95 transition-all shadow-xl"
            >
              {saving ? 'GUARDANDO...' : 'ACTUALIZAR DATOS'}
            </button>
            
            <button 
              type="button"
              onClick={handleDelete}
              className="w-full text-red-500/50 py-4 font-black uppercase text-[9px] tracking-[0.2em] hover:text-red-500 transition-all"
            >
              ELIMINAR REGISTRO
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};