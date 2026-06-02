import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { uploadEvidencia, crearIncidente } from '../services/incidentService';

const CATEGORIES = [
  'Infraestructura',
  'Electricidad',
  'Plomería',
  'Seguridad',
  'Redes',
  'Limpieza',
  'Otros',
];

export default function NewReportDrawer({ isOpen, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('Infraestructura');
  const [description, setDescription] = useState('');
  const [locationManual, setLocationManual] = useState('');
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImageBase64(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImageBase64(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGpsToggle = () => {
    if (!gpsEnabled) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
            setGpsCoordinates(coords);
            setLocationManual(`Coordenadas GPS: ${coords}`);
            setGpsEnabled(true);
          },
          (error) => {
            console.error(error);
            alert('Error al obtener la ubicación GPS. Por favor activa los permisos de ubicación.');
            setGpsEnabled(false);
          }
        );
      } else {
        alert('La geolocalización no está disponible en este navegador.');
        setGpsEnabled(false);
      }
    } else {
      setGpsEnabled(false);
      setGpsCoordinates('');
      setLocationManual('');
    }
  };

  const setCategoria = (value) => {
    setSelectedCategory(value);
  };
  const setDescripcion = (value) => {
    setDescription(value);
  };
  const setImage = (value) => {
    if (value === null) {
      setSelectedImageBase64('');
      setFileName('');
    } else {
      setSelectedImageBase64(value);
    }
  };
  const setGps = (value) => {
    if (value === '') {
      setGpsEnabled(false);
      setGpsCoordinates('');
      setLocationManual('');
    } else {
      setGpsCoordinates(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !description.trim()) {
      toast.error('Debes seleccionar una categoría y escribir una descripción');
      return;
    }
    if (!selectedImageBase64) {
      toast.error('La fotografía de evidencia es obligatoria');
      return;
    }

    const toastId = toast.loading('Subiendo evidencia y creando reporte...');

    try {
      // 1. Extraer usuario de la sesión actual
      const currentUserStr = localStorage.getItem('currentUser');
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      const usuario_id = currentUser?.email || 'estudiante_anonimo';

      // 2. Subir imagen a Supabase Storage
      let uploadedImageUrl = 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=600&auto=format&fit=crop';
      if (selectedImageBase64) {
        uploadedImageUrl = await uploadEvidencia(selectedImageBase64, fileName);
      }

      // 3. Crear registro en la base de datos
      await crearIncidente({
        usuario_id,
        category: selectedCategory,
        description,
        image: uploadedImageUrl,
        location: locationManual || 'Ubicación no especificada',
        coordinates: gpsCoordinates || 'No adjuntas'
      });

      // 4. Guardar notificaciones localmente para mantener alertas funcionando
      const notifs = JSON.parse(localStorage.getItem('notificaciones')) || [];
      notifs.push({
        id: Date.now(),
        rol: 'admin',
        titulo: 'Nuevo Reporte',
        mensaje: `Se ha reportado un daño en ${selectedCategory || 'Infraestructura'}`,
        leida: false,
        time: 'Ahora',
        type: 'info'
      });
      localStorage.setItem('notificaciones', JSON.stringify(notifs));
      window.dispatchEvent(new Event('notificacionesActualizadas'));

      toast.success('Reporte enviado correctamente', { id: toastId });

      // Dispatch event to refresh Dashboard and Reports
      window.dispatchEvent(new Event('reporteCreado'));

      // Resetear estados
      setCategoria('');
      setDescripcion('');
      setImage(null);
      setGps('');

      // Cerrar
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Error al enviar el reporte. Inténtalo de nuevo.', { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" onClick={onClose}>
      {/* Glassmorphic Overlay */}
      <div className="fixed inset-0 z-10 bg-black/40 backdrop-blur-xl animate-fade-in" />

      {/* The Drawer Panel */}
      <aside
        className="drawer-slide-in h-[100dvh] w-full md:max-w-[600px] bg-zinc-900/95 backdrop-blur-3xl border-l border-white/10 md:rounded-tl-[40px] md:rounded-bl-[40px] shadow-[0px_20px_50px_rgba(0,0,0,0.5)] flex flex-col relative z-30 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex-shrink-0 z-20 flex items-center justify-between px-6 md:px-10 py-6 md:py-8 border-b border-white/10">
          <h2 className="font-headline-md text-headline-md text-white">Nuevo Reporte</h2>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors group" onClick={onClose}>
            <span
              className="material-symbols-outlined text-white group-hover:text-primary-container"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              close
            </span>
          </button>
        </header>

        {/* Scrollable Content Canvas */}
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-4 md:p-6 space-y-8 md:space-y-10">
          {/* Section 1: Tipo de Incidente */}
          <section className="space-y-4">
            <h3 className="font-label-caps text-label-caps text-primary-container">Categoría</h3>
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={
                    selectedCategory === cat
                      ? 'px-6 py-2 rounded-full bg-primary-container text-white font-body-md text-body-md shadow-[0px_8px_20px_rgba(52,171,30,0.3)] transition-transform hover:-translate-y-0.5'
                      : 'px-6 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-body-md text-body-md hover:bg-white/10 hover:text-white transition-colors'
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* Section 2: Descripción */}
          <section className="space-y-4">
            <h3 className="font-label-caps text-label-caps text-primary-container">Descripción</h3>
            <div className="relative group">
              <textarea
                className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-6 font-body-md text-body-md text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all resize-none shadow-inner"
                maxLength={500}
                placeholder="Describe el problema al detalle..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="absolute bottom-4 right-6 font-body-md text-sm text-gray-400">
                <span>{description.length}</span> / 500
              </div>
            </div>
          </section>

          {/* Section 3: Fotografía Obligatoria */}
          <section className="space-y-4">
            <h3 className="font-label-caps text-label-caps text-primary-container">Fotografía Obligatoria</h3>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className="w-full h-48 rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer hover:border-primary-container hover:bg-white/[0.05] transition-colors group relative"
            >
              {fileName ? (
                <div className="flex flex-col items-center p-4">
                  <span className="material-symbols-outlined text-4xl text-green-500 mb-2">check_circle</span>
                  <p className="font-body-md text-sm text-zinc-300 text-center font-medium max-w-xs truncate">{fileName}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileName('');
                      setSelectedImageBase64('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 flex items-center justify-center transition-colors shadow-md"
                    title="Eliminar foto"
                  >
                    <span className="material-symbols-outlined text-[16px] text-white">close</span>
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className="material-symbols-outlined text-4xl text-zinc-550 group-hover:text-primary-container mb-3 transition-colors"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    photo_camera
                  </span>
                  <p className="font-body-md text-body-md text-zinc-400 group-hover:text-white transition-colors">Subir fotografía (Obligatorio)</p>
                </>
              )}
            </div>
          </section>

          {/* Section 4: Ubicación */}
          <section className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-label-caps text-label-caps text-primary-container">Ubicación</h3>
              <input
                className="w-full bg-black/40 border border-white/10 rounded-full px-6 py-4 font-body-md text-body-md text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                placeholder="Ubicación manual (Ej: Bloque C)"
                type="text"
                value={locationManual}
                onChange={(e) => setLocationManual(e.target.value)}
              />
            </div>
            {/* Toggle Switch */}
            <div className="flex items-center justify-between bg-white/[0.03] p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                <span className="font-body-md text-body-md text-white/95">Adjuntar coordenadas GPS</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={gpsEnabled}
                  onChange={handleGpsToggle}
                  className="sr-only peer"
                  type="checkbox"
                />
                <div className={`w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-container ${gpsEnabled ? 'shadow-[0px_0px_10px_rgba(52,171,30,0.5)]' : ''}`} />
              </label>
            </div>
          </section>

          {/* Spacer for bottom padding */}
          <div className="h-10" />
        </div>

        {/* Footer Actions */}
        <footer className="flex-shrink-0 p-4 md:p-6 border-t border-white/10 bg-zinc-900/80 pb-8 md:pb-6 z-20 mt-auto flex flex-col items-center gap-4">
          <button
            onClick={handleSubmit}
            className="w-full bg-primary-container hover:bg-[#2e991a] text-white font-headline-md text-[18px] leading-[24px] rounded-full py-4 shadow-[0px_10px_30px_rgba(52,171,30,0.4)] hover:shadow-[0px_15px_40px_rgba(52,171,30,0.6)] transform hover:-translate-y-1 transition-all duration-300"
          >
            Enviar Reporte
          </button>
          <button
            className="font-label-caps text-label-caps text-zinc-450 hover:text-white transition-colors tracking-widest uppercase"
            onClick={onClose}
          >
            Cancelar
          </button>
        </footer>
      </aside>
    </div>
  );
}
