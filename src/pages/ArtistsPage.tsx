import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { IndependentArtistView } from './IndependenArtistView';
import { StudioTeamView } from './StudioTeamView';


export const ArtistsPage = () => {
  const [role, setRole] = useState<'owner' | 'independent' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      // Verificamos el perfil para saber qué es
      const { data: profile } = await supabase
        .from('profiles')
        .select('type') // Asegúrate que tu tabla profiles tenga 'type'
        .eq('id', user.id)
        .single();

      // Lógica de roles: 'owner' = Estudio, cualquier otro o null = Independiente (por defecto o lógica específica)
      // Ajusta 'independent' según lo que guardes en tu DB.
      if (profile?.type === 'residente' || profile?.type === 'independent') {
          setRole('independent');
      } else {
          setRole('owner'); // Por defecto asumimos Owner si no es residente/indep
      }
      setChecking(false);
    };

    checkUserRole();
  }, []);

  if (checking) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-700 font-black tracking-widest animate-pulse">AXIS.ops...</div>;

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen pb-24 px-4 md:px-10">
        {role === 'owner' ? (
            <StudioTeamView currentUserId={userId!} />
        ) : (
            <IndependentArtistView currentUserId={userId!} />
        )}
    </div>
  );
};