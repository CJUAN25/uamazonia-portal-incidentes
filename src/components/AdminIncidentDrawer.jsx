import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { actualizarEstado } from '../services/incidentService';

export default function AdminIncidentDrawer({ isOpen, onClose, incident }) {
  const [selectedStatus, setSelectedStatus] = useState('Reportado');

  useEffect(() => {
    if (incident) {
      setSelectedStatus(incident?.status || incident?.estado || 'Reportado');
    }
  }, [incident]);

  if (!isOpen || !incident) return null;

  const handleChangeStatus = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleSave = async () => {
    const toastId = toast.loading('Guardando cambios de estado...');
    try {
      // Update state in Supabase DB
      await actualizarEstado(incident.id, selectedStatus);

      // Add cross notification for student
      const notifData = localStorage.getItem('notificaciones');
      const notifs = notifData ? JSON.parse(notifData) : [];
      notifs.push({
        id: Date.now(),
        rol: 'estudiante',
        titulo: 'Actualización de Reporte',
        mensaje: `Tu reporte pasó a ${selectedStatus}`,
        leida: false,
        time: 'Ahora',
        type: 'update'
      });
      localStorage.setItem('notificaciones', JSON.stringify(notifs));
      window.dispatchEvent(new Event('notificacionesActualizadas'));

      toast.success('Estado actualizado correctamente', { id: toastId });
      window.dispatchEvent(new Event('reporteActualizado'));
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar el estado en Supabase', { id: toastId });
    }
  };

  const formatHistDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('es-ES');
    } catch (e) {
      return dateStr;
    }
  };

  const handlePrint = () => {
    // 1. Agrega una clase al body para avisar que es una impresión desde el Drawer
    document.body.classList.add('printing-drawer');
    // 2. Ejecuta la impresión (esto bloquea el hilo hasta que el usuario cierra el diálogo)
    window.print();
    // 3. Retira la clase inmediatamente después
    document.body.classList.remove('printing-drawer');
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex justify-end pointer-events-none print:absolute print:inset-0 print:block"
      style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto print:hidden"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <section
        id="admin-incident-drawer"
        className="drawer-slide-in w-full max-w-[600px] h-[100dvh] flex flex-col bg-zinc-900/95 backdrop-blur-3xl border-l border-white/10 overflow-hidden pointer-events-auto print:relative print:w-full print:h-auto print:overflow-visible print:shadow-none print:border-none print:translate-x-0 print:transform-none print:bg-white print:text-black print:p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header (Fijo) */}
        <header className="flex-shrink-0 z-20 sticky top-0 bg-black/40 backdrop-blur-md px-6 py-6 border-b border-white/10 flex items-center justify-between print:bg-white print:text-black print:border-none">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="bg-primary/20 text-primary font-label-caps text-[10px] px-3 py-1 rounded-full uppercase tracking-widest print:border print:border-primary">
                {incident?.category || incident?.categoria || 'INCIDENTE'}
              </span>
              <span className="text-zinc-400 font-body-md text-sm print:text-black">{incident?.id}</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-white leading-tight print:text-black">
              {incident?.title || incident?.titulo || incident?.id}
            </h2>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 print:hidden hide-on-print"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-4 md:p-6 space-y-10 print:overflow-visible print:max-h-none print:p-0 print:space-y-6">
          {/* Evidence Image */}
          <div className="relative group print:relative print:w-full print:h-auto print:max-h-64 print:break-inside-avoid">
            <div className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/40 print:border-none print:rounded-none">
              <img
                alt="Evidencia del incidente"
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 print:max-h-64 print:object-contain print:break-inside-avoid"
                src={incident?.image || 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=600&auto=format&fit=crop'}
              />
            </div>
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-label-caps print:hidden">
              EVIDENCIA ADJUNTA
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-y-8 gap-x-4 print:grid-cols-2 print:gap-4 print:text-black">
            <div className="space-y-1">
              <p className="font-label-caps text-primary uppercase text-[10px] tracking-widest">Ubicación</p>
              <p className="font-body-md text-white print:text-black">{incident?.location || incident?.ubicacion}</p>
            </div>
            <div className="space-y-1">
              <p className="font-label-caps text-primary uppercase text-[10px] tracking-widest">Reportado en</p>
              <p className="font-body-md text-white print:text-black">{incident?.date || incident?.fecha}</p>
            </div>
            <div className="space-y-1">
              <p className="font-label-caps text-primary uppercase text-[10px] tracking-widest">Informante</p>
              <p className="font-body-md text-white print:text-black">Estudiante Anónimo</p>
            </div>
            <div className="space-y-1">
              <p className="font-label-caps text-primary uppercase text-[10px] tracking-widest">ID de Grupo</p>
              <div className="pt-1">
                <span className="bg-white/5 border border-white/10 text-zinc-300 font-label-caps text-[10px] px-3 py-1 rounded-full print:border print:border-zinc-300 print:text-black">
                  {incident?.groupId || incident?.grupoId || 'Sin agrupar'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4 print:text-black">
            <p className="font-label-caps text-primary uppercase text-[10px] tracking-widest">Detalle del Incidente</p>
            <p className="font-body-lg text-white leading-relaxed opacity-90 print:text-black">
              {incident?.description || incident?.descripcion || 'Sin descripción disponible.'}
            </p>
          </div>

          {/* Admin Action Block */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-4 print:hidden">
            <p className="font-label-caps text-white uppercase text-[11px] tracking-widest font-semibold">Gestión Administrativa</p>
            <div className="space-y-2">
              <label className="font-label-caps text-zinc-400 text-[10px]">Actualizar Estado</label>
              <select
                value={selectedStatus}
                onChange={handleChangeStatus}
                className="w-full bg-black/40 border border-white/10 rounded-lg text-white font-body-md py-3 px-4 focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer outline-none font-sans"
              >
                <option value="Reportado">Reportado</option>
                <option value="En proceso">En Proceso</option>
                <option value="Resuelto">Resuelto</option>
              </select>
            </div>
          </div>

          {/* Trazabilidad (Timeline) */}
          <div className="space-y-8 pb-10 print:text-black">
            <p className="font-label-caps text-primary uppercase text-[10px] tracking-widest">Historial de Trazabilidad</p>
            <div className="relative space-y-8 ml-3">
              {/* Timeline Line */}
              <div className="absolute left-[3px] top-2 bottom-2 w-[2px] bg-white/10 print:bg-zinc-200" />
              {(incident.historial || [
                { estado: 'Reportado', fecha: incident.date || incident.fecha || new Date().toISOString(), actor: 'Estudiante' }
              ]).map((hist, idx) => (
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
              ))}
            </div>
          </div>
        </div>

        {/* Footer de Botones Fijo */}
        <footer className="flex-shrink-0 p-4 md:p-6 border-t border-white/10 bg-zinc-900/80 pb-8 md:pb-6 z-20 mt-auto flex gap-2 print:hidden">
          <button
            onClick={handleSave}
            className="flex-grow bg-primary hover:bg-primary/95 text-white font-label-caps text-[13px] py-4 rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-primary/10 font-sans font-bold"
          >
            GUARDAR CAMBIOS
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-4 rounded-lg border-2 border-primary text-primary font-label-caps text-[13px] hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 print:hidden hide-on-print font-sans font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            PDF
          </button>
        </footer>
      </section>
    </div>
  );
}
