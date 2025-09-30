import React from 'react';

/**
 * Tela de Loading IDÊNTICA ao visual final
 * Previne qualquer flash visual durante carregamento
 */
export const LoadingScreen: React.FC = () => {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center"
      style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        opacity: 1,
        visibility: 'visible'
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4"
        style={{
          opacity: 1,
          visibility: 'visible',
          transform: 'translateY(0)'
        }}
      >
        {/* Logo idêntica ao login */}
        <div className="text-center mb-6">
          <img 
            src="/LOGO OBJETIVO PNG.png" 
            alt="Logo Objetivo" 
            className="h-16 mx-auto mb-4"
            style={{ opacity: 1 }}
          />
          <h1 className="text-2xl font-bold text-[#002776] mb-2">
            Colégio Objetivo
          </h1>
          <p className="text-gray-600 text-sm">
            Carregando sistema...
          </p>
        </div>

        {/* Área do formulário com skeleton */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-12 bg-gray-100 rounded border border-gray-200"></div>
          </div>
          
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-12 bg-gray-100 rounded border border-gray-200"></div>
          </div>
          
          {/* Botão skeleton idêntico */}
          <div 
            className="w-full h-12 rounded-lg animate-pulse"
            style={{ 
              backgroundColor: '#002776',
              opacity: 0.7
            }}
          ></div>
        </div>

        {/* Links skeleton */}
        <div className="mt-6 text-center space-y-2">
          <div className="h-3 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;