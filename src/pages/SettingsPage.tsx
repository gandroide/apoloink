import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  // AHORA incluimos 'subscription' en los tabs permitidos
  const [activeTab, setActiveTab] = useState<'studio' | 'subscription' | 'profile' | 'security'>('studio');
  const { user } = useAuth();
  
  // Estados para datos de estudio
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [studioId, setStudioId] = useState<string | null>(null);
  
  // Inputs del formulario
  const [studioName, setStudioName] = useState('');
  const [studioPhone, setStudioPhone] = useState('');
  const [studioAddress, setStudioAddress] = useState('');
  
  // Feedback visual
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // --- DATOS MOCKUP DE PLANES (Para visualizar) ---
  const plans = [
    {
      id: 'free',
      name: 'Starter',
      price: '0€',
      period: '/mes',
      features: ['1 Artista', 'Gestión de Citas Básica', 'Inventario Limitado'],
      current: true, // Simulamos que este es el plan actual
      color: 'border-[var(--brand-border)]'
    },
    {
      id: 'pro',
      name: 'Studio Pro',
      price: '29€',
      period: '/mes',
      features: ['Hasta 5 Artistas', 'Inventario Avanzado', 'Reportes Financieros', 'Soporte Prioritario'],
      current: false,
      popular: true,
      color: 'border-[var(--brand-accent)] shadow-[0_0_30px_rgba(16,185,129,0.15)]'
    },
    {
      id: 'agency',
      name: 'Unlimited',
      price: '99€',
      period: '/mes',
      features: ['Artistas Ilimitados', 'Multi-Sede', 'API Access', 'Account Manager'],
      current: false,
      color: 'border-[var(--brand-border)]'
    }
  ];

  // 1. CARGAR DATOS AL ENTRAR
  useEffect(() => {
    if (user) getStudioData();
  }, [user]);

  const getStudioData = async () => {
    try {
      setInitialLoading(true);
      
      const { data: memberData, error: memberError } = await supabase
        .from('studio_members')
        .select('studio_id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (memberError) throw memberError;
      if (!memberData) throw new Error("No tienes un estudio asignado");

      setStudioId(memberData.studio_id);

      const { data: studioData, error: studioError } = await supabase
        .from('studios')
        .select('*')
        .eq('id', memberData.studio_id)
        .single();

      if (studioError) throw studioError;

      if (studioData) {
        setStudioName(studioData.name || '');
        setStudioPhone(studioData.phone || ''); 
        setStudioAddress(studioData.address || ''); 
      }

    } catch (error: any) {
      console.error('Error cargando estudio:', error.message);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSaveStudio = async () => {
    if (!studioId) return;
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('studios')
        .update({
          name: studioName,
          phone: studioPhone,
          address: studioAddress
        })
        .eq('id', studioId);

      if (error) throw error;
      setMessage({ text: 'Cambios guardados correctamente', type: 'success' });
      setTimeout(() => setMessage(null), 3000);

    } catch (error: any) {
      console.error('Error actualizando:', error);
      setMessage({ text: 'Error al guardar: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* --- ENCABEZADO --- */}
      <div>
        <h1 className="text-3xl font-black text-[var(--brand-primary)] tracking-tight italic uppercase">
          Configuración
        </h1>
        <p className="text-[var(--brand-text-muted)] mt-2">Gestiona tu estudio, suscripción y seguridad.</p>
      </div>

      {/* --- PESTAÑAS (Scrollable en móvil) --- */}
      <div className="flex gap-8 border-b border-[var(--brand-border)] pb-1 overflow-x-auto scrollbar-hide">
        {[
          { id: 'studio', label: 'MI ESTUDIO', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg> },
          { id: 'subscription', label: 'SUSCRIPCIÓN', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg> }, // NUEVO TAB
          { id: 'profile', label: 'PERFIL', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
          { id: 'security', label: 'SEGURIDAD', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-xs font-black tracking-widest uppercase transition-all relative flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id ? 'text-[var(--brand-accent)]' : 'text-[var(--brand-text-muted)] hover:text-[var(--brand-primary)]'
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--brand-accent)] shadow-[0_0_10px_var(--brand-accent)]" />
            )}
          </button>
        ))}
      </div>

      {/* --- CONTENIDO --- */}
      <div className="grid gap-6">
        
        {/* === TAB: ESTUDIO === */}
        {activeTab === 'studio' && (
          <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-8 rounded-2xl shadow-xl relative overflow-hidden">
             {/* Loading Overlay */}
             {initialLoading && (
                <div className="absolute inset-0 bg-[var(--brand-surface)] z-10 flex items-center justify-center">
                    <div className="text-[var(--brand-text-muted)] animate-pulse text-xs font-bold uppercase tracking-widest">Cargando...</div>
                </div>
            )}
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-accent)]/10 flex items-center justify-center text-[var(--brand-accent)] border border-[var(--brand-accent)]/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--brand-primary)] uppercase tracking-wide">Información del Estudio</h2>
                <p className="text-sm text-[var(--brand-text-muted)]">Estos datos aparecerán en tus facturas.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--brand-text-muted)] uppercase tracking-wider">Nombre del Estudio</label>
                <input type="text" value={studioName} onChange={(e) => setStudioName(e.target.value)} placeholder="Ej. Ink Master Studio" className="w-full bg-[#0a0a0a] border border-[var(--brand-border)] rounded-xl px-4 py-3 text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--brand-text-muted)] uppercase tracking-wider">Teléfono</label>
                <input type="text" value={studioPhone} onChange={(e) => setStudioPhone(e.target.value)} placeholder="+34 600 000 000" className="w-full bg-[#0a0a0a] border border-[var(--brand-border)] rounded-xl px-4 py-3 text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] transition-all" />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-[var(--brand-text-muted)] uppercase tracking-wider">Dirección</label>
                <input type="text" value={studioAddress} onChange={(e) => setStudioAddress(e.target.value)} placeholder="Calle Principal 123" className="w-full bg-[#0a0a0a] border border-[var(--brand-border)] rounded-xl px-4 py-3 text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] transition-all" />
              </div>
            </div>
            
            {message && (
              <div className={`mt-6 p-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                 {message.text}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button onClick={handleSaveStudio} disabled={loading} className="bg-[var(--brand-accent)] hover:opacity-90 text-black font-black uppercase tracking-wider py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(var(--brand-accent),0.3)] disabled:opacity-50 active:scale-95">
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        )}

        {/* === TAB: SUSCRIPCIÓN (NUEVO) === */}
        {activeTab === 'subscription' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-500">
            
            {/* 1. Tarjeta de Estado Actual */}
            <div className="bg-gradient-to-r from-[var(--brand-accent)]/10 to-transparent border border-[var(--brand-accent)]/30 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[var(--brand-accent)] rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(var(--brand-accent),0.5)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--brand-accent)] uppercase tracking-wider mb-1">Tu Plan Actual</p>
                        <h2 className="text-2xl font-black text-white italic">STARTER FREE</h2>
                        <p className="text-sm text-[var(--brand-text-muted)]">Próxima renovación: <span className="text-white">Gratis de por vida</span></p>
                    </div>
                </div>
                <button className="bg-[var(--brand-surface)] border border-[var(--brand-border)] hover:border-[var(--brand-primary)] text-white font-bold py-3 px-6 rounded-xl transition-all">
                    Gestionar Facturación
                </button>
            </div>

            {/* 2. Grid de Planes */}
            <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className={`bg-[var(--brand-surface)] border rounded-2xl p-6 relative flex flex-col transition-transform hover:scale-[1.02] duration-300 ${plan.color}`}>
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--brand-accent)] text-black text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-lg">
                                Más Popular
                            </div>
                        )}
                        
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-[var(--brand-primary)] uppercase">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-3xl font-black text-white">{plan.price}</span>
                                <span className="text-sm text-[var(--brand-text-muted)]">{plan.period}</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-[var(--brand-text-muted)]">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.current ? 'bg-white/10 text-white' : 'bg-[var(--brand-accent)]/20 text-[var(--brand-accent)]'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button 
                            disabled={plan.current}
                            className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
                                plan.current 
                                ? 'bg-[#0a0a0a] text-[var(--brand-text-muted)] cursor-default border border-[var(--brand-border)]' 
                                : plan.popular 
                                    ? 'bg-[var(--brand-accent)] text-black hover:opacity-90 shadow-[0_0_15px_rgba(var(--brand-accent),0.3)]' 
                                    : 'bg-white text-black hover:bg-gray-200'
                            }`}
                        >
                            {plan.current ? 'Plan Actual' : 'Seleccionar Plan'}
                        </button>
                    </div>
                ))}
            </div>

            {/* 3. Placeholder de Historial */}
            <div className="pt-8 border-t border-[var(--brand-border)]">
                <h3 className="text-sm font-bold text-[var(--brand-text-muted)] uppercase tracking-wider mb-4">Historial de Facturas</h3>
                <div className="bg-[#0a0a0a] border border-[var(--brand-border)] rounded-xl p-8 text-center">
                    <p className="text-[var(--brand-text-muted)] text-sm">No hay facturas disponibles todavía.</p>
                </div>
            </div>

          </div>
        )}

        {/* === OTROS TABS (Profile/Security) === */}
        {(activeTab === 'profile' || activeTab === 'security') && (
           <div className="text-center py-20 bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-2xl border-dashed">
              <div className="w-16 h-16 bg-[var(--brand-bg)] rounded-full flex items-center justify-center mx-auto text-[var(--brand-text-muted)] mb-4">
                 {activeTab === 'profile' 
                    ? <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> 
                    : <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                 }
              </div>
              <h3 className="text-xl font-bold text-[var(--brand-primary)]">Próximamente</h3>
              <p className="text-[var(--brand-text-muted)] mt-2">Esta sección está en construcción.</p>
           </div>
        )}

      </div>
    </div>
  );
}