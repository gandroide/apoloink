import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccounting } from '../hooks/useAccounting';
import { formatterCOP } from '../lib/formatterCOP';

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const Accounting = () => {
  const navigate = useNavigate();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  const { fetchWorks, works, loading: loadingWorks } = useAccounting();

  const loadData = async () => {
    // Solo cargamos los trabajos, eliminamos la lógica de gastos (expenses)
    await fetchWorks(selectedMonth, selectedYear);
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  // Cálculo del ingreso que queda para el estudio
  const totalStudioGross = works.reduce((sum, w) => {
    const artistCommission = w.artist_profile?.commission_percentage || 50;
    const studioPercentage = (100 - artistCommission) / 100;
    return sum + (w.total_price * studioPercentage);
  }, 0);

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen animate-in fade-in duration-700 pb-24 px-4 md:px-10">
      
      {/* HEADER ESTRUCTO */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 py-10 mb-10 text-left">
        <div>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
            Ingresos
          </h2>
          <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mt-4 ml-1">
            ESTRUCTO • Business Intelligence
          </p>
        </div>

        <button 
          onClick={() => navigate('/new-work')}
          className="bg-white text-black px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-colors w-fit"
        >
          + Registrar Nuevo
        </button>

        <div className="flex gap-2 bg-zinc-900/80 p-2 rounded-2xl border border-zinc-800 self-start md:self-end">
          <select 
            className="bg-transparent text-[10px] font-black uppercase text-zinc-300 px-4 py-2 outline-none cursor-pointer"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={m} value={i} className="bg-zinc-900">{m}</option>)}
          </select>
          <select 
            className="bg-transparent text-[10px] font-black uppercase text-zinc-300 px-4 py-2 outline-none cursor-pointer border-l border-zinc-800"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y} className="bg-zinc-900">{y}</option>)}
          </select>
        </div>
      </header>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LISTADO DE TRABAJOS */}
        <section className="lg:col-span-8 space-y-6 order-2 lg:order-1 text-left">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest italic">Flujo de Caja Detallado</h3>
            <div className="h-px flex-1 bg-zinc-800 opacity-30"></div>
          </div>

          {loadingWorks ? (
            <div className="py-20 text-center animate-pulse text-zinc-700 font-black uppercase text-xs">Sincronizando registros...</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {works.length === 0 ? (
                <p className="text-center py-20 text-zinc-800 font-black uppercase italic text-xs tracking-widest">No hay movimientos en este periodo</p>
              ) : (
                works.map((work) => (
                  <button
                    key={work.id}
                    onClick={() => navigate(`/edit-work/${work.id}`)}
                    className="w-full bg-zinc-900/30 border border-zinc-900 p-6 rounded-[2.5rem] flex justify-between items-center group hover:bg-zinc-900/60 transition-all duration-300"
                  >
                    <div className="text-left flex items-center gap-5">
                      <div className="h-12 w-12 bg-zinc-800 rounded-full flex items-center justify-center font-black text-zinc-600 group-hover:bg-white group-hover:text-black transition-all duration-500 uppercase italic">
                        {work.artist_profile?.name.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-white font-black uppercase italic text-lg tracking-tighter leading-none group-hover:text-emerald-400">
                          {work.artist_profile?.name || 'Artista'}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                          {work.client_name} • {new Date(work.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-zinc-200 font-mono tracking-tighter">
                        {formatterCOP.format(work.total_price)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </section>

        {/* MÉTRICAS DE ESTUDIO */}
        <aside className="lg:col-span-4 order-1 lg:order-2">
          <div className="lg:sticky lg:top-28 space-y-6">
            
            <section className="bg-white p-8 md:p-10 rounded-[3.5rem] shadow-2xl flex flex-col justify-between min-h-[220px]">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-3">Bruto Estudio Acumulado</p>
                <h3 className="text-3xl sm:text-4xl xl:text-5xl font-black text-black tabular-nums tracking-tighter leading-none break-all">
                  {formatterCOP.format(totalStudioGross)}
                </h3>
              </div>
              <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest italic text-left mt-8">
                Cálculo automático basado en comisiones.
              </p>
            </section>

            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[2.5rem] text-left">
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1 italic">Gestión de Periodos</p>
              <p className="text-zinc-500 text-[10px] leading-relaxed">
                Selecciona el mes para revisar la liquidación histórica. Los cambios realizados aquí afectan directamente al Dashboard global de ESTRUCTO.
              </p>
            </div>
          </div>
        </aside>
      </div>

    </div>
  );
};