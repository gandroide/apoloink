import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir al dashboard tras 3 segundos
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-center p-4">
      <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
        ¡Email Verificado!
      </h1>
      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em] animate-pulse">
        Preparando tu espacio en AXIS.ops...
      </p>
    </div>
  );
};