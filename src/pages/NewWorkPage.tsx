import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const NewWorkPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({ 
    artist_id: '', 
    client_name: '', 
    total_price: '',
    date: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    const fetchArtists = async () => {
      // CORRECCIÓN AQUÍ: 'profiles'
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true);
      setArtists(data || []);
    };
    fetchArtists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('artist_works').insert([{
      artist_id: formData.artist_id,
      client_name: formData.client_name,
      total_price: parseFloat(formData.total_price),
      created_at: `${formData.date}T12:00:00Z` 
    }]);

    if (!error) {
      navigate('/accounting');
    } else {
      console.error("Error en AXIS.ops:", error.message);
      alert("Error al registrar: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-screen p-4 md:p-10 animate-in slide-in-from-bottom duration-500 text-left">
      
      <nav className="mb-10 md:mb-16">
        <button 
          onClick={() => navigate('/accounting')}
          className="flex items-center gap-3 text-zinc-600 hover:text-white transition-all group"
        >
          <div className="h-10 w-10 rounded-full border border-zinc-900 flex items-center justify-center group-hover:border-zinc-700">
            <span className="text-xl">←</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cuentas</span>
        </button>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        <div>
          <header>
            <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
              Nueva<br/><span className="text-zinc-800">Entrada</span>
            </h2>
            <div className="mt-8 space-y-4">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] max-w-xs leading-relaxed">
                AXIS.ops Business Intelligence: El sistema calcula comisiones y actualiza la jerarquía en tiempo real.
              </p>
              <div className="h-1 w-12 bg-zinc-800"></div>
            </div>
          </header>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/20 p-6 md:p-10 rounded-[2.5rem] border border-zinc-900/50 shadow-2xl">
          
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">Talento Responsable</label>
            <select 
              required
              className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-white font-bold outline-none focus:border-white transition-all appearance-none cursor-pointer"
              value={formData.artist_id}
              onChange={(e) => setFormData({...formData, artist_id: e.target.value})}
            >
              <option value="">Seleccionar Artista...</option>
              {artists.map(a => <option key={a.id} value={a.id} className="bg-black">{a.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">Nombre del Cliente</label>
            <input 
              required
              className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-white font-bold outline-none focus:border-white transition-all"
              placeholder="Identificación del cliente"
              value={formData.client_name}
              onChange={(e) => setFormData({...formData, client_name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">Fecha de Ejecución</label>
            <input 
              required
              type="date"
              className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-white font-bold outline-none focus:border-white transition-all cursor-pointer font-mono"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">Monto Bruto (COP)</label>
            <input 
              required
              type="number"
              className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-white font-mono font-bold text-2xl outline-none focus:border-white transition-all shadow-inner"
              placeholder="0"
              value={formData.total_price}
              onChange={(e) => setFormData({...formData, total_price: e.target.value})}
            />
          </div>

          <div className="pt-4 space-y-4">
            <button 
              disabled={loading}
              className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Sincronizando...' : 'Confirmar en AXIS.ops'}
            </button>
            
            <p className="text-[8px] text-zinc-700 font-bold uppercase text-center tracking-widest">
              * El registro quedará almacenado bajo el nombre de AXIS.ops
            </p>
          </div>
        </form>

      </div>
    </div>
  );
};