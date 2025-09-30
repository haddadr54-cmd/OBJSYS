import { useState, useEffect, useRef } from 'react';
import { 
  Monitor, 
  Save, 
  RotateCcw, 
  Eye, 
  Palette, 
  Type, 
  Layout, 
  Image, 
  Settings, 
  Check, 
  AlertCircle, 
  ExternalLink,
  Upload,
  Grid,
  Square,
  Circle,
  Layers,
  Smartphone,
  Tablet,
  Camera,
  RefreshCw
} from 'lucide-react';
import { useGlobalConfig } from '../../contexts/globalConfig';

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
  
  // Configurações do Botão de Login
  loginButtonText: string;
  loginButtonColor: string;
  loginButtonHoverColor: string;
  loginButtonTextColor: string;
  loginButtonSize: 'small' | 'medium' | 'large';
  loginButtonStyle: 'solid' | 'outline' | 'gradient';
  loginButtonRounded: boolean;
  
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

const defaultConfig: LoginCustomization = {
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
  
  // Configurações do Botão de Login
  loginButtonText: 'Entrar no Sistema',
  loginButtonColor: '#002776',
  loginButtonHoverColor: '#001A5C',
  loginButtonTextColor: '#FFFFFF',
  loginButtonSize: 'medium',
  loginButtonStyle: 'solid',
  loginButtonRounded: true,
  
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
  
  // Logo Animada - DESABILITADA POR PADRÃO
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
  enableShadows: true,
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

export function PersonalizacaoLoginPage() {
  const { configs, saveConfig: saveGlobalConfig } = useGlobalConfig();
  const [config, setConfig] = useState<LoginCustomization>(defaultConfig);
  const [activeTab, setActiveTab] = useState<'layout' | 'branding' | 'textos' | 'cores' | 'funcionalidades' | 'efeitos' | 'acessibilidade'>('layout');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<'iframe' | 'newTab'>('iframe');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Carregar configurações do contexto global
    if (configs.login_customization) {
      console.log('📂 Carregando configurações do Supabase:', configs.login_customization);
      setConfig({ ...defaultConfig, ...configs.login_customization });
    } else {
      console.log('📂 Usando configurações padrão (Supabase não disponível ou sem dados)');
      setConfig(defaultConfig);
    }
  }, []);

  // Reagir a mudanças nas configurações globais
  useEffect(() => {
    if (configs.login_customization) {
      console.log('🔄 Atualizando configurações via GlobalConfig:', configs.login_customization);
      setConfig({ ...defaultConfig, ...configs.login_customization });
    }
  }, [configs.login_customization]);

  // Enviar configurações para o iframe sempre que mudarem
  useEffect(() => {
    sendConfigToPreview();
  }, [config]);

  const sendConfigToPreview = () => {
    // Enviar via postMessage para iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        console.log('📨 Enviando configuração de login via postMessage:', config);
        iframeRef.current.contentWindow.postMessage({
          type: 'LOGIN_CONFIG_UPDATE',
          config: config
        }, '*');
      } catch (error) {
        console.error('❌ Erro ao enviar via postMessage:', error);
      }
    }
    
    // Fallback: salvar no localStorage e disparar evento
    try {
      console.log('💾 Salvando configuração de login no localStorage:', config);
      localStorage.setItem('loginCustomization', JSON.stringify(config));
      window.dispatchEvent(new CustomEvent('loginConfigChanged', { detail: config }));
      console.log('📡 Evento loginConfigChanged disparado');
    } catch (error) {
      console.error('❌ Erro ao enviar via CustomEvent:', error);
    }
  };

  const forceUpdatePreview = () => {
    console.log('🔄 Forçando atualização do preview...');
    
    // Aguardar um pouco para garantir que o iframe esteja carregado
    setTimeout(() => {
      sendConfigToPreview();
    }, 500);
  };

  const saveConfig = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      // Validar configurações
      const newErrors: Record<string, string> = {};
      
      if (!config.schoolName.trim()) {
        newErrors.schoolName = 'Nome da escola é obrigatório';
      }
      
      if (!config.welcomeMessage.trim()) {
        newErrors.welcomeMessage = 'Mensagem de boas-vindas é obrigatória';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      // Salvar configurações usando o GlobalConfigContext
      await saveGlobalConfig('login_customization', config);
      
      console.log('✅ Configurações de login salvas no Supabase');
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      if (error instanceof Error && error.message.includes('Supabase')) {
        setErrors({ submit: 'Erro: Sistema requer conexão com Supabase para salvar configurações. Verifique sua conexão.' });
      } else {
        setErrors({ submit: 'Erro ao salvar configurações' });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetConfig = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão da tela de login?')) {
      setConfig(defaultConfig);
      // Salvar o padrão no Supabase para que todos vejam o reset
      saveGlobalConfig('login_customization', defaultConfig);
    }
  };

  const handleImageUpload = (field: 'logoUrl' | 'backgroundImageUrl' | 'animatedLogoUrl', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, [field]: 'Imagem deve ter no máximo 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setConfig({ ...config, [field]: result });
        setErrors({ ...errors, [field]: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const openPreviewInNewTab = () => {
    const newWindow = window.open('/?preview=login', '_blank');
    if (newWindow) {
      // Aguardar a janela carregar e enviar configurações
      setTimeout(() => {
        newWindow.postMessage({
          type: 'LOGIN_CONFIG_UPDATE',
          config: config
        }, '*');
      }, 1000);
    }
  };

  const tabs = [
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'branding', label: 'Branding', icon: Image },
    { id: 'textos', label: 'Textos', icon: Type },
    { id: 'cores', label: 'Cores', icon: Palette },
    { id: 'funcionalidades', label: 'Funcionalidades', icon: Settings },
    { id: 'efeitos', label: 'Efeitos Visuais', icon: Layers },
    { id: 'acessibilidade', label: 'Acessibilidade', icon: Eye }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Monitor className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎨 Personalizar Tela de Login
            </h1>
            <p className="text-gray-600 text-lg font-medium">Configure a aparência e funcionalidades</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={forceUpdatePreview}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar Preview</span>
          </button>
          <button
            onClick={resetConfig}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Restaurar</span>
          </button>
          <button
            onClick={saveConfig}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-700">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Configurações salvas com sucesso!</span>
          </div>
        </div>
      )}

      {/* Layout Principal */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Painel de Configurações */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {/* Aba Layout */}
              {activeTab === 'layout' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Estilo de Layout</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: 'split', label: 'Dividido', icon: Grid },
                      { value: 'centered', label: 'Centralizado', icon: Square },
                      { value: 'minimal', label: 'Minimalista', icon: Circle },
                      { value: 'fullscreen', label: 'Tela Cheia', icon: Monitor },
                      { value: 'sidebar', label: 'Lateral', icon: Layers },
                      { value: 'floating', label: 'Flutuante', icon: Circle },
                      { value: 'magazine', label: 'Revista', icon: Grid },
                      { value: 'card', label: 'Card', icon: Square }
                    ].map(layout => (
                      <button
                        key={layout.value}
                        onClick={() => setConfig({ ...config, layoutStyle: layout.value as any })}
                        className={`p-4 border rounded-lg text-center transition-colors ${
                          config.layoutStyle === layout.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <layout.icon className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">{layout.label}</span>
                      </button>
                    ))}
                  </div>

                  {config.layoutStyle === 'split' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Posição do Formulário
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'left', label: 'Esquerda' },
                          { value: 'center', label: 'Centro' },
                          { value: 'right', label: 'Direita' }
                        ].map(position => (
                          <button
                            key={position.value}
                            onClick={() => setConfig({ ...config, formPosition: position.value as any })}
                            className={`p-3 border rounded-lg text-center transition-colors ${
                              config.formPosition === position.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <span className="text-sm font-medium">{position.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Aba Branding */}
              {activeTab === 'branding' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Identidade Visual</h3>
                  
                  {/* Logo Principal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo Principal
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {config.logoUrl ? (
                          <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('logoUrl', e)}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">Escolher Logo</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG/JPG até 5MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Nome da Escola */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Escola
                    </label>
                    <input
                      type="text"
                      value={config.schoolName}
                      onChange={(e) => setConfig({ ...config, schoolName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome da instituição"
                    />
                  </div>

                  {/* Logo Animada - SEÇÃO DESTACADA */}
                  <div className="border-2 border-yellow-200 bg-yellow-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-yellow-900 flex items-center">
                        <Camera className="h-5 w-5 mr-2" />
                        🎭 Logo Animada (Canto Superior)
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-yellow-700 font-medium">
                          {config.showAnimatedLogo ? 'Ativada' : 'Desativada'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.showAnimatedLogo}
                            onChange={(e) => setConfig({ ...config, showAnimatedLogo: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg mb-4">
                      <p className="text-sm text-yellow-800">
                        <strong>💡 Esta é a logo que aparece no canto superior esquerdo da tela de login.</strong>
                        <br />
                        Desative esta opção para remover o quadrado com logo que está incomodando.
                      </p>
                    </div>

                    {config.showAnimatedLogo && (
                      <div className="space-y-4">
                        {/* Upload da Logo Animada */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imagem da Logo Animada
                          </label>
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {config.animatedLogoUrl ? (
                                <img src={config.animatedLogoUrl} alt="Logo Animada" className="w-full h-full object-cover" />
                              ) : (
                                <Camera className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload('animatedLogoUrl', e)}
                                className="hidden"
                                id="animated-logo-upload"
                              />
                              <label
                                htmlFor="animated-logo-upload"
                                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                              >
                                <Upload className="h-4 w-4" />
                                <span className="text-sm">Escolher Imagem</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Tamanho da Logo Animada */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tamanho
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { value: 'small', label: 'Pequeno' },
                              { value: 'medium', label: 'Médio' },
                              { value: 'large', label: 'Grande' }
                            ].map(size => (
                              <button
                                key={size.value}
                                onClick={() => setConfig({ ...config, animatedLogoSize: size.value as any })}
                                className={`p-3 border rounded-lg text-center transition-colors ${
                                  config.animatedLogoSize === size.value
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                <span className="text-sm font-medium">{size.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Posição da Logo Animada */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Posição
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { value: 'top', label: 'Superior' },
                              { value: 'center', label: 'Centro' },
                              { value: 'bottom', label: 'Inferior' }
                            ].map(position => (
                              <button
                                key={position.value}
                                onClick={() => setConfig({ ...config, animatedLogoPosition: position.value as any })}
                                className={`p-3 border rounded-lg text-center transition-colors ${
                                  config.animatedLogoPosition === position.value
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                <span className="text-sm font-medium">{position.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Imagem de Fundo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagem de Fundo (Lado Esquerdo)
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {config.backgroundImageUrl ? (
                          <img src={config.backgroundImageUrl} alt="Fundo" className="w-full h-full object-cover" />
                        ) : (
                          <Image className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('backgroundImageUrl', e)}
                          className="hidden"
                          id="background-upload"
                        />
                        <label
                          htmlFor="background-upload"
                          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">Escolher Imagem</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG/JPG até 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Textos */}
              {activeTab === 'textos' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Textos da Interface</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mensagem de Boas-vindas
                    </label>
                    <input
                      type="text"
                      value={config.welcomeMessage}
                      onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.welcomeMessage ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Mensagem principal"
                    />
                    {errors.welcomeMessage && (
                      <p className="text-red-600 text-xs mt-1">{errors.welcomeMessage}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título do Lado Esquerdo
                    </label>
                    <input
                      type="text"
                      value={config.leftSideTitle}
                      onChange={(e) => setConfig({ ...config, leftSideTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Título principal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtítulo do Lado Esquerdo
                    </label>
                    <textarea
                      value={config.leftSideSubtitle}
                      onChange={(e) => setConfig({ ...config, leftSideSubtitle: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descrição ou subtítulo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtítulo do Login
                    </label>
                    <input
                      type="text"
                      value={config.loginSubtitle}
                      onChange={(e) => setConfig({ ...config, loginSubtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Texto abaixo do título de login"
                    />
                  </div>

                  <hr className="border-gray-200" />

                  <h4 className="text-md font-semibold text-gray-900 mt-6">🔘 Personalização do Botão de Login</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Texto do Botão "Entrar"
                    </label>
                    <input
                      type="text"
                      value={config.loginButtonText}
                      onChange={(e) => setConfig({ ...config, loginButtonText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Entrar no Sistema, Acessar Portal, Login"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tamanho do Botão
                      </label>
                      <select
                        value={config.loginButtonSize}
                        onChange={(e) => setConfig({ ...config, loginButtonSize: e.target.value as 'small' | 'medium' | 'large' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="small">Pequeno</option>
                        <option value="medium">Médio</option>
                        <option value="large">Grande</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estilo do Botão
                      </label>
                      <select
                        value={config.loginButtonStyle}
                        onChange={(e) => setConfig({ ...config, loginButtonStyle: e.target.value as 'solid' | 'outline' | 'gradient' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="solid">Sólido</option>
                        <option value="outline">Contorno</option>
                        <option value="gradient">Gradiente</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor do Botão
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={config.loginButtonColor}
                          onChange={(e) => setConfig({ ...config, loginButtonColor: e.target.value })}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.loginButtonColor}
                          onChange={(e) => setConfig({ ...config, loginButtonColor: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="#002776"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor ao Passar o Mouse
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={config.loginButtonHoverColor}
                          onChange={(e) => setConfig({ ...config, loginButtonHoverColor: e.target.value })}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.loginButtonHoverColor}
                          onChange={(e) => setConfig({ ...config, loginButtonHoverColor: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="#001A5C"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor do Texto
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={config.loginButtonTextColor}
                          onChange={(e) => setConfig({ ...config, loginButtonTextColor: e.target.value })}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.loginButtonTextColor}
                          onChange={(e) => setConfig({ ...config, loginButtonTextColor: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="loginButtonRounded"
                      checked={config.loginButtonRounded}
                      onChange={(e) => setConfig({ ...config, loginButtonRounded: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="loginButtonRounded" className="ml-2 text-sm text-gray-700">
                      Botão com bordas arredondadas
                    </label>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">🎨 Preview do Botão</h5>
                    <button
                      type="button"
                      disabled
                      className={`
                        inline-flex items-center justify-center font-medium transition-all duration-200 cursor-default
                        ${config.loginButtonSize === 'small' ? 'px-4 py-2 text-sm' : ''}
                        ${config.loginButtonSize === 'medium' ? 'px-6 py-3 text-base' : ''}
                        ${config.loginButtonSize === 'large' ? 'px-8 py-4 text-lg' : ''}
                        ${config.loginButtonRounded ? 'rounded-lg' : 'rounded'}
                        ${config.loginButtonStyle === 'solid' ? '' : ''}
                        ${config.loginButtonStyle === 'outline' ? 'border-2' : ''}
                        ${config.loginButtonStyle === 'gradient' ? 'bg-gradient-to-r' : ''}
                      `}
                      style={{
                        backgroundColor: config.loginButtonStyle === 'solid' ? config.loginButtonColor : 'transparent',
                        backgroundImage: config.loginButtonStyle === 'gradient' ? `linear-gradient(to right, ${config.loginButtonColor}, ${config.loginButtonHoverColor})` : 'none',
                        color: config.loginButtonStyle === 'outline' ? config.loginButtonColor : config.loginButtonTextColor,
                        borderColor: config.loginButtonStyle === 'outline' ? config.loginButtonColor : 'transparent'
                      }}
                    >
                      {config.loginButtonText}
                    </button>
                  </div>
                </div>
              )}

              {/* Aba Cores */}
              {activeTab === 'cores' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Esquema de Cores</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor Primária
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={config.primaryColor}
                          onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.primaryColor}
                          onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor Secundária
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={config.secondaryColor}
                          onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.secondaryColor}
                          onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor de Destaque
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={config.accentColor}
                          onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.accentColor}
                          onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Funcionalidades */}
              {activeTab === 'funcionalidades' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Elementos da Interface</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Elementos Principais</h4>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.showLogo}
                          onChange={(e) => setConfig({ ...config, showLogo: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mostrar logo principal</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.showWelcomeText}
                          onChange={(e) => setConfig({ ...config, showWelcomeText: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mostrar texto de boas-vindas</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.showSubtitle}
                          onChange={(e) => setConfig({ ...config, showSubtitle: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mostrar subtítulo</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.showCredentialsHelper}
                          onChange={(e) => setConfig({ ...config, showCredentialsHelper: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mostrar credenciais de teste</span>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Links e Navegação</h4>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.showHelpLinks}
                          onChange={(e) => setConfig({ ...config, showHelpLinks: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mostrar links de ajuda</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.showSiteButton}
                          onChange={(e) => setConfig({ ...config, showSiteButton: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mostrar botão do site</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.showFooter}
                          onChange={(e) => setConfig({ ...config, showFooter: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mostrar rodapé</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Efeitos Visuais */}
              {activeTab === 'efeitos' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Efeitos e Animações</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Efeitos Visuais</h4>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.enableGlassEffect}
                          onChange={(e) => setConfig({ ...config, enableGlassEffect: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Efeito de vidro (glass)</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.enableGradients}
                          onChange={(e) => setConfig({ ...config, enableGradients: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Gradientes</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.enableShadows}
                          onChange={(e) => setConfig({ ...config, enableShadows: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Sombras</span>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Animações</h4>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.enableAnimations}
                          onChange={(e) => setConfig({ ...config, enableAnimations: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Habilitar animações</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.enableParticles}
                          onChange={(e) => setConfig({ ...config, enableParticles: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Partículas de fundo</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opacidade do Overlay ({config.overlayOpacity}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.overlayOpacity}
                      onChange={(e) => setConfig({ ...config, overlayOpacity: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Aba Acessibilidade */}
              {activeTab === 'acessibilidade' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Opções de Acessibilidade</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.highContrast}
                        onChange={(e) => setConfig({ ...config, highContrast: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Alto contraste</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.reducedMotion}
                        onChange={(e) => setConfig({ ...config, reducedMotion: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Movimento reduzido</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showResponsiveIndicator}
                        onChange={(e) => setConfig({ ...config, showResponsiveIndicator: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Indicador de responsividade</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.submit}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Preview em Tempo Real</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewMode('iframe')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  previewMode === 'iframe'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Monitor className="h-4 w-4 mr-2 inline" />
                Iframe
              </button>
              <button
                onClick={() => {
                  setPreviewMode('newTab');
                  openPreviewInNewTab();
                }}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  previewMode === 'newTab'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ExternalLink className="h-4 w-4 mr-2 inline" />
                Nova Aba
              </button>
            </div>
          </div>

          {previewMode === 'iframe' && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Preview da Tela de Login</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-gray-400" />
                  <Tablet className="h-4 w-4 text-gray-400" />
                  <Monitor className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <iframe
                ref={iframeRef}
                src="/?preview=login"
                className="w-full h-96 border-0"
                title="Preview da Tela de Login"
                onLoad={() => {
                  console.log('🔄 Iframe carregado, enviando configurações...');
                  setTimeout(() => {
                    sendConfigToPreview();
                  }, 100);
                }}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}