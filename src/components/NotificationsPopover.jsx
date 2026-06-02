import { forwardRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotificationsPopover = forwardRef(function NotificationsPopover({ isOpen, onClose, role = 'estudiante' }, ref) {
  const [notifications, setNotifications] = useState(() => {
    const data = localStorage.getItem('notificaciones');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Error parsing notifications', e);
      }
    }
    const initial = [
      {
        id: 1,
        rol: 'estudiante',
        titulo: 'Estado actualizado',
        mensaje: 'Tu reporte #INC-012 ahora está "En Proceso".',
        time: 'Hace 10 min',
        type: 'update',
        leida: false,
      },
      {
        id: 2,
        rol: 'estudiante',
        titulo: 'Incidente Resuelto',
        mensaje: 'La fuga de agua en el Bloque C ha sido solucionada.',
        time: 'Ayer a las 14:30',
        type: 'check_circle',
        leida: true,
      },
      {
        id: 3,
        rol: 'estudiante',
        titulo: 'Mantenimiento del Campus',
        mensaje: 'Corte de energía programado para el ala norte este fin de semana.',
        time: 'Hace 2 días',
        type: 'info',
        leida: true,
      },
      {
        id: 4,
        rol: 'admin',
        titulo: 'Nuevo Reporte',
        mensaje: 'Se ha reportado un daño en Plomería',
        time: 'Hace 5 min',
        type: 'info',
        leida: false,
      }
    ];
    localStorage.setItem('notificaciones', JSON.stringify(initial));
    return initial;
  });

  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    return role === 'admin'
      ? localStorage.getItem('adminAlerts') !== 'false'
      : localStorage.getItem('studentAlerts') !== 'false';
  });

  useEffect(() => {
    const handleSync = () => {
      const data = localStorage.getItem('notificaciones');
      if (data) {
        try {
          setNotifications(JSON.parse(data));
        } catch (e) {
          console.error(e);
        }
      }
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
    const updated = notifications.map((n) => {
      if (n.rol === role) {
        return { ...n, leida: true };
      }
      return n;
    });
    setNotifications(updated);
    localStorage.setItem('notificaciones', JSON.stringify(updated));
    window.dispatchEvent(new Event('notificacionesActualizadas'));
  };

  const filteredNotifications = notifications.filter((n) => n.rol === role);

  return (
    <div
      ref={ref}
      className={`absolute top-full right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl transition-all duration-200 ease-in-out z-50 overflow-hidden flex flex-col ${
        isOpen
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-[-10px] pointer-events-none'
      }`}
    >
      {/* Dropdown Header */}
      <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-md z-10">
        <h3 className="font-headline-md text-body-lg font-semibold text-on-surface font-sans text-white">Notificaciones</h3>
        <button
          onClick={handleMarkAllAsRead}
          className="font-label-caps text-zinc-400 hover:text-primary transition-colors focus:outline-none text-[11px]"
        >
          Marcar todas como leídas
        </button>
      </div>

      {/* Scrollable List */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-transparent">
        {!alertsEnabled ? (
          <div className="text-sm py-12 px-6 text-center text-zinc-400">
            Las notificaciones están desactivadas en tu configuración
          </div>
        ) : (
          <>
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`block p-4 transition-colors border-b border-white/10 relative group ${
                  notif.leida ? 'opacity-60 bg-transparent hover:bg-white/5' : 'bg-white/[0.04] hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 relative flex-shrink-0">
                    <span className={`material-symbols-outlined ${notif.leida ? 'text-zinc-500' : 'text-primary'}`}>
                      {notif.type === 'update' ? 'update' : notif.type === 'check_circle' ? 'check_circle' : 'info'}
                    </span>
                    {!notif.leida && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_rgba(106,224,80,0.6)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-on-surface font-semibold mb-0.5 truncate group-hover:text-primary transition-colors text-white">
                      {notif.titulo || notif.title}
                    </p>
                    <p className="font-body-md text-sm text-zinc-400 line-clamp-2 leading-snug mb-1">
                      {notif.mensaje || notif.message}
                    </p>
                    <span className="font-label-caps text-xs text-zinc-500">{notif.time || 'Ahora'}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredNotifications.length === 0 && (
              <div className="text-zinc-550 text-sm py-8 text-center text-zinc-400">
                No tienes notificaciones.
              </div>
            )}
          </>
        )}
      </div>

      {/* Dropdown Footer */}
      <div className="p-3 border-t border-white/10 bg-black/40 backdrop-blur-md z-10 text-center">
        <Link
          onClick={onClose}
          className="inline-block font-body-md text-sm font-semibold text-zinc-450 hover:text-[#34AB1E] transition-colors focus:outline-none text-zinc-400"
          to={role === 'admin' ? '/admin' : '/estudiante/reportes'}
        >
          Ver historial
        </Link>
      </div>
    </div>
  );
});

export default NotificationsPopover;
