import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../lib/supabase';

export const ScannerPage = () => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessing = useRef(false); // BLOQUEO DE SEGURIDAD CRÍTICO

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [itemName, setItemName] = useState('');

  const handleExitWithRefresh = () => {
    window.location.href = '/inventory';
  };

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    const start = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { 
            fps: 5, // Bajamos la velocidad de captura drásticamente para seguridad
            qrbox: { width: 250, height: 250 }
          },
          async (decodedText) => {
            // 1. BLOQUEO INMEDIATO (Si ya detectó una vez, ignora TODO lo demás)
            if (isProcessing.current) return;
            
            if (decodedText.startsWith('apolo-inventory:')) {
              isProcessing.current = true; // ACTIVAMOS EL FRENO
              
              const itemId = decodedText.split(':')[1];
              
              // 2. MATAMOS EL ESCÁNER FÍSICAMENTE ANTES DE PROCESAR
              if (scannerRef.current) {
                try {
                  await scannerRef.current.stop();
                  scannerRef.current.clear();
                  scannerRef.current = null; // Eliminamos la referencia
                } catch (e) {
                  console.warn("Scanner detenido preventivamente");
                }
              }
              
              handleUpdateStock(itemId);
            }
          },
          () => {}
        );
      } catch (err) {
        console.error(err);
      }
    };

    start();
    return () => { 
        if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().catch(() => {});
        }
    };
  }, []);

  const handleUpdateStock = async (id: string) => {
    setStatus('loading');
    try {
      // Obtenemos el nombre para el feedback visual
      const { data: item } = await supabase.from('inventory').select('name').eq('id', id).single();
      if (item) setItemName(item.name);

      // LLAMADA AL SQL QUE CREASTE (Solo resta 1 de forma segura)
      const { error: rpcError } = await supabase.rpc('decrement_inventory', { row_id: id });
      if (rpcError) throw rpcError;

      setStatus('success');
      if (navigator.vibrate) navigator.vibrate(200);

      // Volvemos al inventario rápido
      setTimeout(() => {
        handleExitWithRefresh();
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setStatus('error');
      // NO liberamos isProcessing para obligar a un refresh manual si algo falla
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
        <header>
          <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter italic">Scanner<span className="text-zinc-800">.</span></h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-2 italic">Apolo Intel System</p>
        </header>

        <div className="relative overflow-hidden rounded-[3rem] border-2 border-zinc-800 bg-zinc-900/50 aspect-square flex items-center justify-center shadow-2xl">
          <div id="reader" className="w-full h-full object-cover"></div>
          
          {status !== 'idle' && (
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8">
              {status === 'loading' && <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full" />}
              {status === 'success' && (
                <div className="animate-in zoom-in text-center">
                  <span className="text-6xl block mb-6">✅</span>
                  <p className="font-black text-2xl text-white uppercase">{itemName}</p>
                  <p className="text-[10px] text-emerald-500 font-black mt-4 tracking-widest uppercase">-1 UNIDAD</p>
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={handleExitWithRefresh} className="group flex flex-col items-center gap-4 mx-auto">
          <div className="h-14 w-14 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-white transition-all">
             <span className="text-white text-xl">✕</span>
          </div>
          <p className="text-[10px] font-black text-zinc-600 group-hover:text-white uppercase tracking-[0.4em]">Cancelar</p>
        </button>
      </div>
    </div>
  );
};