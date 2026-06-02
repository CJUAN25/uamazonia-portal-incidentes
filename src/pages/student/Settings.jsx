import { useState, useCallback, useRef } from 'react';

export default function Settings() {
  const [toggleReports, setToggleReports] = useState(() => localStorage.getItem('studentAlerts') !== 'false');
  const [avatar, setAvatar] = useState(() => localStorage.getItem('userAvatar') || '');

  const fileInputRef = useRef(null);

  const handleToggleStyle = useCallback((checked) => ({
    borderColor: checked ? '#34AB1E' : '#3f3f46',
    right: checked ? 0 : undefined,
    left: checked ? undefined : 0,
  }), []);

  const handleLabelStyle = useCallback((checked) => ({
    backgroundColor: checked ? '#34AB1E' : '#3f3f46',
  }), []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        localStorage.setItem('userAvatar', base64String);
        setAvatar(base64String); // Asegúrate de tener este estado inicializado con localStorage.getItem('userAvatar')
        window.dispatchEvent(new Event('userAvatarChanged'));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="px-4 md:px-8 lg:pr-20 pb-8 md:pb-20 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <header className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Configuración de Cuenta</h2>
          <p className="text-zinc-400 text-base">Administra tu información personal y preferencias del sistema.</p>
        </header>

        {/* Profile Card */}
        <section className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl flex flex-col gap-6">
          <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Perfil de Usuario</h3>
          <div className="flex items-center gap-6 pb-2">
            <button
              onClick={handleAvatarClick}
              className="w-20 h-20 rounded-full bg-[#34AB1E] text-white flex items-center justify-center text-2xl font-bold overflow-hidden cursor-pointer hover:opacity-85 transition-opacity relative group focus:outline-none shrink-0"
              title="Cambiar foto de perfil"
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>JV</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="material-symbols-outlined text-white text-lg">edit</span>
              </div>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="flex flex-col gap-1">
              <h4 className="text-xl font-bold text-white">Juan Santiago</h4>
              <span className="inline-flex items-center bg-white/5 text-zinc-300 text-xs font-semibold px-3 py-1 rounded-full w-fit border border-white/10">Estudiante - 7mo Semestre</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Correo Institucional</label>
            <input
              className="w-full bg-black/40 text-zinc-550 text-sm rounded-xl px-4 py-3 border border-white/10 cursor-not-allowed focus:outline-none"
              disabled
              type="email"
              value="j.ceron@udla.edu.co"
              readOnly
            />
          </div>
        </section>

        {/* Security Card */}
        <section className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl flex flex-col gap-6">
          <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Seguridad y Acceso</h3>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Contraseña Actual</label>
              <input
                className="w-full bg-black/40 text-white text-sm rounded-xl px-4 py-3 border border-white/10 focus:ring-2 focus:ring-[#34AB1E] focus:border-transparent focus:outline-none transition-all placeholder-zinc-650"
                placeholder="••••••••"
                type="password"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nueva Contraseña</label>
              <input
                className="w-full bg-black/40 text-white text-sm rounded-xl px-4 py-3 border border-white/10 focus:ring-2 focus:ring-[#34AB1E] focus:border-transparent focus:outline-none transition-all placeholder-zinc-650"
                placeholder="Mínimo 8 caracteres"
                type="password"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Confirmar Nueva Contraseña</label>
              <input
                className="w-full bg-black/40 text-white text-sm rounded-xl px-4 py-3 border border-white/10 focus:ring-2 focus:ring-[#34AB1E] focus:border-transparent focus:outline-none transition-all placeholder-zinc-650"
                placeholder="Repite tu nueva contraseña"
                type="password"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button className="bg-transparent border border-white/20 text-white hover:text-[#34AB1E] hover:border-[#34AB1E] text-sm font-semibold py-2.5 px-6 rounded-full transition-all duration-200">
              Actualizar Contraseña
            </button>
          </div>
        </section>

        {/* Notifications Card */}
        <section className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl flex flex-col gap-6">
          <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Preferencias de Alertas</h3>
          <div className="flex flex-col gap-6">
            {/* Row 1 */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1 pr-4">
                <span className="text-sm font-semibold text-white">Alertas de mis reportes</span>
                <span className="text-sm text-zinc-400">Notificarme cuando un incidente que reporté cambie de estado.</span>
              </div>
              <div className="relative inline-block w-12 shrink-0 align-middle select-none transition duration-200 ease-in">
                <input
                  checked={toggleReports}
                  onChange={() => {
                    const newVal = !toggleReports;
                    setToggleReports(newVal);
                    localStorage.setItem('studentAlerts', newVal ? 'true' : 'false');
                    window.dispatchEvent(new Event('notificacionesActualizadas'));
                  }}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 z-10 top-0"
                  id="toggle-reports"
                  name="toggle-reports"
                  style={handleToggleStyle(toggleReports)}
                  type="checkbox"
                />
                <label
                  className="toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-all duration-300"
                  htmlFor="toggle-reports"
                  style={handleLabelStyle(toggleReports)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Action Footer */}
        <div className="flex justify-end pt-4 pb-8">
          <button className="bg-[#34AB1E] hover:bg-[#2e961a] text-white text-sm font-bold py-3 px-8 rounded-full shadow-lg shadow-[#34AB1E]/20 transition-all duration-200 active:scale-[0.98]">
            Guardar Preferencias
          </button>
        </div>
      </div>
    </div>
  );
}
