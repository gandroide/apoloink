import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, ArrowRight, BarChart3, Users, 
  Package, Clock, ShieldCheck, Zap, ChevronDown, 
  Menu, X, Instagram, Mail
} from 'lucide-react';
import { useState } from 'react';
// IMPORTANTE: Importamos el componente gráfico que creamos
import { LandingDashboard } from '../components/LandingDashboard';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">
              AXIS<span className="text-emerald-500">.ops</span>
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-gray-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Soluciones</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Precios</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">FAQ</button>
            <button 
              onClick={() => navigate('/login')} 
              className="text-white hover:text-emerald-400 transition-colors"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => navigate('/signup')} 
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Prueba Gratis
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-black border-b border-white/10 p-6 flex flex-col gap-6 text-center animate-in slide-in-from-top-5">
            <button onClick={() => scrollToSection('features')} className="text-gray-400 font-bold uppercase">Soluciones</button>
            <button onClick={() => scrollToSection('pricing')} className="text-gray-400 font-bold uppercase">Precios</button>
            <button onClick={() => navigate('/login')} className="text-white font-bold uppercase">Login</button>
            <button onClick={() => navigate('/signup')} className="bg-emerald-500 text-black font-bold uppercase py-3 rounded-lg">Comenzar Ahora</button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] -z-10 opacity-30 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
            Nuevo sistema v2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tight leading-tight">
            Deja de perder dinero por <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              no saber cuánto ganas
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            El software que convierte tu estudio de tatuajes en un negocio organizado. Calcula comisiones, controla inventario y toma decisiones con datos reales.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-black font-bold text-lg px-8 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-2"
            >
              Probar Gratis 30 Días <ArrowRight size={20} />
            </button>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">No requiere tarjeta de crédito</p>
          </div>

          {/* VISUAL DASHBOARD MOCKUP (ACTUALIZADO) */}
          <div className="mt-16 relative mx-auto max-w-5xl z-10">
            {/* Aquí integramos el componente gráfico SVG */}
            <LandingDashboard />
            
            {/* Gradiente inferior para que se funda con el fondo negro */}
            <div className="absolute -bottom-10 left-0 right-0 h-40 bg-gradient-to-t from-black via-black to-transparent z-20 pointer-events-none" />
          </div>

        </div>
      </section>

      {/* --- SECCIÓN DE PROBLEMAS --- */}
      <section className="py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Te identificas con esto?</h2>
            <p className="text-gray-400">La realidad de gestionar un estudio sin las herramientas correctas.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="text-red-400" size={32} />,
                title: "Caos con las Comisiones",
                desc: "Llevas Excel, cuadernos o notas. Al cierre de mes pasas horas sumando y restando, con miedo a equivocarte en los pagos."
              },
              {
                icon: <Package className="text-orange-400" size={32} />,
                title: "Se acaban las tintas",
                desc: "Descubres que no hay negro en medio de una sesión. Pierdes ventas, tiempo y quedas mal con tus clientes."
              },
              {
                icon: <BarChart3 className="text-gray-400" size={32} />,
                title: "Ceguera Financiera",
                desc: "Entra mucho dinero pero no sabes cuánto te queda realmente después de pagar a los artistas, insumos y el arriendo."
              }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-2xl hover:border-white/10 transition-colors">
                <div className="mb-6 p-4 bg-white/5 rounded-xl inline-block">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SOLUCIÓN (Alternating Features) --- */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          
          {/* Feature 1: Comisiones */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
               <div className="relative bg-[#111] border border-white/10 rounded-2xl aspect-[4/3] flex items-center justify-center overflow-hidden">
                  <div className="text-center">
                    <p className="text-emerald-400 font-mono text-xs mb-2">CALCULANDO...</p>
                    <div className="text-4xl font-black text-white">60% / 40%</div>
                    <p className="text-gray-500 text-xs mt-2">Automático</p>
                  </div>
               </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 mb-4">
                <Zap />
              </div>
              <h3 className="text-3xl font-bold">Comisiones Automáticas en Segundos</h3>
              <p className="text-gray-400 text-lg">
                Registra el trabajo en 30 segundos y el sistema calcula instantáneamente cuánto es para el artista y cuánto para el estudio.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle size={16} className="text-emerald-500"/> Configura % personalizados por artista</li>
                <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle size={16} className="text-emerald-500"/> Reportes listos para enviar por WhatsApp</li>
                <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle size={16} className="text-emerald-500"/> Ahorra 3+ horas al mes en cálculos</li>
              </ul>
            </div>
          </div>

          {/* Feature 2: Inventario */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-4">
                <Package />
              </div>
              <h3 className="text-3xl font-bold">Inventario Inteligente que te Avisa</h3>
              <p className="text-gray-400 text-lg">
                Lista visual de todo tu stock en tiempo real. Usa códigos QR para descontar material al instante.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle size={16} className="text-blue-500"/> Alertas de Stock Bajo automáticas</li>
                <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle size={16} className="text-blue-500"/> Escáner de productos integrado</li>
                <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle size={16} className="text-blue-500"/> Evita pérdidas y robos hormiga</li>
              </ul>
            </div>
            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
               <div className="relative bg-[#111] border border-white/10 rounded-2xl aspect-[4/3] flex items-center justify-center">
                  <div className="text-center space-y-4">
                     <div className="flex gap-2 justify-center">
                        <div className="w-16 h-16 bg-white/5 rounded-lg border border-red-500/50 flex items-center justify-center text-xs text-red-500">AGUJAS<br/>BAJO</div>
                        <div className="w-16 h-16 bg-white/5 rounded-lg border border-green-500/50 flex items-center justify-center text-xs text-green-500">TINTA<br/>OK</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- VALUE PROPOSITION --- */}
      <section className="py-24 bg-gradient-to-b from-[#050505] to-black border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-16">Invierte $99.000, recupera mucho más</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="text-5xl font-black text-white mb-2">5h</div>
              <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4">Tiempo Ahorrado</p>
              <p className="text-gray-400 text-sm">Al mes en cálculos manuales y reportes. Tu tiempo vale dinero.</p>
            </div>
            <div className="p-6 border-x border-white/5">
              <div className="text-5xl font-black text-white mb-2">-15%</div>
              <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4">Menos Pérdidas</p>
              <p className="text-gray-400 text-sm">Controla el desperdicio de insumos y evita compras de emergencia caras.</p>
            </div>
            <div className="p-6">
              <div className="text-5xl font-black text-white mb-2">+20%</div>
              <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4">Rentabilidad</p>
              <p className="text-gray-400 text-sm">Toma decisiones basadas en qué artistas y servicios son más rentables.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Elige el plan para tu estudio</h2>
            <p className="text-gray-400">Todos incluyen 30 días de prueba gratis. Sin compromisos.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <div className="text-3xl font-black text-white mb-6">99.000<span className="text-sm font-normal text-gray-500">/mes</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle size={14} className="text-gray-500"/> Hasta 3 Artistas</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle size={14} className="text-gray-500"/> Inventario Básico</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle size={14} className="text-gray-500"/> Reportes Ilimitados</li>
              </ul>
              <button onClick={() => navigate('/signup')} className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/5 font-bold transition-colors">Empezar Gratis</button>
            </div>

            {/* Pro */}
            <div className="bg-[#111] border border-emerald-500/50 rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black text-xs font-black uppercase tracking-widest py-1 px-4 rounded-full">Más Popular</div>
              <h3 className="text-xl font-bold mb-2 text-emerald-400">Professional</h3>
              <div className="text-3xl font-black text-white mb-6">179.000<span className="text-sm font-normal text-gray-500">/mes</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-white"><CheckCircle size={14} className="text-emerald-500"/> <strong>Hasta 8 Artistas</strong></li>
                <li className="flex items-center gap-3 text-sm text-white"><CheckCircle size={14} className="text-emerald-500"/> Inventario Ilimitado</li>
                <li className="flex items-center gap-3 text-sm text-white"><CheckCircle size={14} className="text-emerald-500"/> Dashboard Avanzado</li>
                <li className="flex items-center gap-3 text-sm text-white"><CheckCircle size={14} className="text-emerald-500"/> Soporte Prioritario</li>
              </ul>
              <button onClick={() => navigate('/signup')} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-colors">Prueba 30 Días Gratis</button>
            </div>

            {/* Enterprise */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <div className="text-3xl font-black text-white mb-6">299.000<span className="text-sm font-normal text-gray-500">/mes</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle size={14} className="text-gray-500"/> Artistas Ilimitados</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle size={14} className="text-gray-500"/> Multi-Sede</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle size={14} className="text-gray-500"/> Reportes Personalizados</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle size={14} className="text-gray-500"/> Onboarding 1 a 1</li>
              </ul>
              <button className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/5 font-bold transition-colors">Contactar Ventas</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="py-24 bg-[#050505]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: "¿Necesito ser experto en tecnología?", a: "No. Si sabes usar WhatsApp, puedes usar AXIS.ops. Es intuitivo y diseñado para personas ocupadas, no para ingenieros." },
              { q: "¿Qué pasa con mis datos si cancelo?", a: "Tus datos son tuyos. Puedes exportar todos tus reportes en PDF y Excel antes de cancelar tu suscripción." },
              { q: "¿Funciona en el celular?", a: "Sí. Es 100% responsive. Puedes registrar trabajos desde tu celular mientras estás en el estudio o ver el dashboard desde tu casa." },
              { q: "¿Puedo probarlo sin pagar?", a: "Totalmente. Tienes 30 días de acceso completo totalmente gratis. No te pediremos tarjeta de crédito para empezar." },
              { q: "¿Y si tengo artistas con comisiones diferentes?", a: "Sin problema. Puedes configurar que Juan gane el 50% y María el 60%. El sistema hará el cálculo automático correcto para cada uno." }
            ].map((faq, i) => (
              <div key={i} className="border border-white/10 rounded-xl bg-[#0a0a0a] overflow-hidden">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-gray-200">{faq.q}</span>
                  <ChevronDown className={`transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 -z-10" />
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tight">
            Empieza a organizar tu estudio hoy
          </h2>
          <p className="text-xl text-gray-400">
            Únete a los estudios de tatuajes que ya están profesionalizando su gestión.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg px-12 py-4 rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              Crear Cuenta Gratis
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 pt-4">
             <span className="flex items-center gap-2"><ShieldCheck size={16}/> Datos Seguros</span>
             <span className="flex items-center gap-2"><Clock size={16}/> Soporte 24/7</span>
             <span className="flex items-center gap-2"><Zap size={16}/> Cancelación Flexible</span>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-white/10 bg-black text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 AXIS.ops. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Contacto</a>
          </div>
          <div className="flex gap-4">
             <Instagram size={18} className="hover:text-emerald-400 cursor-pointer" />
             <Mail size={18} className="hover:text-emerald-400 cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}