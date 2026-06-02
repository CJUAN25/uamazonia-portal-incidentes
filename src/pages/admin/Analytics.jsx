import { useState, useEffect } from 'react';
import { fetchIncidentes } from '../../services/incidentService';

export default function Analytics() {
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('Todos');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchIncidentes();
      setIncidentes(data);
    } catch (err) {
      console.error('Error fetching incidents for analytics:', err);
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
    if (inc.status !== 'En proceso' && inc.status !== 'Reportado') return false;
    const incDate = parseIncidentDate(inc.date);
    const diffTime = Math.abs(new Date() - incDate);
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours > 72;
  };

  // Filter based on selected timeframe
  const filteredList = incidentes.filter(inc => {
    if (timeFilter === 'Todos') return true;

    const incDate = parseIncidentDate(inc.date);
    const now = new Date();
    const diffTime = Math.abs(now - incDate);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (timeFilter === 'Último Mes') {
      return diffDays <= 30;
    }
    if (timeFilter === 'Últimos 3 Meses') {
      return diffDays <= 90;
    }
    if (timeFilter === 'Últimos 6 Meses') {
      return diffDays <= 180;
    }
    if (timeFilter === 'Último Año') {
      return diffDays <= 365;
    }
    return true;
  });

  const total = filteredList.length;
  const nuevos = filteredList.filter(i => i.status === 'Reportado').length;
  const enProceso = filteredList.filter(i => i.status === 'En proceso').length;
  const resueltos = filteredList.filter(i => i.status === 'Resuelto').length;
  const estancados = filteredList.filter(i => isStagnant(i)).length;

  const getStatusPct = (status) => {
    if (total === 0) return 0;
    const count = filteredList.filter(i => (i.status || i.estado) === status).length;
    return Math.round((count / total) * 100);
  };

  const resueltosPct = getStatusPct('Resuelto');
  const enProcesoPct = getStatusPct('En proceso');
  const reportadosPct = getStatusPct('Reportado');

  // Static array of all categories from NewReportDrawer
  const TODAS_LAS_CATEGORIAS = [
    'Infraestructura',
    'Electricidad',
    'Plomería',
    'Seguridad',
    'Redes',
    'Limpieza',
    'Otros'
  ];

  const categoryCounts = TODAS_LAS_CATEGORIAS.map(cat => {
    const count = filteredList.filter(
      i => (i.category || i.categoria || '').toLowerCase() === cat.toLowerCase()
    ).length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      name: cat,
      count,
      pct
    };
  });

  // SVG Circumference calculation (r=40 -> 2 * PI * 40 = 251.2)
  const circ = 251.2;
  const strokeDashoffset = circ - (circ * resueltosPct) / 100;

  return (
    <div className="p-4 md:p-8 flex-1 min-h-0 overflow-y-auto">
      {/* Print Only Header */}
      <div className="hidden print:block mb-8 text-black border-b pb-4">
        <h1 className="text-2xl font-bold">U. de Amazonia - Reporte de Infraestructura</h1>
        <p>Reporte Oficial de Infraestructura - Generado por: Juan Santiago.</p>
        <p className="text-sm">Fecha de consulta: {new Date().toLocaleDateString('es-ES')}</p>
        <p className="text-sm">Rango de tiempo filtrado: {timeFilter}</p>
      </div>

      {/* Hero Section / Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 print:hidden">
        <div className="space-y-2">
          <p className="font-label-caps text-primary tracking-widest uppercase">Overview</p>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-extrabold text-on-surface">Analítica Global del Campus</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-5 py-2.5 rounded-full bg-black/40 border border-white/10 text-white font-label-caps text-[12px] hover:bg-white/5 transition-colors cursor-pointer outline-none"
          >
            <option value="Todos">Todos los Tiempos</option>
            <option value="Último Mes">Último Mes</option>
            <option value="Últimos 3 Meses">Últimos 3 Meses</option>
            <option value="Últimos 6 Meses">Últimos 6 Meses</option>
            <option value="Último Año">Último Año</option>
          </select>
          <button
            className="px-5 py-2.5 rounded-full bg-primary-container text-on-primary-container font-bold shadow-lg hover:shadow-primary-container/20 transition-all flex items-center gap-2"
            onClick={() => window.print()}
          >
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            Exportar PDF
          </button>
        </div>
      </header>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {/* KPI 1: Nuevos */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl p-6 rounded-xl group hover:border-primary transition-all print:border-zinc-300 print:text-black print:bg-white">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg print:hidden">list_alt</span>
          </div>
          <p className="text-zinc-400 font-label-caps uppercase text-[10px] tracking-widest mb-1 print:text-zinc-500">Nuevos</p>
          <h3 className="text-[36px] font-extrabold text-white print:text-black">{nuevos}</h3>
        </div>
        {/* KPI 2: En Proceso */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl p-6 rounded-xl group hover:border-primary transition-all print:border-zinc-300 print:text-black print:bg-white">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-blue-400 p-2 bg-blue-500/10 rounded-lg print:hidden">pending_actions</span>
          </div>
          <p className="text-zinc-400 font-label-caps uppercase text-[10px] tracking-widest mb-1 print:text-zinc-500">En Proceso</p>
          <h3 className="text-[36px] font-extrabold text-blue-400 print:text-black">{enProceso}</h3>
        </div>
        {/* KPI 3: Resueltos */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl p-6 rounded-xl group hover:border-primary transition-all print:border-zinc-300 print:text-black print:bg-white">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-green-400 p-2 bg-green-500/10 rounded-lg print:hidden">check_circle</span>
          </div>
          <p className="text-zinc-400 font-label-caps uppercase text-[10px] tracking-widest mb-1 print:text-zinc-500">Resueltos</p>
          <h3 className="text-[36px] font-extrabold text-green-400 print:text-black">{resueltos}</h3>
        </div>
        {/* KPI 4: Estancados */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl p-6 rounded-xl group hover:border-primary transition-all print:border-zinc-300 print:text-black print:bg-white">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-red-400 p-2 bg-red-500/10 rounded-lg print:hidden">warning</span>
          </div>
          <p className="text-zinc-400 font-label-caps uppercase text-[10px] tracking-widest mb-1 print:text-zinc-500">Estancados</p>
          <h3 className="text-[36px] font-extrabold text-red-400 print:text-black">{estancados}</h3>
        </div>
      </section>

      {/* Data Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 print:grid-cols-2">
        {/* Category Chart */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-8 print:border-zinc-300 print:text-black print:bg-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-label-caps text-primary text-[10px] mb-1">Distribución</p>
              <h4 className="font-headline-md text-white text-[20px] font-bold print:text-black">Distribución por Categoría</h4>
            </div>
            <span className="material-symbols-outlined text-zinc-500 print:hidden">bar_chart</span>
          </div>
          <div className="space-y-6">
            {categoryCounts.map(catItem => (
              <div key={catItem.name} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="capitalize">{catItem.name}</span>
                  <span>{catItem.pct}%</span>
                </div>
                <div className="w-full h-3 bg-black/40 border border-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${catItem.pct}%` }} />
                </div>
              </div>
            ))}
            {categoryCounts.length === 0 && (
              <div className="text-zinc-500 text-sm py-4 text-center">No hay categorías registradas en este período.</div>
            )}
          </div>
        </div>

        {/* State Chart */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-8 print:border-zinc-300 print:text-black print:bg-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-label-caps text-primary text-[10px] mb-1">Status Report</p>
              <h4 className="font-headline-md text-white text-[20px] font-bold print:text-black">Proporción de Estados</h4>
            </div>
            <span className="material-symbols-outlined text-zinc-500 print:hidden">pie_chart</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12">
            {/* SVG Donut */}
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle cx="50" cy="50" fill="transparent" r="40" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                {/* Segments */}
                <circle 
                  className="transition-all duration-1000" 
                  cx="50" 
                  cy="50" 
                  fill="transparent" 
                  r="40" 
                  stroke="#34ab1e" 
                  strokeDasharray={`${circ}`} 
                  strokeDashoffset={strokeDashoffset} 
                  strokeWidth="12" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white print:text-black">{resueltosPct}%</span>
                <span className="text-[10px] font-label-caps text-zinc-400 print:text-zinc-500">Resolución</span>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-bold">Resueltos</p>
                  <p className="text-[11px] text-zinc-400 print:text-zinc-500">{resueltos} incidentes ({resueltosPct}%)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-bold">En Proceso</p>
                  <p className="text-[11px] text-zinc-400 print:text-zinc-500">{enProceso} incidentes ({enProcesoPct}%)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div>
                  <p className="text-sm font-bold">Reportados</p>
                  <p className="text-[11px] text-zinc-400 print:text-zinc-500">{nuevos} incidentes ({reportadosPct}%)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Visual Context */}
      <section className="mb-10 rounded-xl overflow-hidden h-[300px] relative group print:hidden">
        <img
          className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-50 transition-all duration-700"
          alt="Campus sostenible - vista aérea del bosque amazónico al amanecer"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBR_0ln0sjfoaj3Z9A655QdZ-zq6jqPcs3UFQMjafbxGbYEld8LUnjuZ-boeO9PKE0u3fl-N7cw4WMOozGEqdOiBz3MVcVKax2Mnf0E52wFDLosrhv469dQ8f9RB0ol9e-F4Pfii4zwYEw7SlMAYiQ7_zNuVZC531OKa5QHMeXSgJAO5z90wRC05IOaQOy2qpW6eMCE5BWiB4TVVUO-u_RAhAS5GTJTTU2s1i4trAJtgd25UHOauc87jXpu2kN4862eUmGnegd4TWd"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute bottom-8 left-8 max-w-lg">
          <h5 className="font-headline-md text-primary mb-2">Campus Sostenible 2026</h5>
          <p className="text-zinc-400">Monitoreo en tiempo real de los ecosistemas académicos integrados a la infraestructura de la U. de Amazonia.</p>
        </div>
      </section>
    </div>
  );
}
