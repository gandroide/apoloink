import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';

export const ArtistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<any>(null);
  const [works, setWorks] = useState<any[]>([]);
  const [rank, setRank] = useState<string>("--");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistData = async () => {
      setLoading(true);
      
      // 1. Datos del artista y sus trabajos
      const { data: profile } = await supabase.from('artist_profile').select('*').eq('id', id).single();
      const { data: jobs } = await supabase.from('artist_works').select('*').eq('artist_id', id);

      // 2. Lógica de Ranking Jerárquico
      const { data: allWorks } = await supabase.from('artist_works').select('artist_id, total_price');
      const { data: allArtists } = await supabase.from('artist_profile').select('id, name');

      if (allWorks && allArtists) {
        // Calculamos ingresos totales por cada artista
        const artistTotals = allArtists.map(a => {
          const total = allWorks
            .filter(w => w.artist_id === a.id)
            .reduce((sum, current) => sum + current.total_price, 0);
          return { id: a.id, total };
        });

        // Ordenamos de mayor a menor
        const sorted = [...artistTotals].sort((a, b) => b.total - a.total);
        const position = sorted.findIndex(a => a.id === id) + 1;
        setRank(position < 10 ? `0${position}` : `${position}`);
      }

      setArtist(profile);
      setWorks(jobs || []);
      setLoading(false);
    };

    fetchArtistData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-black text-zinc-800 uppercase tracking-[0.5em]">Calculando Jerarquía...</div>;

  const totalInvoiced = works.reduce((sum, w) => sum + w.total_price, 0);
  const valueFromDB = artist?.commission_percentage || 0; 
  const artistRate = valueFromDB < 50 ? (100 - valueFromDB) : valueFromDB; 
  const studioRate = 100 - artistRate;

  const artistLiquidation = (totalInvoiced * artistRate) / 100;
  const studioContribution = (totalInvoiced * studioRate) / 100;

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen p-6 md:p-12 lg:p-16 animate-in fade-in duration-700 text-left">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-zinc-900 pb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/team')}
            className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-all active:scale-90"
          >
            ←
          </button>
          <div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter text-white leading-none">
              {artist?.name}
            </h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-4 ml-1">Rendimiento y Jerarquía</p>
          </div>
        </div>
      </header>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16 items-start">
        
        {/* COLUMNA MÉTRICAS */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          
          {/* TARJETA LIQUIDACIÓN CON TAMAÑO REDUCIDO Y RANKING DINÁMICO */}
          <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <span className="px-4 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                  Artist Share {artistRate}%
                </span>
                {/* NÚMERO JERÁRQUICO DINÁMICO */}
                <span className="text-black/10 font-black italic text-5xl md:text-6xl tracking-tighter">
                  {rank}
                </span>
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-black/40 mb-3">Tu Liquidación Neta</p>
              {/* Tamaño reducido de h3 para que no sature la pantalla */}
              <h3 className="text-5xl md:text-6xl xl:text-7xl font-black text-black tabular-nums tracking-tighter leading-none">
                {formatterCOP.format(artistLiquidation)}
              </h3>
            </div>
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-zinc-100 to-transparent opacity-50"></div>
          </div>

          {/* APORTE ESTUDIO */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 p-10 md:p-12 rounded-[4rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-all hover:bg-zinc-900/60">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-3">Aporte al Estudio ({studioRate}%)</p>
              <h3 className="text-3xl md:text-5xl font-black text-emerald-500 tabular-nums tracking-tighter leading-none">
                {formatterCOP.format(studioContribution)}
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest mb-1">Total Bruto</p>
              <p className="text-zinc-400 font-mono font-bold">{formatterCOP.format(totalInvoiced)}</p>
            </div>
          </div>
        </div>

        {/* COLUMNA HISTORIAL */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-10">
          <div className="bg-zinc-900/20 border border-zinc-900/50 rounded-[3.5rem] p-8 md:p-10">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-10">Historial Reciente</h4>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {works.map((work) => (
                <div key={work.id} className="p-4 border-b border-zinc-900/50 flex justify-between items-center group">
                  <div className="text-left">
                    <p className="text-zinc-200 font-black uppercase italic text-xs tracking-wider group-hover:text-emerald-400 transition-colors">
                      {work.client_name || 'Trabajo'}
                    </p>
                    <p className="text-[8px] text-zinc-700 font-bold uppercase mt-1">
                      {new Date(work.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-zinc-400 font-mono text-sm font-bold tracking-tighter">
                    {formatterCOP.format(work.total_price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};