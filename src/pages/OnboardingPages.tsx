import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Tipos de cuenta disponibles
type AccountType = 'business' | 'freelance' | null;

export const OnboardingPage = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Paso 1: Selección de Tipo
  const handleSelectType = (type: 'business' | 'freelance') => {
    setAccountType(type);
    setStep(2); 
  };

  // Función de Salida de Emergencia
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Paso 2: Creación en Base de Datos
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user || !accountType) return;

    setLoading(true);
    try {
      // 1. OBTENER EL PLAN (Si falla, usamos null para no bloquear el registro)
      const planCodname = accountType === 'business' ? 'studio_pro' : 'freelance_basic';
      const { data: planData } = await supabase
        .from('plans')
        .select('id')
        .eq('codname', planCodname)
        .maybeSingle();

      // 2. CREAR EL ESTUDIO (TENANT)
      // Incluso si es Freelance, creamos un "Estudio Personal" para mantener la lógica de datos unificada
      const { data: studioData, error: studioError } = await supabase
        .from('studios')
        .insert([
          { 
            name: name.trim(),
            type: accountType, // 'business' o 'freelance'
            owner_id: user.id 
          }
        ])
        .select()
        .single();

      if (studioError) throw studioError;

      // 3. CREAR LA MEMBRESÍA
      const { error: memberError } = await supabase
        .from('studio_members')
        .insert([
          {
            user_id: user.id,
            studio_id: studioData.id,
            role: 'owner'
          }
        ]);

      if (memberError) throw memberError;

      // 4. CREAR SUSCRIPCIÓN (Solo si encontramos el plan)
      if (planData) {
        await supabase.from('subscriptions').insert([
          {
            studio_id: studioData.id,
            plan_id: planData.id,
            status: 'active',
            valid_until: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
          }
        ]);
      }

      // --- CRÍTICO: ACTUALIZAR EL PERFIL DEL USUARIO ---
      // Esto conecta al usuario con su nuevo entorno
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
            name: name.trim(), // Actualizamos el nombre en el perfil también
            studio_id: studioData.id, // Vinculamos el estudio
            type: accountType === 'business' ? 'owner' : 'independent' // Definimos el rol visual
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 5. REDIRIGIR AL DASHBOARD
      window.location.href = '/'; 

    } catch (error: any) {
      console.error('Error creando cuenta:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* BOTÓN DE SALIDA DE EMERGENCIA */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={handleLogout}
          className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2"
        >
          <span>Cerrar Sesión</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        </button>
      </div>

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--brand-accent)] to-transparent opacity-50" />
      
      <div className="max-w-4xl w-full z-10">
        
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase">
            AXIS<span className="text-[var(--brand-accent)]">.ops</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-xs">
            Plataforma de Gestión Operativa
          </p>
        </div>

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-2xl font-bold text-center mb-10 text-white">¿Cómo trabajas actualmente?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => handleSelectType('business')}
                className="group relative bg-zinc-900/50 border border-zinc-800 hover:border-[var(--brand-accent)] p-10 rounded-[2.5rem] text-left transition-all hover:bg-zinc-900"
              >
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:bg-[var(--brand-accent)] group-hover:text-black transition-colors">
                  🏢
                </div>
                <h3 className="text-2xl font-black italic uppercase mb-2">Soy un Estudio</h3>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                  Tengo un local físico, gestiono un equipo de artistas y manejo inventario compartido.
                </p>
              </button>

              <button 
                onClick={() => handleSelectType('freelance')}
                className="group relative bg-zinc-900/50 border border-zinc-800 hover:border-purple-500 p-10 rounded-[2.5rem] text-left transition-all hover:bg-zinc-900"
              >
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  🎨
                </div>
                <h3 className="text-2xl font-black italic uppercase mb-2">Soy Independiente</h3>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                  Trabajo por mi cuenta (solo o guest), gestiono mis propios gastos y materiales.
                </p>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-md mx-auto animate-in zoom-in duration-300">
            <button 
              onClick={() => setStep(1)}
              className="mb-8 text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white flex items-center gap-2"
            >
              ← Volver atrás
            </button>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl">
              <h2 className="text-3xl font-black italic uppercase mb-2">
                {accountType === 'business' ? 'Crea tu Estudio' : 'Perfil de Artista'}
              </h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">
                {accountType === 'business' 
                  ? 'Configura tu espacio de trabajo empresarial' 
                  : 'Configura tu espacio personal'}
              </p>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-zinc-500 ml-2 tracking-widest">
                    {accountType === 'business' ? 'Nombre Comercial' : 'Tu Alias / Nombre Artístico'}
                  </label>
                  <input 
                    className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-white outline-none focus:border-[var(--brand-accent)] font-bold text-lg placeholder:text-zinc-800 transition-colors"
                    placeholder={accountType === 'business' ? "Ej: Ink Master Studio" : "Ej: Apolo Tattoo"}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--brand-primary)] text-black py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  {loading ? 'Configurando...' : 'Comenzar Ahora'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};