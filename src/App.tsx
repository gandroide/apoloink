import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { supabase } from './lib/supabase';
import { useEffect } from 'react';

// Páginas
import { Dashboard } from './pages/Dashboard';
import { Accounting } from './pages/Accounting';
import { InventoryPage } from './pages/InventoryPage';
import { ArtistsPage } from './pages/ArtistsPage';
import { ArtistDetails } from './pages/ArtistDetails';
import { ExpensesPage } from './pages/ExpensesPage';
import { EditWorkPage } from './pages/EditionWorkPage';
import { NewWorkPage } from './pages/NewWorkPage';
import { ArchivedArtistsPage } from './pages/ArchiveArtistPage';
import { Login } from './pages/Login';
import { ScannerPage } from './pages/ScannerPage';
import { DocumentationPage } from './pages/DocumentationPage';

function AppContent() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('axis-theme') || 'dark';
    const root = document.documentElement;
    
    // Temas para asegurar consistencia al recargar
    const themes: any = {
      dark: { bg: '#000000', surface: '#0a0a0a', primary: '#ffffff', accent: '#10b981', border: '#1a1a1a' },
      light: { bg: '#fafafa', surface: '#ffffff', primary: '#000000', accent: '#020617', border: '#e5e7eb' }
    };

    const theme = themes[savedTheme];
    if (theme) {
      root.style.setProperty('--brand-bg', theme.bg);
      root.style.setProperty('--brand-surface', theme.surface);
      root.style.setProperty('--brand-primary', theme.primary);
      root.style.setProperty('--brand-accent', theme.accent);
      root.style.setProperty('--brand-border', theme.border);
    }
  }, []);

  return (
    // Fondo general del body (el degradado del CSS actúa aquí)
    <div className="min-h-screen w-full flex flex-col items-center py-0 md:py-8 lg:py-12 px-0 md:px-4">
      
      {/* CONTENEDOR FLOTANTE: Este es el que elimina la sensación de "cuadro negro" plano */}
      <div className={`w-full ${user ? 'max-w-[1440px] app-container md:rounded-[3.5rem] overflow-hidden min-h-[90vh]' : 'max-w-md'} flex flex-col relative`}>
        
        {/* HEADER */}
        {user && (
          <header className="p-6 border-b border-[var(--brand-border)] bg-[var(--brand-surface)]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-2 md:px-6">
              <h1 className="text-xl md:text-2xl font-black tracking-tighter italic text-[var(--brand-primary)] uppercase">
                AXIS ops
              </h1>
              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-[10px] font-black text-[var(--brand-text-muted)] uppercase tracking-[0.3em]">Status: Online</span>
                  <div className="h-2 w-2 rounded-full bg-[var(--brand-accent)] shadow-[0_0_12px_var(--brand-accent)]"></div>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="text-[9px] font-black text-[var(--brand-text-muted)] hover:text-red-500 uppercase tracking-widest transition-colors border border-[var(--brand-border)] px-3 py-1 rounded-full"
                >
                  Salir
                </button>
              </div>
            </div>
          </header>
        )}

        {/* CUERPO DE LA APP */}
        <main className="flex-1">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/accounting" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><ArtistsPage /></ProtectedRoute>} />
            <Route path="/team/:id" element={<ProtectedRoute><ArtistDetails /></ProtectedRoute>} />
            <Route path="/edit-work/:id" element={<ProtectedRoute><EditWorkPage /></ProtectedRoute>} />
            <Route path="/new-work" element={<ProtectedRoute><NewWorkPage /></ProtectedRoute>} />
            <Route path="/team/archived" element={<ProtectedRoute><ArchivedArtistsPage /></ProtectedRoute>} />
            <Route path="/scan" element={<ProtectedRoute><ScannerPage /></ProtectedRoute>} />
            <Route path="/guide" element={<DocumentationPage />} />
            <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
          </Routes>
        </main>

        {/* MENÚ INFERIOR */}
        {user && (
          <nav className="sticky bottom-0 left-0 right-0 bg-[var(--brand-surface)]/90 backdrop-blur-xl border-t border-[var(--brand-border)] p-4 pb-8 z-50">
            <div className="max-w-lg mx-auto flex justify-around items-center gap-1">
              <NavButton to="/" icon="📊" label="Dash" />
              <NavButton to="/inventory" icon="📦" label="Stock" />
              <NavButton to="/team" icon="👨‍🎨" label="Equipo" />
              <NavButton to="/expenses" icon="💸" label="Gastos" />
              <NavButton to="/accounting" icon="💰" label="Cuentas" />
              <NavButton to="/guide" icon="📖" label="Guía" />
            </div>
          </nav>
        )}
      </div>

      {/* FOOTER DE LA PÁGINA (Fuera del contenedor flotante) */}
      {user && (
        <footer className="mt-8 opacity-20 text-[9px] font-bold uppercase tracking-[0.5em] text-[var(--brand-primary)]">
          AXIS.ops Business Intelligence — 2025
        </footer>
      )}
    </div>
  );
}

// NavButton (Sin cambios, solo usa variables)
function NavButton({ to, icon, label }: { to: string, icon: string, label: string }) {
  const location = useLocation();
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center gap-1 transition-all duration-300 relative group ${
        isActive ? 'text-[var(--brand-primary)] scale-110' : 'text-[var(--brand-text-muted)]'
      }`}
    >
      <span className={`text-xl transition-transform duration-300 ${isActive ? 'translate-y-[-2px]' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-40'}`}>
        {label}
      </span>
      {isActive && (
        <div className="absolute -bottom-2 h-1 w-1 bg-[var(--brand-primary)] rounded-full shadow-[0_0_8px_var(--brand-primary)]"></div>
      )}
    </Link>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}