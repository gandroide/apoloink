import { Link } from 'react-router-dom';
import { formatterCOP } from '../lib/formatterCOP';

export const Stats = ({ works }: { works: any[] }) => {
  // Agrupamos por artista
  const performance = works.reduce((acc: any, work) => {
    const artist = work.artist_profile;
    if (!artist) return acc;
    
    if (!acc[artist.id]) {
      acc[artist.id] = {
        id: artist.id,
        name: artist.name,
        total: 0,
        count: 0,
        studioShare: 0
      };
    }
    
    const commission = artist.commission_percentage || 50;
    const studioPart = (work.total_price * (100 - commission)) / 100;
    
    acc[artist.id].total += work.total_price;
    acc[artist.id].studioShare += studioPart;
    acc[artist.id].count += 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.values(performance).map((artist: any) => (
        <Link 
          key={artist.id} 
          to={`/team/${artist.id}`} 
          className="group block bg-zinc-900/30 border border-zinc-800 p-6 rounded-[2.5rem] hover:bg-zinc-900/60 transition-all active:scale-[0.98]"
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-black text-lg uppercase text-white italic tracking-tighter group-hover:text-emerald-400 transition-colors">
              {artist.name}
            </h4>
            <span className="text-[10px] font-black text-zinc-600 uppercase bg-black px-3 py-1 rounded-full">
              {artist.count} {artist.count === 1 ? 'Tatuaje' : 'Tatuajes'}
            </span>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Total Bruto</p>
              <p className="text-xl font-black font-mono text-white">
                {formatterCOP.format(artist.total)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest">Estudio</p>
              <p className="text-sm font-black font-mono text-emerald-500">
                {formatterCOP.format(artist.studioShare)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};