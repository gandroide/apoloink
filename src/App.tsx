import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Accounting } from './pages/Accounting';
import { InventoryPage } from './pages/InventoryPage';
import { ArtistsPage } from './pages/ArtistsPage';
import { ArtistDetail } from './pages/ArtistDetails';
import { ExpensesPage } from './pages/ExpensesPage';
import { EditWorkPage } from './pages/EditionWorkPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 font-sans">
        
        {/* HEADER FIJO RESPONSIVO */}
        <header className="p-6 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-2 md:px-6">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter italic text-white uppercase">
              APOLO INK
            </h1>
            <div className="flex items-center gap-3">
              <span className="hidden md:block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Status: Online</span>
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]"></div>
            </div>
          </div>
        </header>

        {/* CUERPO DE LA APP - Liberado para pantallas grandes */}
        <main className="max-w-7xl mx-auto p-4 md:p-10 lg:p-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/team" element={<ArtistsPage />} />
            <Route path="/team/:id" element={<ArtistDetail />} />
            <Route path="/edit-work/:id" element={<EditWorkPage />} />
          </Routes>
        </main>

        {/* MENÚ INFERIOR (BOTONERA) */}
        <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 p-4 pb-8 z-50">
          {/* max-w-lg mantiene los botones juntos y cómodos al centro en pantallas grandes */}
          <div className="max-w-lg mx-auto flex justify-around items-center">
            <NavButton to="/" icon="📊" label="Dash" />
            <NavButton to="/team" icon="👨‍🎨" label="Equipo" />
            <NavButton to="/expenses" icon="💸" label="Gastos" />
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

export default App;