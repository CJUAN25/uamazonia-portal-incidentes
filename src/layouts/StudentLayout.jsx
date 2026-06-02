import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import NotificationsPopover from '../components/NotificationsPopover';

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifBtnRef = useRef(null);
  const notifDropdownRef = useRef(null);

  const [userEmail, setUserEmail] = useState('');
  const [userInitials, setUserInitials] = useState('ES');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        setUserEmail(user.email);
        const namePart = user.email.split('@')[0];
        const initials = namePart.substring(0, 2).toUpperCase();
        setUserInitials(initials || 'ES');
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Cerrando sesión...');
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada correctamente', { id: toastId });
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Error al cerrar sesión', { id: toastId });
    }
  };

  const isActive = (path) => location.pathname === path;

  // Close notifications on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isNotificationsOpen &&
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(e.target) &&
        notifBtnRef.current &&
        !notifBtnRef.current.contains(e.target)
      ) {
        setIsNotificationsOpen(false);
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

  return (
    <div className="min-h-screen w-full relative flex text-white overflow-hidden bg-black selection:bg-primary selection:text-on-primary">
      {/* Ambient cinematic background */}
      <div className="fixed inset-0 z-0 print:hidden">
        <img src="/images/bg-campus.jpg" alt="Fondo" className="w-full h-full object-cover opacity-20" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none"></div>
      </div>

      {/* SideNavBar / BottomNav Component */}
      <nav className="bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl fixed z-50 transition-all duration-300 bottom-0 left-0 w-full h-20 flex flex-row items-center justify-around px-4 md:h-[calc(100vh-40px)] md:w-64 md:rounded-lg md:m-5 md:flex-col md:justify-between md:py-8 md:top-0 md:bottom-auto print:hidden">
        <div className="w-full md:w-auto flex flex-row md:flex-col items-center justify-around md:justify-start md:block">
          {/* Brand */}
          <div className="hidden md:flex px-8 mb-12 items-center justify-start">
            <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">UDLA</span>
          </div>
          {/* Nav Links */}
          <ul className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 px-2 md:px-4 w-full md:w-auto justify-around md:justify-start">
            {/* Dashboard */}
            <li className="flex-1 md:flex-none">
              <Link
                to="/estudiante"
                className={`flex flex-col md:flex-row items-center justify-center md:justify-start space-y-1 md:space-y-0 md:space-x-4 px-2 md:px-4 py-2 md:py-3 transition-transform ${
                  isActive('/estudiante')
                    ? 'bg-primary/10 text-primary md:border-r-4 border-b-4 md:border-b-0 border-primary rounded-t-lg md:rounded-t-none md:rounded-l-full scale-100 md:scale-95'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20 transition-all duration-300 rounded-lg md:rounded-full'
                }`}
              >
                <span className="material-symbols-outlined" style={isActive('/estudiante') ? { fontVariationSettings: "'FILL' 1" } : undefined}>dashboard</span>
                <span className="font-label-caps text-[10px] md:text-label-caps block">Panel Principal</span>
              </Link>
            </li>
            {/* Reports */}
            <li className="flex-1 md:flex-none">
              <Link
                to="/estudiante/reportes"
                className={`flex flex-col md:flex-row items-center justify-center md:justify-start space-y-1 md:space-y-0 md:space-x-4 px-2 md:px-4 py-2 md:py-3 transition-transform ${
                  isActive('/estudiante/reportes')
                    ? 'bg-primary/10 text-primary md:border-r-4 border-b-4 md:border-b-0 border-primary rounded-t-lg md:rounded-t-none md:rounded-l-full scale-100 md:scale-95'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20 transition-all duration-300 rounded-lg md:rounded-full'
                }`}
              >
                <span className="material-symbols-outlined" style={isActive('/estudiante/reportes') ? { fontVariationSettings: "'FILL' 1" } : undefined}>analytics</span>
                <span className="font-label-caps text-[10px] md:text-label-caps block">Mis Reportes</span>
              </Link>
            </li>
            {/* Profile Mobile */}
            <li className="flex-1 flex md:hidden items-center justify-center">
              <Link to="/estudiante/configuracion" className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs shadow-[0px_4px_10px_rgba(52,171,30,0.3)] cursor-pointer">
                {userInitials}
              </Link>
            </li>
          </ul>
        </div>
 
        {/* Footer / Profile Desktop */}
        <div className="hidden md:flex px-4 flex-col items-start md:px-8 space-y-6 w-full">
          <ul className="flex flex-col space-y-2 w-full">
            <li>
              <Link 
                to="/estudiante/ayuda" 
                className={`flex items-center space-x-4 px-4 py-2 transition-all duration-300 rounded-full justify-start ${
                  isActive('/estudiante/ayuda')
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20'
                }`}
              >
                <span className="material-symbols-outlined" style={isActive('/estudiante/ayuda') ? { fontVariationSettings: "'FILL' 1" } : undefined}>help_outline</span>
                <span className="font-label-caps text-label-caps block">Centro de Ayuda</span>
              </Link>
            </li>
            <li>
              <button onClick={handleSignOut} className="flex items-center space-x-4 px-4 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20 transition-all duration-300 rounded-full justify-start w-full text-left bg-transparent border-none outline-none">
                <span className="material-symbols-outlined">logout</span>
                <span className="font-label-caps text-label-caps block">Cerrar Sesión</span>
              </button>
            </li>
          </ul>
          <Link to="/estudiante/configuracion" className="flex items-center space-x-3 bg-white/[0.03] border border-white/5 p-2 rounded-full w-full justify-start mt-4 cursor-pointer hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 -mx-2">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold shadow-[0px_4px_10px_rgba(52,171,30,0.3)]">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-body-md text-xs font-semibold text-on-surface truncate">{userEmail || 'Estudiante'}</p>
            </div>
          </Link>
        </div>
      </nav>

      {/* Main Canvas */}
      <main className="w-full md:ml-[280px] print:ml-0 flex-1 min-h-screen relative z-10 overflow-hidden pb-24 md:pb-0 print:pb-0">
        {/* TopAppBar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full px-4 md:px-8 lg:pr-20 py-6 md:py-8 bg-transparent sticky top-0 z-40 gap-4 sm:gap-0 backdrop-blur-sm sm:backdrop-blur-none relative print:hidden">
          <div>
            <h1 className="font-headline-lg-mobile lg:font-headline-lg text-2xl sm:text-headline-lg-mobile lg:text-headline-lg font-bold text-on-background tracking-tight">
              {isActive('/estudiante/configuracion') 
                ? 'Configuración' 
                : isActive('/estudiante/reportes')
                ? 'Mis Reportes'
                : isActive('/estudiante/ayuda')
                ? 'Centro de Ayuda'
                : 'Panel Principal'}
            </h1>
          </div>
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-0 sm:space-x-6">
            {/* Trailing Icons */}
            <div className="flex space-x-4 text-on-surface-variant mr-4 sm:mr-0">
              <button
                ref={notifBtnRef}
                className="hover:text-primary transition-colors relative"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNotificationsOpen((prev) => !prev);
                }}
                aria-expanded={isNotificationsOpen}
                aria-haspopup="true"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-secondary-container rounded-full" />
              </button>
            </div>
          </div>

          {/* Notifications Popover */}
          <NotificationsPopover
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            ref={notifDropdownRef}
            role="estudiante"
          />
        </header>

        {/* Dynamic Page Content */}
        <Outlet />
      </main>
    </div>
  );
}
