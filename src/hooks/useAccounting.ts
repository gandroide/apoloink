import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Interfaz para el perfil del artista
export interface Artist {
  id: string;
  name: string;
  commission_percentage: number;
  type: 'residente' | 'invitado';
  max_canvases: number; // Nueva propiedad para control de lienzos
}

// Interfaz para cada trabajo/tatuaje
export interface Work {
  id: string;
  client_name: string;
  total_price: number;
  created_at: string;
  artist_id: string;
  is_canvas: boolean; // Nueva propiedad para identificar cortesías
  artist_profile?: Artist;
}

export const useAccounting = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWorks = useCallback(async (month?: number, year?: number) => {
    setLoading(true);
    try {
      let query = supabase
        .from('artist_works')
        .select(`
          *,
          artist_profile (
            id,
            name,
            commission_percentage,
            type,
            max_canvases
          )
        `);

      // Filtrado por fecha si se proporcionan parámetros
      if (month !== undefined && year !== undefined) {
        const startDate = new Date(year, month, 1).toISOString();
        const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }

      const { data: worksData, error: worksError } = await query.order('created_at', { ascending: false });
      if (worksError) throw worksError;

      const { data: artistsData, error: artistsError } = await supabase
        .from('artist_profile')
        .select('*')
        .order('name', { ascending: true });
      if (artistsError) throw artistsError;

      setWorks(worksData || []);
      setArtists(artistsData || []);
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
    is_canvas: boolean; // Ahora permitimos registrar si es lienzo
  }) => {
    const { error } = await supabase.from('artist_works').insert([workData]);
    if (error) return { success: false, error };
    return { success: true };
  };

  return { works, artists, loading, fetchWorks, registerWork };
};