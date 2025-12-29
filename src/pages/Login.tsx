import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isRegistering) {
      // --- FLUJO DE REGISTRO ---
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
      } else {
        // ¡IMPORTANTE! Cerramos la sesión que Supabase abre por defecto
        await supabase.auth.signOut();
        
        alert('¡Registro exitoso! Ahora, por seguridad, ingresa tus credenciales para acceder.');
        
        // Limpiamos los campos y volvemos a la vista de Login
        setPassword('');
        setIsRegistering(false); 
      }
    } else {
      // --- FLUJO DE LOGIN ---
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) alert(error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        
        <div className="text-center">
          <h1 className="text-6xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none">
            Apolo<span className="text-zinc-800">.</span>
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.5em] mt-4">
            {isRegistering ? 'Configurar Acceso Nuevo' : 'Sistema de Control'}
          </p>
        </div>

        <div className="bg-zinc-900/40 p-8 md:p-10 rounded-[3.5rem] border border-zinc-800/50 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-600 uppercase ml-2 tracking-widest">Email</label>
              <input 
                type="email"
                placeholder="tu@email.com"
                className="w-full bg-black/50 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-zinc-500 transition-all text-sm font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-600 uppercase ml-2 tracking-widest">
                {isRegistering ? 'Crea una contraseña segura' : 'Contraseña'}
              </label>
              <input 
                type="password"
                placeholder="••••••••"
                className="w-full bg-black/50 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-zinc-500 transition-all text-sm font-medium"
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
              {loading ? 'PROCESANDO...' : isRegistering ? 'CONFIRMAR Y REGISTRAR' : 'ENTRAR AL SISTEMA'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setPassword('');
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