import { forwardRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { obtenerNotificaciones } from '../services/incidentService';

const NotificationsPopover = forwardRef(function NotificationsPopover({ isOpen, onClose, role = 'estudiante' }, ref) {
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('notificaciones_leidas');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    return role === 'admin'
      ? localStorage.getItem('adminAlerts') !== 'false'
      : localStorage.getItem('studentAlerts') !== 'false';
  });

  const fetchNotificationsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || '';
      const notifs = await obtenerNotificaciones(role, userEmail);
      
      // Update read status based on saved readIds
      const updated = notifs.map((n) => {
        const isRead = readIds.includes(n.id);
        return {
          ...n,
          leido: isRead,
          leida: isRead
        };
      });
      setNotifications(updated);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotificationsData();
    }
  }, [isOpen, role, readIds]);

  useEffect(() => {
    const handleSync = () => {
      fetchNotificationsData();
      setAlertsEnabled(
        role === 'admin'
          ? localStorage.getItem('adminAlerts') !== 'false'
          : localStorage.getItem('studentAlerts') !== 'false'
      );
    };
    window.addEventListener('notificacionesActualizadas', handleSync);
    window.addEventListener('reporteCreado', handleSync);
    window.addEventListener('reporteActualizado', handleSync);
    return () => {
      window.removeEventListener('notificacionesActualizadas', handleSync);
      window.removeEventListener('reporteCreado', handleSync);
      window.removeEventListener('reporteActualizado', handleSync);
    };
  }, [role]);

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    const newReadIds = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(newReadIds);
    localStorage.setItem('notificaciones_leidas', JSON.stringify(newReadIds));
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        leido: true,
        leida: true,
      }))
    );
    window.dispatchEvent(new Event('notificacionesActualizadas'));
  };

  const formatNotifDate = (dateStr) => {
    if (!dateStr) return 'Ahora';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('es-ES');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div
      ref={ref}
      className={`absolute top-full right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl transition-all duration-200 ease-in-out z-[100] overflow-hidden flex flex-col text-white ${
        isOpen
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-[-10px] pointer-events-none'
      }`}
    >
      {/* Dropdown Header */}
      <div className="px-4 py-3 border-b border-zinc-700 flex justify-between items-center bg-zinc-950 z-10">
        <h3 className="font-headline-md text-body-lg font-semibold font-sans text-zinc-100">Notificaciones</h3>
        <button
          onClick={handleMarkAllAsRead}
          className="font-label-caps text-zinc-400 hover:text-primary transition-colors focus:outline-none text-[11px]"
        >
          Marcar todas como leídas
        </button>
      </div>

      {/* Scrollable List */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-zinc-900">
        {!alertsEnabled ? (
          <div className="text-sm py-12 px-6 text-center text-zinc-400">
            Las notificaciones están desactivadas en tu configuración
          </div>
        ) : (
          <>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`block p-4 transition-colors border-b border-zinc-700/50 relative group ${
                  notif.leida ? 'opacity-60 bg-zinc-900 hover:bg-zinc-800/50' : 'bg-zinc-800 hover:bg-zinc-700/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 relative flex-shrink-0">
                    <span className={`material-symbols-outlined ${notif.leida ? 'text-zinc-500' : 'text-primary'}`}>
                      {role === 'admin' ? 'info' : 'update'}
                    </span>
                    {!notif.leida && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_rgba(106,224,80,0.6)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md font-semibold mb-0.5 truncate group-hover:text-primary transition-colors text-zinc-100">
                      {notif.titulo}
                    </p>
                    <p className="font-body-md text-sm text-zinc-400 line-clamp-2 leading-snug mb-1">
                      {notif.mensaje}
                    </p>
                    <span className="font-label-caps text-xs text-zinc-500">{formatNotifDate(notif.fecha)}</span>
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-zinc-400 text-center py-4 text-sm font-body-md">
                No tienes notificaciones nuevas en este momento.
              </div>
            )}
          </>
        )}
      </div>

      {/* Dropdown Footer */}
      <div className="p-3 border-t border-zinc-700 bg-zinc-950 z-10 text-center">
        <Link
          onClick={onClose}
          className="inline-block font-body-md text-sm font-semibold text-zinc-400 hover:text-[#34AB1E] transition-colors focus:outline-none"
          to={role === 'admin' ? '/admin' : '/estudiante/reportes'}
        >
          Ver historial
        </Link>
      </div>
    </div>
  );
});

export default NotificationsPopover;
