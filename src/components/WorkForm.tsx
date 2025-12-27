import React, { useState } from 'react';
import { useAccounting } from '../hooks/useAccounting';

interface Props {
  artists: any[];
  onSuccess: () => void;
}

export const WorkForm = ({ artists, onSuccess }: Props) => {
  const { registerWork, loading } = useAccounting();
  const [formData, setFormData] = useState({
    artist_id: '',
    client_name: '',
    total_price: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await registerWork({
      ...formData,
      total_price: parseFloat(formData.total_price),
    });

    if (!error) {
      setFormData({ artist_id: '', client_name: '', total_price: '' });
      onSuccess();
      alert("¡Registro guardado!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Registrar Tatuaje</h3>
      
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Artista</label>
        <select 
          required
          className="w-full bg-zinc-800 text-white p-2 rounded-md border border-zinc-700"
          value={formData.artist_id}
          onChange={(e) => setFormData({...formData, artist_id: e.target.value})}
        >
          <option value="">Selecciona artista...</option>
          {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <input 
        type="text" 
        placeholder="Nombre del Cliente"
        className="w-full bg-zinc-800 text-white p-2 rounded-md border border-zinc-700"
        value={formData.client_name}
        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
      />

<input 
  type="number" 
  placeholder="Precio Total (COP $)"
  className="w-full bg-zinc-800 text-white p-2 rounded-md border border-zinc-700"
  value={formData.total_price}
  onChange={(e) => setFormData({...formData, total_price: e.target.value})}
/>

      <button 
        disabled={loading}
        className="w-full bg-white text-black font-bold py-2 rounded-md hover:bg-zinc-200 transition-colors"
      >
        {loading ? "Guardando..." : "Guardar Trabajo"}
      </button>
    </form>
  );
};