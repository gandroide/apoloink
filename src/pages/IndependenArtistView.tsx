import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { formatterCOP } from '../lib/formatterCOP';
import { Calendar, DollarSign, User } from 'lucide-react';



interface Work {
    id: string;
    created_at: string;
    client_name: string;
    total_price: number;
    description: string;
  }

  
export const IndependentArtistView = ({ currentUserId }: { currentUserId: string }) => {
    const [works, setWorks] = useState<Work[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Formulario de Ingreso
    const [clientName, setClientName] = useState('');
    const [price, setPrice] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);
  
    const fetchMyWorks = async () => {
      setLoading(true);
      // Buscamos trabajos donde el artist_id sea MI propio ID
      const { data } = await supabase
        .from('artist_works')
        .select('*')
        .eq('artist_id', currentUserId)
        .order('created_at', { ascending: false });
      
      setWorks(data || []);
      setLoading(false);
    };
  
    useEffect(() => { fetchMyWorks(); }, [currentUserId]);
  
    const handleRegisterWork = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!clientName || !price || isSaving) return;
      setIsSaving(true);
  
      try {
          const { error } = await supabase.from('artist_works').insert([{
              artist_id: currentUserId, // Me vinculo a mí mismo
              client_name: clientName,
              total_price: parseFloat(price),
              created_at: new Date(date).toISOString(),
              description: 'Trabajo Independiente'
          }]);
  
          if (error) throw error;
          setClientName(''); setPrice(''); fetchMyWorks();
      } catch (err: any) {
          alert("Error: " + err.message);
      } finally {
          setIsSaving(false);
      }
    };
  
    const totalIncome = works.reduce((sum, w) => sum + (w.total_price || 0), 0);
  
    return (
      <div className="animate-in fade-in duration-700">
          {/* Header Diferente para Independientes */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 py-10 mb-10 text-left">
              <div>
              <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">Mi Flujo</h2>
              <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-[0.4em] mt-4 ml-1">Gestión de Ingresos</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] min-w-[200px]">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Acumulado</p>
                  <p className="text-3xl font-black text-white font-mono tracking-tighter">{formatterCOP.format(totalIncome)}</p>
              </div>
          </header>
  
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Formulario de Registro Rápido */}
              <aside className="lg:col-span-4 order-1 lg:order-2 lg:sticky lg:top-28">
                  <section className="bg-emerald-900/10 p-8 rounded-[3rem] border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] space-y-6">
                      <div className="text-left">
                          <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-1">Nuevo Tatuaje</h3>
                          <p className="text-xl font-black italic text-white uppercase tracking-tighter">Registrar Ingreso</p>
                      </div>
                      <form onSubmit={handleRegisterWork} className="space-y-4 text-left">
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-zinc-500 uppercase ml-1 tracking-widest flex items-center gap-2"><User size={10}/> Cliente</label>
                              <input className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm text-white font-bold outline-none focus:border-emerald-500" placeholder="Nombre del cliente" value={clientName} onChange={e => setClientName(e.target.value)} required />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-zinc-500 uppercase ml-1 tracking-widest flex items-center gap-2"><DollarSign size={10}/> Valor</label>
                              <input type="number" className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm text-white font-mono outline-none focus:border-emerald-500" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} required />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[9px] font-black text-zinc-500 uppercase ml-1 tracking-widest flex items-center gap-2"><Calendar size={10}/> Fecha</label>
                              <input type="date" className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm text-white font-mono outline-none focus:border-emerald-500" value={date} onChange={e => setDate(e.target.value)} required />
                          </div>
                          <button disabled={isSaving} className="w-full bg-emerald-500 text-black py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-emerald-400 transition-all mt-2 active:scale-95">
                              {isSaving ? 'Guardando...' : 'Registrar Pago'}
                          </button>
                      </form>
                  </section>
              </aside>
  
              {/* Lista de Trabajos */}
              <section className="lg:col-span-8 order-2 lg:order-1">
                  {loading ? <div className="text-center py-20 text-zinc-700 font-black animate-pulse">CARGANDO...</div> : (
                      <div className="space-y-3">
                          {works.length === 0 ? (
                              <div className="py-20 border-2 border-dashed border-zinc-900 rounded-[3rem] text-center text-zinc-600 font-bold uppercase text-xs tracking-widest">
                                  Aún no has registrado trabajos.
                              </div>
                          ) : (
                              works.map((work) => (
                                  <div key={work.id} className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-[2rem] flex justify-between items-center group hover:bg-zinc-900 transition-all">
                                      <div className="text-left">
                                          <h4 className="font-black text-lg text-white uppercase italic tracking-tighter">{work.client_name}</h4>
                                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                                              {new Date(work.created_at).toLocaleDateString('es-CO', { dateStyle: 'long' })}
                                          </p>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-xl font-black text-emerald-500 font-mono tracking-tighter">+{formatterCOP.format(work.total_price)}</p>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  )}
              </section>
          </div>
      </div>
    );
  };