import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { eliminarIncidente } from '../services/incidentService';

export default function IncidentDetailDrawer({ isOpen, onClose, incident }) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!isOpen || !incident) return null;

  const handleCancelReport = async () => {
    const toastId = toast.loading('Cancelando el reporte de incidente...');
    try {
      await eliminarIncidente(incident.id);
      
      // Dispatch events to refresh parent views
      window.dispatchEvent(new Event('reporteCreado'));
      
      // Add cancellation notification in localStorage to sync alert counts
      const notifData = localStorage.getItem('notificaciones');
      const notifs = notifData ? JSON.parse(notifData) : [];
      notifs.push({
        id: Date.now(),
        rol: 'admin',
        titulo: 'Reporte Cancelado',
        mensaje: `El estudiante canceló el reporte ${incident.id}`,
        leida: false,
        time: 'Ahora',
        type: 'info'
      });
      localStorage.setItem('notificaciones', JSON.stringify(notifs));
      window.dispatchEvent(new Event('notificacionesActualizadas'));

      toast.success('Reporte cancelado correctamente', { id: toastId });
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Error al cancelar el reporte', { id: toastId });
    }
  };

  const statusColor = {
    'En proceso': { bg: 'bg-[#E3F2FD]', text: 'text-blue-800', dot: 'bg-blue-500', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.8)]' },
    'Reportado': { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', glow: 'shadow-[0_0_8px_rgba(249,115,22,0.8)]' },
    'Resuelto': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', glow: 'shadow-[0_0_8px_rgba(34,197,94,0.8)]' },
  };

  const status = statusColor[incident.status] || statusColor['En proceso'];

  return (
    <>
      <div 
        className="fixed inset-0 z-[60] flex justify-end print:absolute print:inset-0 print:block" 
        onClick={onClose}
        style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm print:hidden" onClick={onClose} />

        {/* Drawer Container */}
        <section
          className="drawer-slide-in w-full max-w-[600px] h-[100dvh] flex flex-col bg-zinc-900/95 backdrop-blur-3xl border-l border-white/10 overflow-hidden relative z-10 print:relative print:w-full print:h-auto print:overflow-visible print:shadow-none print:border-none print:translate-x-0 print:transform-none print:bg-white print:text-black print:p-0 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header (Fijo) */}
          <header className="flex-shrink-0 z-20 px-6 py-6 border-b border-white/10 flex items-center justify-between print:bg-white print:text-black print:border-none">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="bg-primary/20 text-primary font-label-caps text-[10px] px-3 py-1 rounded-full uppercase tracking-widest print:border print:border-primary">
                  {incident.category || incident.categoria || 'INCIDENTE'}
                </span>
                <span className="text-zinc-400 font-body-md text-sm print:text-black">{incident.id}</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-white leading-tight print:text-black">
                {incident.title}
              </h2>
            </div>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 print:hidden hide-on-print animate-fade-in"
              onClick={onClose}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          {/* Cuerpo del Contenido (Zona de Scroll) */}
          <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-4 md:p-6 space-y-10 print:overflow-visible print:max-h-none print:p-0 print:space-y-6">
            {/* Evidence Image */}
            <div className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/40 print:border-none print:rounded-none">
              <img
                alt="Evidencia del incidente"
                className="w-full h-full object-cover print:max-h-64 print:object-contain print:break-inside-avoid"
                src={incident.image}
              />
              <button 
                onClick={() => setIsZoomed(true)}
                className="absolute top-4 right-4 bg-black/40 backdrop-blur-md rounded-full p-2 hover:bg-black/60 transition-colors print:hidden"
              >
                <span className="material-symbols-outlined text-white">open_in_full</span>
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-y-8 gap-x-4 print:grid-cols-2 print:gap-4 print:text-black">
              <div className="space-y-1">
                <p className="font-label-caps text-primary uppercase text-[10px] tracking-widest">Ubicación</p>
                <p className="font-body-md text-white print:text-black">{incident.location}</p>
                <p className="text-xs text-zinc-400">Coordenadas: {incident.coordinates}</p>
              </div>
              <div className="space-y-1">
                <p className="font-label-caps text-primary uppercase text-[10px] tracking-widest">Estado</p>
                <div className="pt-1">
                  <div className={`inline-flex items-center gap-2 ${status.bg} px-3 py-1 rounded-full`}>
                    <div className={`w-2 h-2 rounded-full ${status.dot} ${status.glow} animate-pulse print:animate-none`} />
                    <span className={`text-xs font-semibold ${status.text}`}>{incident.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 print:text-black">
              <p className="font-label-caps text-primary uppercase text-[10px] tracking-widest">Detalle del Incidente</p>
              <p className="font-body-lg text-white leading-relaxed opacity-90 print:text-black">
                {incident.description}
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-8 pb-10 print:text-black">
              <p className="font-label-caps text-primary uppercase text-[10px] tracking-widest">Historial de Trazabilidad</p>
              <div className="relative space-y-8 ml-3">
                {/* Timeline Line */}
                <div className="absolute left-[3px] top-2 bottom-2 w-[2px] bg-white/10 print:bg-zinc-200" />
                {(incident.historial || [
                  { estado: 'Reportado', fecha: incident.date, actor: 'Estudiante' }
                ]).map((hist, idx) => {
                  const formatHistDate = (dateStr) => {
                    try {
                      const d = new Date(dateStr);
                      if (isNaN(d.getTime())) return dateStr;
                      return d.toLocaleString('es-ES');
                    } catch (e) {
                      return dateStr;
                    }
                  };

                  return (
                    <div key={idx} className="relative flex gap-4 items-start z-10">
                      <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${
                        hist.estado === 'Resuelto' 
                          ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' 
                          : hist.estado === 'En proceso' 
                          ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' 
                          : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]'
                      } print:shadow-none`} />
                      <div className="space-y-1">
                        <p className="font-body-md font-semibold text-white print:text-black">{hist.estado}</p>
                        <p className="font-label-caps text-[10px] text-zinc-400 print:text-zinc-500">
                          {formatHistDate(hist.fecha)} <span className="text-xs text-zinc-500 ml-2 font-normal">({hist.actor || 'Estudiante'})</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer de Botones Fijo */}
          <footer className="flex-shrink-0 p-4 md:p-6 border-t border-white/10 bg-zinc-900/80 pb-8 md:pb-6 z-20 mt-auto flex justify-end gap-3 print:hidden">
            {incident.status === 'Reportado' && (
              <button
                onClick={handleCancelReport}
                className="px-6 py-3 rounded-full border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors font-semibold text-sm"
              >
                Cancelar Reporte
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="px-6 py-3 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">download</span>
              Descargar PDF
            </button>
          </footer>
        </section>
      </div>

      {/* Zoom overlay */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <img 
            src={incident.image} 
            alt={incident.title} 
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl transition-transform duration-300"
          />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
            className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 flex items-center justify-center transition-colors shadow-lg"
            title="Cerrar Zoom"
          >
            <span className="material-symbols-outlined text-white text-2xl">close</span>
          </button>
        </div>
      )}
    </>
  );
}
