import { useState } from 'react';

export default function AdminSettings() {
  const [toggleNewIncidents, setToggleNewIncidents] = useState(() => localStorage.getItem('adminAlerts') !== 'false');

  return (
    <div className="p-4 md:p-8 flex-1 overflow-y-auto flex justify-center">
      {/* Centered Wrapper */}
      <div className="w-full max-w-3xl flex flex-col space-y-6">
        {/* Main Header */}
        <header className="mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Configuración del Sistema</h1>
          <p className="text-zinc-400 mt-1">Gestiona credenciales de acceso y parámetros de alertas globales (RF-14).</p>
        </header>

        {/* Admin Profile Card */}
        <section className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#34AB1E] rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0">
              JV
            </div>
            <div className="flex-1 w-full space-y-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold">Juan Santiago</h2>
                  <span className="bg-[#34AB1E]/10 text-[#34AB1E] text-[10px] font-bold px-2 py-0.5 rounded border border-[#34AB1E]/20 uppercase tracking-wider">Super Administrador</span>
                </div>
              </div>
              <div className="w-full">
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Email Institucional</label>
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-zinc-400 cursor-not-allowed outline-none"
                  disabled
                  type="email"
                  value="j.ceron@udla.edu.co"
                  readOnly
                />
              </div>
            </div>
          </div>
        </section>

        {/* Security & Access Card */}
        <section className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-4 md:p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[#34AB1E] text-lg">lock</span>
            <h3 className="text-lg font-bold">Seguridad de la Cuenta</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Contraseña Actual</label>
              <input
                className="w-full bg-black/40 border border-white/10 focus:border-[#34AB1E] rounded-lg px-4 py-2.5 text-white outline-none transition-colors"
                placeholder="••••••••"
                type="password"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
              <input
                className="w-full bg-black/40 border border-white/10 focus:border-[#34AB1E] rounded-lg px-4 py-2.5 text-white outline-none transition-colors"
                placeholder="••••••••"
                type="password"
              />
            </div>
          </div>
          <button className="mt-6 sm:self-end bg-transparent border-2 border-[#34AB1E] text-[#34AB1E] hover:bg-[#34AB1E]/5 font-bold py-2.5 px-6 rounded-lg transition-all active:scale-95">
            Actualizar Credenciales
          </button>
        </section>

        {/* Global System Alerts (RF-14) */}
        <section className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[#34AB1E] text-lg">notifications</span>
            <h3 className="text-lg font-bold">Notificaciones Administrativas (RF-14)</h3>
          </div>
          <div className="space-y-6">
            {/* Row 1 */}
            <div className="flex flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white">Nuevos Incidentes</h4>
                <p className="text-sm text-zinc-400">Notificarme cuando cualquier usuario reporte un nuevo daño.</p>
              </div>
              <div className="shrink-0 pt-1 sm:pt-0">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    checked={toggleNewIncidents}
                    onChange={() => {
                      const newVal = !toggleNewIncidents;
                      setToggleNewIncidents(newVal);
                      localStorage.setItem('adminAlerts', newVal ? 'true' : 'false');
                      window.dispatchEvent(new Event('notificacionesActualizadas'));
                    }}
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-11 h-6 bg-white/10 border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34AB1E]" />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Master Save Button */}
        <div className="flex justify-end w-full mt-4 pb-10">
          <button className="bg-[#34AB1E] hover:bg-[#2d941a] text-white font-bold py-4 px-12 rounded-xl w-full sm:w-auto shadow-lg shadow-[#34AB1E]/20 transition-all active:scale-95">
            Guardar Preferencias
          </button>
        </div>
      </div>
    </div>
  );
}
