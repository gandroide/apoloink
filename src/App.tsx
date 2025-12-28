import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Accounting } from './pages/Accounting';
import { InventoryPage } from './pages/InventoryPage';
import { ArtistsPage } from './pages/ArtistsPage';
import { ArtistDetail } from './pages/ArtistDetails';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
        {/* HEADER FIJO */}
        <header className="p-6 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <h1 className="text-xl font-black tracking-tighter italic text-white">APOLO INK</h1>
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          </div>
        </header>

        {/* CUERPO DE LA APP: Aquí es donde React Router hace el cambio */}
        <main className="max-w-md mx-auto p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounting" element={<Accounting />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/team" element={<ArtistsPage />} />
          <Route path="/team/:id" element={<ArtistDetail />} />
        </Routes>
        </main>

        {/* MENÚ INFERIOR (BOTONERA) */}
        <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 p-4 pb-8 z-50">
          <div className="max-w-md mx-auto flex justify-around items-center">
            <NavButton to="/" icon="📊" label="Dash" />
            <NavButton to="/team" icon="👨‍🎨" label="Equipo" />
            <NavButton to="/accounting" icon="💰" label="Cuentas" />
            <NavButton to="/inventory" icon="📦" label="Stock" />
          </div>
        </nav>
      </div>
    </Router>
  );
}

// Componente para los botones del menú que detecta cuál está activo
function NavButton({ to, icon, label }: { to: string, icon: string, label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${
        isActive ? 'text-white scale-110' : 'text-zinc-500 opacity-60'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      {isActive && <div className="h-1 w-1 bg-white rounded-full mt-1"></div>}
    </Link>
  );
}

export default App;