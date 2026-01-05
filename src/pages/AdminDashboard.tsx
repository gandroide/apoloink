import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { formatterCOP } from '../lib/formatterCOP';

// --- CONFIGURACIÓN ---
const ITEMS_PER_PAGE = 8;

// --- UTILIDADES ---
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// --- ICONOS ---
const Icons = {
  Building: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Users: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Exit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Close: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  ChevronLeft: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Mail: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Money: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Crown: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  UserPlus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  CheckBadge: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Alert: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
};

export const AdminDashboard = () => {
  const [studios, setStudios] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ mrr: 0, totalUsers: 0 });
  const [currentView, setCurrentView] = useState<'studios' | 'users'>('studios');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudio, setSelectedStudio] = useState<any | null>(null);
  const [showNewAdminModal, setShowNewAdminModal] = useState(false);
  
  // MODAL DE ELIMINAR
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // NUEVO: MODAL DE ASCENDER
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [userToPromote, setUserToPromote] = useState<any | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPage(1);
  }, [currentView, searchTerm]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_super_admin) {
        navigate('/'); 
        return;
      }
      loadGlobalData();
    };
    init();
  }, [navigate]);

  const loadGlobalData = async () => {
    const { data: studiosData } = await supabase.from('studios').select('*').order('created_at', { ascending: false });
    
    // FILTRO CORRECTO: Sin artistas
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .neq('type', 'residente') 
      .order('created_at', { ascending: false });
    
    const mrr = studiosData?.reduce((acc, studio) => {
        if (studio.is_active !== false) { 
            return acc + (studio.subscription_price || 0);
        }
        return acc;
    }, 0) || 0;

    setStudios(studiosData || []);
    setUsers(profilesData || []);
    setMetrics({ mrr: mrr, totalUsers: profilesData?.length || 0 });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // --- LOGICA ESTUDIOS ---
  const handleToggleStudioStatus = async () => {
    if (!selectedStudio) return;
    setIsUpdating(true);
    const newStatus = !selectedStudio.is_active;

    const { error } = await supabase
      .from('studios')
      .update({ is_active: newStatus })
      .eq('id', selectedStudio.id);

    if (error) {
      alert("Error: " + error.message);
    } else {
      const updatedStudios = studios.map(s => s.id === selectedStudio.id ? { ...s, is_active: newStatus } : s);
      setStudios(updatedStudios);
      setSelectedStudio(null); 
    }
    setIsUpdating(false);
  };

  const requestDeleteStudio = () => {
    setShowDeleteModal(true);
  };

  const executeDeleteStudio = async () => {
    if (!selectedStudio) return;
    setIsUpdating(true);
    
    const { error } = await supabase.rpc('delete_studio_completely', { 
        target_studio_id: selectedStudio.id 
    });

    if (error) {
        alert("Error al eliminar: " + error.message);
    } else {
        const updatedStudios = studios.filter(s => s.id !== selectedStudio.id);
        setStudios(updatedStudios);
        setShowDeleteModal(false);
        setSelectedStudio(null);
    }
    setIsUpdating(false);
  };

  // --- LOGICA ASCENDER USUARIO ---
  const requestPromoteUser = (user: any) => {
    setUserToPromote(user);
    setShowPromoteModal(true);
  };

  const executePromoteUser = async () => {
    if (!userToPromote) return;
    
    setIsUpdating(true);
    const { error } = await supabase
        .from('profiles')
        .update({ is_super_admin: true, studio_id: null })
        .eq('id', userToPromote.id);

    if (error) {
        alert("Error: " + error.message);
    } else {
        // Actualizar lista localmente
        setUsers(users.map(u => u.id === userToPromote.id ? { ...u, is_super_admin: true, studio_id: null } : u));
        setShowPromoteModal(false);
        setUserToPromote(null);
    }
    setIsUpdating(false);
  };

  // --- FILTROS ---
  const filteredStudios = studios.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.includes(searchTerm)
  );

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.includes(searchTerm)
  );

  const currentData = currentView === 'studios' ? filteredStudios : filteredUsers;
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentData.length / ITEMS_PER_PAGE);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

  return (
    <div className="flex h-screen bg-black text-zinc-300 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-zinc-800">
            <span className="font-black text-lg text-white tracking-tight">AXIS<span className="text-zinc-600">.hq</span></span>
          </div>
          <nav className="p-4 space-y-1">
            <button onClick={() => setCurrentView('studios')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${currentView === 'studios' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}><Icons.Building /> Estudios</button>
            <button onClick={() => setCurrentView('users')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${currentView === 'users' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}><Icons.Users /> Usuarios</button>
          </nav>
        </div>
        <div className="p-4 border-t border-zinc-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-950/30 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors"><Icons.Exit /> Cerrar Sesión</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden bg-black relative">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-black shrink-0">
          <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">{currentView === 'studios' ? 'Gestión de Estudios' : 'Directorio de Usuarios'}</h2>
              {currentView === 'users' && (
                  <button onClick={() => setShowNewAdminModal(true)} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg border border-zinc-700 transition-all"><Icons.UserPlus /> Nuevo Admin</button>
              )}
          </div>
          <div className="flex items-center gap-4">
             {/* ... Search ... */}
             <div className="relative">
                <input type="text" placeholder="Buscar..." className="bg-zinc-900 border border-zinc-800 text-xs text-white pl-9 pr-4 py-2 rounded-lg outline-none focus:border-zinc-600 w-64 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <div className="absolute left-3 top-2.5 text-zinc-500"><Icons.Search /></div>
            </div>
            <div className="h-8 w-8 bg-zinc-800 rounded-full flex items-center justify-center text-xs font-black text-white cursor-help" title="Super Admin Activo">HQ</div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 flex flex-col">
          {/* METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
             {/* ... Metrics ... */}
             <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg relative overflow-hidden group">
                <div className="absolute right-4 top-4 text-zinc-800 group-hover:text-emerald-900/40 transition-colors"><Icons.Money /></div>
                <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">MRR (Ingreso Mensual)</p>
                <p className="text-2xl font-mono font-bold text-emerald-400">{formatterCOP.format(metrics.mrr)}</p>
                <p className="text-[9px] text-zinc-600 mt-2">Calculado sobre estudios activos</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg"><p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Estudios Totales</p><p className="text-2xl font-mono font-bold text-white">{studios.length}</p></div>
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg"><p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Usuarios Totales</p><p className="text-2xl font-mono font-bold text-white">{users.length}</p></div>
          </div>

          <div className="bg-zinc-900/20 border border-zinc-800 rounded-lg flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900/40 shrink-0">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{currentView === 'studios' ? 'Listado de Estudios' : 'Listado de Usuarios'}</h3>
            </div>
            <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="border-b border-zinc-800 bg-zinc-900">
                           {/* HEADERS */}
                           {currentView === 'studios' ? (
                              <>
                                <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-12">#</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nombre</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email / Contacto</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Plan</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Estado</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Acciones</th>
                              </>
                           ) : (
                              <>
                                <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nombre</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email / Contacto</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Fecha Registro</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rol</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">ID Usuario</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Acciones</th>
                              </>
                           )}
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        {currentItems.map((item, index) => {
                            const realIndex = indexOfFirstItem + index + 1;
                            if (currentView === 'studios') {
                                const studio = item;
                                return (
                                    <tr key={studio.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors">
                                        <td className="py-3 px-4 text-zinc-600 font-mono">{realIndex}</td>
                                        <td className="py-3 px-4 font-bold text-white">{studio.name}</td>
                                        <td className="py-3 px-4">
                                            {studio.contact_email ? (<div className="flex items-center gap-2"><span className="text-zinc-500"><Icons.Mail /></span><span className="font-mono text-zinc-300">{studio.contact_email}</span></div>) : (<span className="text-zinc-600 italic text-[10px]">Sin asignar</span>)}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-zinc-400">{formatterCOP.format(studio.subscription_price || 0)}</td>
                                        <td className="py-3 px-4"><span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${studio.is_active !== false ? 'bg-emerald-950/50 text-emerald-500 border-emerald-900/30' : 'bg-red-950/50 text-red-500 border-red-900/30'}`}>{studio.is_active !== false ? 'Activo' : 'Suspendido'}</span></td>
                                        <td className="py-3 px-4 text-right"><button onClick={() => setSelectedStudio(studio)} className="text-zinc-400 hover:text-white font-bold uppercase text-[9px] border border-zinc-700 px-3 py-1.5 rounded hover:bg-zinc-800 transition-all">Gestionar</button></td>
                                    </tr>
                                );
                            } else {
                                const user = item;
                                return (
                                    <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors">
                                        <td className="py-3 px-4 font-bold text-white">{user.name || 'Sin Nombre'}</td>
                                        <td className="py-3 px-4">{user.email ? (<div className="flex items-center gap-2"><span className="text-zinc-500"><Icons.Mail /></span><span className="font-mono text-zinc-300">{user.email}</span></div>) : <span className="text-zinc-600 italic">No disponible</span>}</td>
                                        <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">{formatDate(user.created_at)}</td>
                                        <td className="py-3 px-4">{user.is_super_admin ? (<span className="text-purple-400 font-black uppercase text-[9px]">👑 Super Admin</span>) : (<span className="text-zinc-500 font-mono uppercase text-[9px]">{user.type || 'Usuario'}</span>)}</td>
                                        <td className="py-3 px-4 font-mono text-zinc-600 select-all max-w-[150px] truncate" title={user.id}>{user.id}</td>
                                        <td className="py-3 px-4 text-right">
                                            {!user.is_super_admin ? (
                                                <button 
                                                    onClick={() => requestPromoteUser(user)} // <-- AQUI USAMOS EL NUEVO TRIGGER
                                                    disabled={isUpdating} 
                                                    className="text-yellow-600 hover:text-yellow-400 font-bold uppercase text-[9px] border border-yellow-900/30 px-3 py-1.5 rounded hover:bg-yellow-900/20 transition-all flex items-center gap-1 ml-auto"
                                                >
                                                    <Icons.Crown /> Ascender
                                                </button>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2"><span className="text-zinc-500 text-[9px] font-black uppercase flex items-center gap-1 border border-zinc-800 px-2 py-1 rounded bg-zinc-900"><Icons.CheckBadge /> Verificado</span></div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }
                        })}
                    </tbody>
                </table>
            </div>
            {/* PAGINACIÓN */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/40 flex justify-between items-center shrink-0">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Mostrando {currentItems.length} registros</span>
                <div className="flex items-center gap-2">
                    <button onClick={prevPage} disabled={currentPage === 1} className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"><Icons.ChevronLeft /></button>
                    <span className="text-[10px] font-mono text-zinc-400 px-2">Página <span className="text-white font-bold">{currentPage}</span></span>
                    <button onClick={nextPage} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"><Icons.ChevronRight /></button>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL GESTIÓN ESTUDIO (Mismo código de antes) */}
      {selectedStudio && !showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
             {/* ... Contenido del modal de gestión ... */}
             <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Gestionar Estudio</h3>
                        <p className="text-xs text-zinc-500 mt-1">{selectedStudio.name}</p>
                    </div>
                    <button onClick={() => setSelectedStudio(null)} className="text-zinc-500 hover:text-white"><Icons.Close /></button>
                </div>
                
                <div className="space-y-4 overflow-y-auto pr-2">
                    {/* INFO EMAIL */}
                    {selectedStudio.contact_email && (
                        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex items-center gap-3">
                            <div className="bg-zinc-800 p-2 rounded-full text-zinc-400"><Icons.Mail /></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-zinc-500">Email de Contacto</p>
                                <p className="font-mono text-xs text-white break-all">{selectedStudio.contact_email}</p>
                            </div>
                        </div>
                    )}
                    {/* VALOR */}
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex justify-between items-center">
                         <div>
                             <p className="text-[10px] uppercase font-bold text-zinc-500">Valor de Suscripción</p>
                             <p className="font-mono text-xl font-bold text-white">{formatterCOP.format(selectedStudio.subscription_price || 0)}<span className="text-xs text-zinc-500 font-normal">/mes</span></p>
                         </div>
                    </div>
                    {/* ESTADO */}
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                        <p className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Estado de Suscripción</p>
                        <div className="flex items-center gap-3">
                            <div className={`h-3 w-3 rounded-full ${selectedStudio.is_active !== false ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                            <span className="text-sm font-bold text-white">{selectedStudio.is_active !== false ? 'ACTIVO' : 'SUSPENDIDO'}</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 mt-2">
                            {selectedStudio.is_active !== false 
                            ? 'Este estudio está sumando a tu MRR.' 
                            : 'Al estar suspendido, su valor NO cuenta en el MRR.'}
                        </p>
                    </div>
                    {/* BOTONES */}
                    <button 
                        onClick={handleToggleStudioStatus}
                        disabled={isUpdating}
                        className={`w-full py-3 rounded-lg font-bold uppercase text-xs tracking-widest transition-all ${
                            selectedStudio.is_active !== false 
                            ? 'bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700' 
                            : 'bg-emerald-950 text-emerald-500 border border-emerald-900/50 hover:bg-emerald-900 hover:text-white'
                        }`}
                    >
                        {isUpdating ? 'Procesando...' : (selectedStudio.is_active !== false ? 'SUSPENDER SERVICIO' : 'REACTIVAR SERVICIO')}
                    </button>
                    <div className="pt-6 mt-6 border-t border-zinc-800/50">
                        <p className="text-[10px] font-bold text-red-500 uppercase mb-2 tracking-wider">Zona de Peligro</p>
                        <button onClick={requestDeleteStudio} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold uppercase text-xs tracking-widest transition-all bg-red-950/30 text-red-500 border border-red-900/30 hover:bg-red-900 hover:text-white"><Icons.Trash /> Eliminar Estudio</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MODAL NUEVO ADMIN */}
      {showNewAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Icons.UserPlus /> Nuevo Super Admin</h3>
                    <button onClick={() => setShowNewAdminModal(false)} className="text-zinc-500 hover:text-white"><Icons.Close /></button>
                </div>
                <div className="space-y-4 text-xs text-zinc-400">
                    <p>Por seguridad, la creación de usuarios requiere verificación de correo. Sigue estos pasos:</p>
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 space-y-3">
                        <div className="flex gap-3"><span className="bg-zinc-800 h-5 w-5 rounded-full flex items-center justify-center text-white font-bold text-[10px]">1</span><p>Pídele a tu socio que se registre normalmente en la App <span className="text-white">(/signup)</span>.</p></div>
                        <div className="flex gap-3"><span className="bg-zinc-800 h-5 w-5 rounded-full flex items-center justify-center text-white font-bold text-[10px]">2</span><p>Una vez registrado, búscalo aquí en la lista de <span className="text-white font-bold uppercase">Usuarios</span>.</p></div>
                        <div className="flex gap-3"><span className="bg-zinc-800 h-5 w-5 rounded-full flex items-center justify-center text-white font-bold text-[10px]">3</span><p>Haz clic en el botón dorado <span className="text-yellow-500 font-bold uppercase">Ascender</span>.</p></div>
                    </div>
                    <button onClick={() => setShowNewAdminModal(false)} className="w-full py-3 bg-white text-black font-bold uppercase rounded-lg hover:bg-zinc-200 transition-colors">Entendido</button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL ELIMINAR CONFIRMACIÓN */}
      {showDeleteModal && selectedStudio && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-zinc-950 border-2 border-red-900 rounded-2xl w-full max-w-sm p-6 shadow-[0_0_50px_rgba(220,38,38,0.2)] animate-in zoom-in-95 duration-200 text-center">
                <div className="mx-auto h-16 w-16 bg-red-950/50 rounded-full flex items-center justify-center mb-4 text-red-500 animate-pulse"><Icons.Alert /></div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">¿Eliminar Definitivamente?</h3>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">Estás a punto de borrar el estudio <strong className="text-white">{selectedStudio.name}</strong> y todos sus datos.<br /><br /><span className="text-red-400 font-bold uppercase">Esta acción es irreversible.</span></p>
                <div className="flex flex-col gap-3">
                    <button onClick={executeDeleteStudio} disabled={isUpdating} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase rounded-lg tracking-widest transition-all shadow-lg shadow-red-900/20">{isUpdating ? 'Eliminando...' : 'Sí, Eliminar Todo'}</button>
                    <button onClick={() => setShowDeleteModal(false)} disabled={isUpdating} className="w-full py-3 bg-transparent hover:bg-zinc-900 text-zinc-500 hover:text-white font-bold uppercase rounded-lg tracking-widest transition-all">Cancelar</button>
                </div>
            </div>
        </div>
      )}

      {/* --- NUEVO MODAL "ROYAL" DE ASCENSO --- */}
      {showPromoteModal && userToPromote && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-zinc-950 border-2 border-yellow-600 rounded-2xl w-full max-w-sm p-6 shadow-[0_0_50px_rgba(234,179,8,0.2)] animate-in zoom-in-95 duration-200 text-center relative overflow-hidden">
                
                {/* Fondo Decorativo */}
                <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none" />

                <div className="mx-auto h-16 w-16 bg-yellow-900/30 border border-yellow-700/50 rounded-full flex items-center justify-center mb-4 text-yellow-500 animate-bounce relative z-10">
                    <div className="scale-150"><Icons.Crown /></div>
                </div>

                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 relative z-10">
                    ¿Otorgar Super Poderes?
                </h3>
                
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed relative z-10">
                    Estás a punto de ascender a <strong className="text-white">{userToPromote.name || userToPromote.email}</strong>.
                    <br /><br />
                    Tendrá acceso total a <strong>AXIS.hq</strong>, podrá ver ingresos, borrar estudios y gestionar todo el sistema.
                </p>

                <div className="flex flex-col gap-3 relative z-10">
                    <button 
                        onClick={executePromoteUser}
                        disabled={isUpdating}
                        className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-black uppercase rounded-lg tracking-widest transition-all shadow-lg shadow-yellow-900/20 hover:scale-[1.02] active:scale-95"
                    >
                        {isUpdating ? 'Procesando...' : 'Sí, Ascender Usuario'}
                    </button>
                    <button 
                        onClick={() => setShowPromoteModal(false)}
                        disabled={isUpdating}
                        className="w-full py-3 bg-transparent hover:bg-zinc-900 text-zinc-500 hover:text-white font-bold uppercase rounded-lg tracking-widest transition-all"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};