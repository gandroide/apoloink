import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const navigate = useNavigate();
  
  // Estados
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Estado para el mensaje de éxito (Solo si requiere confirmar email)
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    try {
      if (isRegistering) {
        // --- FLUJO DE REGISTRO ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // ANALIZAMOS QUÉ PASÓ:
        if (data.session) {
          // CASO A: Supabase inició sesión automáticamente (Auto-Login).
          // No mostramos alertas ni mensajes. Simplemente dejamos que el AuthContext
          // haga su trabajo y redirija al usuario a la App. ¡Cero Flash!
          // (No hacemos nada aquí, el useEffect del router detectará el usuario)
        } else {
          // CASO B: Supabase requiere confirmación de email.
          // Mostramos el mensaje de éxito bonito.
          setShowSuccess(true);
        }

      } else {
        // --- FLUJO DE LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Si es exitoso, el AuthContext redirigirá automáticamente.
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  // Si estamos en estado de éxito (esperando confirmación de email)
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-[var(--brand-accent)] rounded-full flex items-center justify-center mx-auto text-black text-4xl shadow-[0_0_20px_var(--brand-accent)] mb-6">
            📩
          </div>
          <h2 className="text-2xl font-black text-white italic uppercase mb-4">¡Revisa tu correo!</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            Hemos enviado un enlace de confirmación a <br/>
            <span className="text-white font-bold">{email}</span>.
          </p>
          <button 
            onClick={() => {
              setShowSuccess(false);
              setIsRegistering(false); // Volver al modo Login
              setPassword('');
            }}
            className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-zinc-200 transition-all"
          >
            Volver al Inicio de Sesión
          </button>
        </div>
      </div>
    );
  }

  // Render normal (Formulario)
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 relative overflow-hidden">
      {/* Fondo sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/20 to-black pointer-events-none" />

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500 relative z-10">
        
        <div className="text-center">
          <h1 className="text-6xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none">
            Axis<span className="text-zinc-800">.</span>
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.5em] mt-4">
            {isRegistering ? 'Configurar Acceso' : 'Sistema de Control'}
          </p>
        </div>

        <div className="bg-zinc-900/40 p-8 md:p-10 rounded-[3.5rem] border border-zinc-800/50 backdrop-blur-xl shadow-2xl">
          
          {/* Mensaje de Error Integrado (Sin Alert) */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs font-bold text-center mb-6 animate-pulse">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Email</label>
              <input 
                type="email"
                placeholder="tu@email.com"
                className="w-full bg-black/50 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-zinc-500 transition-all text-sm font-medium focus:bg-black/80"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-600 uppercase ml-2 tracking-widest">
                {isRegistering ? 'Crea una contraseña' : 'Contraseña'}
              </label>
              <input 
                type="password"
                placeholder="••••••••"
                className="w-full bg-black/50 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-zinc-500 transition-all text-sm font-medium focus:bg-black/80"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-white text-black py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 mt-4"
            >
              {loading ? 'PROCESANDO...' : isRegistering ? 'REGISTRARSE' : 'ENTRAR'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
            <button 
              type="button" // Importante para que no envíe el form
              onClick={() => {
                setIsRegistering(!isRegistering);
                setPassword('');
                setErrorMsg(null);
              }}
              className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
            >
              {isRegistering 
                ? '¿Ya tienes cuenta? Iniciar Sesión' 
                : '¿No tienes acceso? Registrarse'}
            </button>
          </div>
        </div>

        <p className="text-[9px] text-zinc-800 font-black uppercase tracking-[0.4em] italic text-center">
          AXIS ops Management • 2025
        </p>
      </div>
    </div>
  );
};