import { useParams, Link } from 'react-router-dom';
import { useAccounting } from '../hooks/useAccounting';
import type { Artist, Work } from '../hooks/useAccounting'; // Importación de tipos correcta
import { useEffect } from 'react';
import { formatterCOP } from '../lib/formatterCOP';

export const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { works, artists, fetchWorks, loading } = useAccounting();
  
  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const artist = artists.find((a: Artist) => a.id === id);
  const artistWorks = works.filter((w: Work) => w.artist_id === id);

  const now = new Date();
  const currentMonthWorks = artistWorks.filter(w => {
    const d = new Date(w.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const canvasCount = currentMonthWorks.filter(w => w.is_canvas).length;
  
  const totalGenerated = artistWorks.reduce((sum, w) => sum + w.total_price, 0);
  const artistShare = artistWorks.reduce((sum, w) => {
    if (w.is_canvas) return sum;
    return sum + (w.total_price * (artist?.commission_percentage || 50) / 100);
  }, 0);
  const studioShare = totalGenerated - artistShare;

  if (loading && !artist) return <div className="p-20 text-center animate-pulse text-zinc-500 uppercase text-xs font-bold tracking-widest">Cargando perfil...</div>;
  if (!artist) return <div className="p-20 text-center text-zinc-600">Artista no encontrado</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center gap-4">
        <Link to="/team" className="bg-zinc-900 w-10 h-10 rounded-full flex items-center justify-center border border-zinc-800 text-zinc-400">←</Link>
        <div>
          <h2 className="text-2xl font-black uppercase italic leading-none">{artist.name}</h2>
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Detalles de Rendimiento</span>
        </div>
      </header>

      <section className="bg-zinc-900 border border-zinc-800 p-5 rounded-[2rem]">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Lienzos {now.toLocaleString('es-ES', { month: 'long' })}</p>
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${canvasCount > artist.max_canvases ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-300'}`}>
            {canvasCount} / {artist.max_canvases}
          </span>
        </div>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${canvasCount > artist.max_canvases ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min((canvasCount / artist.max_canvases) * 100, 100)}%` }}
          ></div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3">
        <div className="bg-white p-6 rounded-[2rem] text-black shadow-xl">
          <p className="text-[10px] font-black uppercase opacity-50 mb-1">Total acumulado Artista</p>
          <h4 className="text-3xl font-black tabular-nums">{formatterCOP.format(artistShare)}</h4>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem]">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Ganancia para el estudio</p>
          <h4 className="text-2xl font-black text-green-500 tabular-nums">{formatterCOP.format(studioShare)}</h4>
        </div>
      </div>

      <section className="space-y-3">
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Últimos trabajos</p>
        {artistWorks.slice(0, 5).map(work => (
          <div key={work.id} className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
            <span className="text-sm font-bold text-zinc-300">{work.client_name}</span>
            <span className={`font-mono text-sm font-bold ${work.is_canvas ? 'text-blue-400' : 'text-zinc-500'}`}>
              {work.is_canvas ? 'LIENZO' : formatterCOP.format(work.total_price)}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
};