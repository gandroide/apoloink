import { formatterCOP } from '../lib/formatterCOP';

interface StatsProps {
  works: any[];
}

export const Stats = ({ works }: StatsProps) => {
  // Agrupamos los trabajos por artista
  const artistPerformance = works.reduce((acc: any, work) => {
    const artistName = work.artist_profile?.name || 'Sin Asignar';
    if (!acc[artistName]) {
      acc[artistName] = { 
        name: artistName, 
        total: 0, 
        count: 0,
        studioContribution: 0 
      };
    }
    
    acc[artistName].total += work.total_price;
    acc[artistName].count += 1;
    
    const artistCommission = work.artist_profile?.commission_percentage || 50;
    const studioPart = (100 - artistCommission) / 100;
    acc[artistName].studioContribution += (work.total_price * studioPart);
    
    return acc;
  }, {});

  const artists = Object.values(artistPerformance);

  return (
    <div className="space-y-3">
      {artists.length === 0 ? (
        <p className="text-center text-zinc-700 text-[10px] py-4 uppercase font-black italic">
          Sin actividad este período
        </p>
      ) : (
        artists.map((artist: any) => (
          <div key={artist.name} className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl flex justify-between items-center group hover:border-zinc-800 transition-all">
            <div className="space-y-1">
              <h5 className="text-white font-black uppercase italic text-xs tracking-tighter">
                {artist.name}
               Marques
              </h5>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                {artist.count} {artist.count === 1 ? 'Tatuaje' : 'Tatuajes'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-zinc-200 font-mono">
                {formatterCOP.format(artist.total)}
              </p>
              <p className="text-[8px] text-emerald-500/70 font-bold uppercase">
                Estudio: {formatterCOP.format(artist.studioContribution)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};