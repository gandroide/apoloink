import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const ScannerPage = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [itemName, setItemName] = useState('');

  useEffect(() => {
    // Configuración del escáner
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        aspectRatio: 1.0
      }, 
      /* verbose= */ false
    );

    const onScanSuccess = async (decodedText: string) => {
      // Evitar escaneos múltiples seguidos
      if (status === 'loading' || status === 'success') return;

      // Verificamos que sea un código de Apolo
      if (decodedText.startsWith('apolo-inventory:')) {
        const itemId = decodedText.split(':')[1];
        setScanResult(itemId);
        handleUpdateStock(itemId);
        scanner.clear(); // Detener cámara tras éxito
      }
    };

    scanner.render(onScanSuccess, (err) => {
      // Errores de lectura silenciosos (mientras busca)
    });

    return () => {
      scanner.clear().catch(error => console.error("Error limpiando escáner", error));
    };
  }, [status]);

  const handleUpdateStock = async (id: string) => {
    setStatus('loading');
    try {
      // 1. Obtener el nombre y stock actual
      const { data: item, error: fetchError } = await supabase
        .from('inventory')
        .select('name, quantity')
        .eq('id', id)
        .single();

      if (fetchError || !item) throw new Error('Item no encontrado');
      setItemName(item.name);

      // 2. Restar 1 unidad
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: Math.max(0, item.quantity - 1) })
        .eq('id', id);

      if (updateError) throw updateError;

      setStatus('success');
      // Vibración de éxito (si el dispositivo lo permite)
      if (navigator.vibrate) navigator.vibrate(200);

      // Volver al inventario tras 2 segundos
      setTimeout(() => navigate('/inventory'), 2500);

    } catch (error) {
      console.error(error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      
      <div className="w-full max-w-md space-y-8">
        <header>
          <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Scanner<span className="text-zinc-800">.</span></h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-2">Buscando Código QR</p>
        </header>

        {/* CONTENEDOR DE LA CÁMARA */}
        <div className="relative overflow-hidden rounded-[3rem] border-2 border-zinc-800 bg-zinc-900/50 aspect-square">
          <div id="reader" className="w-full"></div>
          
          {/* Overlay de estado */}
          {status === 'loading' && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
              <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
            </div>
          )}

          {status === 'success' && (
            <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-black animate-in fade-in duration-300">
              <span className="text-6xl mb-4">✅</span>
              <p className="font-black uppercase tracking-tighter text-2xl">{itemName}</p>
              <p className="font-bold uppercase text-[10px] tracking-widest opacity-60">-1 UNIDAD RETIRADA</p>
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center text-white">
              <span className="text-6xl mb-4">❌</span>
              <p className="font-black uppercase">Código Inválido</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => navigate('/inventory')}
          className="text-[10px] font-black text-zinc-600 hover:text-white uppercase tracking-[0.3em] transition-colors"
        >
          ← Cancelar y volver
        </button>
      </div>
    </div>
  );
};