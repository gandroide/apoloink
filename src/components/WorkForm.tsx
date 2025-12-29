import React, { useState } from 'react';
import { useAccounting } from '../hooks/useAccounting';
import type { Artist } from '../hooks/useAccounting';

interface WorkFormProps {
  artists: Artist[];
  onSuccess: () => void;
}

export const WorkForm = ({ artists, onSuccess }: WorkFormProps) => {
  const { registerWork } = useAccounting();
  const [totalPrice, setTotalPrice] = useState('');
  const [artistId, setArtistId] = useState('');
  const [clientName, setClientName] = useState('');
  // Inicializamos con la fecha de hoy
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCanvas, setIsCanvas] = useState(false); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistId || !clientName) return;
    if (!isCanvas && !totalPrice) return;

    setLoading(true);
    const { success } = await registerWork({
      total_price: isCanvas ? 0 : parseFloat(totalPrice),
      artist_id: artistId,
      client_name: clientName,
      is_canvas: isCanvas,
      date: workDate // Enviamos la fecha seleccionada a AXIS.ops
    });

    if (success) {
      setTotalPrice('');
      setArtistId('');
      setClientName('');
      setWorkDate(new Date().toISOString().split('T')[0]);
      setIsCanvas(false);
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 space-y-6 shadow-2xl text-left">
      <div className="space-y-4">
        <header className="mb-4">
          <h3 className="text-white font-black italic uppercase text-lg tracking-tighter">Registro de Actividad</h3>
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.4em]">AXIS.ops Intelligence</p>
        </header>

        {/* NOMBRE DEL CLIENTE */}
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase text-zinc-600 ml-2 tracking-widest">Cliente</label>
          <input
            className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm focus:border-zinc-500 outline-none transition-all placeholder:text-zinc-800 text-white font-bold"
            placeholder="Nombre del Cliente"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
        </div>

        {/* GRID: ARTISTA Y FECHA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-zinc-600 ml-2 tracking-widest">Artista</label>
            <select
              className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm text-zinc-400 outline-none focus:border-zinc-500 transition-all appearance-none cursor-pointer"
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
              required
            >
              <option value="">Seleccionar Artista</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id} className="bg-zinc-950">
                  {artist.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-zinc-600 ml-2 tracking-widest italic">Fecha de Ejecución</label>
            <input
              type="date"
              className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm text-white outline-none focus:border-zinc-500 transition-all cursor-pointer font-mono"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* VALOR Y LIENZO */}
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase text-zinc-600 ml-2 tracking-widest">Monto del Servicio</label>
          <div className="flex gap-2">
            <input
              type="number"
              className="flex-1 bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-mono focus:border-zinc-500 outline-none transition-all text-white"
              placeholder="Total COP"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              required={!isCanvas}
              disabled={isCanvas}
            />
            
            <button
              type="button"
              onClick={() => {
                setIsCanvas(!isCanvas);
                if (!isCanvas) setTotalPrice('0');
              }}
              className={`px-6 rounded-2xl border font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                isCanvas 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-700'
              }`}
            >
              {isCanvas ? 'Lienzo' : '¿Lienzo?'}
            </button>
          </div>
        </div>
      </div>

      <button
        disabled={loading}
        className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-zinc-200 transition-all disabled:opacity-50 shadow-xl mt-4 active:scale-95"
      >
        {loading ? 'Sincronizando...' : 'Confirmar en AXIS.ops'}
      </button>
    </form>
  );
};