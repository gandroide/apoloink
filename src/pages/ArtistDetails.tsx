import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatterCOP } from '../lib/formatterCOP';
import { Share2, FileText, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      // CORRECCIÓN AQUÍ: 'profiles'
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single();
      const { data: jobs } = await supabase.from('artist_works').select('*').eq('artist_id', id);

      const { data: allWorks } = await supabase.from('artist_works').select('artist_id, total_price');
      // CORRECCIÓN AQUÍ TAMBIÉN: 'profiles'
      const { data: allArtists } = await supabase.from('profiles').select('id, name');

      if (allWorks && allArtists) {
        const artistTotals = allArtists.map(a => {
          const total = allWorks
            .filter(w => w.artist_id === a.id)
            .reduce((sum, current) => sum + (current.total_price || 0), 0);
          return { id: a.id, total };
        });

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

  const totalInvoiced = works?.reduce((sum, w) => sum + (w.total_price || 0), 0) || 0;
  const valueFromDB = artist?.commission_percentage || 0; 
  const artistRate = valueFromDB < 1 ? 50 : valueFromDB; 
  const studioRate = 100 - artistRate;
  const artistLiquidation = (totalInvoiced * artistRate) / 100;
  const studioContribution = (totalInvoiced * studioRate) / 100;

  const handleWhatsAppShare = () => {
    const total = formatterCOP.format(totalInvoiced);
    const liquidacion = formatterCOP.format(artistLiquidation);
    const mesActual = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    const messageText = `*ESTRUCTO - Business Intelligence*
*Resumen de Rendimiento*
--------------------------------
*Artista:* ${artist?.name}
*Ranking:* #${rank}
*Periodo:* ${mesActual}

*MÉTRICAS:*
• Trabajos: ${works.length}
• Total Bruto: ${total}
• Comisión: ${artistRate}%

*TOTAL A LIQUIDAR:*
💰 *${liquidacion}*
--------------------------------
_Generado por ESTRUCTO_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(messageText)}`, '_blank');
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString();

    doc.setFillColor(24, 24, 27);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('ESTRUCTO', 15, 20);
    doc.setFontSize(10);
    doc.text('REPORTE DE RENDIMIENTO PROFESIONAL', 15, 28);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(`${artist?.name}`, 15, 55);
    doc.setFontSize(10);
    doc.text(`Ranking: #${rank} | Fecha: ${dateStr}`, 15, 62);

    autoTable(doc, {
      startY: 70,
      head: [['Concepto', 'Monto']],
      body: [
        ['Total Facturado Bruto', formatterCOP.format(totalInvoiced)],
        [`Comisión Artista (${artistRate}%)`, formatterCOP.format(artistLiquidation)],
        [`Aporte Estudio (${studioRate}%)`, formatterCOP.format(studioContribution)],
      ],
      headStyles: { fillColor: [24, 24, 27] }, 
      styles: { font: 'helvetica' }
    });

    doc.text('DETALLE DE TRABAJOS', 15, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Fecha', 'Cliente', 'Monto']],
      body: works.map(w => [
        new Date(w.created_at || w.date).toLocaleDateString(),
        w.client_name || 'N/A',
        formatterCOP.format(w.total_price)
      ]),
      headStyles: { fillColor: [0, 0, 0] } 
    });

    doc.save(`Reporte_${artist?.name}.pdf`);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-black text-zinc-800 uppercase tracking-[0.5em]">Cargando...</div>;

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen p-6 md:p-12 lg:p-16 animate-in fade-in duration-700 text-left">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-zinc-900 pb-12">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/team')} className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter text-white leading-none">{artist?.name}</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-4 ml-1 italic">Business Intelligence</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <span className="px-4 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full">Share {artistRate}%</span>
                <span className="text-black/10 font-black italic text-5xl md:text-6xl tracking-tighter">#{rank}</span>
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-black/40 mb-3">Liquidación Neta</p>
              <h3 className="text-5xl md:text-6xl xl:text-7xl font-black text-black tabular-nums tracking-tighter leading-none">{formatterCOP.format(artistLiquidation)}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={handleWhatsAppShare} className="flex items-center justify-center gap-4 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/20 py-8 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest transition-all">
              <Share2 size={18} /> WhatsApp
            </button>
            <button onClick={generatePDF} className="flex items-center justify-center gap-4 bg-zinc-900 border border-zinc-800 text-white hover:bg-white hover:text-black py-8 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest transition-all">
              <FileText size={18} /> Descargar PDF
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-10">
          <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[3.5rem] p-8 md:p-10">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-10">Historial</h4>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {works.map((work) => (
                <div key={work.id} className="p-4 border-b border-zinc-900/50 flex justify-between items-center group">
                  <div className="text-left">
                    <p className="text-zinc-200 font-black uppercase italic text-xs group-hover:text-emerald-400 transition-colors">{work.client_name || 'Tatuaje'}</p>
                    <p className="text-[8px] text-zinc-700 font-bold uppercase mt-1">{new Date(work.created_at || work.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-zinc-400 font-mono text-sm font-bold">{formatterCOP.format(work.total_price)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};