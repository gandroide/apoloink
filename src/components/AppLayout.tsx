import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // LÓGICA DE LOGOUT (Único cambio: forzar la navegación al Login)
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login'); // Asegura que te saque de la app visualmente
  };

  // LISTA COMPLETA DE NAVEGACIÓN (TU DISEÑO ORIGINAL)
  const navItems = [
    { 
      path: '/', 
      label: 'Dash', 
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
      label: 'Equipo', 
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
      label: 'Cuentas', 
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
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
      )
    },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--brand-bg)] text-[var(--brand-primary)] font-sans">
      
      {/* === SIDEBAR (Visible solo en Desktop lg:flex) === */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-[var(--brand-border)] fixed h-full bg-[var(--brand-surface)] z-50 p-6">
        {/* Logo */}
        <div className="mb-8 px-4">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-[var(--brand-primary)]">
            AXIS<span className="text-[var(--brand-accent)]">.ops</span>
          </h1>
          <p className="text-[10px] text-[var(--brand-text-muted)] font-bold tracking-[0.4em] uppercase mt-1">Studio Manager</p>
        </div>

        {/* Navegación Vertical */}
        <nav className="flex-1 space-y-2 overflow-y-auto mb-6">
          {navItems.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            
            if (item.isAction) return null; // El botón scan lo ponemos abajo

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                   isActive 
                      ? 'bg-[var(--brand-bg)] text-[var(--brand-primary)] border border-[var(--brand-border)]' 
                      : 'text-[var(--brand-text-muted)] hover:bg-[var(--brand-bg)]/50'
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

        {/* === FOOTER DEL SIDEBAR (SCAN + CUENTA) === */}
        <div className="mt-auto pt-6 border-t border-[var(--brand-border)] space-y-6">
            
            {/* Botón Escanear */}
             <button
                onClick={() => navigate('/scan')}
                className="w-full flex items-center justify-center gap-2 bg-[var(--brand-accent)] text-black py-4 rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-[0_0_15px_var(--brand-accent)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
                <span className="font-black text-xs uppercase tracking-widest">Escanear</span>
              </button>

            {/* Apartado de Cuenta / Configuración */}
            <div 
                onClick={handleLogout}
                className="flex items-center gap-3 px-2 cursor-pointer hover:bg-[var(--brand-bg)] p-2 rounded-xl transition-colors group"
                title="Cerrar Sesión"
            >
                <div className="w-10 h-10 rounded-full bg-[var(--brand-border)] border border-[var(--brand-border)] flex items-center justify-center text-[var(--brand-text-muted)] group-hover:border-[var(--brand-primary)] transition-colors overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div className="overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-[var(--brand-primary)] tracking-wider truncate">
                        {user?.email?.split('@')[0] || 'Mi Cuenta'}
                    </p>
                    <p className="text-[9px] text-[var(--brand-text-muted)] truncate group-hover:text-red-500 transition-colors">Cerrar Sesión</p>
                </div>
            </div>
        </div>
      </aside>

      {/* === HEADER MÓVIL (Visible solo en Móvil lg:hidden) === */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-[var(--brand-surface)]/95 backdrop-blur-xl border-b border-[var(--brand-border)] z-40 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <h1 className="text-xl font-black italic tracking-tighter uppercase text-[var(--brand-primary)]">
            AXIS<span className="text-[var(--brand-accent)]">.ops</span>
          </h1>
        </div>
        <button 
            onClick={handleLogout}
            className="w-8 h-8 rounded-full bg-[var(--brand-border)] flex items-center justify-center text-[var(--brand-text-muted)]"
        >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        </button>
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
                  className="relative -top-8 bg-[var(--brand-accent)] w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-[0_0_20px_rgba(var(--brand-accent),0.4)] hover:scale-105 active:scale-95 transition-all border-4 border-[var(--brand-bg)] z-10 text-black"
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