import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const StudioGuard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 1. Si todavía estamos cargando el usuario, esperamos.
    if (authLoading) return;

    // 2. Si no hay usuario, mandamos al login.
    if (!user) {
      navigate('/login');
      return;
    }

    const checkStudio = async () => {
      try {
        // 3. Preguntamos a la base de datos si tiene estudio
        const { data, error } = await supabase
          .from('studio_members')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        // Si hay error o el array está vacío, NO tiene estudio.
        if (error || !data || data.length === 0) {
          console.log("Usuario sin estudio, redirigiendo a Onboarding...");
          navigate('/onboarding');
        } else {
          // TIENE ESTUDIO: Dejamos de cargar y mostramos la app
          setIsChecking(false);
        }
      } catch (err) {
        console.error("Error verificando estudio:", err);
        navigate('/onboarding'); // Por seguridad
      }
    };

    checkStudio();
  }, [user, authLoading, navigate]);

  // === EL BLOQUEO VISUAL ===
  // Mientras "isChecking" sea true, mostramos pantalla negra.
  // ESTO ES LO QUE EVITA EL FLASH.
  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-500 font-bold text-xs uppercase tracking-[0.3em] animate-pulse">
          Cargando Espacio...
        </div>
      </div>
    );
  }

  // Si llegamos aquí, es seguro mostrar el Dashboard
  return <Outlet />;
};