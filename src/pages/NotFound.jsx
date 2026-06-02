import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4 relative overflow-hidden select-none">
      {/* Ambient cinematic background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src="/images/bg-campus.jpg" alt="Fondo" className="w-full h-full object-cover opacity-20" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px]"></div>
      </div>

      <div className="text-center space-y-6 z-10">
        <h1 className="text-9xl font-black text-[#34AB1E] tracking-tighter drop-shadow-[0_0_50px_rgba(52,171,30,0.15)] animate-bounce">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Parece que te has perdido en el campus.
          </h2>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">
            La página que estás buscando no existe o ha sido trasladada a otra ubicación.
          </p>
        </div>
        <div className="pt-4">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3.5 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:bg-[#34AB1E] hover:border-transparent text-white font-bold transition-all duration-300 shadow-lg"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
