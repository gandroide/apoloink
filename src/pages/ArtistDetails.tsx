import { useParams, Link } from 'react-router-dom';
import { useAccounting } from '../hooks/useAccounting';
import type { Artist, Work } from '../hooks/useAccounting';
import { useEffect } from 'react';
import { formatterCOP } from '../lib/formatterCOP';
import { generateArtistReport, sendWhatsAppSummary } from '../lib/reports';

export const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { works, artists, fetchWorks, loading } = useAccounting();
  
  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const artist = artists.find((a: Artist) => a.id === id);
  const artistWorks = works.filter((w: Work) => w.artist_id === id);

  const now = new Date();
  
  // Cálculo de totales simplificado (sin lógica de lienzos)
  const totalGenerated = artistWorks.reduce((sum, w) => sum + (w.total_price || 0), 0);
  const artistShare = (totalGenerated * (artist?.commission_percentage || 50)) / 100;
  const studioShare = totalGenerated - artistShare;

  if (loading && !artist) return <div className="p-20 text-center animate-pulse text-zinc-500 uppercase text-xs font-bold tracking-widest">Cargando perfil...</div>;
  if (!artist) return <div className="p-20 text-center text-zinc-600">Artista no encontrado</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center gap-4">
        <Link to="/team" className="bg-zinc-900 w-10 h-10 rounded-full flex items-center justify-center border border-zinc-800 text-zinc-400 active:scale-90 transition-all">←</Link>
        <div>
          <h2 className="text-2xl font-black uppercase italic leading-none">{artist.name}</h2>
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Rendimiento Financiero</span>
        </div>
      </header>

      {/* Resumen de Ganancias */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-white p-8 rounded-[2.5rem] text-black shadow-xl relative overflow-hidden">
           <div className="absolute -right-4 -top-2 text-black/5 text-6xl font-black italic select-none uppercase">ARTIST</div>
          <p className="text-[10px] font-black uppercase opacity-50 mb-1">Tu Liquidación ({artist.commission_percentage}%)</p>
          <h4 className="text-4xl font-black tabular-nums tracking-tighter">{formatterCOP.format(artistShare)}</h4>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem]">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Aporte al Estudio</p>
          <h4 className="text-2xl font-black text-emerald-500 tabular-nums">{formatterCOP.format(studioShare)}</h4>
        </div>
      </div>

      {/* Historial de Trabajos */}
      <section className="space-y-3">
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Historial de Trabajos</p>
        <div className="space-y-2">
          {artistWorks.length === 0 ? (
            <p className="text-center text-zinc-800 text-[10px] py-10 font-black uppercase italic">Sin registros este mes</p>
          ) : (
            artistWorks.slice(0, 10).map(work => (
              <div key={work.id} className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-300 uppercase italic">{work.client_name || 'Cliente Sin Nombre'}</span>
                  <span className="text-[8px] text-zinc-600 font-bold uppercase">{new Date(work.created_at).toLocaleDateString()}</span>
                </div>
                <span className="font-mono text-sm font-bold text-zinc-200">
                  {formatterCOP.format(work.total_price)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Botonera de Reportes */}
      <div className="flex gap-2 mt-6">
        <button 
          onClick={() => generateArtistReport(artist, artistWorks, now.toLocaleString('es-ES', { month: 'long' }))}
          className="flex-1 bg-zinc-800 text-[10px] font-black p-4 rounded-2xl uppercase tracking-widest active:bg-white active:text-black transition-all border border-zinc-700"
        >
          📄 PDF
        </button>
        
        <button 
          onClick={() => sendWhatsAppSummary(artist, artistWorks, now.toLocaleString('es-ES', { month: 'long' }))}
          className="flex-1 bg-emerald-600 text-[10px] font-black p-4 rounded-2xl uppercase tracking-widest active:scale-95 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
        >
          📱 WhatsApp
        </button>
      </div>
    </div>
  );
};