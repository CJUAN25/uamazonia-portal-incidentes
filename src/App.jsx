import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/auth/Login'
import StudentLayout from './layouts/StudentLayout'
import Dashboard from './pages/student/Dashboard'
import Settings from './pages/student/Settings'
import Reports from './pages/student/Reports'
import HelpCenter from './pages/student/HelpCenter'
import AdminLayout from './layouts/AdminLayout'
import CommandCenter from './pages/admin/CommandCenter'
import Grouping from './pages/admin/Grouping'
import Analytics from './pages/admin/Analytics'
import AdminSettings from './pages/admin/AdminSettings'
import NotFound from './pages/NotFound'
import { supabase } from './lib/supabase'

function RequireAuth({ children, session, loading }) {
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener la sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        localStorage.setItem('currentUser', JSON.stringify({ email: session.user.email }));
      } else {
        localStorage.removeItem('currentUser');
      }
      setLoading(false);
    });

    // 2. Escuchar cambios de estado en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) {
        localStorage.setItem('currentUser', JSON.stringify({ email: session.user.email }));
      } else {
        localStorage.removeItem('currentUser');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #27272a'
          }
        }}
      />
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Student module – nested under StudentLayout */}
        <Route 
          path="/estudiante" 
          element={
            <RequireAuth session={session} loading={loading}>
              <StudentLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="configuracion" element={<Settings />} />
          <Route path="reportes" element={<Reports />} />
          <Route path="ayuda" element={<HelpCenter />} />
        </Route>

        {/* Admin module – nested under AdminLayout */}
        <Route 
          path="/admin" 
          element={
            <RequireAuth session={session} loading={loading}>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<CommandCenter />} />
          <Route path="agrupacion" element={<Grouping />} />
          <Route path="analitica" element={<Analytics />} />
          <Route path="configuracion" element={<AdminSettings />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
