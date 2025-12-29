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
      desc: "Descarga todas las facturas y gastos en formato CSV compatible con Excel. Tu contador recibirá la información procesada.",
      benefit: "Contabilidad simplificada."
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Seguridad RLS",
      desc: "Tus datos están blindados mediante Row Level Security. Solo el personal autorizado accede a las finanzas del estudio.",
      benefit: "Privacidad de nivel bancario."
    }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen animate-in fade-in duration-700 pb-32 px-4 md:px-10 text-left bg-brand-bg text-brand-primary">
      
      <header className="py-20 border-b border-brand-border mb-16">
        <h2 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter text-brand-primary leading-[0.8]">
          The Guide<span className="text-brand-accent">.</span>
        </h2>
        <p className="text-[10px] md:text-xs font-bold text-brand-muted uppercase tracking-[0.4em] mt-8 ml-1 max-w-2xl leading-relaxed">
          Diseñado para artistas que odian la administración. AXIS.ops es el puente inteligente entre el caos creativo y el orden empresarial.
        </p>
      </header>

      {/* Grid de Funcionalidades AXIS.ops */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        {features.map((f, i) => (
          <div key={i} className="bg-brand-surface border border-brand-border p-8 rounded-[3rem] hover:border-brand-accent/50 transition-all group">
            <div className="text-brand-muted group-hover:text-brand-accent transition-colors mb-6">
              {f.icon}
            </div>
            <h3 className="text-2xl font-black italic uppercase text-brand-primary tracking-tighter mb-4 leading-none">
              {f.title}
            </h3>
            <p className="text-brand-muted text-sm font-medium leading-relaxed mb-6">
              {f.desc}
            </p>
            <div className="pt-6 border-t border-brand-border">
              <p className="text-[9px] font-black text-brand-accent uppercase tracking-widest">
                Beneficio: {f.benefit}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* SECCIÓN COMPARATIVA: CAOS VS AXIS.OPS */}
      <section className="relative overflow-hidden rounded-[4rem] bg-brand-surface border border-brand-border shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Columna Caos */}
          <div className="p-12 md:p-20 border-b lg:border-b-0 lg:border-r border-brand-border bg-black/5">
            <h4 className="text-brand-muted text-[10px] font-black uppercase tracking-[0.5em] mb-4">Escenario A</h4>
            <h3 className="text-4xl font-black italic uppercase tracking-tighter text-brand-muted/50 mb-12">El Caos Manual</h3>
            
            <div className="space-y-8">
              {[
                "Te quedas sin stock crítico en mitad de un tatuaje porque nadie avisó.",
                "Pierdes horas cuadrando cuentas con el contador enviando fotos borrosas.",
                "Incertidumbre total sobre cuánto dinero real gana el estudio al mes.",
                "Estrés constante por no saber quién gastó qué material."
              ].map((text, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="mt-1 bg-brand-danger/10 p-1 rounded-full text-brand-danger">
                    <X size={16} strokeWidth={3} />
                  </div>
                  <p className="text-brand-muted font-bold text-sm uppercase tracking-tight leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Columna AXIS.ops */}
          <div className="p-12 md:p-20 bg-brand-primary relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-brand-bg/40 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Escenario B</h4>
              <h3 className="text-4xl font-black italic uppercase tracking-tighter text-brand-bg mb-12">AXIS.ops System</h3>
              
              <div className="space-y-8">
                {[
                  "Alertas automáticas de stock bajo para comprar con tiempo.",
                  "Archivos CSV listos para el contador. Se acabó el desorden.",
                  "Reportes PDF directos a tu WhatsApp cada cierre de semana.",
                  "Libertad mental absoluta para enfocarte en tu arte y fotografía."
                ].map((text, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="mt-1 bg-brand-bg p-1 rounded-full text-brand-primary">
                      <Check size={16} strokeWidth={4} />
                    </div>
                    <p className="text-brand-bg font-black text-sm uppercase tracking-tight leading-snug">{text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-16 pt-8 border-t border-brand-bg/10">
                <p className="text-[10px] font-black text-brand-bg uppercase tracking-[0.3em]">
                  La decisión es tuya: ¿Administras o creas?
                </p>
              </div>
            </div>
            
            {/* Marca de agua decorativa */}
            <div className="absolute right-[-5%] bottom-[-5%] text-[12rem] font-black italic text-brand-bg/5 select-none pointer-events-none tracking-tighter">
              AXIS
            </div>
          </div>

        </div>
      </section>

      <footer className="mt-24 text-center">
        <div className="h-1 w-20 bg-brand-border mx-auto mb-10"></div>
        <p className="text-brand-muted font-black uppercase text-[10px] tracking-[0.5em]">
          AXIS.ops — Business Intelligence System
        </p>
      </footer>
    </div>
  );
};