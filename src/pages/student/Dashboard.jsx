import { useState, useEffect } from 'react';
import NewReportDrawer from '../../components/NewReportDrawer';
import IncidentDetailDrawer from '../../components/IncidentDetailDrawer';
import { fetchIncidentes } from '../../services/incidentService';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  // States for filters and search
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchIncidentes();
      setIncidentes(data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar incidentes desde Supabase');
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

  // Filter verification function
  const filteredIncidentes = incidentes.filter((inc) => {
    const matchesFilter =
      activeFilter === 'Todos' ||
      (activeFilter === 'Reportados' && inc.status === 'Reportado') ||
      (activeFilter === 'Resueltos' && inc.status === 'Resuelto') ||
      inc.status === activeFilter;

    const matchesSearch =
      !searchQuery ||
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Bento layout configurations
  const getBentoClasses = (index) => {
    if (index === 0) {
      return {
        article: "bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl overflow-hidden md:col-span-2 xl:col-span-8 flex flex-col group cursor-pointer hover:shadow-[0px_25px_60px_rgba(106,224,80,0.1)] transition-all duration-500 print:col-span-full print:break-inside-avoid print:shadow-none print:border-gray-300 print:mb-4 print:text-black print:color-adjust-exact",
        isFeatured: true
      };
    } else if (index === 1) {
      return {
        article: "bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl overflow-hidden md:col-span-1 xl:col-span-4 flex flex-col group cursor-pointer hover:shadow-[0px_25px_60px_rgba(0,0,0,0.5)] transition-all duration-500 print:col-span-full print:break-inside-avoid print:shadow-none print:border-gray-300 print:mb-4 print:text-black print:color-adjust-exact",
        isFeatured: false
      };
    } else {
      return {
        article: "bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl overflow-hidden md:col-span-1 xl:col-span-6 flex flex-col group cursor-pointer hover:shadow-[0px_25px_60px_rgba(0,0,0,0.5)] transition-all duration-500 print:col-span-full print:break-inside-avoid print:shadow-none print:border-gray-300 print:mb-4 print:text-black print:color-adjust-exact",
        isFeatured: false
      };
    }
  };

  return (
    <>
      {/* Content Area */}
      <div className="px-4 md:px-8 lg:pr-20 pb-8 md:pb-20 mt-4 md:mt-8 max-w-container-max mx-auto">
        
        {/* Contenedor Superior (Filtros, Buscador y Botón de Nuevo Reporte) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-12 print:hidden">
          {/* Filtros e Icono de Buscar */}
          <div className="flex flex-wrap items-center gap-3">
            {['Todos', 'Reportados', 'En Proceso', 'Resueltos'].map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 md:px-6 py-2 rounded-full font-label-caps text-[10px] md:text-label-caps whitespace-nowrap snap-start shrink-0 transition-all duration-300 ${
                    isActive
                      ? 'bg-[#34AB1E] text-white shadow-md border border-[#34AB1E]'
                      : 'bg-surface-container-low text-on-surface-variant border border-outline-variant hover:border-primary/50'
                  }`}
                >
                  {filter}
                </button>
              );
            })}

            {/* Buscador Dinámico */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className={`p-2 rounded-full transition-colors flex items-center justify-center ${
                  isSearchExpanded
                    ? 'bg-[#34AB1E] text-white border border-[#34AB1E]'
                    : 'bg-surface-container-low text-on-surface-variant border border-outline-variant hover:border-primary/50'
                }`}
                title="Buscar por categoría o título"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
              </button>
              {isSearchExpanded && (
                <input
                  type="text"
                  placeholder="Buscar por categoría o título..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-1.5 rounded-full bg-surface-container-low text-on-surface border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary text-xs transition-all duration-300 w-48 outline-none"
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Botón Nuevo Reporte */}
          <div className="flex justify-end z-30">
            <button
              onClick={() => setIsNewReportOpen(true)}
              className="bg-primary-container text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-label-caps text-xs sm:text-label-caps hover:bg-primary-fixed hover:text-on-primary-fixed shadow-[0px_10px_20px_rgba(52,171,30,0.2)] hover:shadow-[0px_15px_30px_rgba(52,171,30,0.3)] transition-all duration-300 active:scale-95 flex items-center space-x-2 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Nuevo Reporte</span>
            </button>
          </div>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
          
          {filteredIncidentes.map((inc, index) => {
            const { article, isFeatured } = getBentoClasses(index);
            const statusConfig = {
              'En Proceso': { dot: 'bg-blue-500', glow: 'bg-blue-400', text: 'text-blue-400' },
              'Reportado': { dot: 'bg-orange-500', glow: 'bg-orange-400', text: 'text-orange-400' },
              'Resuelto': { dot: 'bg-green-500', glow: 'bg-green-400', text: 'text-green-400' }
            };
            const config = statusConfig[inc.status] || statusConfig['Reportado'];

            const renderImageBanner = () => (
              <div className="h-32 w-full relative overflow-hidden bg-black/40 border-b border-white/5">
                {inc.image ? (
                  <img
                    alt={inc.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    src={inc.image}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-primary/30 to-[#34AB1E]/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-zinc-500 text-3xl">image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 to-transparent" />
              </div>
            );

            if (isFeatured) {
              return (
                <article
                  key={inc.id}
                  onClick={() => handleOpenDetail(inc)}
                  className={article}
                  style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                >
                  {renderImageBanner()}
                  <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                    <div>
                      <div className="inline-flex items-center space-x-2 bg-secondary-fixed-dim/20 text-secondary-fixed-dim px-3 py-1 rounded-full mb-3 sm:mb-4">
                        <span className="material-symbols-outlined text-[14px]">
                          {inc.categoryIcon || (inc.category === 'Electricidad' ? 'bolt' : inc.category === 'Plomería' ? 'water_drop' : 'construction')}
                        </span>
                        <span className="font-label-caps text-[10px]">{inc.category}</span>
                      </div>
                      <h2 className="font-headline-md text-xl sm:text-headline-md text-on-surface mb-2 sm:mb-3">{inc.title}</h2>
                      <p className="font-body-md text-sm sm:text-base text-on-surface-variant line-clamp-3 sm:line-clamp-2">{inc.description}</p>
                    </div>
                    <div className="mt-6 sm:mt-8 flex items-center justify-between border-t border-outline-variant/30 pt-4">
                      <span className="font-body-md text-xs sm:text-sm text-on-surface-variant">{inc.date}</span>
                      <div className="flex items-center space-x-2">
                        <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.glow} opacity-75`} />
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 ${config.dot}`} />
                        </span>
                        <span className={`font-label-caps text-[10px] sm:text-label-caps ${config.text}`}>{inc.status}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            } else {
              return (
                <article
                  key={inc.id}
                  onClick={() => handleOpenDetail(inc)}
                  className={article}
                  style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                >
                  {renderImageBanner()}
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="inline-flex items-center space-x-2 bg-primary-container/20 text-primary-container px-3 py-1 rounded-full">
                          <span className="material-symbols-outlined text-[14px]">
                            {inc.categoryIcon || (inc.category === 'Electricidad' ? 'bolt' : inc.category === 'Plomería' ? 'water_drop' : 'construction')}
                          </span>
                          <span className="font-label-caps text-[10px]">{inc.category}</span>
                        </div>
                        {inc.status === 'Resuelto' && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-headline-md text-lg sm:text-xl font-semibold text-on-surface mb-2">{inc.title}</h3>
                      <p className="font-body-md text-sm text-on-surface-variant line-clamp-2">{inc.description}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-outline-variant/10">
                      <span className="font-body-md text-xs sm:text-sm text-on-surface-variant">{inc.date}</span>
                      <span className={`font-label-caps text-[10px] ${config.text}`}>{inc.status}</span>
                    </div>
                  </div>
                </article>
              );
            }
          })}

          {/* Loading or Fallback if no cards match */}
          {loading ? (
            <div className="col-span-full py-12 text-center text-zinc-400 font-body-md bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl">
              Cargando incidentes reales desde Supabase...
            </div>
          ) : filteredIncidentes.length === 0 && (
            <div className="col-span-full py-12 text-center text-on-surface-variant font-body-md bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl">
              No se encontraron incidentes que coincidan con la búsqueda o el filtro seleccionado.
            </div>
          )}

          {/* Card 4: Quick Action / Status */}
          <article className="bg-surface-container-low border border-outline-variant rounded-xl p-6 sm:p-8 md:col-span-2 xl:col-span-6 flex items-center justify-center relative overflow-hidden print:hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, #6ae050 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="text-center z-10 relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-surface-container-highest mx-auto mb-3 sm:mb-4 flex items-center justify-center border border-outline-variant shadow-inner">
                <span className="material-symbols-outlined text-[24px] sm:text-[32px] text-on-surface-variant">query_stats</span>
              </div>
              <h3 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface mb-1">Generar Reporte Mensual</h3>
              <p className="font-body-md text-on-surface-variant mb-4 sm:mb-6 text-xs sm:text-sm">Resumen de incidentes de Mayo 2026</p>
              <button
                onClick={() => window.print()}
                className="bg-transparent border-2 border-primary text-primary px-5 sm:px-6 py-2 rounded-full font-label-caps text-[10px] sm:text-label-caps hover:bg-primary/10 transition-colors"
              >
                Descargar PDF
              </button>
            </div>
          </article>
        </div>
      </div>

      {/* Drawers */}
      <NewReportDrawer isOpen={isNewReportOpen} onClose={() => setIsNewReportOpen(false)} />
      <IncidentDetailDrawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        incident={selectedIncident}
      />
    </>
  );
}
