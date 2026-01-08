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
import { OnboardingPage } from './pages/OnboardingPages';
import { AdminDashboard } from './pages/AdminDashboard'; 
import { AuthSuccess } from './pages/AuthSuccess';
import SettingsPage from './pages/SettingsPage'; 
import LandingPage from './pages/LandingPage'; // <--- 1. NUEVA IMPORTACIÓN

// --- COMPONENTE DE CARGA ---
const LoadingScreen = ({ text }: { text: string }) => (
  <div className="h-screen w-full bg-black flex items-center justify-center">
    <div className="text-zinc-500 font-bold text-xs uppercase tracking-[0.3em] animate-pulse">
      {text}
    </div>
  </div>
);

// --- GUARDIA DE ESTUDIO ---
function StudioGuard({ children }: { readonly children: JSX.Element }) {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasStudio, setHasStudio] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const checkMembership = async () => {
      try {
        const { data, error } = await supabase
          .from('studio_members')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle(); 

        if (!error && data) {
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

  if (loading || authLoading) return <LoadingScreen text="Cargando Espacio..." />;

  if (!hasStudio) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  // 1. Configurar Tema
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

  // 2. Verificar ROL
  useEffect(() => {
    let isMounted = true; 

    if (authLoading) return; 
    
    if (!user) {
      setRoleLoading(false);
      return;
    }

    const checkRole = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_super_admin')
          .eq('id', user.id)
          .maybeSingle(); 

        if (isMounted) {
          if (error) {
            console.warn("Error verificando rol (puede ser temporal):", error.message);
            setIsSuperAdmin(false); 
          } else {
            setIsSuperAdmin(!!data?.is_super_admin);
          }
          setRoleLoading(false);
        }
      } catch (err) {
        console.error("Error inesperado en roles:", err);
        if (isMounted) setRoleLoading(false);
      }
    };

    checkRole();

    return () => { isMounted = false; }; 
  }, [user, authLoading]);

  // A. PANTALLA DE CARGA
  if (authLoading || (user && roleLoading)) {
    return <LoadingScreen text="Iniciando AXIS.ops..." />;
  }

  // B. RUTAS PÚBLICAS (MODIFICADO: LANDING PAGE ES LA PRINCIPAL)
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} /> {/* <--- 2. ROOT es LANDING PAGE */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/" replace />} /> {/* <--- Fallback a Landing */}
      </Routes>
    );
  }

  // C. RUTAS DE SUPER ADMIN
  if (isSuperAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  // D. RUTAS DE USUARIO NORMAL
  return (
    <Routes>
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } />

      <Route path="/auth-success" element={<AuthSuccess />} />

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
              
              {/* --- RUTA DE CONFIGURACIÓN --- */}
              <Route path="/settings" element={<SettingsPage />} />
              
              <Route path="/admin" element={<Navigate to="/" replace />} />
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