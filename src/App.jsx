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
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [nElements, setNElements] = useState(null);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  
  // Usar useRef para mantener el índice actualizado en el closure
  const jokeIndexRef = useRef(0);
  const loadingMessageIntervalRef = useRef(null);
  const loadingMessageTimeoutRef = useRef(null);

  const updateNPS = async (userPassword) => {
    setIsLoading(true);
    setResult(null);
    setShowAnimation(false);
    setPasswordError('');
    setNElements(null);
    setShowLoadingMessage(false);
    jokeIndexRef.current = 0;
    
    // Mostrar primer chiste inmediatamente
    setCurrentJoke(badJokes[0]);
    jokeIndexRef.current = 1;
    
    // Cambiar chistes cada 3 segundos
    const jokeInterval = setInterval(() => {
      setCurrentJoke(badJokes[jokeIndexRef.current % badJokes.length]);
      jokeIndexRef.current += 1;
    }, 4000);

    // Mensaje de carga cada 12 segundos
    loadingMessageIntervalRef.current = setInterval(() => {
      setShowLoadingMessage(true);
      // Ocultar el mensaje después de 5 segundos
      loadingMessageTimeoutRef.current = setTimeout(() => {
        setShowLoadingMessage(false);
      }, 7000);
    }, 20000);

    // Traemos endpoint
    const apiUrl = import.meta.env.VITE_API_URL

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_password: userPassword
        }),
        signal: AbortSignal.timeout(200000)
      });

      const data = await response.json();
      
      // Limpiar todos los intervalos y timeouts
      clearInterval(jokeInterval);
      clearInterval(loadingMessageIntervalRef.current);
      clearTimeout(loadingMessageTimeoutRef.current);
      
      setCurrentJoke('');
      setIsLoading(false);
      setShowLoadingMessage(false);

      if (data.done && response.ok) {
        setResult('success');
        setNElements(data.n_elements);
        setShowPasswordForm(false);
        setPassword('');
      } else if (data.error === 'invalid_password') {
        setResult('invalid_password');
      } else {
        setResult('error');
      }
      
      setShowAnimation(true);
      
    } catch (error) {
      // Limpiar todos los intervalos y timeouts
      clearInterval(jokeInterval);
      clearInterval(loadingMessageIntervalRef.current);
      clearTimeout(loadingMessageTimeoutRef.current);
      
      setCurrentJoke('');
      setIsLoading(false);
      setShowLoadingMessage(false);
      setResult('error');
      setShowAnimation(true);
      console.error('Error updating NPS:', error);
    }
  };

  const handlePasswordSubmit = () => {
    if (password.length >= 3) {
      updateNPS(password);
    }
  };

  const resetState = () => {
    setResult(null);
    setShowAnimation(false);
    setCurrentJoke('');
    setPasswordError('');
    setNElements(null);
    if (result === 'invalid_password') {
      setPassword('');
    }
  };

  const showPasswordFormHandler = () => {
    setShowPasswordForm(true);
    setResult(null);
    setShowAnimation(false);
    setPasswordError('');
  };

  const hidePasswordForm = () => {
    setShowPasswordForm(false);
    setPassword('');
    setShowPassword(false);
    setPasswordError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Contenedor dinámico que se adapta al contenido */}
      <div className={`
        w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden transition-all duration-500
        ${showAnimation ? 'min-h-[500px]' : showPasswordForm ? 'min-h-[450px]' : 'min-h-[400px]'}
      `}>
        
        {/* Efecto de fondo sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
        
        {/* Animación de éxito */}
        {showAnimation && result === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/95 backdrop-blur-md rounded-3xl animate-bounce-in">
            <div className="text-center p-6">
              <div className="text-7xl mb-6 animate-bounce">🎉</div>
              <h3 className="text-3xl font-bold text-green-600 mb-3 text-shadow-sm">¡Éxito!</h3>
              <p className="text-gray-600 mb-2 text-lg">NPS actualizado correctamente</p>
              {nElements && (
                <p className="text-gray-500 mb-6 text-base">
                  <span className="font-semibold text-blue-600">{parseInt(nElements).toLocaleString()}</span> elementos procesados
                </p>
              )}
              <button 
                onClick={resetState}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Animación de error general */}
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

        {/* Animación de contraseña incorrecta */}
        {showAnimation && result === 'invalid_password' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/95 backdrop-blur-md rounded-3xl animate-bounce-in">
            <div className="text-center p-6">
              <div className="text-7xl mb-6 animate-pulse">🔒</div>
              <h3 className="text-3xl font-bold text-orange-600 mb-3 text-shadow-sm">Contraseña Incorrecta</h3>
              <p className="text-gray-600 mb-6 text-lg px-4">La contraseña ingresada no es válida</p>
              <button 
                onClick={resetState}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className={`text-center relative z-0 transition-all duration-300 ${showAnimation ? 'opacity-20' : 'opacity-100'}`}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-8 text-shadow-sm">
            Actualizador NPS
          </h1>
          
          {/* Botón principal o formulario de contraseña */}
          {!showPasswordForm && !isLoading ? (
            <button
              onClick={showPasswordFormHandler}
              className="relative px-10 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 transform shadow-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl text-white text-shadow-sm"
            >
              Actualizar bruto NPS
            </button>
          ) : showPasswordForm && !isLoading ? (
            <div className="space-y-6 animate-fade-in">
              <div className="text-left space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña de autorización
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && password.length >= 3 && handlePasswordSubmit()}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                    placeholder="Ingresa la contraseña..."
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {password.length > 0 && password.length < 3 && (
                  <p className="text-sm text-orange-600">Mínimo 3 caracteres</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={hidePasswordForm}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold"
                >
                  Cancelar
                </button>
                {password.length >= 3 && (
                  <button
                    onClick={handlePasswordSubmit}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 font-semibold transform hover:scale-105 shadow-lg animate-fade-in"
                  >
                    Ejecutar
                  </button>
                )}
              </div>
            </div>
          ) : isLoading ? (
            <button
              disabled
              className="relative px-10 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 transform shadow-lg bg-gradient-to-r from-blue-400 to-blue-500 cursor-not-allowed animate-pulse-glow text-white text-shadow-sm"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Actualizando...</span>
              </div>
            </button>
          ) : null}

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
              
              {/* Mensaje de carga cada 12 segundos */}
              {showLoadingMessage && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <div className="text-xl">⏳</div>
                    <p className="text-blue-700 text-sm font-medium">
                      La aplicación sigue funcionando. Hay mucha información que procesar, esto puede tardar un poco más.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}