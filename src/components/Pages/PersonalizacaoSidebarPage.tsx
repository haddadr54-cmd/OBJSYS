import { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Save, 
  RotateCcw, 
  Eye, 
  Palette, 
  Layout, 
  Settings, 
  Check, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Grid,
  Square,
  Circle,
  Layers,
  Zap,
  User,
  Sliders,
  Minimize
} from 'lucide-react';
import { useGlobalConfig } from '../../contexts/globalConfig/useGlobalConfig';

interface SidebarCustomization {
  // Layout e Estilo
  layout: 'default' | 'compact' | 'icon-only' | 'tabs' | 'cards' | 'minimal' | 'modern';
  width: string;
  position: 'left' | 'right';
  
  // Cores
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  
  // Funcionalidades
  showSearch: boolean;
  showUserInfo: boolean;
  showFavorites: boolean;
  showBadges: boolean;
  showDescriptions: boolean;
  showQuickActions: boolean;
  
  // Efeitos Visuais
  enableAnimations: boolean;
  enableHoverEffects: boolean;
  enableShadows: boolean;
  enableBlur: boolean;
  shadowIntensity: 'none' | 'light' | 'medium' | 'strong' | 'dramatic';
  animationSpeed: string;
  borderRadius: string;
  
  // Personalização Avançada
  customCSS: string;
  
  // Configurações por Tipo de Usuário
  adminConfig: any;
  professorConfig: any;
  paiConfig: any;
}

const defaultConfig: SidebarCustomization = {
  // Layout e Estilo
  layout: 'modern',
  width: '320px',
  position: 'left',
  
  // Cores
  primaryColor: '#1e40af',
  secondaryColor: '#3b82f6',
  accentColor: '#60a5fa',
  backgroundColor: '#ffffff',
  textColor: '#374151',
  
  // Funcionalidades
  showSearch: false,
  showUserInfo: false,
  showFavorites: false,
  showBadges: true,
  showDescriptions: true,
  showQuickActions: true,
  
  // Efeitos Visuais
  enableAnimations: true,
  enableHoverEffects: true,
  enableShadows: true,
  enableBlur: false,
  shadowIntensity: 'medium',
  animationSpeed: '300ms',
  borderRadius: '12px',
  
  // Personalização Avançada
  customCSS: '',
  
  // Configurações por Tipo de Usuário
  adminConfig: {},
  professorConfig: {},
  paiConfig: {}
};

export function PersonalizacaoSidebarPage() {
  const { configs, saveConfig: saveGlobalConfig } = useGlobalConfig();
  const [config, setConfig] = useState<SidebarCustomization>(defaultConfig);
  const [activeTab, setActiveTab] = useState<'layout' | 'cores' | 'funcionalidades' | 'efeitos' | 'avancado'>('layout');
  const [previewUserType, setPreviewUserType] = useState<'admin' | 'professor' | 'pai'>('admin');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<'iframe' | 'newTab'>('iframe');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Carregar configurações do contexto global
    if (configs.sidebar_customization) {
      console.log('📂 Carregando configurações do Supabase:', configs.sidebar_customization);
      setConfig({ ...defaultConfig, ...configs.sidebar_customization });
    } else {
      console.log('📂 Usando configurações padrão (Supabase não disponível ou sem dados)');
      setConfig(defaultConfig);
    }
  }, []);

  // Reagir a mudanças nas configurações globais
  useEffect(() => {
    if (configs.sidebar_customization) {
      console.log('🔄 Atualizando configurações via GlobalConfig:', configs.sidebar_customization);
      setConfig({ ...defaultConfig, ...configs.sidebar_customization });
    }
  }, [configs.sidebar_customization]);

  // Enviar configurações para o preview sempre que mudarem
  useEffect(() => {
    sendConfigToPreview();
  }, [config, previewUserType]);

  // (legacy) loadConfig removido - configuração já é carregada do contexto e localStorage em useGlobalConfig

  const sendConfigToPreview = () => {
    // Salvar configurações no localStorage
    try {
      console.log('💾 Salvando configurações do sidebar:', config);
      localStorage.setItem('sidebarCustomization', JSON.stringify(config));
      localStorage.setItem('sidebarLayout', config.layout);
      
      // Disparar eventos para atualizar o preview
      window.dispatchEvent(new CustomEvent('sidebarConfigChanged', { detail: config }));
      window.dispatchEvent(new CustomEvent('sidebarLayoutChanged', { detail: config.layout }));
      
      console.log('📡 Eventos disparados para atualizar sidebar');
    } catch (error) {
      console.error('❌ Erro ao enviar configuração do sidebar:', error);
    }
    
    // Enviar via postMessage para iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        console.log('📨 Enviando configuração via postMessage:', { config, userType: previewUserType });
        iframeRef.current.contentWindow.postMessage({
          type: 'SIDEBAR_CONFIG_UPDATE',
          config: config,
          userType: previewUserType
        }, '*');
        console.log('📨 Configuração enviada via postMessage para iframe');
      } catch (error) {
        console.error('❌ Erro ao enviar via postMessage:', error);
      }
    }
  };

  const forceUpdatePreview = () => {
    console.log('🔄 Forçando atualização do preview do sidebar...');
    
    // Primeiro, salvar as configurações
    sendConfigToPreview();
    
    // Depois, recarregar iframe
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }
    
    // Aguardar um pouco e enviar configurações
    setTimeout(() => {
      sendConfigToPreview();
    }, 1000);
  };

  const saveConfig = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      // Validar configurações
      const newErrors: Record<string, string> = {};
      
      if (!config.primaryColor) {
        newErrors.primaryColor = 'Cor primária é obrigatória';
      }
      
      if (!config.width || !config.width.match(/^\d+(px|rem|em|%)$/)) {
        newErrors.width = 'Largura deve ter uma unidade válida (px, rem, em, %)';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      // Salvar configurações usando o GlobalConfigContext
      await saveGlobalConfig('sidebar_customization', config);
      
      console.log('✅ Configurações do sidebar salvas no Supabase');
      
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
    if (confirm('Tem certeza que deseja restaurar as configurações padrão do menu lateral?')) {
      setConfig(defaultConfig);
      // Salvar o padrão no Supabase para que todos vejam o reset
      saveGlobalConfig('sidebar_customization', defaultConfig);
    }
  };

  const openPreviewInNewTab = () => {
    const newWindow = window.open(`/?preview=sidebar&userType=${previewUserType}`, '_blank');
    if (newWindow) {
      // Aguardar a janela carregar e enviar configurações
      setTimeout(() => {
        newWindow.postMessage({
          type: 'SIDEBAR_CONFIG_UPDATE',
          config: config,
          userType: previewUserType
        }, '*');
      }, 1000);
    }
  };

  const tabs = [
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'cores', label: 'Cores', icon: Palette },
    { id: 'funcionalidades', label: 'Funcionalidades', icon: Settings },
    { id: 'efeitos', label: 'Efeitos Visuais', icon: Zap },
    { id: 'avancado', label: 'Avançado', icon: Sliders }
  ];

  const layoutOptions = [
    { 
      value: 'default', 
      label: 'Padrão Objetivo', 
      description: 'Layout tradicional com gradiente azul',
      icon: Grid 
    },
    { 
      value: 'compact', 
      label: 'Compacto', 
      description: 'Versão reduzida para economizar espaço',
      icon: Minimize 
    },
    { 
      value: 'icon-only', 
      label: 'Apenas Ícones', 
      description: 'Menu ultra-compacto com tooltips',
      icon: Circle 
    },
    { 
      value: 'tabs', 
      label: 'Em Abas', 
      description: 'Organização por categorias',
      icon: Layers 
    },
    { 
      value: 'cards', 
      label: 'Cards Modernos', 
      description: 'Cada item como um card individual',
      icon: Square 
    },
    { 
      value: 'minimal', 
      label: 'Minimalista', 
      description: 'Design limpo e simples',
      icon: Minimize 
    },
    { 
      value: 'modern', 
      label: 'Ultra Moderno', 
      description: 'Layout futurista com efeitos avançados',
      icon: Zap 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <Menu className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎨 Personalizar Menu Lateral
            </h1>
            <p className="text-gray-600 text-lg font-medium">Configure aparência e funcionalidades do sidebar</p>
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
            <span className="text-sm font-medium">Configurações do menu lateral salvas com sucesso!</span>
          </div>
        </div>
      )}

      {/* Layout Principal */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Painel de Configurações */}
        <div className="space-y-6">
          {/* Seletor de Tipo de Usuário para Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-medium text-blue-800 mb-3 flex items-center">
              <User className="h-5 w-5 mr-2" />
              👤 Tipo de Usuário para Preview
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'admin', label: '👑 Admin', color: 'purple' },
                { value: 'professor', label: '👨‍🏫 Professor', color: 'green' },
                { value: 'pai', label: '👨‍👩‍👧‍👦 Pai', color: 'blue' }
              ].map(userType => (
                <button
                  key={userType.value}
                  onClick={() => setPreviewUserType(userType.value as any)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    previewUserType === userType.value
                      ? `border-${userType.color}-500 bg-${userType.color}-50 text-${userType.color}-700`
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="text-sm font-medium">{userType.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-blue-700 mt-2">
              💡 Cada tipo de usuário vê menus diferentes. Teste todos os tipos!
            </p>
          </div>

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
                          ? 'border-purple-500 text-purple-600'
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {layoutOptions.map(layout => {
                      const Icon = layout.icon;
                      return (
                        <button
                          key={layout.value}
                          onClick={() => setConfig({ ...config, layout: layout.value as any })}
                          className={`p-4 border rounded-xl text-left transition-all duration-300 hover:scale-105 ${
                            config.layout === layout.value
                              ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-lg'
                              : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`p-2 rounded-lg ${
                              config.layout === layout.value ? 'bg-purple-100' : 'bg-gray-100'
                            }`}>
                              <Icon className={`h-5 w-5 ${
                                config.layout === layout.value ? 'text-purple-600' : 'text-gray-600'
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-semibold">{layout.label}</h4>
                              <p className="text-xs text-gray-500">{layout.description}</p>
                            </div>
                          </div>
                          {config.layout === layout.value && (
                            <div className="flex items-center justify-end">
                              <Check className="h-4 w-4 text-purple-600" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Configurações de Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Largura do Menu
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={config.width}
                          onChange={(e) => setConfig({ ...config, width: e.target.value })}
                          className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.width ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="320px"
                        />
                        <div className="flex space-x-1">
                          {['280px', '320px', '360px', '400px'].map(width => (
                            <button
                              key={width}
                              onClick={() => setConfig({ ...config, width })}
                              className={`px-2 py-1 text-xs rounded ${
                                config.width === width
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {width}
                            </button>
                          ))}
                        </div>
                      </div>
                      {errors.width && (
                        <p className="text-red-600 text-xs mt-1">{errors.width}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posição
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'left', label: 'Esquerda' },
                          { value: 'right', label: 'Direita' }
                        ].map(position => (
                          <button
                            key={position.value}
                            onClick={() => setConfig({ ...config, position: position.value as any })}
                            className={`p-3 border rounded-lg text-center transition-colors ${
                              config.position === position.value
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <span className="text-sm font-medium">{position.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Cores */}
              {activeTab === 'cores' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Esquema de Cores</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor do Texto
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={config.textColor}
                          onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.textColor}
                          onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Paleta de Cores Predefinidas */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Paletas Predefinidas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { name: 'Objetivo', primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa' },
                        { name: 'Roxo', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
                        { name: 'Verde', primary: '#059669', secondary: '#10b981', accent: '#34d399' },
                        { name: 'Laranja', primary: '#ea580c', secondary: '#f97316', accent: '#fb923c' }
                      ].map(palette => (
                        <button
                          key={palette.name}
                          onClick={() => setConfig({
                            ...config,
                            primaryColor: palette.primary,
                            secondaryColor: palette.secondary,
                            accentColor: palette.accent
                          })}
                          className="p-3 border rounded-lg text-center hover:shadow-md transition-all"
                        >
                          <div className="flex space-x-1 mb-2 justify-center">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: palette.primary }}></div>
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: palette.secondary }}></div>
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: palette.accent }}></div>
                          </div>
                          <span className="text-xs font-medium">{palette.name}</span>
                        </button>
                      ))}
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
                          checked={config.showSearch}
                          onChange={(e) => setConfig({ ...config, showSearch: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mostrar campo de busca</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.showUserInfo}
                          onChange={(e) => setConfig({ ...config, showUserInfo: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mostrar informações do usuário</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.showFavorites}
                          onChange={(e) => setConfig({ ...config, showFavorites: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mostrar seção de favoritos</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.showQuickActions}
                          onChange={(e) => setConfig({ ...config, showQuickActions: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mostrar ações rápidas</span>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Indicadores Visuais</h4>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.showBadges}
                          onChange={(e) => setConfig({ ...config, showBadges: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mostrar badges e notificações</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.showDescriptions}
                          onChange={(e) => setConfig({ ...config, showDescriptions: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mostrar descrições dos itens</span>
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
                          checked={config.enableAnimations}
                          onChange={(e) => setConfig({ ...config, enableAnimations: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Habilitar animações</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.enableHoverEffects}
                          onChange={(e) => setConfig({ ...config, enableHoverEffects: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Efeitos de hover</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.enableShadows}
                          onChange={(e) => setConfig({ ...config, enableShadows: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Sombras</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.enableBlur}
                          onChange={(e) => setConfig({ ...config, enableBlur: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Efeito de desfoque (blur)</span>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Configurações Avançadas</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Intensidade da Sombra
                        </label>
                        <select
                          value={config.shadowIntensity}
                          onChange={(e) => setConfig({ ...config, shadowIntensity: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="none">Sem sombra</option>
                          <option value="light">Leve</option>
                          <option value="medium">Média</option>
                          <option value="strong">Forte</option>
                          <option value="dramatic">Dramática</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Velocidade das Animações
                        </label>
                        <select
                          value={config.animationSpeed}
                          onChange={(e) => setConfig({ ...config, animationSpeed: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="150ms">Muito Rápida</option>
                          <option value="300ms">Rápida</option>
                          <option value="500ms">Normal</option>
                          <option value="700ms">Lenta</option>
                          <option value="1000ms">Muito Lenta</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Raio das Bordas
                        </label>
                        <select
                          value={config.borderRadius}
                          onChange={(e) => setConfig({ ...config, borderRadius: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="4px">Quadrado</option>
                          <option value="8px">Levemente Arredondado</option>
                          <option value="12px">Arredondado</option>
                          <option value="16px">Muito Arredondado</option>
                          <option value="24px">Extremamente Arredondado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Avançado */}
              {activeTab === 'avancado' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Configurações Avançadas</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CSS Personalizado
                    </label>
                    <textarea
                      value={config.customCSS}
                      onChange={(e) => setConfig({ ...config, customCSS: e.target.value })}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                      placeholder="/* CSS personalizado para o sidebar */
.sidebar-container {
  /* Seus estilos aqui */
}

.sidebar-header {
  /* Personalizar header */
}"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Use CSS personalizado para ajustes finos. Seja cuidadoso para não quebrar o layout.
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ Dicas de CSS Personalizado:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Use seletores específicos como `.sidebar-container`</li>
                      <li>• Teste sempre no preview antes de salvar</li>
                      <li>• Use `!important` apenas quando necessário</li>
                      <li>• Mantenha backup das configurações funcionais</li>
                    </ul>
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
                    ? 'bg-purple-100 text-purple-700'
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
                    ? 'bg-purple-100 text-purple-700'
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
                  <span className="text-sm text-gray-600 font-medium">Preview do Menu Lateral</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Usuário: {previewUserType}</span>
                  <Smartphone className="h-4 w-4 text-gray-400" />
                  <Tablet className="h-4 w-4 text-gray-400" />
                  <Monitor className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <iframe
                ref={iframeRef}
                src={`/?preview=sidebar&userType=${previewUserType}`}
                className="w-full h-96 border-0"
                title="Preview do Menu Lateral"
                onLoad={() => {
                  console.log('🔄 Iframe do sidebar carregado, enviando configurações...');
                  setTimeout(() => {
                    sendConfigToPreview();
                  }, 100);
                }}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          )}

          {/* Informações do Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              💡 Como usar o Preview
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Mudanças em tempo real:</strong> Alterações aparecem instantaneamente</li>
              <li>• <strong>Teste diferentes usuários:</strong> Mude o tipo de usuário acima</li>
              <li>• <strong>Layouts diferentes:</strong> Experimente todos os layouts disponíveis</li>
              <li>• <strong>Nova aba:</strong> Abra em nova aba para teste completo</li>
              <li>• <strong>Atualizar:</strong> Use o botão "Atualizar Preview" se necessário</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}