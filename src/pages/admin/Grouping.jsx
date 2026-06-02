import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import AdminIncidentDrawer from '../../components/AdminIncidentDrawer';
import { fetchIncidentes, actualizarEstado, agruparIncidentes } from '../../services/incidentService';
import { formatearID } from '../../lib/utils';

export default function Grouping() {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas las Categorías');
  const [groupStatusFilter, setGroupStatusFilter] = useState('Todos los Estados');
  const [selectedIds, setSelectedIds] = useState([]);
  const [groupName, setGroupName] = useState('');
  const handleOpenDrawer = (incident) => {
    setSelectedIncident(incident);
    setIsDrawerOpen(true);
  };

  const getStatusSelectStyle = (status) => {
    switch (status) {
      case 'Resuelto':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'En proceso':
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

      // Add cross notification for student
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

  // Improved search engine to filter by Category, Description, and ID (Spanish/English keys)
  const filtered = incidentes.filter(inc => {
    const matchesCategory = selectedCategory === 'Todas las Categorías' || 
      (inc.category || inc.categoria || '').toLowerCase() === selectedCategory.toLowerCase();
    
    let matchesGroupStatus = true;
    if (groupStatusFilter === 'Sin Agrupar') {
      matchesGroupStatus = !inc.groupId && !inc.grupoId;
    } else if (groupStatusFilter === 'Ya Agrupados') {
      matchesGroupStatus = !!inc.groupId || !!inc.grupoId;
    }

    const term = searchQuery.toLowerCase();
    const idMatches = (inc.id || '').toLowerCase().includes(term);
    const descMatches = (inc.description || inc.descripcion || '').toLowerCase().includes(term);
    const catMatches = (inc.category || inc.categoria || '').toLowerCase().includes(term);
    const matchesSearch = !searchQuery || idMatches || descMatches || catMatches;

    return matchesCategory && matchesGroupStatus && matchesSearch;
  });

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(i => i.id));
    }
  };

  const isAllSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  const handleApplyGroup = async () => {
    if (selectedIds.length < 2) {
      toast.error('Selecciona al menos dos incidentes para agrupar');
      return;
    }

    const toastId = toast.loading('Vinculando incidentes en Supabase...');
    try {
      const incidentePrincipalId = selectedIds[0];
      const incidentesSecundariosIds = selectedIds.slice(1);

      await agruparIncidentes(incidentePrincipalId, incidentesSecundariosIds);

      setGroupName('');
      setSelectedIds([]);
      window.dispatchEvent(new Event('reporteActualizado'));
      toast.success('Incidentes vinculados correctamente', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Error al vincular incidentes', { id: toastId });
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div id="dashboard-content-wrapper" className="w-full h-full flex flex-col">
        <div className="max-w-7xl mx-auto space-y-8 w-full">
          {/* Page Header */}
          <section>
            <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">Vincular y Agrupar Incidentes</h1>
            <p className="text-zinc-400 mt-2 max-w-2xl">Administra reportes duplicados asignando un identificador de grupo común para facilitar la resolución masiva.</p>
          </section>

          {/* Multi-Filter Grid Panel */}
          <section className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl p-4 rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 px-2 uppercase tracking-wider">Categoría</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary px-4 py-2.5 transition-all outline-none"
                >
                  <option value="Todas las Categorías">Todas las Categorías</option>
                  <option value="Infraestructura">Infraestructura</option>
                  <option value="Electricidad">Electricidad</option>
                  <option value="Plomería">Plomería</option>
                  <option value="Seguridad">Seguridad</option>
                  <option value="Redes">Redes</option>
                  <option value="Limpieza">Limpieza</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 px-2 uppercase tracking-wider">Estado Grupo</label>
                <select 
                  value={groupStatusFilter}
                  onChange={(e) => setGroupStatusFilter(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary px-4 py-2.5 transition-all outline-none"
                >
                  <option value="Todos los Estados">Todos los Estados</option>
                  <option value="Sin Agrupar">Sin Agrupar</option>
                  <option value="Ya Agrupados">Ya Agrupados</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 px-2 uppercase tracking-wider">Búsqueda</label>
                  <div className="relative">
                    <input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary pl-10 pr-4 py-2.5 transition-all outline-none" 
                      placeholder="Buscar palabras clave..." 
                      type="text" 
                    />
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-zinc-500 text-[20px]">search</span>
                  </div>
              </div>
            </div>
          </section>

          {/* Bulk Action Floating Control Console */}
          <section className="bg-white/[0.02] backdrop-blur-md border border-dashed border-white/10 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:flex-grow mr-0 md:mr-4">
              <span className="text-sm font-bold text-primary flex items-center gap-2 shrink-0">
                <span className="material-symbols-outlined">inventory_2</span>
                Acción Masiva:
              </span>
              <input 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary px-4 py-3 outline-none" 
                placeholder="Nombre del Grupo (Ej. Falla Tubo)" 
                type="text" 
              />
            </div>
            <div className="w-full md:w-auto shrink-0">
              <button 
                onClick={handleApplyGroup}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3.5 rounded-full transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">check_circle</span>
                Aplicar Vinculación
              </button>
            </div>
          </section>

          {/* Responsive Data Views */}
          <div className="space-y-4">
            {/* Desktop Table (md:block) */}
            <div className="hidden md:block overflow-x-auto bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-black/40 border-b border-white/10 text-zinc-300 font-bold uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-4 w-12">
                      <input 
                        checked={isAllSelected}
                        onChange={handleToggleSelectAll}
                        className="rounded border-white/20 bg-black/40 text-primary focus:ring-primary cursor-pointer" 
                        type="checkbox" 
                      />
                    </th>
                    <th className="px-6 py-4">ID Incidente</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4">Título / Ubicación</th>
                    <th className="px-6 py-4">ID Grupo</th>
                    <th className="px-6 py-4">Nombre Grupo</th>
                    <th className="px-6 py-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filtered.map(inc => (
                    <tr 
                      key={formatearID(inc.id)} 
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => handleOpenDrawer(inc)}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input 
                          checked={selectedIds.includes(inc.id)}
                          onChange={() => handleToggleSelect(inc.id)}
                          className="rounded border-white/20 bg-black/40 text-primary focus:ring-primary cursor-pointer" 
                          type="checkbox" 
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-primary tracking-tight">{inc.id}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded bg-primary/10 text-primary font-bold text-[10px] border border-primary/20">
                          {inc.category || inc.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        <div className="font-semibold text-white">{inc.title || inc.titulo}</div>
                        <div className="text-xs text-zinc-550">{inc.location || inc.ubicacion}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">{inc.groupId || inc.grupoId || '—'}</td>
                      <td className="px-6 py-4 text-zinc-300">{inc.groupName || inc.grupoNombre || '—'}</td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={inc.status || inc.estado || 'Reportado'}
                          onChange={(e) => handleStatusChange(inc.id, e.target.value)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-semibold ${getStatusSelectStyle(inc.status || inc.estado)} outline-none cursor-pointer`}
                        >
                          <option className="bg-black text-white" value="Reportado">Reportado</option>
                          <option className="bg-black text-white" value="En proceso">En Proceso</option>
                          <option className="bg-black text-white" value="Resuelto">Resuelto</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-zinc-500">No hay incidentes que coincidan con los filtros.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (md:hidden) */}
            <div className="md:hidden space-y-4">
              {filtered.map(inc => (
                <div 
                  key={inc.id} 
                  className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-5 space-y-4 shadow-xl cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => handleOpenDrawer(inc)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div onClick={(e) => e.stopPropagation()}>
                        <input 
                          checked={selectedIds.includes(inc.id)}
                          onChange={() => handleToggleSelect(inc.id)}
                          className="rounded border-white/20 bg-black/40 text-primary focus:ring-primary w-5 h-5 cursor-pointer" 
                          type="checkbox" 
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-primary text-lg">{formatearID(inc.id)}</h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">
                          {inc.groupId || inc.grupoId ? `Grupo: ${inc.groupId || inc.grupoId}` : 'Sin Grupo'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-primary/10 text-primary font-bold text-[10px] border border-primary/20">
                      {inc.category || inc.categoria}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <p className="font-semibold text-white">{inc.title || inc.titulo}</p>
                    <p className="flex items-center gap-2 text-zinc-400">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      {inc.location || inc.ubicacion}
                    </p>
                    {(inc.groupName || inc.grupoNombre) && (
                      <p className="text-xs text-zinc-550">
                        Nombre del grupo: <span className="text-zinc-400 font-medium">{inc.groupName || inc.grupoNombre}</span>
                      </p>
                    )}
                  </div>
                  <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
                    <div className="flex justify-between items-center text-xs text-zinc-400">
                      <span>Fecha: {inc.date || inc.fecha}</span>
                    </div>
                    <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Actualizar Estado</label>
                      <select
                        value={inc.status || inc.estado || 'Reportado'}
                        onChange={(e) => handleStatusChange(inc.id, e.target.value)}
                        className={`w-full bg-black/40 border border-white/10 text-white rounded-lg py-2.5 px-3 text-sm outline-none cursor-pointer`}
                      >
                        <option className="bg-black text-white" value="Reportado">Reportado</option>
                        <option className="bg-black text-white" value="En proceso">En Proceso</option>
                        <option className="bg-black text-white" value="Resuelto">Resuelto</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-zinc-450 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl">
                  No hay incidentes que coincidan con los filtros.
                </div>
              )}
            </div>
          </div>

          {/* Info footer */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-zinc-500">Mostrando {filtered.length} incidentes de {incidentes.length} totales</p>
          </div>
        </div>
      </div>

      {/* Admin Incident Drawer for Details Viewing */}
      <AdminIncidentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        incident={selectedIncident}
      />
    </div>
  );
}
