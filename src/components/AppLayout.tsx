import { useState, useRef, useEffect } from 'react'; // <--- 1. Importamos useRef y useEffect
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: LayoutProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // 2. CREAMOS LAS REFERENCIAS
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // 3. EFECTO PARA DETECTAR CLICS FUERA (CLICKAWAY)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Lógica Desktop
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      // Lógica Móvil
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    }

    // Agregamos el "oyente" al documento
    document.addEventListener("mousedown", handleClickOutside);
    
    // Limpieza al desmontar
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { 
      path: '/', 
      label: 'Dash', 
      // Usamos 'active' para cambiar el stroke
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "currentColor" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
      )
    },
    { 
      path: '/inventory', 
      label: 'Stock', 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "currentColor" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
      )
    },
    { 
      path: '/team', 
      label: 'Artistas', 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "currentColor" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      )
    },
    { 
      path: '/expenses', 
      label: 'Gastos', 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "currentColor" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      )
    },
    { 
      path: '/accounting', 
      label: 'Ingresos', 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "currentColor" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
      )
    },
    { 
      path: '/guide', 
      label: 'Guía', 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "currentColor" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      )
    },
    { 
      path: '/scan', 
      label: 'Scan', 
      isAction: true,
      // CORRECCIÓN AQUÍ: Quitamos el argumento 'active' porque no se usaba dentro
      icon: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
      )
    },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--brand-bg)] text-[var(--brand-primary)] font-sans">
      
      {/* === 1. SIDEBAR (ESCRITORIO) === */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-[var(--brand-border)] fixed h-full bg-[var(--brand-surface)] z-50 p-6">
        <div className="mb-8 px-4">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-[var(--brand-primary)]">
            AXIS<span className="text-[var(--brand-accent)]">.ops</span>
          </h1>
          <p className="text-[10px] text-[var(--brand-primary)] opacity-60 font-bold tracking-[0.4em] uppercase mt-1">Studio Manager</p>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto mb-6">
          {navItems.map((item) => {
            if (item.isAction) return null;
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                   isActive 
                      ? 'bg-[var(--brand-bg)] text-[var(--brand-primary)] border border-[var(--brand-border)]' 
                      : 'text-[var(--brand-primary)] opacity-60 hover:bg-[var(--brand-bg)]/50'
                }`}
              >
                {item.icon(isActive)}
                <span className={`font-bold text-xs uppercase tracking-widest ${isActive ? 'text-[var(--brand-primary)]' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)] shadow-[0_0_8px_var(--brand-accent)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar (Ref Desktop añadida) */}
        <div 
          ref={desktopMenuRef} // <--- 4. ASIGNAMOS LA REF AQUÍ (Engloba botón y menú)
          className="mt-auto pt-6 border-t border-[var(--brand-border)] space-y-4 relative"
        >
            
            {showUserMenu && (
              <div className="absolute bottom-[calc(100%-10px)] left-0 right-0 bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50 mb-4">
                <button 
                  onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                  className="w-full text-left px-4 py-3 hover:bg-[var(--brand-primary)]/5 flex items-center gap-3 transition-colors group"
                >
                  <div className="text-[var(--brand-primary)] opacity-60 group-hover:text-[var(--brand-accent)] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                  <span className="text-xs font-bold text-[var(--brand-primary)]">Configuración</span>
                </button>
                <div className="h-px bg-[var(--brand-border)] mx-4"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-red-500/10 flex items-center gap-3 transition-colors group"
                >
                  <div className="text-[var(--brand-primary)] opacity-60 group-hover:text-red-500 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                  </div>
                  <span className="text-xs font-bold text-red-500 group-hover:text-red-600">Cerrar Sesión</span>
                </button>
              </div>
            )}

             <button
                onClick={() => navigate('/scan')}
                className="w-full flex items-center justify-center gap-2 bg-[var(--brand-accent)] text-[var(--brand-surface)] py-4 rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-[0_0_15px_var(--brand-accent)] z-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
                <span className="font-black text-xs uppercase tracking-widest">Escanear</span>
              </button>

            <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`w-full flex items-center gap-3 px-2 cursor-pointer p-2 rounded-xl transition-all group ${showUserMenu ? 'bg-[var(--brand-bg)]' : 'hover:bg-[var(--brand-bg)]'}`}
            >
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors overflow-hidden ${showUserMenu ? 'bg-[var(--brand-bg)] border-[var(--brand-accent)] text-[var(--brand-accent)]' : 'bg-[var(--brand-border)] border-[var(--brand-border)] text-[var(--brand-primary)] opacity-60 group-hover:border-[var(--brand-primary)]'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div className="overflow-hidden flex-1 text-left">
                    <p className="text-[10px] font-black uppercase text-[var(--brand-primary)] tracking-wider truncate">
                        {user?.email?.split('@')[0] || 'Mi Cuenta'}
                    </p>
                    <p className="text-[9px] text-[var(--brand-primary)] opacity-60 truncate flex items-center gap-1">
                      Admin
                      <svg className={`transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                    </p>
                </div>
            </button>
        </div>
      </aside>

      {/* === 2. HEADER (MÓVIL) === */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-[var(--brand-surface)]/95 backdrop-blur-xl border-b border-[var(--brand-border)] z-40 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <h1 className="text-xl font-black italic tracking-tighter uppercase text-[var(--brand-primary)]">
            AXIS<span className="text-[var(--brand-accent)]">.ops</span>
          </h1>
        </div>

        {/* ÁREA DE USUARIO MÓVIL */}
        <div 
          ref={mobileMenuRef} // <--- 5. ASIGNAMOS LA REF AQUÍ PARA MÓVIL
          className="relative"
        >
          <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${showMobileMenu ? 'border-[var(--brand-accent)] text-[var(--brand-accent)]' : 'bg-[var(--brand-border)] border-transparent text-[var(--brand-primary)] opacity-60'}`}
          >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>

          {/* MENÚ FLOTANTE MÓVIL */}
          {showMobileMenu && (
            <div className="absolute top-full right-0 mt-3 w-48 bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 z-50">
               <button 
                  onClick={() => { setShowMobileMenu(false); navigate('/settings'); }}
                  className="w-full text-left px-4 py-3 hover:bg-[var(--brand-primary)]/5 flex items-center gap-3 transition-colors border-b border-[var(--brand-border)]"
                >
                  <svg className="text-[var(--brand-accent)]" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  <span className="text-xs font-bold text-[var(--brand-primary)]">Configuración</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                >
                  <svg className="text-red-500" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                  <span className="text-xs font-bold text-red-500">Cerrar Sesión</span>
                </button>
            </div>
          )}
        </div>
      </header>

      {/* === CONTENIDO PRINCIPAL === */}
      <main className="flex-1 lg:ml-72 w-full pb-32 pt-20 lg:pt-10 lg:pb-10 relative px-4 md:px-8">
        {children}
      </main>

      {/* === BOTTOM BAR (Móvil) === */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--brand-surface)]/95 backdrop-blur-xl border-t border-[var(--brand-border)] z-50 px-2 py-3 pb-8 safe-area-bottom">
        <div className="flex justify-between items-center max-w-md mx-auto relative">
          
          {navItems.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            
            if (item.isAction) {
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative -top-8 bg-[var(--brand-accent)] w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-[0_0_20px_rgba(var(--brand-accent),0.4)] hover:scale-105 active:scale-95 transition-all border-4 border-[var(--brand-bg)] z-10 text-[var(--brand-surface)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 transition-all flex-1 min-w-0 ${
                  isActive ? 'text-[var(--brand-primary)] scale-105' : 'text-[var(--brand-text-muted)] opacity-60'
                }`}
              >
                <div className={`${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    {item.icon(isActive)}
                </div>
                <span className="text-[8px] font-black uppercase tracking-wider truncate w-full text-center">
                   {item.label}
                </span>
                {isActive && <div className="w-1 h-1 bg-[var(--brand-accent)] rounded-full mt-0.5 shadow-[0_0_5px_var(--brand-accent)]" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};