import { useState, useEffect } from 'react';
import IncidentDetailDrawer from '../../components/IncidentDetailDrawer';
import { fetchIncidentes } from '../../services/incidentService';
import { formatearID } from '../../lib/utils';

export default function Reports() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchIncidentes();
      setIncidentes(data);
    } catch (err) {
      console.error('Error fetching student reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('reporteCreado', loadData);
    window.addEventListener('reporteActualizado', loadData);
    return () => {
      window.removeEventListener('reporteCreado', loadData);
      window.removeEventListener('reporteActualizado', loadData);
    };
  }, []);

  const handleOpenDetail = (incident) => {
    setSelectedIncident(incident);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'En proceso':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium">En Proceso</span>;
      case 'Reportado':
        return <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Reportado</span>;
      case 'Resuelto':
        return <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Resuelto</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-full font-medium">{status}</span>;
    }
  };

  return (
    <div className="px-4 md:px-8 lg:pr-20 pb-8 md:pb-20 mt-4 md:mt-8 max-w-container-max mx-auto">
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
          <h2 className="font-headline-md text-xl text-on-surface">Historial de Reportes</h2>
          <span className="text-xs text-on-surface-variant font-label-caps">{incidentes.length} Reportes Totales</span>
        </div>
        
        {/* Table View for desktop */}
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-zinc-400 font-body-md">
              Cargando tus reportes desde Supabase...
            </div>
          ) : incidentes.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 font-body-md flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-4xl text-zinc-550">task</span>
              <p className="font-semibold text-zinc-300">No hay incidentes reportados</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse hidden md:table">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-xs font-label-caps border-b border-outline-variant/20">
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Título</th>
                <th className="p-4">Fecha</th>
                <th className="p-4 whitespace-nowrap">Estado</th>
                <th className="p-4 pr-6 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-on-surface text-sm">
              {incidentes.map((report) => (
                <tr 
                  key={formatearID(report.id)} 
                  className="hover:bg-surface-variant/20 transition-colors cursor-pointer"
                  onClick={() => handleOpenDetail(report)}
                >
                  <td className="p-4 pl-6 font-semibold">{formatearID(report.id)}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="material-symbols-outlined text-[18px] text-primary-container">{report.categoryIcon}</span>
                      <span>{report.category}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{report.title}</td>
                  <td className="p-4 text-on-surface-variant">{report.date}</td>
                  <td className="p-4 whitespace-nowrap">{getStatusBadge(report.status)}</td>
                  <td className="p-4 pr-6 text-right">
                    <button className="text-primary hover:text-primary/80 transition-colors">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          )}
        </div>

        {/* Card list view for mobile */}
        <div className="block md:hidden flex flex-col gap-4 p-4">
          {!loading && incidentes.map((report) => (
            <div 
              key={formatearID(report.id)} 
              className="p-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer space-y-3"
              onClick={() => handleOpenDetail(report)}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-xs text-on-surface-variant">{formatearID(report.id)}</span>
                {getStatusBadge(report.status)}
              </div>
              <div>
                <h4 className="font-bold text-base text-on-surface">{report.title}</h4>
                <p className="text-xs text-on-surface-variant mt-1">{report.location}</p>
              </div>
              <div className="flex justify-between items-center text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10">
                <span>{report.date}</span>
                <span className="flex items-center space-x-1">
                  <span className="material-symbols-outlined text-[16px] text-primary-container">{report.categoryIcon}</span>
                  <span>{report.category}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <IncidentDetailDrawer 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        incident={selectedIncident} 
      />
    </div>
  );
}
