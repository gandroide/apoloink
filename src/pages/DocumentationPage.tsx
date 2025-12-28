import { 
    QrCode, 
    Zap, 
    ShieldCheck, 
    FileText, 
    Share2, 
    Table,
    Check,
    X
  } from 'lucide-react';
  
  export const DocumentationPage = () => {
    const features = [
      {
        icon: <QrCode className="w-8 h-8" />,
        title: "ADN Digital (QR)",
        desc: "Escanea y descuenta material en 0.5s. Precisión absoluta para que nunca te falte una aguja en mitad de una sesión.",
        benefit: "Cero errores de conteo."
      },
      {
        icon: <Zap className="w-8 h-8" />,
        title: "Pulso Realtime",
        desc: "El stock se actualiza solo en todas las pantallas. Si un artista saca algo en la bodega, tú lo ves en recepción al instante.",
        benefit: "Estudio 100% conectado."
      },
      {
        icon: <FileText className="w-8 h-8" />,
        title: "Reportes PDF",
        desc: "Genera cierres de caja y estados de inventario en PDF profesional con un solo click. Listos para archivar o presentar.",
        benefit: "Documentación impecable."
      },
      {
        icon: <Share2 className="w-8 h-8" />,
        title: "Envío por WhatsApp",
        desc: "Envía los reportes de ventas y stock directamente al móvil del dueño o del manager. Información al instante donde estés.",
        benefit: "Comunicación sin fricción."
      },
      {
        icon: <Table className="w-8 h-8" />,
        title: "Exportación CSV",
        desc: "Descarga todas las facturas y gastos en formato CSV compatible con Excel. Tu contador recibirá la información masticada y lista.",
        benefit: "Contabilidad simplificada."
      },
      {
        icon: <ShieldCheck className="w-8 h-8" />,
        title: "Seguridad RLS",
        desc: "Tus datos están blindados. Solo las personas autorizadas pueden ver las finanzas y el stock crítico del estudio.",
        benefit: "Privacidad de nivel bancario."
      }
    ];
  
    return (
      <div className="w-full max-w-[1400px] mx-auto min-h-screen animate-in fade-in duration-700 pb-32 px-4 md:px-10 text-left">
        
        <header className="py-20 border-b border-zinc-800/50 mb-16">
          <h2 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter text-white leading-[0.8]">
            The Guide<span className="text-zinc-700">.</span>
          </h2>
          <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mt-8 ml-1 max-w-2xl leading-relaxed">
            Diseñado para artistas que odian la administración. Apolo Intel System es el puente entre el caos creativo y el orden empresarial.
          </p>
        </header>
  
        {/* Grid de Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {features.map((f, i) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[3rem] hover:bg-zinc-900/70 transition-all group">
              <div className="text-zinc-700 group-hover:text-white transition-colors mb-6">
                {f.icon}
              </div>
              <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter mb-4 leading-none">
                {f.title}
              </h3>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-6">
                {f.desc}
              </p>
              <div className="pt-6 border-t border-zinc-800/50">
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                  Beneficio: {f.benefit}
                </p>
              </div>
            </div>
          ))}
        </div>
  
        {/* SECCIÓN REESTRUCTURADA: VIVIR CON APOLO VS CAOS */}
        <section className="relative overflow-hidden rounded-[4rem] bg-zinc-900 border border-zinc-800">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Columna Caos */}
            <div className="p-12 md:p-20 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-black/20">
              <h4 className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Escenario A</h4>
              <h3 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-500 mb-12">El Caos Manual</h3>
              
              <div className="space-y-8">
                {[
                  "Te quedas sin stock crítico en mitad de un tatuaje porque nadie avisó.",
                  "Pierdes horas cuadrando cuentas con el contador enviando fotos borrosas.",
                  "Incertidumbre total sobre cuánto dinero real gana el estudio al mes.",
                  "Estrés constante por no saber quién gastó qué material."
                ].map((text, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="mt-1 bg-red-500/10 p-1 rounded-full text-red-500">
                      <X size={16} strokeWidth={3} />
                    </div>
                    <p className="text-zinc-500 font-bold text-sm uppercase tracking-tight leading-snug">{text}</p>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Columna Apolo */}
            <div className="p-12 md:p-20 bg-white relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Escenario B</h4>
                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-black mb-12 text-shadow">Apolo Intel System</h3>
                
                <div className="space-y-8">
                  {[
                    "Alertas automáticas de stock bajo para comprar con tiempo.",
                    "Archivos CSV listos para el contador. Se acabó el desorden.",
                    "Reportes PDF directos a tu WhatsApp cada cierre de semana.",
                    "Libertad mental absoluta para enfocarte en tu arte y fotografía."
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="mt-1 bg-black p-1 rounded-full text-white">
                        <Check size={16} strokeWidth={4} />
                      </div>
                      <p className="text-black font-black text-sm uppercase tracking-tight leading-snug">{text}</p>
                    </div>
                  ))}
                </div>
  
                <div className="mt-16 pt-8 border-t border-black/10">
                  <p className="text-[10px] font-black text-black uppercase tracking-[0.3em]">
                    La decisión es tuya: ¿Administras o creas?
                  </p>
                </div>
              </div>
              
              {/* Marca de agua decorativa */}
              <div className="absolute right-[-5%] bottom-[-5%] text-[15rem] font-black italic text-black/5 select-none pointer-events-none tracking-tighter">
                APOLO
              </div>
            </div>
  
          </div>
        </section>
  
        <footer className="mt-24 text-center">
          <div className="h-1 w-20 bg-zinc-800 mx-auto mb-10"></div>
          <p className="text-zinc-600 font-black uppercase text-[10px] tracking-[0.5em]">Apolo Intel System — Powered by Ale</p>
        </footer>
      </div>
    );
  };