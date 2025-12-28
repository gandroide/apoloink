import React, { useState } from 'react';
// Corregimos el import usando "import type" para Artist
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
      is_canvas: isCanvas
    });

    if (success) {
      setTotalPrice('');
      setArtistId('');
      setClientName('');
      setIsCanvas(false);
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 space-y-4 shadow-xl">
      <div className="space-y-4">
        <input
          className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-700"
          placeholder="Nombre del Cliente"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          required
        />

        <select
          className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm text-zinc-400 outline-none focus:border-zinc-600 transition-all"
          value={artistId}
          onChange={(e) => setArtistId(e.target.value)}
          required
        >
          <option value="">Seleccionar Artista</option>
          {artists.map((artist) => (
            <option key={artist.id} value={artist.id}>
              {artist.name} ({artist.type})
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="number"
            className="flex-1 bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm font-mono focus:border-zinc-600 outline-none transition-all"
            placeholder="Precio Total ($)"
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
            className={`px-4 rounded-2xl border font-bold text-[10px] uppercase tracking-widest transition-all ${
              isCanvas 
                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-600'
            }`}
          >
            {isCanvas ? 'Es Lienzo' : 'Lienzo?'}
          </button>
        </div>
      </div>

      <button
        disabled={loading}
        className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-zinc-200 transition-all disabled:opacity-50 shadow-lg"
      >
        {loading ? 'REGISTRANDO...' : 'GUARDAR TRABAJO'}
      </button>
    </form>
  );
};