import React from 'react';
import { 
  Home, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  Bell, 
  User, 
  ClipboardList,
  AlertTriangle, 
  FileText, 
  Settings, 
  School, 
  BarChart3, 
  Database, 
  Shield, 
  Palette, 
  Menu, 
  Monitor, 
  HelpCircle, 
  MessageCircle 
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { CompactSidebar } from './SidebarLayouts/CompactSidebar';
import { IconOnlySidebar } from './SidebarLayouts/IconOnlySidebar';
import { TabsSidebar } from './SidebarLayouts/TabsSidebar';
import { CardsSidebar } from './SidebarLayouts/CardsSidebar';
import { MinimalSidebar } from './SidebarLayouts/MinimalSidebar';
import { ModernSidebar } from './SidebarLayouts/ModernSidebar';
import { useAuth } from '../../contexts/auth';
import { useGlobalConfig } from '../../contexts/globalConfig';

// Configuração padrão completa do sidebar
const defaultSidebarConfig = {
  // Layout e Estilo
  layout: 'default',
  width: '320px',
  position: 'left',
  
  // Cores
  primaryColor: '#1e40af',
  secondaryColor: '#3b82f6',
  accentColor: '#60a5fa',
  backgroundColor: '#ffffff',
  textColor: '#374151',
  
  // Funcionalidades
  showSearch: true,
  showUserInfo: true,
  showFavorites: true,
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
  customCSS: ''
};

interface SidebarManagerProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  mockUser?: any; // Para modo preview
}

// Menu items baseado no tipo de usuário
type MenuKey = 'pai' | 'professor' | 'admin';
const getMenuItems = (userType: MenuKey, featureFlags?: { parents_show_recovery?: boolean }) => {
  const menuItems: Record<MenuKey, any[]> = {
    pai: [
      { 
        id: 'dashboard', 
        label: 'Início', 
        icon: Home,
        description: 'Visão geral dos seus filhos'
      },
      { 
        id: 'notas', 
        label: 'Notas & Boletim', 
        icon: BookOpen,
        description: 'Acompanhe o desempenho acadêmico',
        isPopular: true
      },
      { 
        id: 'agenda', 
        label: 'Agenda Escolar', 
        icon: Calendar,
        description: 'Provas, tarefas e cronograma'
      },
      { 
        id: 'materiais', 
        label: 'Materiais de Estudo', 
        icon: FileText,
        description: 'Recursos educacionais'
      },
      { 
        id: 'recados', 
        label: 'Comunicados', 
        icon: MessageSquare,
        description: 'Recados da escola'
      },
      { 
        id: 'notificacoes', 
        label: 'Notificações', 
        icon: Bell,
        description: 'Avisos importantes'
      },
      { 
        id: 'perfil', 
        label: 'Meu Perfil', 
        icon: User,
        description: 'Dados pessoais e configurações'
      },
    ],
    professor: [
      { 
        id: 'dashboard', 
        label: 'Painel Principal', 
        icon: Home,
        description: 'Visão geral das suas atividades'
      },
      {
        id: 'ensino',
        label: 'Ensino',
        icon: GraduationCap,
        children: [
          { 
            id: 'turmas', 
            label: 'Minhas Turmas', 
            icon: Users,
            description: 'Gerenciar turmas atribuídas'
          },
          { 
            id: 'alunos', 
            label: 'Meus Alunos', 
            icon: GraduationCap,
            description: 'Visualizar perfis dos alunos'
          },
          { 
            id: 'presenca', 
            label: 'Lista de Presença', 
            icon: ClipboardList,
            description: 'Controle de frequência',
            isPopular: true
          }
        ]
      },
      {
        id: 'avaliacao',
        label: 'Avaliação',
        icon: BookOpen,
        children: [
          { 
            id: 'notas', 
            label: 'Lançar Notas', 
            icon: BookOpen,
            description: 'Sistema rápido de notas',
            isPopular: true
          },
          { 
            id: 'recuperacao', 
            label: 'Gestão de Recuperação', 
            icon: AlertTriangle,
            description: 'Alunos em recuperação'
          },
          { 
            id: 'agenda', 
            label: 'Provas & Tarefas', 
            icon: Calendar,
            description: 'Criar e gerenciar avaliações'
          }
        ]
      },
      {
        id: 'conteudo',
        label: 'Conteúdo',
        icon: FileText,
        children: [
          { 
            id: 'materiais', 
            label: 'Materiais Didáticos', 
            icon: FileText,
            description: 'Compartilhar recursos'
          },
          { 
            id: 'recados', 
            label: 'Enviar Comunicados', 
            icon: MessageSquare,
            description: 'Comunicar com pais'
          }
        ]
      },
      { 
        id: 'notificacoes', 
        label: 'Notificações', 
        icon: Bell,
        description: 'Avisos do sistema'
      },
      { 
        id: 'perfil', 
        label: 'Meu Perfil', 
        icon: User,
        description: 'Dados pessoais'
      },
    ],
    admin: [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        icon: Home,
        description: 'Visão geral do sistema'
      },
      {
        id: 'pessoas',
        label: 'Gestão de Pessoas',
        icon: Users,
        children: [
          { 
            id: 'usuarios', 
            label: 'Usuários', 
            icon: Users,
            description: 'Gerenciar contas de acesso'
          },
          { 
            id: 'alunos', 
            label: 'Alunos', 
            icon: GraduationCap,
            description: 'Cadastro e matrícula'
          },
          { 
            id: 'permissoes', 
            label: 'Permissões', 
            icon: Shield,
            description: 'Controle de acesso',
            isNew: true
          }
        ]
      },
      {
        id: 'academico',
        label: 'Gestão Acadêmica',
        icon: School,
        children: [
          { 
            id: 'turmas', 
            label: 'Turmas', 
            icon: School,
            description: 'Organizar salas de aula'
          },
          { 
            id: 'disciplinas', 
            label: 'Disciplinas', 
            icon: BookOpen,
            description: 'Matérias e currículo'
          },
          { 
            id: 'notas', 
            label: 'Gestão de Notas', 
            icon: BookOpen,
            description: 'Supervisionar avaliações'
          },
          { 
            id: 'recuperacao', 
            label: 'Sistema de Recuperação', 
            icon: AlertTriangle,
            description: 'Gerenciar recuperação acadêmica'
          },
          { 
            id: 'presenca', 
            label: 'Controle de Presença', 
            icon: ClipboardList,
            description: 'Monitorar frequência'
          }
        ]
      },
      {
        id: 'relatorios',
        label: 'Relatórios & Análises',
        icon: BarChart3,
        children: [
          { 
            id: 'relatorios', 
            label: 'Relatórios', 
            icon: BarChart3,
            description: 'Análises e estatísticas',
            isPopular: true
          },
          { 
            id: 'auditoria', 
            label: 'Auditoria', 
            icon: Database,
            description: 'Logs e monitoramento'
          }
        ]
      },
      {
        id: 'comunicacao',
        label: 'Comunicação',
        icon: MessageSquare,
        children: [
          { 
            id: 'recados', 
            label: 'Central de Recados', 
            icon: MessageSquare,
            description: 'Comunicados gerais'
          },
          { 
            id: 'notificacoes', 
            label: 'Notificações', 
            icon: Bell,
            description: 'Avisos do sistema'
          },
          { 
            id: 'whatsapp', 
            label: 'WhatsApp Business', 
            icon: MessageCircle,
            description: 'Comunicação direta',
            isNew: true
          }
        ]
      },
      {
        id: 'configuracoes',
        label: 'Configurações',
        icon: Settings,
        children: [
          { 
            id: 'configuracoes', 
            label: 'Sistema', 
            icon: Settings,
            description: 'Configurações gerais'
          },
          { 
            id: 'editar-informacoes', 
            label: 'Dados da Escola', 
            icon: School,
            description: 'Informações institucionais'
          },
          { 
            id: 'configuracoes-aparencia', 
            label: 'Aparência', 
            icon: Palette,
            description: 'Cores e visual'
          },
          { 
            id: 'personalizacao-sidebar', 
            label: 'Menu Lateral', 
            icon: Menu,
            description: 'Personalizar navegação'
          },
          { 
            id: 'personalizacao-login', 
            label: 'Tela de Login', 
            icon: Monitor,
            description: 'Customizar entrada',
            isPopular: true
          },
          { 
            id: 'configuracao-ajuda', 
            label: 'Sistema de Ajuda', 
            icon: HelpCircle,
            description: 'Configurar suporte'
          }
        ]
      },
      {
        id: 'manutencao',
        label: 'Manutenção',
        icon: Database,
        children: [
          { 
            id: 'dados-importexport', 
            label: 'Backup & Dados', 
            icon: Database,
            description: 'Import/Export'
          },
          { 
            id: 'manutencao', 
            label: 'Sistema', 
            icon: Settings,
            description: 'Limpeza e otimização'
          }
        ]
      },
      { 
        id: 'perfil', 
        label: 'Meu Perfil', 
        icon: User,
        description: 'Dados pessoais'
      }
    ],
  };
  // Inserir item de Recuperação para pais via feature flag (off por padrão)
  if (userType === 'pai' && featureFlags?.parents_show_recovery) {
    const parentMenu = menuItems.pai;
    // Evitar duplicidade se já existir
    if (!parentMenu.find(i => i.id === 'recuperacao')) {
      parentMenu.splice(2, 0, {
        id: 'recuperacao',
        label: 'Gestão de Recuperação',
        icon: AlertTriangle,
        description: 'Alunos em recuperação e notas de recuperação'
      });
    }
  }
  return menuItems[userType] || [];
};

export function SidebarManager({ currentPage, onPageChange, isOpen, onToggle, mockUser }: SidebarManagerProps) {
  const { user } = useAuth();
  const { configs } = useGlobalConfig();
  // Inicializa layout/config do localStorage para evitar flash visual
  const [currentLayout, setCurrentLayout] = React.useState(() => {
    try {
      const saved = localStorage.getItem('sidebar_customization');
      if (saved) return (JSON.parse(saved).layout || 'default');
    } catch {}
    return 'default';
  });
  const [sidebarConfig, setSidebarConfig] = React.useState<any>(() => {
    try {
      const saved = localStorage.getItem('sidebar_customization');
      if (saved) return { ...defaultSidebarConfig, ...JSON.parse(saved) };
    } catch {}
    return defaultSidebarConfig;
  });

  // Usar mockUser se fornecido (modo preview), senão usar user real
  const activeUser = mockUser || user;

  // Carregar configurações salvas e mesclar com padrão
  React.useEffect(() => {
    console.log('📂 [SidebarManager] Carregando configurações...', { configs, activeUser: activeUser?.tipo_usuario });
    
    // Carregar configurações do contexto global
    if (configs.sidebar_customization) {
      console.log('📂 Carregando configurações do Supabase:', configs.sidebar_customization);
      const layoutFromConfig = configs.sidebar_customization.layout || 'default';
      console.log('🔍 [SidebarManager] Layout carregado:', layoutFromConfig);
    
      setCurrentLayout(layoutFromConfig);
      setSidebarConfig({ ...defaultSidebarConfig, ...configs.sidebar_customization });
      try { localStorage.setItem('sidebar_customization', JSON.stringify(configs.sidebar_customization)); } catch {}
    } else {
      console.log('📂 Usando configurações padrão (Supabase não disponível ou sem dados)');
      // Mantém o que veio do localStorage (se houver) para evitar flash
    }
    
    // Escutar mudanças de configuração via eventos
    const handleConfigChange = (event: CustomEvent) => {
      console.log('📡 [SidebarManager] Configuração recebida via evento:', event.detail);
      setSidebarConfig(event.detail);
      if (event.detail.layout) {
        setCurrentLayout(event.detail.layout);
      }
    };
    
    const handleLayoutChange = (event: CustomEvent) => {
      console.log('📡 [SidebarManager] Layout recebido via evento:', event.detail);
      setCurrentLayout(event.detail);
    };
    
    window.addEventListener('sidebarConfigChanged', handleConfigChange as EventListener);
    window.addEventListener('sidebarLayoutChanged', handleLayoutChange as EventListener);
    
    return () => {
      window.removeEventListener('sidebarConfigChanged', handleConfigChange as EventListener);
      window.removeEventListener('sidebarLayoutChanged', handleLayoutChange as EventListener);
    };
  }, [configs, activeUser]);

  // Aplicar CSS dinâmico sempre que a configuração mudar
  React.useEffect(() => {
    console.log('🎨 [SidebarManager] Aplicando CSS dinâmico...', { sidebarConfig, isDefault: sidebarConfig === defaultSidebarConfig });
    
    if (!sidebarConfig || sidebarConfig === defaultSidebarConfig) {
      console.log('⏭️ Pulando aplicação de CSS - usando configuração padrão');
      return;
    }
    
    console.log('🎨 Aplicando CSS dinâmico do sidebar...', sidebarConfig);
    
    try {
      const styleId = 'custom-sidebar-styles';
      let styleElement = document.getElementById(styleId);
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      const css = `
        /* Variáveis CSS customizadas para sidebar */
        :root {
          --sidebar-primary: ${sidebarConfig.primaryColor || '#1e40af'};
          --sidebar-secondary: ${sidebarConfig.secondaryColor || '#3b82f6'};
          --sidebar-accent: ${sidebarConfig.accentColor || '#60a5fa'};
          --sidebar-bg: ${sidebarConfig.backgroundColor || 'white'};
          --sidebar-text: ${sidebarConfig.textColor || '#374151'};
          --sidebar-width: ${sidebarConfig.width || '320px'};
        }
        
        /* Aplicar estilos aos sidebars */
        .sidebar-container,
        div[class*="sidebar"],
        aside[class*="sidebar"],
        nav[class*="sidebar"] {
          background: linear-gradient(180deg, var(--sidebar-primary) 0%, var(--sidebar-secondary) 50%, var(--sidebar-accent) 100%) !important;
          width: var(--sidebar-width) !important;
          min-width: var(--sidebar-width) !important;
          max-width: var(--sidebar-width) !important;
        }
        
        /* Header específico */
        .sidebar-header {
          background: linear-gradient(135deg, var(--sidebar-primary) 0%, var(--sidebar-secondary) 100%) !important;
        }
        
        /* Informações do usuário */
        .sidebar-user-info {
          background: linear-gradient(135deg, var(--sidebar-secondary) 0%, var(--sidebar-accent) 100%) !important;
        }
        
        /* Itens ativos do menu */
        .nav-modern.active,
        button[class*="active"],
        .active {
          background-color: var(--sidebar-bg) !important;
          color: var(--sidebar-primary) !important;
        }
        
        /* Border radius */
        .sidebar-container *,
        div[class*="sidebar"] * {
          border-radius: ${sidebarConfig.borderRadius || '12px'} !important;
        }
        
        /* Sombras condicionais */
        ${(sidebarConfig.enableShadows !== false) ? `
          .sidebar-container {
            box-shadow: ${
              (sidebarConfig.shadowIntensity || 'medium') === 'none' ? 'none' :
              (sidebarConfig.shadowIntensity || 'medium') === 'light' ? '0 2px 8px rgba(0,0,0,0.1)' :
              (sidebarConfig.shadowIntensity || 'medium') === 'medium' ? '0 4px 20px rgba(0,0,0,0.15)' :
              (sidebarConfig.shadowIntensity || 'medium') === 'strong' ? '0 8px 30px rgba(0,0,0,0.2)' :
              (sidebarConfig.shadowIntensity || 'medium') === 'dramatic' ? '0 12px 40px rgba(0,0,0,0.3)' :
              '0 4px 20px rgba(0,0,0,0.15)'
            } !important;
          }
        ` : ''}
        
        /* Velocidade de animação */
        ${(sidebarConfig.enableAnimations !== false) ? `
          .sidebar-container,
          .sidebar-container *,
          div[class*="sidebar"],
          div[class*="sidebar"] * {
            transition-duration: ${sidebarConfig.animationSpeed || '300ms'} !important;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
        ` : `
          .sidebar-container,
          .sidebar-container *,
          div[class*="sidebar"],
          div[class*="sidebar"] * {
            transition: none !important;
            animation: none !important;
          }
        `}
        
        /* Efeitos hover condicionais */
        ${(sidebarConfig.enableHoverEffects === false) ? `
          .sidebar-container *:hover,
          .sidebar-container button:hover,
          div[class*="sidebar"] *:hover {
            transform: none !important;
            scale: 1 !important;
            box-shadow: none !important;
          }
        ` : ''}
        
        /* Blur effect */
        ${(sidebarConfig.enableBlur === true) ? `
          .sidebar-container {
            backdrop-filter: blur(20px) !important;
            background: linear-gradient(180deg, ${sidebarConfig.primaryColor || '#1e40af'}90 0%, ${sidebarConfig.secondaryColor || '#3b82f6'}90 50%, ${sidebarConfig.accentColor || '#60a5fa'}90 100%) !important;
          }
        ` : ''}
        
        /* Ocultar elementos baseado na configuração */
        ${(sidebarConfig.showSearch === false) ? `
          .sidebar-container [class*="search"],
          .sidebar-container input[placeholder*="Buscar"],
          .sidebar-container input[placeholder*="buscar"] {
            display: none !important;
          }
        ` : ''}
        
        ${(sidebarConfig.showUserInfo === false) ? `
          .sidebar-user-info,
          .sidebar-container [class*="user-info"] {
            display: none !important;
          }
        ` : ''}
        
        ${(sidebarConfig.showBadges === false) ? `
          .sidebar-container [class*="badge"],
          .sidebar-container span[class*="bg-red-500"],
          .sidebar-container span[class*="animate-pulse"] {
            display: none !important;
          }
        ` : ''}
        
        ${sidebarConfig.customCSS || ''}
      `;
      
      styleElement.textContent = css;
      console.log('✅ CSS dinâmico do sidebar aplicado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao aplicar estilos do sidebar:', error);
    }
  }, [sidebarConfig]);

  if (!activeUser) return null;

  const menuItems = getMenuItems((activeUser.tipo_usuario as MenuKey) || 'pai', { parents_show_recovery: configs.parents_show_recovery });
  const commonProps = {
    currentPage,
    onPageChange,
    isOpen,
    onToggle,
    menuItems,
    config: sidebarConfig,
    user: activeUser
  };

  // Renderizar o layout apropriado
  switch (currentLayout) {
    case 'compact':
      return <CompactSidebar {...commonProps} />;
    case 'icon-only':
      return <IconOnlySidebar {...commonProps} />;
    case 'tabs':
      return <TabsSidebar {...commonProps} />;
    case 'cards':
      return <CardsSidebar {...commonProps} />;
    case 'minimal':
      return <MinimalSidebar {...commonProps} />;
    case 'modern':
      return <ModernSidebar {...commonProps} />;
    case 'default':
    default:
      return <Sidebar {...commonProps} config={sidebarConfig} />;
  }
}