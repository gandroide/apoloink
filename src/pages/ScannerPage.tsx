import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const ScannerPage = () => {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [itemName, setItemName] = useState('');

  // 1. SOLUCIÓN DEFINITIVA: REFRESH TOTAL
  const handleExitWithRefresh = async () => {
    // Intentamos apagar de forma cortés primero
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop().catch(() => {});
    }
    
    // REDIRECCIÓN CON REFRESH (Esto mata la cámara sí o sí)
    window.location.href = '/inventory';
  };

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    const start = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 15, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (decodedText.startsWith('apolo-inventory:')) {
              const itemId = decodedText.split(':')[1];
              // Si el escaneo es exitoso, procesamos y luego salimos con refresh
              await handleUpdateStock(itemId);
            }
          },
          () => {}
        );
      } catch (err) {
        console.error("Error al iniciar cámara:", err);
      }
    };

    start();

    return () => {
      // Limpieza preventiva si se navega por otros medios
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleUpdateStock = async (id: string) => {
    setStatus('loading');
    try {
      const { data: item } = await supabase
        .from('inventory')
        .select('name, total_stock')
        .eq('id', id)
        .single();

      if (item) {
        await supabase
          .from('inventory')
          .update({ total_stock: Math.max(0, item.total_stock - 1) })
          .eq('id', id);

        setItemName(item.name);
        setStatus('success');
        
        if (navigator.vibrate) navigator.vibrate(200);

        // Tras 2 segundos de mostrar el éxito, hacemos el refresh hacia el inventario
        setTimeout(() => {
          window.location.href = '/inventory';
        }, 2000);
      }
    } catch (e) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
        
        <header>
          <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Scanner<span className="text-zinc-800">.</span></h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-2 italic">Apolo Intel System</p>
        </header>

        <div className="relative overflow-hidden rounded-[3rem] border-2 border-zinc-800 bg-zinc-900/50 aspect-square flex items-center justify-center shadow-2xl">
          <div id="reader" className="w-full h-full object-cover"></div>
          
          {/* OVERLAYS DE ESTADO */}
          {status !== 'idle' && (
            <div className="absolute inset-0 bg-black/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8">
              {status === 'loading' && (
                <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full" />
              )}
              {status === 'success' && (
                <div className="animate-in zoom-in text-center">
                  <span className="text-6xl block mb-6">✅</span>
                  <p className="font-black text-2xl text-white uppercase leading-none">{itemName}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-4">Stock actualizado correctamente</p>
                </div>
              )}
              {status === 'error' && (
                <div className="text-red-500">
                  <span className="text-5xl block mb-4">⚠️</span>
                  <p className="font-black uppercase tracking-widest text-xs">Error de conexión</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-6">
          <button 
            onClick={handleExitWithRefresh}
            className="group flex flex-col items-center gap-4 mx-auto transition-all active:scale-95"
          >
            <div className="h-14 w-14 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-white group-hover:bg-zinc-900 transition-all">
               <span className="text-white text-xl">✕</span>
            </div>
            <p className="text-[10px] font-black text-zinc-600 group-hover:text-white uppercase tracking-[0.4em] transition-colors">
              Finalizar y Salir
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};