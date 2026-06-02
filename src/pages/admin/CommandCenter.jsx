import { useState, useEffect } from 'react';
import AdminIncidentDrawer from '../../components/AdminIncidentDrawer';
import { fetchIncidentes, actualizarEstado } from '../../services/incidentService';
import { toast } from 'react-hot-toast';

export default function CommandCenter() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchIncidentes();
      setIncidentes(data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar incidentes de Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('reporteActualizado', loadData);
    window.addEventListener('reporteCreado', loadData);
    return () => {
      window.removeEventListener('reporteActualizado', loadData);
      window.removeEventListener('reporteCreado', loadData);
    };
  }, []);

  const handleOpenDrawer = (incident) => {
    setSelectedIncident(incident);
    setIsDrawerOpen(true);
  };

  const getStatusSelectStyle = (status) => {
    switch (status) {
      case 'Resuelto':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'En Proceso':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Reportado':
      default:
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700/50';
    }
  };

  const handleStatusChange = async (incidentId, newStatus) => {
    const toastId = toast.loading('Actualizando estado del reporte...');
    try {
      // Update in Supabase
      await actualizarEstado(incidentId, newStatus);

      // Add cross notification for student in localStorage to keep alerts intact
      const notifData = localStorage.getItem('notificaciones');
      const notifs = notifData ? JSON.parse(notifData) : [];
      notifs.push({
        id: Date.now(),
        rol: 'estudiante',
        titulo: 'Actualización de Reporte',
        mensaje: `Tu reporte pasó a ${newStatus}`,
        leida: false,
        time: 'Ahora',
        type: 'update'
      });
      localStorage.setItem('notificaciones', JSON.stringify(notifs));
      window.dispatchEvent(new Event('notificacionesActualizadas'));

      toast.success('Estado actualizado correctamente', { id: toastId });
      window.dispatchEvent(new Event('reporteActualizado'));
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar el estado del reporte', { id: toastId });
    }
  };

  const parseIncidentDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  };

  const isStagnant = (inc) => {
    const statusVal = inc.status || inc.estado;
    if (statusVal !== 'En Proceso' && statusVal !== 'Reportado') return false;
    const incDate = parseIncidentDate(inc.date);
    const diffTime = Math.abs(new Date() - incDate);
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours > 72;
  };

  const total = incidentes.length;
  const nuevos = incidentes.filter(i => (i.status || i.estado) === 'Reportado').length;
  const enProceso = incidentes.filter(i => (i.status || i.estado) === 'En Proceso').length;
  const resueltos = incidentes.filter(i => (i.status || i.estado) === 'Resuelto').length;
  const estancados = incidentes.filter(i => isStagnant(i)).length;

  // Real Percentage calculation
  const resolvedPctVal = Math.round((resueltos / total) * 100) || 0;
  const resolvedPct = `${resolvedPctVal}%`;

  // Extract unique categories dynamically and count occurrences
  const uniqueCategories = Array.from(
    new Set(
      incidentes
        .map(i => i.category || i.categoria)
        .filter(Boolean)
    )
  );

  const categoryCounts = uniqueCategories.map(cat => {
    const count = incidentes.filter(
      i => (i.category || i.categoria || '').toLowerCase() === cat.toLowerCase()
    ).length;
    const pctReal = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      name: cat,
      count,
      pct: `${pctReal}%`
    };
  });

  return (
    <div className="p-4 md:p-8 lg:p-margin-desktop max-w-7xl mx-auto space-y-8">
      <div id="dashboard-content-wrapper" className="w-full h-full flex flex-col space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="font-label-caps text-label-caps text-primary tracking-widest uppercase mb-2">Portal Administrativo</p>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Panel Central de Triaje</h2>
          </div>
          <button 
            onClick={() => window.print()}
            className="print:hidden hide-on-print flex items-center justify-center space-x-2 px-6 py-3 rounded-full border-2 border-primary text-primary hover:bg-primary/10 transition-colors font-body-md text-body-md font-medium whitespace-nowrap"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>print</span>
            <span>Imprimir Historial</span>
          </button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Nuevos */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-6 relative overflow-hidden group print:bg-white print:text-black print:shadow-none">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500 print:hidden" />
            <p className="font-body-md text-body-md text-zinc-400 mb-1 print:text-zinc-650">Nuevos</p>
            <p className="font-display-xl text-display-xl text-white print:text-black">{nuevos}</p>
          </div>
          {/* En Proceso */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-6 relative overflow-hidden group print:bg-white print:text-black print:shadow-none">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl print:hidden" />
            <p className="font-body-md text-body-md text-zinc-400 mb-1 print:text-zinc-650">En Proceso</p>
            <p className="font-display-xl text-display-xl text-blue-400 print:text-blue-700">{enProceso}</p>
          </div>
          {/* Resueltos */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-6 relative overflow-hidden group print:bg-white print:text-black print:shadow-none">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl print:hidden" />
            <p className="font-body-md text-body-md text-zinc-400 mb-1 print:text-zinc-650">Reportes Resueltos</p>
            <p className="font-display-xl text-display-xl text-primary print:text-[#237413]">{resueltos}</p>
          </div>
          {/* Estancados */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-6 relative overflow-hidden group print:bg-white print:text-black print:shadow-none">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl print:hidden" />
            <p className="font-body-md text-body-md text-zinc-400 mb-1 print:text-zinc-650">Estancados</p>
            <p className="font-display-xl text-display-xl text-red-400 print:text-red-700">{estancados}</p>
          </div>
        </div>

        {/* Visualization Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart (CSS) */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-6">
            <h3 className="font-body-lg text-body-lg text-on-surface font-semibold mb-6">Incidentes por Tipo</h3>
            <div className="space-y-5">
              {categoryCounts.map(catItem => (
                <div key={catItem.name}>
                  <div className="flex justify-between font-body-md text-[14px] text-zinc-400 mb-2">
                    <span className="capitalize">{catItem.name}</span>
                    <span>{catItem.pct}</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 border border-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: catItem.pct }} />
                  </div>
                </div>
              ))}
              {categoryCounts.length === 0 && (
                <div className="text-zinc-550 text-sm py-4 text-center">No hay categorías registradas.</div>
              )}
            </div>
          </div>
          {/* Donut Chart (CSS) */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-6 flex flex-col items-center justify-center">
            <h3 className="font-body-lg text-body-lg text-on-surface font-semibold mb-6 self-start w-full">Estado de reportes</h3>
            <div className="relative w-48 h-48 mb-4">
              <div className="absolute inset-0 rounded-full border-[16px] border-black/40" />
              <div className="absolute inset-0 rounded-full border-[16px] border-primary" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0, 25% 0)', transform: 'rotate(0deg)' }} />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="font-headline-md text-headline-md text-on-surface">{resolvedPct}</span>
                <span className="font-label-caps text-[10px] text-zinc-400 tracking-widest uppercase">Resueltos</span>
              </div>
            </div>
            <div className="flex space-x-4 w-full justify-center mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="font-body-md text-[12px] text-zinc-400">Resuelto</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <span className="font-body-md text-[12px] text-zinc-400">Pendiente</span>
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl overflow-hidden print:bg-white print:text-black print:shadow-none print:border-zinc-300">
          <div className="p-6 border-b border-white/10 print:border-zinc-300">
            <h3 className="font-body-lg text-body-lg text-on-surface font-semibold print:text-black">Historial de Reportes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 border-b border-white/10 font-label-caps text-label-caps text-zinc-300 uppercase tracking-wider print:bg-zinc-100 print:text-zinc-700">
                  <th className="p-4 border-b border-white/10 font-medium print:border-zinc-300">ID</th>
                  <th className="p-4 border-b border-white/10 font-medium print:border-zinc-300">Categoría</th>
                  <th className="p-4 border-b border-white/10 font-medium print:border-zinc-300">Ubicación</th>
                  <th className="p-4 border-b border-white/10 font-medium print:border-zinc-300">Fecha</th>
                  <th className="p-4 border-b border-white/10 font-medium print:border-zinc-300">Estado</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface divide-y divide-white/10 print:text-black print:divide-zinc-200">
                {incidentes.map((inc) => (
                  <tr
                    key={inc.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer print:hover:bg-transparent"
                    onClick={() => handleOpenDrawer(inc)}
                  >
                    <td className="p-4 text-zinc-400 print:text-zinc-700">{inc.id}</td>
                    <td className="p-4 font-medium print:text-black">{inc.category || inc.categoria}</td>
                    <td className="p-4 text-zinc-400 print:text-zinc-700">{inc.location || inc.ubicacion}</td>
                    <td className="p-4 text-zinc-400 print:text-zinc-700">{inc.date || inc.fecha}</td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={inc.status || inc.estado || 'Reportado'}
                        onChange={(e) => handleStatusChange(inc.id, e.target.value)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-semibold ${getStatusSelectStyle(inc.status || inc.estado)} outline-none cursor-pointer print:bg-white print:text-black print:border print:border-zinc-300`}
                      >
                        <option className="bg-black text-white print:bg-white print:text-black" value="Reportado">Reportado</option>
                        <option className="bg-black text-white print:bg-white print:text-black" value="En Proceso">En Proceso</option>
                        <option className="bg-black text-white print:bg-white print:text-black" value="Resuelto">Resuelto</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {incidentes.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-zinc-500 print:text-zinc-650">No hay incidentes reportados en el sistema.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Incident Drawer */}
      <AdminIncidentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        incident={selectedIncident}
      />
    </div>
  );
}
