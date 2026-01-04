import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Interfaz para el perfil del artista (Ahora mapea a la tabla 'profiles')
export interface Artist {
  id: string;
  name: string;
  commission_percentage: number;
  type: 'residente' | 'invitado';
  is_active: boolean; 
  max_canvases?: number; 
}

// Interfaz para cada trabajo/tatuaje
export interface Work {
  id: string;
  client_name: string;
  total_price: number;
  created_at: string;
  artist_id: string;
  is_canvas: boolean;
  // NUEVO: Aquí definimos el campo para la "foto" histórica de la comisión
  snapshot_commission?: number; 
  // Mantenemos el nombre viejo aquí para no romper tus componentes visuales
  artist_profile?: Artist;
}

export const useAccounting = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWorks = useCallback(async (month?: number, year?: number) => {
    setLoading(true);
    try {
      // 1. Traemos los trabajos
      // El "*" traerá automáticamente la columna 'snapshot_commission' si existe en la BD
      let query = supabase
        .from('artist_works')
        .select(`
          *,
          artist_profile:profiles!artist_works_artist_id_fkey (
            id,
            name,
            commission_percentage,
            type,
            max_canvases,
            is_active
          )
        `);

      if (month !== undefined && year !== undefined) {
        const startDate = new Date(year, month, 1).toISOString();
        const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }

      const { data: worksData, error: worksError } = await query.order('created_at', { ascending: false });
      
      if (worksError) throw worksError;

      // 2. Traemos la lista completa de perfiles
      const { data: artistsData, error: artistsError } = await supabase
        .from('profiles') 
        .select('*')
        .order('name', { ascending: true });
        
      if (artistsError) throw artistsError;

      // Conversión de tipos segura
      setWorks((worksData as any) || []);
      setArtists((artistsData as any) || []);

    } catch (error) {
      console.error('Error en fetchWorks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const registerWork = async (workData: { 
    artist_id: string; 
    total_price: number; 
    client_name: string;
    is_canvas: boolean; 
    date?: string;
  }) => {
    // Al insertar, el Trigger de la base de datos se encargará de rellenar 'snapshot_commission'
    const { error } = await supabase.from('artist_works').insert([workData]);
    if (error) {
      console.error('Error al registrar trabajo:', error.message);
      return { success: false, error };
    }
    return { success: true };
  };

  return { works, artists, loading, fetchWorks, registerWork };
};