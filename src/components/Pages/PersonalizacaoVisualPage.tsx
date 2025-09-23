import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Save, 
  RotateCcw, 
  Eye, 
  Monitor, 
  Smartphone, 
  Tablet,
  Check, 
  AlertCircle, 
  Paintbrush,
  Zap,
  Star,
  Crown,
  Sparkles,
  Sun,
  Moon,
  Contrast,
  Type,
  Layout,
  Grid,
  Square,
  Circle,
  Triangle,
  Heart,
  Hexagon
} from 'lucide-react';
import { useGlobalConfig } from '../../utils/configManager';

interface VisualTheme {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
  animations: {
    duration: string;
    easing: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      base: string;
      large: string;
    };
  };
}

const predefinedThemes: VisualTheme[] = [
  {
    id: 'objetivo-classic',
    name: '🏫 Objetivo Clássico',
    description: 'Visual tradicional do Colégio Objetivo com azul institucional',
    preview: 'bg-gradient-to-br from-blue-600 to-blue-800',
    colors: {
      primary: '#002776',
      secondary: '#3B82F6',
      accent: '#60A5FA',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #002776 0%, #3B82F6 100%)',
      secondary: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      accent: 'linear-gradient(135deg, #60A5FA 0%, #93C5FD 100%)'
    },
    shadows: {
      small: '0 1px 3px rgba(0, 0, 0, 0.12)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
      large: '0 10px 25px rgba(0, 0, 0, 0.15)'
    },
    borderRadius: {
      small: '8px',
      medium: '12px',
      large: '16px'
    },
    animations: {
      duration: '300ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        small: '14px',
        base: '16px',
        large: '18px'
      }
    }
  },
  {
    id: 'modern-purple',
    name: '💜 Moderno Roxo',
    description: 'Design moderno com tons de roxo e gradientes vibrantes',
    preview: 'bg-gradient-to-br from-purple-600 to-pink-600',
    colors: {
      primary: '#7C3AED',
      secondary: '#A855F7',
      accent: '#C084FC',
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
      secondary: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
      accent: 'linear-gradient(135deg, #C084FC 0%, #DDD6FE 100%)'
    },
    shadows: {
      small: '0 2px 4px rgba(124, 58, 237, 0.1)',
      medium: '0 8px 16px rgba(124, 58, 237, 0.15)',
      large: '0 16px 32px rgba(124, 58, 237, 0.2)'
    },
    borderRadius: {
      small: '12px',
      medium: '16px',
      large: '24px'
    },
    animations: {
      duration: '400ms',
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        small: '14px',
        base: '16px',
        large: '18px'
      }
    }
  },
  {
    id: 'green-nature',
    name: '🌿 Verde Natureza',
    description: 'Tema inspirado na natureza com tons de verde e sustentabilidade',
    preview: 'bg-gradient-to-br from-green-600 to-emerald-600',
    colors: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#34D399',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      secondary: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      accent: 'linear-gradient(135deg, #34D399 0%, #6EE7B7 100%)'
    },
    shadows: {
      small: '0 2px 4px rgba(5, 150, 105, 0.1)',
      medium: '0 8px 16px rgba(5, 150, 105, 0.15)',
      large: '0 16px 32px rgba(5, 150, 105, 0.2)'
    },
    borderRadius: {
      small: '8px',
      medium: '12px',
      large: '16px'
    },
    animations: {
      duration: '350ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        small: '14px',
        base: '16px',
        large: '18px'
      }
    }
  },
  {
    id: 'orange-energy',
    name: '🔥 Laranja Energia',
    description: 'Visual energético com laranja e amarelo para motivar estudos',
    preview: 'bg-gradient-to-br from-orange-500 to-yellow-500',
    colors: {
      primary: '#EA580C',
      secondary: '#F97316',
      accent: '#FB923C',
      background: '#FFFBEB',
      surface: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
      secondary: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
      accent: 'linear-gradient(135deg, #FB923C 0%, #FCD34D 100%)'
    },
    shadows: {
      small: '0 2px 4px rgba(234, 88, 12, 0.1)',
      medium: '0 8px 16px rgba(234, 88, 12, 0.15)',
      large: '0 16px 32px rgba(234, 88, 12, 0.2)'
    },
    borderRadius: {
      small: '8px',
      medium: '12px',
      large: '16px'
    },
    animations: {
      duration: '300ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        small: '14px',
        base: '16px',
        large: '18px'
      }
    }
  },
  {
    id: 'dark-mode',
    name: '🌙 Modo Escuro',
    description: 'Tema escuro elegante para reduzir cansaço visual',
    preview: 'bg-gradient-to-br from-gray-800 to-gray-900',
    colors: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      accent: '#93C5FD',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#D1D5DB'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      secondary: 'linear-gradient(135deg, #60A5FA 0%, #93C5FD 100%)',
      accent: 'linear-gradient(135deg, #93C5FD 0%, #DBEAFE 100%)'
    },
    shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.3)',
      medium: '0 8px 16px rgba(0, 0, 0, 0.4)',
      large: '0 16px 32px rgba(0, 0, 0, 0.5)'
    },
    borderRadius: {
      small: '8px',
      medium: '12px',
      large: '16px'
    },
    animations: {
      duration: '300ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        small: '14px',
        base: '16px',
        large: '18px'
      }
    }
  },
  {
    id: 'minimalist',
    name: '⚪ Minimalista',
    description: 'Design limpo e minimalista com foco na funcionalidade',
    preview: 'bg-gradient-to-br from-gray-100 to-gray-200',
    colors: {
      primary: '#374151',
      secondary: '#6B7280',
      accent: '#9CA3AF',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827',
      textSecondary: '#6B7280'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #374151 0%, #6B7280 100%)',
      secondary: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
      accent: 'linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)'
    },
    shadows: {
      small: '0 1px 2px rgba(0, 0, 0, 0.05)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.07)',
      large: '0 10px 15px rgba(0, 0, 0, 0.1)'
    },
    borderRadius: {
      small: '4px',
      medium: '6px',
      large: '8px'
    },
    animations: {
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    typography: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: {
        small: '13px',
        base: '15px',
        large: '17px'
      }
    }
  }
];

export function PersonalizacaoVisualPage() {
  const { configs, saveConfig: saveGlobalConfig, loading: globalLoading } = useGlobalConfig();
  const [selectedTheme, setSelectedTheme] = useState<string>('objetivo-classic');
  const [customTheme, setCustomTheme] = useState<VisualTheme | null>(null);
  const [activeTab, setActiveTab] = useState<'temas' | 'personalizado' | 'preview'>('temas');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Carregar tema atual das configurações globais
    if (configs.visual_theme) {
      const savedTheme = configs.visual_theme;
      if (savedTheme.id) {
        setSelectedTheme(savedTheme.id);
        if (!predefinedThemes.find(t => t.id === savedTheme.id)) {
          setCustomTheme(savedTheme);
        }
      }
    }
  }, [configs.visual_theme]);

  const applyTheme = async (theme: VisualTheme) => {
    setLoading(true);
    setErrors({});
    
    try {
      // Aplicar CSS customizado ao documento
      const styleId = 'custom-theme-styles';
      let styleElement = document.getElementById(styleId);
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      const css = `
        :root {
          --theme-primary: ${theme.colors.primary};
          --theme-secondary: ${theme.colors.secondary};
          --theme-accent: ${theme.colors.accent};
          --theme-background: ${theme.colors.background};
          --theme-surface: ${theme.colors.surface};
          --theme-text: ${theme.colors.text};
          --theme-text-secondary: ${theme.colors.textSecondary};
          
          --theme-gradient-primary: ${theme.gradients.primary};
          --theme-gradient-secondary: ${theme.gradients.secondary};
          --theme-gradient-accent: ${theme.gradients.accent};
          
          --theme-shadow-small: ${theme.shadows.small};
          --theme-shadow-medium: ${theme.shadows.medium};
          --theme-shadow-large: ${theme.shadows.large};
          
          --theme-radius-small: ${theme.borderRadius.small};
          --theme-radius-medium: ${theme.borderRadius.medium};
          --theme-radius-large: ${theme.borderRadius.large};
          
          --theme-animation-duration: ${theme.animations.duration};
          --theme-animation-easing: ${theme.animations.easing};
          
          --theme-font-family: ${theme.typography.fontFamily};
          --theme-font-size-small: ${theme.typography.fontSize.small};
          --theme-font-size-base: ${theme.typography.fontSize.base};
          --theme-font-size-large: ${theme.typography.fontSize.large};
        }
        
        /* Aplicar tema globalmente */
        body {
          background: var(--theme-background) !important;
          color: var(--theme-text) !important;
          font-family: var(--theme-font-family) !important;
          font-size: var(--theme-font-size-base) !important;
        }
        
        /* Botões primários */
        .btn-primary,
        .bg-blue-600,
        .bg-blue-500 {
          background: var(--theme-gradient-primary) !important;
          border-color: var(--theme-primary) !important;
        }
        
        /* Botões secundários */
        .btn-secondary,
        .bg-gray-600 {
          background: var(--theme-gradient-secondary) !important;
        }
        
        /* Cards e superfícies */
        .bg-white,
        .card-modern,
        .glass-card {
          background: var(--theme-surface) !important;
          box-shadow: var(--theme-shadow-medium) !important;
          border-radius: var(--theme-radius-medium) !important;
        }
        
        /* Sidebar */
        .sidebar-container,
        div[class*="sidebar"] {
          background: var(--theme-gradient-primary) !important;
        }
        
        /* Textos */
        .text-gray-900,
        .text-gray-800 {
          color: var(--theme-text) !important;
        }
        
        .text-gray-600,
        .text-gray-500 {
          color: var(--theme-text-secondary) !important;
        }
        
        /* Bordas arredondadas */
        .rounded-lg {
          border-radius: var(--theme-radius-medium) !important;
        }
        
        .rounded-xl {
          border-radius: var(--theme-radius-large) !important;
        }
        
        /* Animações */
        * {
          transition-duration: var(--theme-animation-duration) !important;
          transition-timing-function: var(--theme-animation-easing) !important;
        }
        
        /* Gradientes de texto */
        .text-gradient-objetivo,
        .bg-gradient-to-r.from-blue-600.to-purple-600.bg-clip-text.text-transparent {
          background: var(--theme-gradient-primary) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
        }
        
        /* Sombras especiais */
        .shadow-modern,
        .shadow-xl {
          box-shadow: var(--theme-shadow-large) !important;
        }
        
        /* Estados hover */
        .hover\\:bg-blue-50:hover {
          background-color: ${theme.colors.primary}10 !important;
        }
        
        .hover\\:text-blue-600:hover {
          color: var(--theme-primary) !important;
        }
        
        /* Badges e indicadores */
        .bg-blue-100 {
          background-color: ${theme.colors.primary}20 !important;
        }
        
        .text-blue-800 {
          color: var(--theme-primary) !important;
        }
        
        /* Inputs e formulários */
        .focus\\:ring-blue-500:focus {
          --tw-ring-color: ${theme.colors.primary}50 !important;
        }
        
        .focus\\:border-blue-500:focus {
          border-color: var(--theme-primary) !important;
        }
      `;
      
      styleElement.textContent = css;
      
      // Salvar tema nas configurações globais
      await saveGlobalConfig('visual_theme', theme);
      
      setSelectedTheme(theme.id);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      console.log('✅ Tema aplicado com sucesso:', theme.name);
    } catch (error) {
      console.error('Erro ao aplicar tema:', error);
      if (error instanceof Error && error.message.includes('Supabase')) {
        setErrors({ submit: 'Erro: Sistema requer conexão com Supabase para salvar tema. Verifique sua conexão.' });
      } else {
        setErrors({ submit: 'Erro ao aplicar tema' });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetTheme = async () => {
    if (confirm('Tem certeza que deseja restaurar o tema padrão do Objetivo?')) {
      const defaultTheme = predefinedThemes[0]; // Objetivo Clássico
      await applyTheme(defaultTheme);
    }
  };

  const createCustomTheme = () => {
    const baseTheme = predefinedThemes.find(t => t.id === selectedTheme) || predefinedThemes[0];
    setCustomTheme({
      ...baseTheme,
      id: 'custom',
      name: 'Tema Personalizado',
      description: 'Tema criado por você'
    });
    setActiveTab('personalizado');
  };

  const saveCustomTheme = async () => {
    if (!customTheme) return;
    
    await applyTheme(customTheme);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg">
            <Palette className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              🎨 Personalização Visual
            </h1>
            <p className="text-gray-600 text-lg font-medium">Defina o visual padrão do sistema</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={resetTheme}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Tema Padrão</span>
          </button>
          <button
            onClick={createCustomTheme}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Paintbrush className="h-4 w-4" />
            <span>Personalizar</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-700">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Tema aplicado com sucesso!</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'temas', label: 'Temas Predefinidos', icon: Star },
              { id: 'personalizado', label: 'Tema Personalizado', icon: Paintbrush },
              { id: 'preview', label: 'Preview', icon: Eye }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-600'
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
          {/* Aba Temas Predefinidos */}
          {activeTab === 'temas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">🎨 Escolha um Tema</h3>
                <div className="text-sm text-gray-500">
                  Tema atual: <span className="font-medium">{predefinedThemes.find(t => t.id === selectedTheme)?.name}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {predefinedThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl ${
                      selectedTheme === theme.id
                        ? 'border-pink-500 shadow-xl ring-4 ring-pink-200'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                    onClick={() => applyTheme(theme)}
                  >
                    {/* Preview do tema */}
                    <div className={`h-24 ${theme.preview} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                      <div className="absolute top-2 left-2 flex space-x-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.primary }}></div>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.secondary }}></div>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.accent }}></div>
                      </div>
                      {selectedTheme === theme.id && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Informações do tema */}
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                        {theme.name}
                        {theme.id === 'objetivo-classic' && (
                          <Crown className="h-4 w-4 ml-2 text-yellow-500" />
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">{theme.description}</p>
                      
                      {/* Paleta de cores */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-xs font-medium text-gray-500">Cores:</span>
                        <div className="flex space-x-1">
                          <div 
                            className="w-4 h-4 rounded border border-gray-300" 
                            style={{ backgroundColor: theme.colors.primary }}
                            title="Primária"
                          ></div>
                          <div 
                            className="w-4 h-4 rounded border border-gray-300" 
                            style={{ backgroundColor: theme.colors.secondary }}
                            title="Secundária"
                          ></div>
                          <div 
                            className="w-4 h-4 rounded border border-gray-300" 
                            style={{ backgroundColor: theme.colors.accent }}
                            title="Destaque"
                          ></div>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          applyTheme(theme);
                        }}
                        disabled={loading}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          selectedTheme === theme.id
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {loading ? 'Aplicando...' : selectedTheme === theme.id ? '✅ Tema Ativo' : 'Aplicar Tema'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aba Tema Personalizado */}
          {activeTab === 'personalizado' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">🛠️ Criar Tema Personalizado</h3>
              
              {!customTheme ? (
                <div className="text-center py-12">
                  <Paintbrush className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Crie seu Tema Único</h4>
                  <p className="text-gray-600 mb-6">
                    Personalize cores, tipografia e efeitos visuais
                  </p>
                  <button
                    onClick={createCustomTheme}
                    className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Começar Personalização</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Nome e Descrição */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Tema
                      </label>
                      <input
                        type="text"
                        value={customTheme.name}
                        onChange={(e) => setCustomTheme({ ...customTheme, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Meu Tema Personalizado"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <input
                        type="text"
                        value={customTheme.description}
                        onChange={(e) => setCustomTheme({ ...customTheme, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Descrição do seu tema"
                      />
                    </div>
                  </div>

                  {/* Cores */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">🎨 Paleta de Cores</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(customTheme.colors).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                            {key === 'textSecondary' ? 'Texto Secundário' : key}
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => setCustomTheme({
                                ...customTheme,
                                colors: { ...customTheme.colors, [key]: e.target.value }
                              })}
                              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => setCustomTheme({
                                ...customTheme,
                                colors: { ...customTheme.colors, [key]: e.target.value }
                              })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bordas e Sombras */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">📐 Bordas Arredondadas</h4>
                      <div className="space-y-3">
                        {Object.entries(customTheme.borderRadius).map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                              {key}
                            </label>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => setCustomTheme({
                                ...customTheme,
                                borderRadius: { ...customTheme.borderRadius, [key]: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="8px"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">🌟 Animações</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duração
                          </label>
                          <select
                            value={customTheme.animations.duration}
                            onChange={(e) => setCustomTheme({
                              ...customTheme,
                              animations: { ...customTheme.animations, duration: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="150ms">Muito Rápida (150ms)</option>
                            <option value="300ms">Rápida (300ms)</option>
                            <option value="500ms">Normal (500ms)</option>
                            <option value="700ms">Lenta (700ms)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estilo de Transição
                          </label>
                          <select
                            value={customTheme.animations.easing}
                            onChange={(e) => setCustomTheme({
                              ...customTheme,
                              animations: { ...customTheme.animations, easing: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="cubic-bezier(0.4, 0, 0.2, 1)">Linear</option>
                            <option value="cubic-bezier(0.175, 0.885, 0.32, 1.275)">Bounce</option>
                            <option value="cubic-bezier(0.68, -0.55, 0.265, 1.55)">Elastic</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={saveCustomTheme}
                      disabled={loading}
                      className="flex items-center space-x-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-lg"
                    >
                      <Save className="h-5 w-5" />
                      <span>{loading ? 'Aplicando...' : 'Aplicar Tema Personalizado'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Aba Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">👁️ Preview do Tema Atual</h3>
              
              {/* Componentes de exemplo */}
              <div className="space-y-6">
                {/* Botões */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Botões</h4>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Botão Primário
                    </button>
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      Botão Secundário
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Botão Outline
                    </button>
                  </div>
                </div>

                {/* Cards */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Cards</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-2">Card Exemplo</h5>
                      <p className="text-gray-600 text-sm">Este é um exemplo de como os cards aparecerão com o tema atual.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                          A
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">Aluno Exemplo</h5>
                          <p className="text-sm text-gray-500">5º Ano A</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Média:</span>
                        <span className="font-bold text-green-600">8.5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulários */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Formulários</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Campo de Texto
                      </label>
                      <input
                        type="text"
                        placeholder="Digite algo..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Seleção
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Opção 1</option>
                        <option>Opção 2</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Badges e Indicadores */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Badges e Indicadores</h4>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      Ativo
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Aprovado
                    </span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                      Pendente
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                      Reprovado
                    </span>
                  </div>
                </div>
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

      {/* Informações sobre Temas */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">💡 Como Funcionam os Temas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">🎯 O que os Temas Alteram:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Cores:</strong> Primária, secundária e de destaque</li>
              <li>• <strong>Gradientes:</strong> Fundos e efeitos visuais</li>
              <li>• <strong>Sombras:</strong> Profundidade e elevação</li>
              <li>• <strong>Bordas:</strong> Arredondamento dos elementos</li>
              <li>• <strong>Animações:</strong> Velocidade e estilo</li>
              <li>• <strong>Tipografia:</strong> Fontes e tamanhos</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">✨ Aplicação Automática:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Instantânea:</strong> Mudanças aplicadas imediatamente</li>
              <li>• <strong>Global:</strong> Afeta todo o sistema</li>
              <li>• <strong>Persistente:</strong> Salvo no Supabase</li>
              <li>• <strong>Responsivo:</strong> Funciona em todos os dispositivos</li>
              <li>• <strong>Compatível:</strong> Mantém funcionalidades</li>
              <li>• <strong>Reversível:</strong> Pode voltar ao padrão</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}