import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { supabase } from './lib/supabase';

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

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();

  // Función para cerrar sesión
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 font-sans">
      
      {/* HEADER: Solo se muestra si el usuario está logueado */}
      {user && (
        <header className="p-6 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-2 md:px-6">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter italic text-white uppercase">
              APOLO INK
            </h1>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-3">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Status: Online</span>
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]"></div>
              </div>
              {/* Botón de Logout pequeño y discreto */}
              <button 
                onClick={handleSignOut}
                className="text-[9px] font-black text-zinc-600 hover:text-red-500 uppercase tracking-widest transition-colors border border-zinc-800 px-3 py-1 rounded-full"
              >
                Salir
              </button>
            </div>
          </div>
        </header>
      )}

      {/* CUERPO DE LA APP */}
      <main className={`${user ? 'max-w-7xl mx-auto p-4 md:p-10 lg:p-12' : ''}`}>
        <Routes>
          {/* Ruta Pública */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

          {/* Rutas Protegidas */}
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

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
      </main>

      {/* MENÚ INFERIOR: Solo se muestra si el usuario está logueado */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 p-4 pb-8 z-50 animate-in slide-in-from-bottom duration-500">
          <div className="max-w-lg mx-auto flex justify-around items-center">
            <NavButton to="/" icon="📊" label="Dash" />
            <NavButton to="/team" icon="👨‍🎨" label="Equipo" />
            <NavButton to="/expenses" icon="💸" label="Gastos" />
            <NavButton to="/accounting" icon="💰" label="Cuentas" />
            <NavButton to="/inventory" icon="📦" label="Stock" />
          </div>
        </nav>
      )}
    </div>
  );
}

// Componente para botones del menú
function NavButton({ to, icon, label }: { to: string, icon: string, label: string }) {
  const location = useLocation();
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center gap-1 transition-all duration-300 relative group ${
        isActive ? 'text-white scale-110' : 'text-zinc-600'
      }`}
    >
      <span className={`text-xl transition-transform duration-300 ${isActive ? 'translate-y-[-2px]' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-40'}`}>
        {label}
      </span>
      {isActive && (
        <div className="absolute -bottom-2 h-1 w-1 bg-white rounded-full shadow-[0_0_8px_white]"></div>
      )}
    </Link>
  );
}

// App Wrapper con Providers
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}