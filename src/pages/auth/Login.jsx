import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Por favor ingresa tu correo y contraseña');
      return;
    }

    const toastId = toast.loading('Iniciando sesión...');

    try {
      // 1. Intentar iniciar sesión
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        // Si el usuario no existe o las credenciales no son válidas
        if (
          error.message.toLowerCase().includes('invalid login credentials') ||
          error.message.toLowerCase().includes('user not found') ||
          error.status === 400
        ) {
          toast.dismiss(toastId);
          const confirmRegister = window.confirm(
            'Las credenciales ingresadas no corresponden a una cuenta activa. ¿Deseas registrar este correo como una nueva cuenta?'
          );
          if (confirmRegister) {
            const signUpToastId = toast.loading('Registrando nueva cuenta...');
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: email.trim(),
              password: password.trim(),
            });

            if (signUpError) {
              toast.error(`Error en el registro: ${signUpError.message}`, { id: signUpToastId });
              return;
            }

            if (signUpData.session) {
              toast.success('Registro e inicio de sesión exitoso', { id: signUpToastId });
              redirectUser(email);
            } else {
              toast.success('Registro exitoso. Por favor revisa tu correo para confirmar la cuenta.', { id: signUpToastId });
            }
          }
          return;
        }

        toast.error(`Error al iniciar sesión: ${error.message}`, { id: toastId });
        return;
      }

      toast.success('Inicio de sesión exitoso', { id: toastId });
      redirectUser(email);
    } catch (err) {
      console.error(err);
      toast.error('Ocurrió un error inesperado al iniciar sesión', { id: toastId });
    }
  };

  const handleSSO = async (proveedor) => {
    const toastId = toast.loading('Conectando con ' + proveedor + '...');
    try {
      const providerName = proveedor.toLowerCase() === 'google' ? 'google' : 'azure';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: providerName,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      toast.error('Error al conectar con ' + proveedor + ': ' + err.message, { id: toastId });
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error('Ingresa tu correo institucional arriba primero para recuperar tu contraseña.');
      return;
    }
    const toastId = toast.loading('Enviando correo de recuperación...');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      toast.success('Te hemos enviado un enlace de recuperación a ' + email, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Error al enviar correo de recuperación: ' + err.message, { id: toastId });
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

      {/* Capa 2: Orbes de Luz Gigantes (z-0) */}
      {/* Orbe 1 (Verde Superior) */}
      <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/40 blur-[150px] z-0 pointer-events-none" />
      {/* Orbe 2 (Azul Inferior) */}
      <div className="absolute -bottom-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-600/40 blur-[150px] z-0 pointer-events-none" />

      {/* Tarjeta de Cristal Real (Glassmorphism) */}
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
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Correo Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block px-1">
              Correo Institucional
            </label>
            <div className="relative group">
              {/* Envelope SVG Icon */}
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
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

          {/* Contraseña Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block px-1">
              Contraseña
            </label>
            <div className="relative group">
              {/* Lock SVG Icon */}
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
              />
              {/* Toggle Eye Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  /* Eye-Slash SVG */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  /* Eye SVG */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Recordarme Checkbox */}
          <div className="flex items-center justify-between text-sm px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-400 hover:text-zinc-300">
              <input
                type="checkbox"
                className="rounded border-white/10 bg-black/20 text-emerald-600 focus:ring-emerald-500/50 focus:ring-offset-zinc-950 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs">Recordarme</span>
            </label>
          </div>

          {/* Botón Principal */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] mt-2 active:scale-[0.98]"
          >
            Ingresar al Portal
          </button>
        </form>

        {/* Separador */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-white/10" />
          <span className="px-3 text-[10px] text-zinc-500 uppercase tracking-widest">o continúa con</span>
          <div className="flex-grow border-t border-white/10" />
        </div>

        {/* Botones Sociales (SSO) */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleSSO('Google')}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center gap-3 py-2.5 rounded-xl transition-colors active:scale-[0.98]"
          >
            {/* Google SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-xs font-semibold">Google</span>
          </button>
          <button
            type="button"
            onClick={() => handleSSO('Microsoft')}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center gap-3 py-2.5 rounded-xl transition-colors active:scale-[0.98]"
          >
            {/* Microsoft SVG */}
            <svg className="w-5 h-5" viewBox="0 0 23 23" fill="currentColor">
              <rect x="0" y="0" width="10.5" height="10.5" fill="#f25022"/>
              <rect x="11.5" y="0" width="10.5" height="10.5" fill="#7fba00"/>
              <rect x="0" y="11.5" width="10.5" height="10.5" fill="#00a4ef"/>
              <rect x="11.5" y="11.5" width="10.5" height="10.5" fill="#ffb900"/>
            </svg>
            <span className="text-xs font-semibold">Microsoft</span>
          </button>
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
