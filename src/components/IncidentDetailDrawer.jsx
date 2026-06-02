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
    'En Proceso': { bg: 'bg-[#E3F2FD]', text: 'text-blue-800', dot: 'bg-blue-500', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.8)]' },
    'Reportado': { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', glow: 'shadow-[0_0_8px_rgba(249,115,22,0.8)]' },
    'Resuelto': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', glow: 'shadow-[0_0_8px_rgba(34,197,94,0.8)]' },
  };

  const status = statusColor[incident.status] || statusColor['En Proceso'];

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center print:fixed print:inset-0 print:z-[9999] print:bg-white print:block print:p-0" onClick={onClose}>
        {/* Background overlay */}
        <div className="fixed inset-0 z-0 bg-black/40 backdrop-blur-2xl print:hidden" />

        {/* Mobile TopAppBar */}
        <header className="bg-black/60 backdrop-blur-3xl shadow-none fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile h-20 md:hidden print:hidden border-b border-white/10">
          <button onClick={onClose}>
            <span className="material-symbols-outlined text-primary text-2xl">arrow_back</span>
          </button>
          <span className="font-headline-md text-headline-md font-bold text-primary text-xl">Detalle de Incidente</span>
          <span className="material-symbols-outlined text-primary text-2xl">more_vert</span>
        </header>

        {/* Floating Card */}
        <div
          className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-xl shadow-glow overflow-hidden flex flex-col md:flex-row w-full max-w-5xl mt-20 md:mt-0 relative z-10 mx-4 print:mx-0 print:mt-0 print:bg-white print:text-black print:flex-col print:border-none print:relative print:top-0 print:left-0 print:w-full print:h-auto print:overflow-visible print:shadow-none print:translate-x-0 print:transform-none text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Side: Evidence Image */}
          <div className="w-full md:w-[40%] relative min-h-[300px] md:min-h-[600px] print:min-h-[300px] print:w-full print:h-auto print:relative">
            <img
              alt="Evidencia del incidente"
              className="absolute inset-0 w-full h-full object-cover print:relative print:w-full print:h-auto print:max-h-64 print:object-contain print:break-inside-avoid"
              src={incident.image}
            />
            <button 
              onClick={() => setIsZoomed(true)}
              className="absolute top-4 right-4 bg-black/40 backdrop-blur-md rounded-full p-2 hover:bg-black/60 transition-colors print:hidden"
            >
              <span className="material-symbols-outlined text-white">open_in_full</span>
            </button>
          </div>

          {/* Right Side: Data */}
          <div className="w-full md:w-[60%] p-8 md:p-12 flex flex-col text-surface-container-lowest print:p-6 print:text-black print:w-full print:bg-white">
            {/* Top Row Info */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider print:text-black">{incident.id}</span>
                <div className={`flex items-center gap-2 ${status.bg} px-3 py-1 rounded-full`}>
                  <div className={`w-2 h-2 rounded-full ${status.dot} ${status.glow} animate-pulse print:animate-none`} />
                  <span className={`text-xs font-semibold ${status.text}`}>{incident.status}</span>
                </div>
              </div>
              <button
                className="hidden md:block text-on-surface-variant hover:text-error transition-colors print:hidden"
                onClick={onClose}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Header */}
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white mb-4 print:text-black">
              {incident.title}
            </h2>

            {/* Location */}
            <div className="flex items-start gap-3 mb-8">
              <span className="material-symbols-outlined text-primary mt-1 print:text-[#34AB1E]">location_on</span>
              <div>
                <p className="font-body-lg text-body-lg text-white print:text-black">{incident.location}</p>
                <p className="text-sm text-zinc-300 print:text-black/70">Coordenadas: {incident.coordinates}</p>
              </div>
            </div>

            {/* Description */}
            <p className="font-body-md text-body-md text-zinc-350 mb-10 leading-relaxed print:text-black/90">
              {incident.description}
            </p>

            {/* Timeline */}
            <div className="mb-12 relative print:overflow-visible print:max-h-none">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />
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
                  <div key={idx} className="flex items-center gap-6 mb-6 relative z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      hist.estado === 'Resuelto' 
                        ? 'bg-green-500 text-white' 
                        : hist.estado === 'En Proceso' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-primary-container text-white print:bg-[#34AB1E]'
                    }`}>
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div>
                      <p className="font-semibold text-white print:text-black">{hist.estado}</p>
                      <p className="text-sm text-zinc-350 print:text-black/70">
                        {formatHistDate(hist.fecha)}
                        <span className="text-xs text-zinc-500 ml-2">({hist.actor || 'Estudiante'})</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Button */}
            <div className="mt-auto flex justify-end gap-3 print:hidden">
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
            </div>
          </div>
        </div>
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
