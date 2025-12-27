import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useAccounting = () => {
  const [loading, setLoading] = useState(false);
  const [works, setWorks] = useState<any[]>([]);

  // Función para registrar un nuevo trabajo
  const registerWork = async (workData: {
    artist_id: string;
    client_name: string;
    total_price: number;
    supplies_cost?: number;
  }) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('artist_works')
      .insert([workData]);
    setLoading(false);
    return { data, error };
  };
  const fetchWorks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('artist_works')
      .select(`
        *,
        artist_profile (name, commission_percentage)
      `) // Esto trae el trabajo Y los datos del artista al mismo tiempo
      .order('created_at', { ascending: false });
  
    if (!error) setWorks(data || []);
    setLoading(false);
  };

  // Aquí luego añadiremos: getTotalRevenue, getArtistPerformance, etc.

  return { registerWork, loading, fetchWorks, works };
};