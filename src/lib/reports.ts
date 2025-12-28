import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatterCOP } from './formatterCOP';
// Solución al error de 'verbatimModuleSyntax': importamos como tipos
import type { Work, Artist } from '../hooks/useAccounting';

export const generateArtistReport = (artist: Artist, works: Work[], monthName: string) => {
  const doc = new jsPDF();
  const totalProduced = works.reduce((sum, w) => sum + (w.total_price || 0), 0);
  const artistShare = (totalProduced * artist.commission_percentage) / 100;

  // Estilo del PDF
  doc.setFontSize(20);
  doc.text('APOLO INK - LIQUIDACIÓN', 14, 22);
  doc.setFontSize(10);
  doc.text(`Artista: ${artist.name.toUpperCase()}`, 14, 32);
  doc.text(`Periodo: ${monthName}`, 14, 38);

  // Tabla de trabajos
  autoTable(doc, {
    startY: 45,
    head: [['Fecha', 'Cliente', 'Monto Total', 'Comisión']],
    body: works.map(w => [
      new Date(w.created_at).toLocaleDateString(),
      w.client_name || 'N/A',
      formatterCOP.format(w.total_price),
      `${artist.commission_percentage}%`
    ]),
    foot: [[
      '', 
      'TOTAL A PAGAR:', 
      '', 
      formatterCOP.format(artistShare)
    ]],
    theme: 'striped',
    // Solución al error 'fillStyle': la propiedad correcta es fillColor
    headStyles: { fillColor: [20, 20, 20] } 
  });

  // Guardar PDF
  doc.save(`Liquidacion_${artist.name}_${monthName}.pdf`);
};

export const sendWhatsAppSummary = (artist: Artist, works: Work[], monthName: string) => {
  const totalProduced = works.reduce((sum, w) => sum + (w.total_price || 0), 0);
  const artistShare = (totalProduced * artist.commission_percentage) / 100;
  
  const message = `*APOLO INK - RESUMEN MENSUAL*%0A` +
    `--------------------------------%0A` +
    `*Artista:* ${artist.name}%0A` +
    `*Mes:* ${monthName}%0A` +
    `*Tatuajes realizados:* ${works.length}%0A` +
    `*Total Producido:* ${formatterCOP.format(totalProduced)}%0A` +
    `*Tu Ganancia (${artist.commission_percentage}%):* ${formatterCOP.format(artistShare)}%0A` +
    `--------------------------------%0A` +
    `Pasa por el estudio para tu liquidación. ¡Buen trabajo! 🖋️`;

  window.open(`https://wa.me/?text=${message}`, '_blank');
};

//documento para el contable
export const generateAccountingReport = (
    works: Work[], 
    expenses: any[], 
    monthName: string,
    year: number
  ) => {
    // Encabezados del CSV
    let csvContent = "Fecha,Tipo,Categoría/Artista,Descripción,Ingreso (Haber),Egreso (Debe),Balance\n";
    
    let runningBalance = 0;
  
    // 1. Procesar Ingresos (Trabajos de Artistas)
    works.forEach(w => {
      const artistCommission = w.artist_profile?.commission_percentage || 50;
      const studioPart = (w.total_price * (100 - artistCommission)) / 100;
      runningBalance += studioPart;
  
      csvContent += `${new Date(w.created_at).toLocaleDateString()},INGRESO,${w.artist_profile?.name || 'Artista'},Tatuaje - Cliente: ${w.client_name || 'N/A'},${studioPart},0,${runningBalance}\n`;
    });
  
    // 2. Procesar Egresos (Gastos del Local)
    expenses.forEach(e => {
      runningBalance -= e.amount;
      csvContent += `${new Date(e.date).toLocaleDateString()},EGRESO,${e.category || 'Gasto'},${e.description},0,${e.amount},${runningBalance}\n`;
    });
  
    // Crear el archivo y disparar la descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Contador_ApoloInk_${monthName}_${year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };