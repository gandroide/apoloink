import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Artist {
  id: string;
  name: string;
  commission_percentage: number;
}

export interface Work {
  id: string;
  client_name: string;
  total_price: number;
  created_at: string;
  artist_id: string;
  artist_profile?: Artist;
}

export const useAccounting = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWorks = useCallback(async () => {
    setLoading(true);
    try {
      const { data: worksData, error: worksError } = await supabase
        .from('artist_works')
        .select(`
          *,
          artist_profile (
            id,
            name,
            commission_percentage
          )
        `)
        .order('created_at', { ascending: false });

      if (worksError) throw worksError;

      const { data: artistsData, error: artistsError } = await supabase
        .from('artist_profile')
        .select('*')
        .order('name', { ascending: true });

      if (artistsError) throw artistsError;

      setWorks(worksData || []);
      setArtists(artistsData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ESTA ES LA FUNCIÓN QUE TE FALTABA:
  const registerWork = async (workData: { 
    artist_id: string; 
    total_price: number; 
    client_name: string; 
  }) => {
    const { error } = await supabase
      .from('artist_works')
      .insert([workData]);
    
    if (error) {
      console.error('Error al registrar:', error);
      return { success: false, error };
    }

    return { success: true };
  };

  return { 
    works, 
    artists, 
    loading, 
    fetchWorks, 
    registerWork // Asegúrate de que esté en el return
  };
};