import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { useEffect, useState, type JSX } from 'react';
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
import { SignUp } from './pages/SignUp';
import { ScannerPage } from './pages/ScannerPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { OnboardingPage } from './pages/OnboardingPages'; // Confirma nombre de archivo

// --- GUARDIA DE ESTUDIO (STUDIO GUARD) ---
// Este componente evita el "Flash" del Dashboard.
// Verifica en la BD si el usuario pertenece a un estudio antes de mostrar nada.
function StudioGuard({ children }: { readonly children: JSX.Element }) {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasStudio, setHasStudio] = useState(false);

  useEffect(() => {
    // 1. Si AuthContext aún carga, esperamos.
    if (authLoading) return;

    // 2. Si no hay usuario, la ruta protegida se encargará, pero por seguridad paramos.
    if (!user) {
      setLoading(false);
      return;
    }

    const checkMembership = async () => {
      try {
        // Consultamos si existe ALGUNA membresía para este usuario
        const { data, error } = await supabase
          .from('studio_members')
          .select('id') // Solo necesitamos saber si existe una ID
          .eq('user_id', user.id)
          .limit(1);

        // Si hay error o el array está vacío, NO tiene estudio.
        if (!error && data && data.length > 0) {
          setHasStudio(true);
        } else {
          setHasStudio(false);
        }
      } catch (err) {
        console.error("Error verificando estudio:", err);
        setHasStudio(false);
      } finally {
        setLoading(false);
      }
    };

    checkMembership();
  }, [user, authLoading]);

  // A. MIENTRAS VERIFICAMOS: Pantalla Negra (Bloquea el Dashboard)
  if (loading || authLoading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-zinc-500 font-bold text-xs uppercase tracking-[0.3em] animate-pulse">
          Cargando Espacio...
        </div>
      </div>
    );
  }

  // B. SI NO TIENE ESTUDIO: Redirigir al Onboarding
  if (!hasStudio) {
    return <Navigate to="/onboarding" replace />;
  }

  // C. SI TIENE ESTUDIO: Mostrar la App (Dashboard, etc)
  return children;
}

function AppContent() {
  const { user } = useAuth();

  // Tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('axis-theme') || 'dark';
    const root = document.documentElement;
    const themes: any = {
      dark: { bg: '#000000', surface: '#0a0a0a', primary: '#ffffff', accent: '#10b981', border: '#1a1a1a' },
      light: { bg: '#fafafa', surface: '#ffffff', primary: '#000000', accent: '#020617', border: '#e5e7eb' }
    };
    const theme = themes[savedTheme];
    if (theme) Object.entries(theme).forEach(([k, v]) => root.style.setProperty(`--brand-${k}`, v as string));
  }, []);

  // Rutas Públicas (Login/Signup)
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Rutas Privadas
  return (
    <Routes>
      {/* 1. ONBOARDING (Aislado, SIN Sidebar) */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } />

      {/* 2. APP PRINCIPAL (Con Sidebar + StudioGuard) */}
      <Route path="/*" element={
        <AppLayout>
          <StudioGuard>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/team" element={<ArtistsPage />} />
              <Route path="/team/:id" element={<ArtistDetails />} />
              <Route path="/team/archived" element={<ArchivedArtistsPage />} />
              <Route path="/new-work" element={<NewWorkPage />} />
              <Route path="/edit-work/:id" element={<EditWorkPage />} />
              <Route path="/scan" element={<ScannerPage />} />
              <Route path="/guide" element={<DocumentationPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </StudioGuard>
        </AppLayout>
      } />
    </Routes>
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