import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Mapa de configuraciones regionales
const LOCALE_MAP: Record<string, string> = {
  'COP': 'es-CO', // Colombia
  'USD': 'en-US', // Estados Unidos
  'EUR': 'es-ES', // Europa (España)
  'MXN': 'es-MX', // Mexico
};

export const useCurrency = () => {
  const [currency, setCurrency] = useState('COP');
  const [loading, setLoading] = useState(true);

  // Cargar preferencia al iniciar
  useEffect(() => {
    const loadCurrency = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('currency')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data?.currency) {
          setCurrency(data.currency);
        }
      }
      setLoading(false);
    };
    loadCurrency();
  }, []);

  // Función para formatear dinero
  const format = useCallback((amount: number) => {
    const locale = LOCALE_MAP[currency] || 'es-CO';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0, // Sin decimales para COP/MXN generalmente
      maximumFractionDigits: 0, 
    }).format(amount);
  }, [currency]);

  // Función para actualizar la moneda
  const updateCurrency = async (newCurrency: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ currency: newCurrency })
      .eq('id', user.id);

    if (!error) {
      setCurrency(newCurrency);
    }
  };

  return { currency, format, updateCurrency, loading };
};