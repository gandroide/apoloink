import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../hooks/useCurrency';
import { 
  Store, Shield, CreditCard, Lock, User,
  AlertTriangle, CheckCircle, Eye, EyeOff, Save, Globe 
} from 'lucide-react';

export default function SettingsPage() {
  // Hook de moneda
  const { currency, updateCurrency } = useCurrency();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'security'>('profile');
  const { user } = useAuth();
  
  // --- ESTADOS DE LOGICA ---
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [userRole, setUserRole] = useState<'owner' | 'independent' | null>(null);
  
  // Estado local para el selector de moneda
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  
  // --- ESTADOS DEL FORMULARIO ---
  const [targetId, setTargetId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // --- PASSWORD ---
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- PLANES ---
  const plans = [
    {
      id: 'free',
      name: 'Starter',
      price: '0',
      period: '/mes',
      features: ['1 Cuenta', 'Gestión de Citas', 'Inventario Básico'],
      current: true,
      color: 'border-[var(--brand-border)]'
    },
    {
      id: 'pro',
      name: 'Artist Pro',
      price: '15',
      period: '/mes',
      features: ['Estadísticas Avanzadas', 'Inventario Ilimitado', 'Exportar Contabilidad', 'Soporte Prioritario'],
      current: false,
      popular: true,
      color: 'border-[var(--brand-accent)] shadow-[0_0_30px_rgba(16,185,129,0.15)]'
    },
    {
      id: 'agency',
      name: 'Studio Master',
      price: '45',
      period: '/mes',
      features: ['Múltiples Artistas', 'Gestión de Comisiones', 'Control de Acceso', 'Multi-Sede'],
      current: false,
      color: 'border-[var(--brand-border)]'
    }
  ];

  // Sincronizar estado local de moneda cuando carga el hook
  useEffect(() => {
    setSelectedCurrency(currency);
  }, [currency]);

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      setInitialLoading(true);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (!profile) return;

      if (profile.type === 'owner' && profile.studio_id) {
          setUserRole('owner');
          const { data: studio } = await supabase
            .from('studios')
            .select('*')
            .eq('id', profile.studio_id)
            .single();
            
          if (studio) {
            setTargetId(studio.id);
            setFormData({
                name: studio.name || '',
                phone: studio.phone || '',
                address: studio.address || ''
            });
          }
      } else {
          setUserRole('independent');
          setTargetId(profile.id);
          setFormData({
              name: profile.name || '',
              phone: profile.phone || '',
              address: profile.address || ''
          });
      }

    } catch (error) {
      console.error('Error cargando configuración', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    if (!targetId) return;
    setLoading(true);
    setMessage(null);
    
    try {
      // 1. Guardar Moneda
      await updateCurrency(selectedCurrency);

      // 2. Guardar Datos Perfil/Estudio
      let error;
      if (userRole === 'owner') {
        const { error: err } = await supabase
            .from('studios')
            .update({ 
                name: formData.name, 
                phone: formData.phone, 
                address: formData.address 
            })
            .eq('id', targetId);
        error = err;
      } else {
        const { error: err } = await supabase
            .from('profiles')
            .update({ 
                name: formData.name, 
                phone: formData.phone, 
                address: formData.address 
            })
            .eq('id', targetId);
        error = err;
      }

      if (error) throw error;
      
      setMessage({ text: 'Información actualizada correctamente', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ text: 'Error: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: 'Mínimo 6 caracteres', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ text: 'Contraseña actualizada', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ text: 'Error: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 text-[var(--brand-primary)]">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-[var(--brand-primary)] tracking-tight italic uppercase">
          Configuración
        </h1>
        <p className="text-[var(--brand-primary)] opacity-60 mt-2">
            {userRole === 'independent' ? 'Gestiona tu marca personal.' : 'Gestiona tu estudio y cuenta.'}
        </p>
      </div>

      {/* PESTAÑAS */}
      <div className="flex gap-8 border-b border-[var(--brand-border)] pb-1 overflow-x-auto scrollbar-hide">
        {[
          { 
            id: 'profile', 
            label: userRole === 'independent' ? 'PERFIL PRO' : 'EL ESTUDIO', 
            icon: userRole === 'independent' ? <User size={16} /> : <Store size={16} /> 
          },
          { id: 'subscription', label: 'SUSCRIPCIÓN', icon: <CreditCard size={16} /> },
          { id: 'security', label: 'SEGURIDAD', icon: <Shield size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-xs font-black tracking-widest uppercase transition-all relative flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id ? 'text-[var(--brand-accent)]' : 'text-[var(--brand-primary)] opacity-60 hover:opacity-100'
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

      {/* CONTENIDO */}
      <div className="grid gap-6">
        
        {/* === TAB: PERFIL / ESTUDIO === */}
        {activeTab === 'profile' && (
          <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-8 rounded-2xl shadow-xl relative overflow-hidden">
             {initialLoading && (
                <div className="absolute inset-0 bg-[var(--brand-surface)] z-10 flex items-center justify-center">
                    <div className="text-[var(--brand-primary)] opacity-50 animate-pulse text-xs font-bold uppercase tracking-widest">Cargando...</div>
                </div>
            )}
            
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  userRole === 'independent' 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : 'bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] border-[var(--brand-accent)]/20'
              }`}>
                {userRole === 'independent' ? <User size={24} /> : <Store size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--brand-primary)] uppercase tracking-wide">
                    {userRole === 'independent' ? 'Información Profesional' : 'Información del Estudio'}
                </h2>
                <p className="text-sm text-[var(--brand-primary)] opacity-60">Estos datos aparecerán en tus reportes.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--brand-primary)] opacity-60 uppercase tracking-wider">
                    {userRole === 'independent' ? 'Nombre Artístico' : 'Nombre del Estudio'}
                </label>
                <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder={userRole === 'independent' ? "Ej. Gandroide" : "Ej. Studio Name"} 
                    className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-xl px-4 py-3 text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] transition-all placeholder:text-[var(--brand-primary)]/30 font-bold" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--brand-primary)] opacity-60 uppercase tracking-wider">Teléfono / WhatsApp</label>
                <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    placeholder="+34 600 000 000" 
                    className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-xl px-4 py-3 text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] transition-all placeholder:text-[var(--brand-primary)]/30 font-mono" 
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-[var(--brand-primary)] opacity-60 uppercase tracking-wider">
                    {userRole === 'independent' ? 'Ubicación / Ciudad' : 'Dirección Fiscal'}
                </label>
                <input 
                    type="text" 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                    placeholder={userRole === 'independent' ? "Ej. Lisboa, Portugal" : "Calle Principal 123"} 
                    className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-xl px-4 py-3 text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] transition-all placeholder:text-[var(--brand-primary)]/30" 
                />
              </div>

              {/* --- AQUÍ ESTÁ EL NUEVO SELECTOR DE MONEDA --- */}
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-[var(--brand-primary)] opacity-60 uppercase tracking-wider flex items-center gap-2">
                   <Globe size={12} /> Moneda Principal
                </label>
                <div className="relative">
                    <select 
                        className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-xl px-4 py-3 text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] transition-all appearance-none font-bold cursor-pointer"
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                    >
                        <option value="COP">🇨🇴 Peso Colombiano (COP)</option>
                        <option value="USD">🇺🇸 Dólar Estadounidense (USD)</option>
                        <option value="EUR">🇪🇺 Euro (EUR)</option>
                        <option value="MXN">🇲🇽 Peso Mexicano (MXN)</option>
                    </select>
                    {/* Flechita decorativa */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--brand-primary)] opacity-50">▼</div>
                </div>
                <p className="text-[9px] text-[var(--brand-primary)] opacity-40">Cambia la visualización de precios en toda la app.</p>
              </div>

            </div>
            
            {message && (
              <div className={`mt-6 p-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                 {message.text}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button onClick={handleSave} disabled={loading} className="bg-[var(--brand-accent)] hover:opacity-90 text-[var(--brand-bg)] font-black uppercase tracking-wider py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(var(--brand-accent),0.3)] disabled:opacity-50 active:scale-95 flex items-center gap-2">
                <Save size={16} />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        )}

        {/* === TAB: SUSCRIPCIÓN === */}
        {activeTab === 'subscription' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-500">
            
            <div className="bg-gradient-to-r from-[var(--brand-accent)]/10 to-transparent border border-[var(--brand-accent)]/30 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[var(--brand-accent)] rounded-full flex items-center justify-center text-[var(--brand-bg)] shadow-[0_0_20px_rgba(var(--brand-accent),0.5)]">
                        <CreditCard size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--brand-accent)] uppercase tracking-wider mb-1">Tu Plan Actual</p>
                        <h2 className="text-2xl font-black text-[var(--brand-primary)] italic uppercase">STARTER FREE</h2>
                        <p className="text-sm text-[var(--brand-primary)] opacity-60">Próxima renovación: <span className="text-[var(--brand-primary)] opacity-100 font-bold">Gratis de por vida</span></p>
                    </div>
                </div>
                <button className="bg-[var(--brand-surface)] border border-[var(--brand-border)] hover:border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold py-3 px-6 rounded-xl transition-all text-xs uppercase tracking-widest">
                    Gestionar Facturación
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className={`bg-[var(--brand-surface)] border rounded-2xl p-6 relative flex flex-col transition-transform hover:scale-[1.02] duration-300 ${plan.color}`}>
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--brand-accent)] text-[var(--brand-bg)] text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-lg">
                                Recomendado
                            </div>
                        )}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-[var(--brand-primary)] uppercase">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-3xl font-black text-[var(--brand-primary)]">
                                    {currency === 'COP' ? `$${parseInt(plan.price) * 4000}` : `${plan.price}€`}
                                </span>
                                <span className="text-sm text-[var(--brand-primary)] opacity-60">{plan.period}</span>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-[var(--brand-primary)] opacity-70">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.current ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]' : 'bg-[var(--brand-accent)]/20 text-[var(--brand-accent)]'}`}>
                                        <CheckCircle size={12} strokeWidth={3} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button disabled={plan.current} className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${plan.current ? 'bg-[var(--brand-bg)] text-[var(--brand-primary)] opacity-40 cursor-default border border-[var(--brand-border)]' : plan.popular ? 'bg-[var(--brand-accent)] text-[var(--brand-bg)] hover:opacity-90 shadow-[0_0_15px_rgba(var(--brand-accent),0.3)]' : 'bg-[var(--brand-primary)] text-[var(--brand-bg)] hover:opacity-90'}`}>{plan.current ? 'Plan Actual' : 'Seleccionar Plan'}</button>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* === TAB: SEGURIDAD === */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-500">
            <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] p-8 rounded-2xl shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-xl bg-[var(--brand-accent)]/10 flex items-center justify-center text-[var(--brand-accent)] border border-[var(--brand-accent)]/20">
                    <Lock size={24} />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-[var(--brand-primary)] uppercase tracking-wide">Contraseña</h2>
                    <p className="text-sm text-[var(--brand-primary)] opacity-60">Actualiza tu contraseña.</p>
                 </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-black text-[var(--brand-primary)] opacity-60 uppercase tracking-wider">Nueva Contraseña</label>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-xl px-4 py-3 text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-all placeholder:text-[var(--brand-primary)]/30"/>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-primary)] opacity-60 hover:opacity-100">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--brand-primary)] opacity-60 uppercase tracking-wider">Confirmar Contraseña</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" className="w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-xl px-4 py-3 text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-all placeholder:text-[var(--brand-primary)]/30"/>
                  </div>
              </div>
              {message && (
                  <div className={`mt-6 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    {message.text}
                  </div>
              )}
              <div className="mt-8 border-t border-[var(--brand-border)] pt-6 flex justify-end">
                  <button onClick={handleUpdatePassword} disabled={loading || !newPassword} className="bg-[var(--brand-primary)] text-[var(--brand-bg)] hover:opacity-90 font-black uppercase tracking-wider py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Actualizando...' : 'Actualizar Contraseña'}</button>
              </div>
            </div>
            <div className="border border-red-900/30 bg-red-500/5 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-500/10 rounded-lg text-red-500"><AlertTriangle size={24} /></div>
                    <div><h3 className="text-lg font-bold text-red-500">Zona de Peligro</h3><p className="text-sm text-[var(--brand-primary)] opacity-60 mt-1">Una vez eliminas tu cuenta, no hay vuelta atrás.</p></div>
                </div>
                <button className="whitespace-nowrap px-6 py-3 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold uppercase text-xs tracking-widest transition-all">Eliminar Cuenta</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}