import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <span className="material-symbols-outlined text-red-500 text-6xl animate-pulse">
              error
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight">¡Ups! Algo en el sistema ha fallado</h1>
              <p className="text-zinc-400 text-sm">
                Hemos detectado un error inesperado en la interfaz. Por favor, intenta recargar la plataforma.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 rounded-full bg-[#34AB1E] hover:bg-[#2d941a] text-white font-bold tracking-wide shadow-lg shadow-[#34AB1E]/20 transition-all active:scale-[0.98]"
            >
              Recargar el portal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
