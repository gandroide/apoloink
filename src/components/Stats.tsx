import { formatterCOP } from '../lib/formatterCOP';

export const Stats = ({ works }: { works: any[] }) => {
  // 1. Total que entró al estudio (dinero en mano antes de repartir)
  const totalInvoiced = works.reduce((sum, w) => sum + w.total_price, 0);
  
  // 2. Lo que el estudio RETIENE (Total - Comisiones de artistas)
  const studioShare = works.reduce((sum, w) => {
    // Si el artista cobra el 60%, el estudio se queda con el 40% (100 - 60)
    const artistCommission = w.artist_profile?.commission_percentage || 50;
    const studioPercentage = (100 - artistCommission) / 100;
    return sum + (w.total_price * studioPercentage);
  }, 0);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Facturado</p>
        <p className="text-lg font-black text-white font-mono">
          {formatterCOP.format(totalInvoiced)}
        </p>
      </div>
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 border-l-blue-900/50">
        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Bruto Estudio</p>
        <p className="text-lg font-black text-blue-400 font-mono">
          {formatterCOP.format(studioShare)}
        </p>
      </div>
    </div>
  );
};