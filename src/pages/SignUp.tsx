import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ESTADO MÁGICO: Controla si mostramos el formulario o el mensaje de éxito
  const [showSuccess, setShowSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Crear usuario
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // 2. IMPORTANTE: No usamos alert() ni navigate().
      // Simplemente cambiamos el estado local para mostrar el mensaje de éxito.
      // Esto evita que el Router intente cargar el Dashboard de fondo.
      setShowSuccess(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        
        {/* === ESCENARIO 1: ÉXITO (Correo enviado) === */}
        {showSuccess ? (
          <div className="text-center space-y-6 py-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto text-4xl mb-4 text-white">
              📩
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase mb-2">¡Revisa tu correo!</h2>
              <p className="text-zinc-400 text-sm leading-relaxed px-4">
                Hemos enviado un enlace de confirmación a <br/>
                <span className="text-white font-bold">{email}</span>
              </p>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-6">
                Confirma tu cuenta antes de acceder
              </p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-white text-black font-black uppercase py-4 rounded-xl tracking-widest hover:bg-zinc-200 transition-all mt-4"
            >
              Volver al Login
            </button>
          </div>
        ) : (
          /* === ESCENARIO 2: FORMULARIO DE REGISTRO (Tu diseño original) === */
          <>
            <h2 className="text-3xl font-black text-white italic uppercase mb-2">Crear Cuenta</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-8">Comienza en AXIS.ops</p>
            
            {error && <div className="bg-red-900/20 text-red-500 p-3 rounded-xl text-xs mb-4 border border-red-900/30">{error}</div>}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black text-zinc-500 ml-2">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-white transition-colors"
                  placeholder="nombre@email.com"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-zinc-500 ml-2">Contraseña</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-white transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button 
                disabled={loading}
                className="w-full bg-white text-black font-black uppercase py-4 rounded-xl tracking-widest hover:bg-zinc-200 mt-4 disabled:opacity-50 transition-all active:scale-95"
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>

            <p className="mt-8 text-center text-zinc-500 text-xs">
              ¿Ya tienes cuenta? <Link to="/login" className="text-white font-bold underline hover:text-zinc-300">Inicia Sesión</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};