import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [semester, setSemester] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Garantía de carga limpia: forzar reset de inputs al montar el componente.
  // Previene state leaking de sesiones anteriores o autorrelleno del navegador.
  useEffect(() => {
    setEmail('');
    setPassword('');
    setFullName('');
    setSemester('');
    setIsRegistering(false);
  }, []);

  const redirectUser = (userEmail) => {
    const isEmailAdmin = userEmail.toLowerCase().includes('admin');
    if (isEmailAdmin) {
      toast.success('Bienvenido, Administrador');
      navigate('/admin');
    } else {
      toast.success('Bienvenido, Estudiante');
      navigate('/estudiante');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Por favor ingresa tu correo y contraseña');
      return;
    }
    if (isRegistering) {
      if (fullName.trim().length < 3) {
        toast.error('El nombre debe tener al menos 3 caracteres');
        return;
      }
      if (!semester) {
        toast.error('Selecciona un semestre');
        return;
      }
    }
    const toastId = toast.loading(isRegistering ? 'Registrando cuenta...' : 'Iniciando sesión...');
    setIsLoading(true);
    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: { data: { full_name: fullName.trim(), semestre: semester } },
        });
        if (error) throw error;
        if (data.session) {
          toast.success('Registro e inicio de sesión exitoso', { id: toastId });
          redirectUser(email);
        } else {
          toast.success('Registro exitoso. Por favor revisa tu correo para confirmar la cuenta.', { id: toastId });
          setIsRegistering(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        toast.success('Inicio de sesión exitoso', { id: toastId });
        redirectUser(email);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error inesperado', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error('Ingresa tu correo institucional arriba primero para recuperar tu contraseña.');
      return;
    }
    const toastId = toast.loading('Enviando correo de recuperación...');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      toast.success('Te hemos enviado un enlace de recuperación a ' + email, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Error al enviar correo de recuperación: ' + err.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-black font-sans text-white">
      {/* Capa 1: Imagen de fondo */}
      <img
        src="/images/bg-campus.jpg"
        alt="Campus background"
        className="absolute inset-0 z-0 opacity-30 object-cover w-full h-full"
      />

      {/* Capa 2: Orbes de Luz Gigantes */}
      <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/40 blur-[150px] z-0 pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-600/40 blur-[150px] z-0 pointer-events-none" />

      {/* Tarjeta de Cristal Real */}
      <div className="relative z-10 w-[90%] max-w-[450px] p-8 sm:p-10 rounded-[2rem] bg-white/[0.05] backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Logo y Bienvenida */}
        <img
          src="/images/logo-uamazonia.png"
          alt="Logo U-Amazonia"
          className="h-16 mx-auto mb-6 object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <h1 className="text-2xl font-bold text-white text-center">¡Bienvenido de vuelta!</h1>
        <p className="text-sm text-zinc-400 text-center mb-8">Inicia sesión para continuar</p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Correo */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block px-1">Correo Institucional</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </span>
              <input
                type="email"
                placeholder="ejemplo@udla.edu.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-10 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block px-1">Contraseña</label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Registro extra campos */}
          {isRegistering && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block px-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block px-1">Semestre</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                >
                  <option value="">Selecciona un semestre</option>
                  <option value="1er Semestre">1er Semestre</option>
                  <option value="2do Semestre">2do Semestre</option>
                  <option value="3er Semestre">3er Semestre</option>
                  <option value="4to Semestre">4to Semestre</option>
                  <option value="5to Semestre">5to Semestre</option>
                  <option value="6to Semestre">6to Semestre</option>
                  <option value="7mo Semestre">7mo Semestre</option>
                  <option value="8vo Semestre">8vo Semestre</option>
                </select>
              </div>
            </>
          )}

          {/* Recordarme */}
          <div className="flex items-center justify-between text-sm px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-400 hover:text-zinc-300">
              <input
                type="checkbox"
                className="rounded border-white/10 bg-black/20 text-emerald-600 focus:ring-emerald-500/50 focus:ring-offset-zinc-950 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs">Recordarme</span>
            </label>
          </div>

          {/* Botón principal */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] mt-2 active:scale-[0.98] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (isRegistering ? 'Registrando...' : 'Cargando...') : (isRegistering ? 'Registrarse' : 'Ingresar al Portal')}
          </button>
        </form>

        {/* Alternancia entre login y registro */}
        <div className="text-center mt-4">
          {isRegistering ? (
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
            >
              ¿No tienes cuenta? Regístrate aquí
            </button>
          )}
        </div>

        {/* Enlace Inferior */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors bg-transparent border-none outline-none cursor-pointer"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>
    </div>
  );
}
