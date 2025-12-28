import { useParams, Link } from 'react-router-dom';
import { useAccounting } from '../hooks/useAccounting';
import { useEffect } from 'react';
import { formatterCOP } from '../lib/formatterCOP';

export const ArtistDetail = () => {
  const { id } = useParams();
  const { works, artists, fetchWorks, loading } = useAccounting();
  
  useEffect(() => {
    fetchWorks(); // Traemos todos para filtrar por ID
  }, [fetchWorks]);

  const artist = artists.find(a => a.id === id);
  const artistWorks = works.filter(w => w.artist_id === id);

  // Filtrar por mes actual para los lienzos
  const now = new Date();
  const currentMonthWorks = artistWorks.filter(w => {
    const d = new Date(w.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const canvasCount = currentMonthWorks.filter(w => w.is_canvas).length;
  
  // Totales Históricos/Filtrados
  const totalGenerated = artistWorks.reduce((sum, w) => sum + w.total_price, 0);
  const artistShare = artistWorks.reduce((sum, w) => {
    if (w.is_canvas) return sum;
    return sum + (w.total_price * (artist?.commission_percentage || 50) / 100);
  }, 0);
  const studioShare = totalGenerated - artistShare;

  if (!artist) return <div className="p-10 text-center">Artista no encontrado</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-20">
      <header className="flex items-center gap-4">
        <Link to="/team" className="text-zinc-500">←</Link>
        <div>
          <h2 className="text-2xl font-black uppercase italic">{artist.name}</h2>
          <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase font-bold">
            {artist.type}
          </span>
        </div>
      </header>

      {/* METRICA DE LIENZOS */}
      <section className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Lienzos del Mes</p>
          <span className="text-xs font-mono text-white bg-zinc-800 px-3 py-1 rounded-full">
            {canvasCount} / {artist.max_canvases || 2}
          </span>
        </div>
        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${canvasCount > (artist.max_canvases || 2) ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min((canvasCount / (artist.max_canvases || 2)) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-zinc-500 mt-3 italic">
          * Los lienzos son tatuajes que no generan comisión directa pero consumen insumos del estudio.
        </p>
      </section>

      {/* BALANCES FINANCIEROS */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-white p-6 rounded-3xl text-black">
          <p className="text-[10px] font-black uppercase opacity-60">Pago al Artista</p>
          <h4 className="text-3xl font-black">{formatterCOP.format(artistShare)}</h4>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Ganancia para Apolo</p>
          <h4 className="text-2xl font-black text-green-500">{formatterCOP.format(studioShare)}</h4>
        </div>
      </div>

      {/* HISTORIAL RECIENTE */}
      <section className="space-y-3">
        <h5 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Últimos Trabajos</h5>
        {artistWorks.slice(0, 5).map(work => (
          <div key={work.id} className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-zinc-200">{work.client_name}</p>
              <p className="text-[10px] text-zinc-500 font-mono">{new Date(work.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${work.is_canvas ? 'text-blue-400' : 'text-zinc-400'}`}>
                {work.is_canvas ? 'LIENZO' : formatterCOP.format(work.total_price)}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};