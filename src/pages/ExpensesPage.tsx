import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const ScannerPage = () => {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [itemName, setItemName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Inicializar el motor del escáner en el div con id "reader"
    scannerRef.current = new Html5Qrcode("reader");

    const startScanner = async () => {
      try {
        await scannerRef.current?.start(
          { facingMode: "environment" }, // Forzar cámara trasera del móvil
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            // Validamos que el código sea de nuestra app
            if (decodedText.startsWith('apolo-inventory:')) {
              const itemId = decodedText.split(':')[1];
              handleUpdateStock(itemId);
            }
          },
          () => { /* Error de escaneo silencioso mientras busca */ }
        );
      } catch (err) {
        console.error("Error al iniciar cámara:", err);
        setErrorMessage("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
      }
    };

    startScanner();

    // Limpieza al salir del componente
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().then(() => scannerRef.current?.clear());
      }
    };
  }, []);

  const handleUpdateStock = async (id: string) => {
    if (status !== 'idle') return;
    
    setStatus('loading');
    try {
      // Detener cámara inmediatamente para evitar lecturas dobles
      if (scannerRef.current?.isScanning) await scannerRef.current.stop();

      // 1. Obtener datos actuales del item
      const { data: item, error: fetchError } = await supabase
        .from('inventory')
        .select('name, total_stock')
        .eq('id', id)
        .single();

      if (fetchError || !item) throw new Error('Producto no registrado');
      setItemName(item.name);

      // 2. Restar 1 unidad (mínimo 0)
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ total_stock: Math.max(0, item.total_stock - 1) })
        .eq('id', id);

      if (updateError) throw updateError;

      setStatus('success');
      
      // Feedback táctil para el Ale del futuro usando el scanner en el estudio
      if (navigator.vibrate) navigator.vibrate(200);

      // Redirigir al almacén después de la confirmación visual
      setTimeout(() => navigate('/inventory'), 2500);

    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Error al actualizar");
      setStatus('error');
      
      // Reiniciar después de 3 segundos para permitir otro escaneo si falla
      setTimeout(() => {
        setStatus('idle');
        window.location.reload(); 
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      
      <div className="w-full max-w-md space-y-8">
        <header>
          <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Scanner<span className="text-zinc-800">.</span></h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-2 italic">Apolo Supply Intel</p>
        </header>

        {/* CONTENEDOR DE CÁMARA ESTILO MINIMALISTA */}
        <div className="relative overflow-hidden rounded-[4rem] border-2 border-zinc-800 bg-zinc-900/20 aspect-square flex items-center justify-center group">
          
          {/* Capa de la Cámara */}
          <div id="reader" className="w-full h-full object-cover"></div>
          
          {/* UI: Buscando (Scanline) */}
          {status === 'idle' && (
            <div className="absolute inset-0 pointer-events-none border-[20px] border-black/10">
              <div className="w-full h-[2px] bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.5)] absolute top-0 animate-[bounce_3s_infinite]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-64 h-64 border border-white/10 rounded-3xl"></div>
              </div>
            </div>
          )}

          {/* UI: Cargando */}
          {status === 'loading' && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center backdrop-blur-md z-20">
              <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full mb-4"></div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Sincronizando Nube...</p>
            </div>
          )}

          {/* UI: Éxito */}
          {status === 'success' && (
            <div className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-black z-30 animate-in zoom-in duration-300">
              <span className="text-7xl mb-4 animate-bounce">📦</span>
              <p className="font-black uppercase tracking-tighter text-3xl leading-none mb-2">{itemName}</p>
              <div className="bg-black text-white px-4 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">
                -1 Unidad de Stock
              </div>
            </div>
          )}

          {/* UI: Error */}
          {status === 'error' && (
            <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center text-white z-30">
              <span className="text-6xl mb-4">⚠️</span>
              <p className="font-black uppercase tracking-tighter text-xl">Fallo de Lectura</p>
              <p className="text-[9px] font-bold mt-2 opacity-80 uppercase tracking-widest">{errorMessage}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 items-center">
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest max-w-[200px]">
            Apunta la cámara al código QR impreso en el insumo
          </p>
          
          <button 
            onClick={() => navigate('/inventory')}
            className="group flex items-center gap-3 text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-[0.3em] transition-all"
          >
            <span className="group-hover:-translate-x-2 transition-transform">←</span> 
            Cancelar y Volver
          </button>
        </div>
      </div>
    </div>
  );
};