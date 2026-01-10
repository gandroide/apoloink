import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const NewWorkPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<'owner' | 'independent' | null>(null);
  const [currentUserName, setCurrentUserName] = useState('');
  
  // Estados para el Custom Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedArtistName, setSelectedArtistName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({ 
    artist_id: '', 
    client_name: '', 
    total_price: '',
    date: new Date().toISOString().split('T')[0] 
  });

  // Cerrar dropdown si clicamos fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. CARGA DE DATOS Y DETECCIÓN DE ROL
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('studio_id, type, name')
        .eq('id', user.id)
        .maybeSingle(); 

      if (profile?.type === 'owner') {
          setUserRole('owner');
          
          if (profile.studio_id) {
              const { data: artistsData } = await supabase
                .from('profiles')
                .select('id, name')
                .eq('studio_id', profile.studio_id)
                .eq('is_active', true)
                .eq('type', 'residente')
                .order('name');
              setArtists(artistsData || []);
          }
      } else {
          setUserRole('independent');
          setCurrentUserName(profile?.name || 'Mí mismo');
          setFormData(prev => ({ ...prev, artist_id: user.id }));
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.artist_id) {
        alert("Error: No se ha identificado el artista. Recarga la página.");
        return;
    }
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('studio_id')
        .eq('id', user?.id)
        .maybeSingle();

      const studioIdToSave = profile?.studio_id || null;

      // CORRECCIÓN: Eliminé la línea "description: '...'" que causaba el error
      const { error } = await supabase.from('artist_works').insert([{
        artist_id: formData.artist_id,
        client_name: formData.client_name,
        total_price: parseFloat(formData.total_price),
        created_at: `${formData.date}T12:00:00Z`,
        studio_id: studioIdToSave
      }]);

      if (!error) {
        navigate('/accounting');
      } else {
        throw error; // Esto capturará errores de Supabase
      }
    } catch (error: any) {
      console.error("Error completo:", error); // Ver en consola para detalles
      alert("Error al guardar: " + (error.message || error.details || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-screen p-4 md:p-10 animate-in slide-in-from-bottom duration-500 text-left">
      
      {/* HEADER */}
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
        
        {/* TITULO */}
        <div>
          <header>
            <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">
              Nueva<br/><span className="text-zinc-800">Entrada</span>
            </h2>
            <div className="mt-8 space-y-4">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] max-w-xs leading-relaxed">
                AXIS.ops Business Intelligence
              </p>
              <div className="h-1 w-12 bg-zinc-800"></div>
            </div>
          </header>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/20 p-6 md:p-10 rounded-[2.5rem] border border-zinc-900/50 shadow-2xl relative">
          
          {/* --- ZONA DE ARTISTA (CONDICIONAL) --- */}
          {userRole === 'owner' ? (
              <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">
                  Talento Responsable
                </label>
                <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full bg-black border ${isDropdownOpen ? 'border-white' : 'border-zinc-800'} p-5 rounded-2xl text-white font-bold cursor-pointer flex justify-between items-center transition-all hover:border-zinc-600`}
                >
                    <span className={selectedArtistName ? "text-white" : "text-zinc-500"}>
                        {selectedArtistName || "Seleccionar Artista..."}
                    </span>
                    <svg className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
                        {artists.length > 0 ? (
                            artists.map((artist) => (
                                <div 
                                    key={artist.id}
                                    onClick={() => {
                                        setFormData({...formData, artist_id: artist.id});
                                        setSelectedArtistName(artist.name);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="p-4 hover:bg-zinc-900 text-white font-bold cursor-pointer transition-colors text-sm uppercase tracking-wider border-b border-zinc-900 last:border-0"
                                >
                                    {artist.name}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-zinc-600 text-xs uppercase font-bold">No hay artistas activos</div>
                        )}
                    </div>
                )}
              </div>
          ) : (
              <div className="space-y-2">
                  <label className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-2 italic">
                    Artista (Tú)
                  </label>
                  <div className="w-full bg-emerald-900/10 border border-emerald-900/30 p-5 rounded-2xl text-emerald-500 font-bold flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      {currentUserName || 'Cargando perfil...'}
                  </div>
              </div>
          )}

          {/* INPUT CLIENTE */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">Cliente</label>
            <input 
              required
              className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-white font-bold outline-none focus:border-white transition-all"
              placeholder="Nombre / ID"
              value={formData.client_name}
              onChange={(e) => setFormData({...formData, client_name: e.target.value})}
            />
          </div>

          {/* INPUT FECHA */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">Fecha</label>
            <input 
              required
              type="date"
              className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-white font-bold outline-none focus:border-white transition-all font-mono uppercase"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          {/* INPUT MONTO */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2 italic">Monto (COP)</label>
            <input 
              required
              type="number"
              className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-white font-mono font-bold text-2xl outline-none focus:border-white transition-all"
              placeholder="0"
              value={formData.total_price}
              onChange={(e) => setFormData({...formData, total_price: e.target.value})}
            />
          </div>

          <div className="pt-4">
            <button 
              disabled={loading || !formData.artist_id}
              className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-zinc-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};