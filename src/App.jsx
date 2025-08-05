import { useState, useRef } from 'react';

const badJokes = [
  "¿Por qué los datos siempre están tristes? Porque viven en la base... de datos 😢",
  "¿Qué le dice un NPS a otro NPS? ¡Nos vemos en el dashboard! 📊",
  "¿Por qué el servidor fue al psicólogo? Tenía problemas de conexión 🔌",
  "¿Cómo se llama el pez que mide la satisfacción? El NPS-cado 🐟",
  "¿Por qué los algoritmos no pueden mentir? Porque siempre dicen la verdad binaria 🤖",
  "¿Qué hace un desarrollador cuando está aburrido? Hace un commit y se va 💻",
  "¿Por qué los datos no van al gimnasio? Porque ya están en forma... de tabla 💪",
  "¿Cómo se despiden las APIs? ¡Nos vemos en el endpoint! 🚀"
];

export default function NPSUpdaterApp() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentJoke, setCurrentJoke] = useState('');
  const [result, setResult] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Usar useRef para mantener el índice actualizado en el closure
  const jokeIndexRef = useRef(0);

  const updateNPS = async () => {
    setIsLoading(true);
    setResult(null);
    setShowAnimation(false);
    jokeIndexRef.current = 0;
    
    // Mostrar primer chiste inmediatamente
    setCurrentJoke(badJokes[0]);
    jokeIndexRef.current = 1;
    
    // Cambiar chistes cada 3 segundos
    const jokeInterval = setInterval(() => {
      setCurrentJoke(badJokes[jokeIndexRef.current % badJokes.length]);
      jokeIndexRef.current += 1;
    }, 3000);


    // Traemos endpoint
    const apiUrl = import.meta.env.VITE_API_URL

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(200000)
      });

      const data = await response.json();
      
      clearInterval(jokeInterval);
      setCurrentJoke('');
      setIsLoading(false);

      if (data.done && response.ok) {
        setResult('success');
      } else {
        setResult('error');
      }
      
      setShowAnimation(true);
      
    } catch (error) {
      clearInterval(jokeInterval);
      setCurrentJoke('');
      setIsLoading(false);
      setResult('error');
      setShowAnimation(true);
      console.error('Error updating NPS:', error);
    }
  };

  const resetState = () => {
    setResult(null);
    setShowAnimation(false);
    setCurrentJoke('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Contenedor dinámico que se adapta al contenido */}
      <div className={`
        w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden transition-all duration-500
        ${showAnimation ? 'min-h-[500px]' : 'min-h-[400px]'}
      `}>
        
        {/* Efecto de fondo sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
        
        {/* Animación de éxito con mejoras v4.1 */}
        {showAnimation && result === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/95 backdrop-blur-md rounded-3xl animate-bounce-in">
            <div className="text-center p-6">
              <div className="text-7xl mb-6 animate-bounce">🎉</div>
              <h3 className="text-3xl font-bold text-green-600 mb-3 text-shadow-sm">¡Éxito!</h3>
              <p className="text-gray-600 mb-6 text-lg">NPS actualizado correctamente</p>
              <button 
                onClick={resetState}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Animación de error mejorada */}
        {showAnimation && result === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/95 backdrop-blur-md rounded-3xl animate-bounce-in">
            <div className="text-center p-6">
              <div className="text-7xl mb-6 animate-pulse">❌</div>
              <h3 className="text-3xl font-bold text-red-600 mb-3 text-shadow-sm">Error</h3>
              <p className="text-gray-600 mb-6 text-lg px-4">Hubo un problema al actualizar el NPS</p>
              <button 
                onClick={resetState}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Contenido principal con espaciado dinámico */}
        <div className={`text-center relative z-0 transition-all duration-300 ${showAnimation ? 'opacity-20' : 'opacity-100'}`}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-8 text-shadow-sm">
            Actualizador NPS
          </h1>
          
          <button
            onClick={updateNPS}
            disabled={isLoading}
            className={`
              relative px-10 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 transform shadow-lg
              ${isLoading 
                ? 'bg-gradient-to-r from-blue-400 to-blue-500 cursor-not-allowed animate-pulse-glow' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl'
              }
              text-white text-shadow-sm
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-3">
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Actualizando...</span>
              </div>
            ) : (
              'Actualizar bruto NPS'
            )}
          </button>

          {/* Chistes con mejor diseño y altura mínima para evitar saltos */}
          <div className="mt-8 min-h-[100px] flex items-center">
            {currentJoke && (
              <div className="w-full p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border-l-4 border-yellow-400 animate-fade-in shadow-inner">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl shrink-0">😄</div>
                  <p className="text-gray-700 italic text-base leading-relaxed text-left">
                    {currentJoke}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Indicador de progreso mejorado */}
          {isLoading && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full animate-pulse shadow-sm"></div>
              </div>
              <p className="text-sm text-gray-500 mt-3 font-medium">Procesando datos del NPS...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}