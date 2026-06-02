import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import NotificationsPopover from '../components/NotificationsPopover';

export default function AdminLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notifBtnRef = useRef(null);
  const notifDropdownRef = useRef(null);

  const [userEmail, setUserEmail] = useState('');
  const [userInitials, setUserInitials] = useState('AD');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error('Error fetching user', error);
      const userData = data?.user;
      if (userData) {
        setUser(userData);
        setUserEmail(userData.email);
        const fullName = userData.user_metadata?.full_name;
        const nameForInitials = fullName || userData.email.split('@')[0];
        const initials = nameForInitials.substring(0, 2).toUpperCase();
        setUserInitials(initials || 'AD');
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async (e) => {
    if (e) e.preventDefault();
    try {
      // 1. Cerrar sesión en el backend
      await supabase.auth.signOut();
      // 2. Destruir toda la memoria local y de sesión del navegador
      localStorage.clear();
      sessionStorage.clear();
      // 3. Destruir el árbol de React y forzar recarga limpia hacia el login
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión', error);
      // En caso de error, igualmente forzar la salida limpia
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  const isActive = (path) => location.pathname === path;

  // Close notifications on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isNotificationsOpen) {
        // Look for the open notifications dropdown
        const dropdown = notifDropdownRef.current;
        const btn = notifBtnRef.current;
        if (
          dropdown &&
          !dropdown.contains(e.target) &&
          (!btn || !btn.contains(e.target)) &&
          !e.target.closest('.notif-btn')
        ) {
          setIsNotificationsOpen(false);
        }
      }
    };
    const handleEscape = (e) => {
      if (isNotificationsOpen && e.key === 'Escape') {
        setIsNotificationsOpen(false);
        notifBtnRef.current?.focus();
      }
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isNotificationsOpen]);

  const navLinks = [
    { to: '/admin', label: 'Panel Central', icon: 'dashboard' },
    { to: '/admin/agrupacion', label: 'Gestión y Agrupación', icon: 'group_work' },
    { to: '/admin/analitica', label: 'Analítica Global', icon: 'analytics' },
  ];

  return (
    <div className="h-[100dvh] w-full fixed inset-0 overflow-hidden overscroll-none flex text-white bg-black">
      {/* Ambient Glassmorphism Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none print:hidden">
        <img src="/images/bg-campus.jpg" alt="Fondo" className="w-full h-full object-cover opacity-20" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none"></div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex flex-col p-6"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex justify-end mb-4">
            <button className="text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav className="flex-grow space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(link.to)
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-on-surface/60 hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={isActive(link.to) ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {link.icon}
                </span>
                <span className={`text-sm ${isActive(link.to) ? 'font-bold' : 'font-semibold'}`}>{link.label}</span>
              </Link>
            ))}
          </nav>
            {/* Profile Access Link */}
            <Link to="/admin/configuracion" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-2 bg-white/[0.03] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 -mx-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">{userInitials}</div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold truncate">{userEmail.split('@')[0] || 'Administrador'}</p>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">SUPER ADMIN</span>
              </div>
            </Link>
          <div className="mt-auto pt-6 border-t border-white/10">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 mt-4 px-4 py-2 text-red-400 hover:text-red-300 transition-colors w-full text-left bg-transparent border-none outline-none"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (>= 1024px / lg) */}
      <aside id="admin-sidebar" className="hidden lg:flex flex-col w-64 h-full bg-black/40 backdrop-blur-2xl border-r border-white/10 z-20 flex-shrink-0 relative print:hidden">
        <div className="mb-10">
          <h1 className="text-2xl font-black text-primary tracking-tight">U-Amazonia</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface/40 font-bold">Admin Console</p>
        </div>
        <nav className="flex-1 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(link.to)
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-on-surface/60 hover:text-on-surface hover:bg-white/5'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive(link.to) ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {link.icon}
              </span>
              <span className={`text-sm ${isActive(link.to) ? 'font-bold' : 'font-semibold'}`}>{link.label}</span>
            </Link>
          ))}
        </nav>
        {/* Profile Card */}
        <div className="mt-auto pt-6 border-t border-white/10">
          <Link to="/admin/configuracion" className="flex items-center gap-3 p-2 bg-white/[0.03] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 -mx-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">{userInitials}</div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-bold truncate">{userEmail.split('@')[0] || 'Administrador'}</p>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">SUPER ADMIN</span>
            </div>
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-3 mt-4 px-4 py-2 text-red-400 hover:text-red-300 transition-colors w-full text-left bg-transparent border-none outline-none">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenedor Derecho (Topbar + Contenido) */}
      <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        {/* Mobile Header (< 1024px / lg) */}
        <header id="admin-topbar" className="flex lg:hidden h-16 w-full items-center justify-between px-4 bg-black/40 backdrop-blur-2xl border-b border-white/10 shrink-0 print:hidden relative z-50">
          <div className="flex items-center gap-2">
            <span className="text-[#34AB1E] font-bold text-xl tracking-tight">U-Amazonia</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsNotificationsOpen(!isNotificationsOpen);
              }}
              className="notif-btn p-2 text-zinc-400 hover:text-white relative flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#34AB1E] rounded-full animate-pulse" />
            </button>
            <button
              className="p-2 text-zinc-400 hover:text-white flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
          {/* Mobile Notifications Popover */}
          <NotificationsPopover
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            role="admin"
          />
        </header>

        {/* Desktop Topbar */}
        <header className="hidden lg:flex h-16 flex-shrink-0 bg-black/40 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-4 lg:px-8 z-20 print:hidden">
          <div className="flex-grow" />
          <button
            ref={notifBtnRef}
            onClick={(e) => {
              e.stopPropagation();
              setIsNotificationsOpen(!isNotificationsOpen);
            }}
            className="notif-btn p-2 text-zinc-400 hover:text-white relative flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#34AB1E] rounded-full animate-pulse" />
          </button>
          {/* Desktop Notifications Popover */}
          <NotificationsPopover
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            ref={notifDropdownRef}
            role="admin"
          />
        </header>

        {/* Área de Scroll Interno (El secreto del Layout) */}
        <main className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
