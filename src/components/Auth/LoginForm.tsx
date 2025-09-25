import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, ExternalLink, HelpCircle, Lock, User, School, Monitor, Smartphone, Tablet, Key } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { HelpInstructionsModal } from './HelpInstructionsModal';
import { useGlobalConfig } from '../../utils/configManager.tsx';

// Configuração padrão completa da tela de login
const defaultLoginConfig: LoginCustomization = {
  // Logo e Branding
  logoUrl: '/LOGO OBJETIVO PNG.png',
  schoolName: 'Colégio Objetivo',
  
  // Imagens e Cores
  backgroundImageUrl: '',
  backgroundColor: 'from-slate-50 to-blue-50',
  primaryColor: '#002776',
  secondaryColor: '#3B82F6',
  accentColor: '#8B5CF6',
  
  // Textos Principais
  welcomeMessage: 'Área restrita do Objetivo (Colégio e Curso)',
  leftSideTitle: 'Educação de excelência para o futuro dos seus filhos',
  leftSideSubtitle: 'Acompanhe o desenvolvimento acadêmico através do nosso portal educacional.',
  loginSubtitle: 'Faça login para acessar o sistema',
  
  // Links e URLs
  siteUrl: 'https://objetivo.br',
  helpUrl: '#',
  forgotPasswordUrl: '#',
  privacyPolicyUrl: '#',
  accessibilityUrl: '#',

  // Configurações do Botão do Site
  showSiteButton: true,
  siteButtonText: 'Voltar para o site do Objetivo',
  siteButtonUrl: 'https://objetivo.br',

  
  // Rodapé
  showFooter: true,
  copyrightText: 'Copyright © 1997-2025 Colégio Objetivo. Todos os direitos reservados.',
  showPrivacyLink: true,
  showAccessibilityLink: true,
  privacyPolicyText: 'Política de Privacidade',
  accessibilityText: 'Acessibilidade',
  
  // Funcionalidades
  showCredentialsHelper: true,
  showLogo: true,
  showWelcomeText: true,
  showSubtitle: true,
  showHelpLinks: true,
  showResponsiveIndicator: false,
  enableAnimations: true,
  showWelcomeAnimation: true,
  
  // Logo Animada
  showAnimatedLogo: false,
  animatedLogoUrl: '/logo-objetivo.png',
  animatedLogoSize: 'medium',
  animatedLogoPosition: 'top',
  
  // Layout
  layoutStyle: 'split',
  formPosition: 'right',
  
  // Efeitos Visuais
  enableGlassEffect: true,
  enableGradients: true,
  enableShadows: false,
  enableParticles: false,
  enableNoiseEffect: false,
  overlayOpacity: 40,
  removeBackgroundBlur: false,
  
  // Acessibilidade
  highContrast: false,
  reducedMotion: false,
  
  // Tipografia
  fontFamily: 'inter',
  fontSize: 'base'
};

interface LoginCustomization {
  // Logo e Branding
  logoUrl: string;
  schoolName: string;
  
  // Imagens e Cores
  backgroundImageUrl: string;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Textos Principais
  welcomeMessage: string;
  leftSideTitle: string;
  leftSideSubtitle: string;
  loginSubtitle: string;
  
  // Links e URLs
  siteUrl: string;
  helpUrl: string;
  forgotPasswordUrl: string;
  privacyPolicyUrl: string;
  accessibilityUrl: string;
  
  // Configurações do Botão do Site
  showSiteButton: boolean;
  siteButtonText: string;
  siteButtonUrl: string;
  
  // Rodapé
  showFooter: boolean;
  copyrightText: string;
  showPrivacyLink: boolean;
  showAccessibilityLink: boolean;
  privacyPolicyText: string;
  accessibilityText: string;
  
  // Funcionalidades
  showCredentialsHelper: boolean;
  showLogo: boolean;
  showWelcomeText: boolean;
  showSubtitle: boolean;
  showHelpLinks: boolean;
  showResponsiveIndicator: boolean;
  enableAnimations: boolean;
  showWelcomeAnimation: boolean;
  
  // Logo Animada
  showAnimatedLogo: boolean;
  animatedLogoUrl: string;
  animatedLogoSize: 'small' | 'medium' | 'large';
  animatedLogoPosition: 'top' | 'center' | 'bottom';
  
  // Layout
  layoutStyle: 'split' | 'centered' | 'minimal' | 'fullscreen' | 'sidebar' | 'floating' | 'magazine' | 'card';
  formPosition: 'right' | 'center' | 'left';
  
  // Efeitos Visuais
  enableGlassEffect: boolean;
  enableGradients: boolean;
  enableShadows: boolean;
  enableParticles: boolean;
  enableNoiseEffect: boolean;
  overlayOpacity: number;
  removeBackgroundBlur: boolean;
  
  // Acessibilidade
  highContrast: boolean;
  reducedMotion: boolean;
  
  // Tipografia
  fontFamily: string;
  fontSize: string;
}

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { configs } = useGlobalConfig();
  const [customization, setCustomization] = useState<LoginCustomization>(defaultLoginConfig);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const { signIn } = useAuth();

  useEffect(() => {
    // Carregar configurações do contexto global
    if (configs.login_customization) {
      console.log('📂 Carregando configurações do Supabase:', configs.login_customization);
      setCustomization({ ...defaultLoginConfig, ...configs.login_customization });
    } else {
      console.log('📂 Usando configurações padrão (Supabase não disponível ou sem dados)');
      setCustomization(defaultLoginConfig);
    }
    
    // Escutar mensagens do postMessage (para iframe) - manter para preview
    const handlePostMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'LOGIN_CONFIG_UPDATE') {
        console.log('📨 LoginForm: Recebendo configuração via postMessage:', event.data.config);
        const mergedConfig = { ...defaultLoginConfig, ...event.data.config };
        setCustomization(mergedConfig);
      }
    };
    
    window.addEventListener('message', handlePostMessage);
    
    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  }, []);

  // Reagir a mudanças nas configurações globais
  useEffect(() => {
    if (configs.login_customization) {
      console.log('🔄 Atualizando configurações via GlobalConfig:', configs.login_customization);
      setCustomization({ ...defaultLoginConfig, ...configs.login_customization });
    }
  }, [configs.login_customization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  const getLayoutClasses = () => {
    switch (customization.layoutStyle) {
      case 'fullscreen':
        return 'min-h-screen flex items-center justify-center relative overflow-hidden';
      case 'sidebar':
        return 'min-h-screen flex';
      case 'floating':
        return 'min-h-screen flex items-center justify-center p-8';
      case 'magazine':
        return 'min-h-screen grid grid-cols-1 lg:grid-cols-3';
      case 'card':
        return 'min-h-screen flex items-center justify-center p-4';
      case 'centered':
        return 'min-h-screen flex items-center justify-center';
      case 'minimal':
        return 'min-h-screen flex items-center justify-center bg-white';
      case 'split':
      default:
        return 'min-h-screen flex';
    }
  };

  const getFormPositionClasses = () => {
    if (customization.layoutStyle === 'split') {
      return customization.formPosition === 'left' ? 'order-first' : '';
    }
    return '';
  };

  const getAnimationClasses = () => {
    if (!customization.enableAnimations) return '';
    return 'animate-fade-in';
  };

  const getGlassClasses = () => {
    if (!customization.enableGlassEffect) return 'bg-white';
    return 'glass-card backdrop-blur-lg bg-white/90';
  };

  const getShadowClasses = () => {
    if (!customization.enableShadows) return '';
    return 'shadow-2xl';
  };

  const getFontClasses = () => {
    if (!customization.fontFamily) return '';
    return `font-${customization.fontFamily}`;
  };

  const getBackgroundEffectStyles = () => {
    const styles: React.CSSProperties = {};
    
    // No layout "split", a imagem de fundo deve aparecer apenas no painel esquerdo,
    // portanto não aplicamos imagem de fundo no container global para evitar duplicação.
    if (customization.layoutStyle === 'split') {
      return styles;
    }

    if (customization.backgroundImageUrl) {
      styles.backgroundImage = `url(${customization.backgroundImageUrl})`;
      styles.backgroundSize = 'cover';
      styles.backgroundPosition = 'center';
      styles.backgroundRepeat = 'no-repeat';
    }
    
    return styles;
  };

  const renderSplitLayout = () => (
    <>
      {/* Link para voltar ao site - Topo direito */}
      {customization.showSiteButton && (
        <div className="absolute top-4 right-4 z-20">
          <a
            href={customization.siteButtonUrl || customization.siteUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 text-sm sm:text-base font-bold text-gray-700 hover:text-blue-600 ${getGlassClasses()} ${getShadowClasses()} hover:scale-105`}
          >
            <ExternalLink className="h-5 w-5" />
            <span className="hidden sm:inline">{customization.siteButtonText}</span>
            <span className="sm:hidden">Site</span>
          </a>
        </div>
      )}
      
      {/* Logo Animada */}
      {customization.showAnimatedLogo && (
        <div className={`absolute z-10 ${
          customization.animatedLogoPosition === 'top' ? 'top-4 left-4' :
          customization.animatedLogoPosition === 'center' ? 'top-1/2 left-4 transform -translate-y-1/2' :
          'bottom-4 left-4'
        }`}>
          <div className={`${
            customization.animatedLogoSize === 'small' ? 'w-16 h-16' :
            customization.animatedLogoSize === 'medium' ? 'w-20 h-20' :
            'w-24 h-24'
          } ${getGlassClasses()} rounded-2xl flex items-center justify-center overflow-hidden ${getShadowClasses()} ${customization.enableAnimations ? 'animate-float' : ''}`}>
            {customization.animatedLogoUrl ? (
              <img 
                src={customization.animatedLogoUrl} 
                alt="Logo animada" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="text-gray-400">
                <School className="h-8 w-8" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lado esquerdo - Imagem institucional */}
      <div className={`hidden md:flex md:w-1/2 lg:w-1/2 relative ${getFormPositionClasses()}`}>
        <div 
          className={`w-full bg-cover bg-center bg-no-repeat relative ${getAnimationClasses()}`}
          style={{
            backgroundImage: customization.backgroundImageUrl 
              ? `url(${customization.backgroundImageUrl})`
              : `url('https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`
          }}
        >
          {/* Overlay para melhor legibilidade */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-blue-800/40"
            style={{ 
              opacity: customization.overlayOpacity / 100,
              filter: customization.removeBackgroundBlur ? 'none' : 'blur(0.5px)'
            }}
          ></div>
          
          {/* Conteúdo sobre a imagem */}
          <div className={`absolute inset-0 flex flex-col justify-end p-12 text-white ${customization.enableAnimations ? 'animate-slide-in-up' : ''}`}>
            <div className="max-w-sm md:max-w-md">
              <h2 className={`text-3xl md:text-4xl font-black mb-6 leading-tight ${customization.enableShadows ? 'text-shadow-modern' : ''} ${customization.enableAnimations ? 'animate-glow' : ''}`}>
                {customization.leftSideTitle}
              </h2>
              <p className={`text-lg md:text-xl opacity-95 leading-relaxed font-semibold ${customization.enableShadows ? 'text-shadow-modern' : ''}`}>
                {customization.leftSideSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className={`w-full md:w-1/2 lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 ${getFormPositionClasses()}`}>
        <div className={`w-full max-w-md ${getAnimationClasses()}`}>
          {/* Logo e título */}
          <div className={`text-center mb-8 sm:mb-10 ${customization.enableAnimations ? 'animate-scale-in' : ''}`}>
            {customization.showLogo && customization.logoUrl && (
              <img 
                src={customization.logoUrl} 
                alt="Logo" 
                className={`h-16 sm:h-20 mx-auto mb-4 sm:mb-6 transition-all duration-500 ${getShadowClasses()} ${customization.enableAnimations ? 'hover:scale-110 animate-float' : ''}`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {customization.showWelcomeText && (
              <h1 className={`text-2xl sm:text-3xl font-black text-gray-900 mb-4 ${customization.enableAnimations ? 'animate-slide-up' : ''} ${customization.enableShadows ? 'text-shadow-modern' : ''}`}>
                {customization.welcomeMessage}
              </h1>
            )}
            {customization.showSubtitle && (
              <p className={`text-gray-600 text-base sm:text-lg font-semibold ${customization.enableAnimations ? 'animate-slide-up' : ''}`}>
                {customization.loginSubtitle}
              </p>
            )}
          </div>

          {/* Credenciais de Teste */}
          {customization.showCredentialsHelper && (
            <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl ${customization.enableGlassEffect ? 'glass-card-dark' : 'bg-blue-50 border border-blue-200'} ${customization.enableAnimations ? 'animate-fade-in' : ''}`}>
              <h3 className="text-sm sm:text-base font-black text-blue-800 mb-3 sm:mb-4">🔑 Credenciais para Teste</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-blue-700">👑 Admin</p>
                    <p className="text-sm text-blue-600 truncate">admin@escola.com</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillCredentials('admin@escola.com', '123456')}
                    className="px-4 py-2 text-sm flex-shrink-0 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-bold hover:scale-105"
                  >
                    Usar
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-blue-700">👨‍🏫 Professor</p>
                    <p className="text-sm text-blue-600 truncate">professor@escola.com</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillCredentials('professor@escola.com', '123456')}
                    className="px-4 py-2 text-sm flex-shrink-0 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 font-bold hover:scale-105"
                  >
                    Usar
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-blue-700">👨‍👩‍👧‍👦 Pai</p>
                    <p className="text-sm text-blue-600 truncate">pai@escola.com</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillCredentials('pai@escola.com', '123456')}
                    className="px-4 py-2 text-sm flex-shrink-0 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 font-bold hover:scale-105"
                  >
                    Usar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formulário de login */}
          <form onSubmit={handleSubmit} className={`space-y-6 ${customization.enableAnimations ? 'animate-slide-up' : ''}`}>
            {error && (
              <div className={`flex items-center space-x-3 p-4 sm:p-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl text-red-700 ${getShadowClasses()} ${customization.enableAnimations ? 'animate-fade-in' : ''}`}>
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm sm:text-base font-semibold">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                📧 Identificação
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-4 sm:py-5 text-base sm:text-lg border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium placeholder-gray-400 ${getShadowClasses()}`}
                  placeholder="Digite seu e-mail"
                  style={{ 
                    borderColor: customization.enableGradients ? customization.secondaryColor : undefined 
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                🔒 Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-4 sm:py-5 text-base sm:text-lg border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 font-medium placeholder-gray-400 ${getShadowClasses()}`}
                  placeholder="Digite sua senha"
                  style={{ 
                    borderColor: customization.enableGradients ? customization.secondaryColor : undefined 
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110 p-1 rounded-full hover:bg-gray-100"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 sm:py-6 px-6 text-lg sm:text-xl rounded-2xl font-black text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${getShadowClasses()} ${customization.enableAnimations ? 'hover:scale-105 active:scale-95' : ''}`}
              style={{ 
                backgroundColor: customization.primaryColor,
                background: customization.enableGradients 
                  ? `linear-gradient(135deg, ${customization.primaryColor}, ${customization.secondaryColor})` 
                  : customization.primaryColor
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-black">Entrando...</span>
                </div>
              ) : (
                <span className="font-black">🚀 Entrar no Sistema</span>
              )}
            </button>
          </form>

          {/* Links de ajuda */}
          {customization.showHelpLinks && (
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8 text-sm sm:text-base">
              <a
                onClick={() => setShowForgotPasswordModal(true)}
                className={`text-blue-600 hover:text-blue-800 transition-all duration-300 flex items-center space-x-2 font-semibold ${customization.enableAnimations ? 'hover:scale-105' : ''}`}
              >
                <Key className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>🔑 Esqueceu a senha?</span>
              </a>
              <button
                onClick={() => setShowHelpModal(true)}
                className={`text-blue-600 hover:text-blue-800 transition-all duration-300 flex items-center space-x-2 font-semibold ${customization.enableAnimations ? 'hover:scale-105' : ''}`}
              >
                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>💡 Como acessar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderCenteredLayout = () => (
    <div className="w-full max-w-md mx-auto">
      <div className={`${getGlassClasses()} rounded-3xl p-8 ${getShadowClasses()}`}>
        {/* Logo */}
        <div className={`text-center mb-8 ${customization.enableAnimations ? 'animate-scale-in' : ''}`}>
          {customization.logoUrl && (
            <img 
              src={customization.logoUrl} 
              alt="Logo" 
              className={`h-20 mx-auto mb-6 ${customization.enableAnimations ? 'animate-float' : ''}`}
            />
          )}
          <h1 className="text-3xl font-black text-gray-900 mb-4">
            {customization.welcomeMessage}
          </h1>
          <p className="text-gray-600 text-lg">
            {customization.loginSubtitle}
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-semibold">{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email-centered" className="block text-sm font-bold text-gray-700 mb-2">
              E-mail
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email-centered"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                placeholder="Digite seu e-mail"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password-centered" className="block text-sm font-bold text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password-centered"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 text-lg rounded-lg font-black text-white transition-all duration-300 disabled:opacity-50"
            style={{ backgroundColor: customization.primaryColor }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderSidebarLayout = () => (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-xl p-8 flex flex-col justify-center">
        <div className="text-center mb-8">
          {customization.logoUrl && (
            <img 
              src={customization.logoUrl} 
              alt="Logo" 
              className="h-16 mx-auto mb-6"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {customization.welcomeMessage}
          </h1>
          <p className="text-gray-600">
            {customization.loginSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="E-mail"
          />

          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Senha"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: customization.primaryColor }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>

      {/* Área de Conteúdo */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: customization.primaryColor }}>
        <div className="text-center max-w-md">
          <h2 className="text-4xl font-bold text-white mb-6">
            {customization.leftSideTitle}
          </h2>
          <p className="text-xl text-white opacity-90">
            {customization.leftSideSubtitle}
          </p>
        </div>
      </div>
    </div>
  );

  const renderFloatingLayout = () => (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className={`w-full max-w-md ${getGlassClasses()} rounded-3xl p-8 ${getShadowClasses()}`}>
        <div className="text-center mb-8">
          {customization.logoUrl && (
            <img 
              src={customization.logoUrl} 
              alt="Logo" 
              className="h-20 mx-auto mb-6"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {customization.welcomeMessage}
          </h1>
          <p className="text-gray-600">
            {customization.loginSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Digite seu e-mail"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Digite sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
            style={{ backgroundColor: customization.primaryColor }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderMagazineLayout = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 min-h-screen">
      {/* Coluna 1 - Info */}
      <div className="bg-white p-8 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          {customization.leftSideTitle}
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          {customization.leftSideSubtitle}
        </p>
      </div>

      {/* Coluna 2 - Login */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            {customization.logoUrl && (
              <img 
                src={customization.logoUrl} 
                alt="Logo" 
                className="h-16 mx-auto mb-6"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {customization.welcomeMessage}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="E-mail"
            />

            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Senha"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: customization.primaryColor }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>

      {/* Coluna 3 - Visual */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
        <div className="text-center text-white">
          <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <School className="h-16 w-16" />
          </div>
          <h3 className="text-2xl font-bold mb-4">{customization.schoolName}</h3>
          <p className="text-lg opacity-90">Educação de Qualidade</p>
        </div>
      </div>
    </div>
  );

  const renderCardLayout = () => (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-lg">
        <div className={`${getGlassClasses()} rounded-3xl overflow-hidden ${getShadowClasses()}`}>
          {/* Header do Card */}
          <div 
            className="p-8 text-center text-white"
            style={{ backgroundColor: customization.primaryColor }}
          >
            {customization.logoUrl && (
              <img 
                src={customization.logoUrl} 
                alt="Logo" 
                className="h-16 mx-auto mb-4"
              />
            )}
            <h1 className="text-2xl font-bold mb-2">
              {customization.welcomeMessage}
            </h1>
            <p className="opacity-90">
              {customization.loginSubtitle}
            </p>
          </div>

          {/* Formulário */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Digite seu e-mail"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Digite sua senha"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                style={{ backgroundColor: customization.primaryColor }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMinimalLayout = () => (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        {customization.logoUrl && (
          <img 
            src={customization.logoUrl} 
            alt="Logo" 
            className="h-16 mx-auto mb-4"
          />
        )}
        <h1 className="text-2xl font-bold text-gray-900">
          {customization.schoolName}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="E-mail"
        />

        <input
          type={showPassword ? 'text' : 'password'}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Senha"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: customization.primaryColor }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );

  const renderFullscreenLayout = () => (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
      <div className="w-full max-w-md mx-auto">
        <div className={`${getGlassClasses()} rounded-3xl p-8 ${getShadowClasses()}`}>
          <div className="text-center mb-8">
            {customization.logoUrl && (
              <img 
                src={customization.logoUrl} 
                alt="Logo" 
                className="h-20 mx-auto mb-6"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {customization.welcomeMessage}
            </h1>
            <p className="text-gray-600">
              {customization.loginSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Digite seu e-mail"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Digite sua senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
              style={{ backgroundColor: customization.primaryColor }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div 
        className={`${getLayoutClasses()} ${getFontClasses()} ${customization.highContrast ? 'contrast-125' : ''} ${customization.reducedMotion ? 'motion-reduce' : ''}`} 
        style={{
          background: customization.enableGradients && customization.layoutStyle !== 'minimal'
            ? `linear-gradient(135deg, ${customization.primaryColor}10, ${customization.secondaryColor}10)`
            : undefined,
          ...getBackgroundEffectStyles()
        }}
      >
        {/* Partículas de fundo */}
        {customization.enableParticles && (
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-pulse"></div>
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              ></div>
            ))}
          </div>
        )}

        {customization.layoutStyle === 'split' && renderSplitLayout()}
        {customization.layoutStyle === 'centered' && renderCenteredLayout()}
        {customization.layoutStyle === 'minimal' && renderMinimalLayout()}
        {customization.layoutStyle === 'fullscreen' && renderFullscreenLayout()}
        {customization.layoutStyle === 'sidebar' && renderSidebarLayout()}
        {customization.layoutStyle === 'floating' && renderFloatingLayout()}
        {customization.layoutStyle === 'magazine' && renderMagazineLayout()}
        {customization.layoutStyle === 'card' && renderCardLayout()}

        {/* Rodapé fixo */}
        {customization.showFooter && customization.layoutStyle === 'split' && (
          <div 
            className="fixed bottom-0 left-0 right-0 py-4 sm:py-6 px-4 sm:px-8 text-white text-xs sm:text-sm z-20 backdrop-blur-lg"
            style={{ backgroundColor: customization.primaryColor }}
          >
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-center sm:text-left">
                <span className="font-semibold">{customization.copyrightText}</span>
              </div>
              {(customization.showPrivacyLink || customization.showAccessibilityLink) && (
                <div className="flex items-center space-x-6">
                  {customization.showPrivacyLink && (
                    <a
                      href={customization.privacyPolicyUrl}
                      className={`hover:text-blue-200 transition-all duration-300 font-semibold ${customization.enableAnimations ? 'hover:scale-105' : ''}`}
                    >
                      {customization.privacyPolicyText}
                    </a>
                  )}
                  {customization.showPrivacyLink && customization.showAccessibilityLink && (
                    <span className="text-blue-200">|</span>
                  )}
                  {customization.showAccessibilityLink && (
                    <a
                      href={customization.accessibilityUrl}
                      className={`hover:text-blue-200 transition-all duration-300 font-semibold ${customization.enableAnimations ? 'hover:scale-105' : ''}`}
                    >
                      {customization.accessibilityText}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Indicador de responsividade */}
        {customization.showResponsiveIndicator && (
          <div className="fixed bottom-4 left-4 z-10 opacity-20 hover:opacity-100 transition-opacity">
            <div className="flex space-x-2">
              <div className="hidden lg:block p-2 bg-blue-600 rounded-full">
                <Monitor className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block lg:hidden p-2 bg-green-600 rounded-full">
                <Tablet className="h-4 w-4 text-white" />
              </div>
              <div className="block md:hidden p-2 bg-purple-600 rounded-full">
                <Smartphone className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />

      <HelpInstructionsModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </>
  );
}