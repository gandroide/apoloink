export const Stats = ({ works }: { works: any[] }) => {
    // Formateador para Pesos Colombianos
    const formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0, // Los pesos colombianos no suelen usar centavos
    });
  
    const totalRevenue = works.reduce((sum, w) => sum + w.total_price, 0);
    
    const studioProfit = works.reduce((sum, w) => {
      const commission = (w.artist_profile?.commission_percentage || 50) / 100;
      const artistCut = w.total_price * commission;
      return sum + (w.total_price - artistCut);
    }, 0);
  
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Total Bruto</p>
          <p className="text-xl font-bold text-green-500 font-mono">
            {formatter.format(totalRevenue)}
          </p>
        </div>
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Estudio (Neto)</p>
          <p className="text-xl font-bold text-white font-mono">
            {formatter.format(studioProfit)}
          </p>
        </div>
      </div>
    );
  };