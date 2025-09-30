import { useState, useEffect } from 'react';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  FileText, 
  User, 
  Users, 
  GraduationCap,
  MessageSquare,
  Settings,
  LogOut,
  X,
  School,
  ClipboardList,
  BarChart3,
  Menu,
  Bell,
  HelpCircle,
  Shield,
  Plus,
  Database,
  MessageCircle,
  Monitor,
  ChevronDown,
  ChevronRight,
  Search,
  Star,
  Bookmark,
  Palette
} from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { useNotifications } from '../../contexts/notification';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  config?: any;
  user?: any; // Para modo preview
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  isNew?: boolean;
  isPopular?: boolean;
  children?: MenuItem[];
  description?: string;
}

const menuItems = {
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
          id: 'personalizacao-visual', 
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

export function Sidebar({ currentPage, onPageChange, isOpen, onToggle, config, user: propUser }: SidebarProps) {
  const { user: authUser, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  
  // Usar user passado via props (modo preview) ou user autenticado
  const user = propUser || authUser;
  // Keep param referenced to avoid unused warning in relaxed lint baseline
  void config;
  
  const [expandedSections, setExpandedSections] = useState<string[]>(['pessoas', 'academico']);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sidebarConfig, setSidebarConfig] = useState<any>(null);
  
  type MenuKey = keyof typeof menuItems;
  const userType: MenuKey = (user?.tipo_usuario as MenuKey) ?? 'pai';
  const items: MenuItem[] = (menuItems[userType] ?? []) as MenuItem[];

  // Load favorites from localStorage
  useEffect(() => {
    if (!user?.id) return;
    const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    // Carregar configurações do sidebar
    const savedConfig = localStorage.getItem('sidebarCustomization');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setSidebarConfig(parsedConfig);
      } catch (error) {
        console.error('Erro ao carregar configurações do sidebar:', error);
      }
    }
  }, [user?.id]);

  // Escutar mudanças de configuração
  useEffect(() => {
    const handleConfigChange = (event: CustomEvent) => {
      setSidebarConfig(event.detail);
    };
    
    window.addEventListener('sidebarConfigChanged', handleConfigChange as EventListener);
    
    return () => {
      window.removeEventListener('sidebarConfigChanged', handleConfigChange as EventListener);
    };
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (itemId: string) => {
    if (!user?.id) return;
    const newFavorites = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];
    
    setFavorites(newFavorites);
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const filterItems = (items: MenuItem[]): MenuItem[] => {
    if (!searchTerm) return items;
    
    return items.filter(item => {
      const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (item.children) {
        const filteredChildren = filterItems(item.children);
        return matchesSearch || filteredChildren.length > 0;
      }
      
      return matchesSearch;
    });
  };

  const renderMenuItem = (item: MenuItem, level: number = 0): React.ReactNode => {
    const isActive = currentPage === item.id;
    const isExpanded = expandedSections.includes(item.id);
    const isFavorite = favorites.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;

    return (
      <>
        <li key={item.id} className={level > 0 ? 'ml-4' : ''}>
          <div className="relative group">
            <button
              onClick={() => {
                if (hasChildren) {
                  toggleSection(item.id);
                } else {
                 console.log('🔍 [Sidebar] Item clicado:', {
                   itemId: item.id,
                   itemLabel: item.label,
                   currentPage,
                   timestamp: new Date().toISOString()
                 });
                  onPageChange(item.id);
                  if (window.innerWidth < 1024) onToggle();
                }
              }}
              className={`w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-all duration-300 rounded-lg sm:rounded-xl group relative mobile-nav-item ${
                isActive
                  ? 'bg-white text-blue-700 shadow-xl font-bold border-l-4 border-blue-600'
                  : hasChildren
                    ? 'text-white hover:bg-white/10 hover:text-white hover:shadow-lg font-medium'
                    : 'text-white hover:bg-white/10 hover:text-white hover:shadow-lg font-medium'
              }`}
            >
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 flex-shrink-0 shadow-lg ${
                  isActive 
                    ? 'bg-blue-600 shadow-xl' 
                    : 'bg-white/20 group-hover:bg-white/30 group-hover:shadow-xl'
                }`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-white group-hover:text-white'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs sm:text-sm font-semibold transition-all duration-300 truncate ${
                    isActive 
                      ? 'text-blue-700' 
                      : 'text-white group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Badges e indicadores */}
                  <div className="flex items-center space-x-1">
                    {(sidebarConfig?.showBadges !== false) && (
                      (() => {
                        // Para o item de Notificações, usamos SEMPRE o contador dinâmico
                        if (item.id === 'notificacoes') {
                          return unreadCount > 0 ? (
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse">
                              {String(unreadCount)}
                            </span>
                          ) : null;
                        }
                        // Demais itens podem usar badge estática se configurada
                        return item.badge ? (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse">
                            {item.badge}
                          </span>
                        ) : null;
                      })()
                    )}
                    {(sidebarConfig?.showBadges !== false) && item.isNew && (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-500 text-white text-xs rounded-full font-bold">
                        <span className="hidden sm:inline">NOVO</span>
                        <span className="sm:hidden">N</span>
                      </span>
                    )}
                    {(sidebarConfig?.showBadges !== false) && item.isPopular && (
                      <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-400 fill-current" />
                    )}
                  </div>
                </div>
                
                {/* Descrição (tooltip) */}
                {(sidebarConfig?.showDescriptions !== false) && item.description && (
                  <p className={`text-xs mt-1 opacity-75 line-clamp-2 sm:truncate ${
                    isActive ? 'text-blue-600' : 'text-white'
                  }`}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            {/* Controles adicionais */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Botão de favorito */}
              {(sidebarConfig?.showFavorites !== false) && !hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  className={`p-1 rounded-full transition-all duration-300 ${
                    isFavorite 
                      ? 'text-yellow-400 hover:text-yellow-300' 
                      : 'text-white/50 hover:text-yellow-400'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}
              
              {/* Seta para expandir */}
              {hasChildren && (
                <div className="text-white/70">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              )}
              
              {/* Indicador ativo */}
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
              )}
            </div>
          </button>
        </div>
      </li>
        
      {/* Submenu items - rendered as separate li elements to avoid nesting */}
      {hasChildren && isExpanded && item.children!.map(child => renderMenuItem(child, level + 1))}
    </>
  );
  };

  const filteredItems = filterItems(items);
  const favoriteItems = items.filter(item => 
    favorites.includes(item.id) || 
    (item.children && item.children.some(child => favorites.includes(child.id)))
  );

  // Safe early return AFTER hooks
  if (!user) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="mobile-sidebar-overlay" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={`sidebar-container fixed left-0 top-0 h-full z-50 transition-transform duration-300 w-72 sm:w-80 bg-gradient-to-b from-blue-900 via-blue-800 to-slate-900 shadow-2xl border-r-4 border-blue-500 flex flex-col lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
          boxShadow: '4px 0 20px rgba(59, 130, 246, 0.3)'
        }}
      >
        {/* Header */}
        <div className="sidebar-header flex items-center justify-between p-4 sm:p-6 border-b-2 border-white/20" 
             style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' }}>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="sidebar-logo w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300 border-3 border-blue-200">
              <span className="text-blue-600 font-black text-lg sm:text-xl tracking-wide">
                <span className="hidden sm:inline">OBJ</span>
                <span className="sm:hidden">O</span>
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-lg sm:text-2xl font-black text-white tracking-wide drop-shadow-lg">
                Objetivo
              </span>
              <div className="text-xs sm:text-sm text-blue-100 font-semibold uppercase tracking-wider">
                Sistema Escolar
              </div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-blue-700/50 transition-all duration-300 backdrop-blur-sm mobile-button"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-md" />
          </button>
        </div>

        {/* User info */}
        <div className="sidebar-user-info p-4 sm:p-6 border-b-2 border-white/20" 
             style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="sidebar-user-avatar w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg sm:text-2xl shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-blue-200">
              {user.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-base sm:text-lg leading-tight drop-shadow-lg truncate">{user.nome}</p>
              <p className="text-xs sm:text-sm font-semibold text-blue-100 capitalize bg-white/20 px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/30 truncate">
                {user.tipo_usuario === 'admin' ? '👑 Administrador' : 
                 user.tipo_usuario === 'professor' ? '👨‍🏫 Professor' : 
                 '👨‍👩‍👧‍👦 Responsável'}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        {(sidebarConfig?.showSearch !== false) && (
          <div className="p-3 sm:p-4 border-b border-white/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                type="text"
                placeholder="Buscar menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-300 text-sm sm:text-base"
              />
            </div>
          </div>
        )}

        {/* Favorites Section */}
        {(sidebarConfig?.showFavorites !== false) && favoriteItems.length > 0 && !searchTerm && (
          <div className="px-3 sm:px-4 py-3 border-b border-white/20">
            <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2 flex items-center">
              <Star className="h-3 w-3 mr-2 text-yellow-400 fill-current" />
              Favoritos
            </h4>
            <div className="space-y-1">
              {favoriteItems.slice(0, 3).map(item => {
                if (item.children) {
                  return item.children
                    .filter(child => favorites.includes(child.id))
                    .slice(0, 2)
                    .map(child => (
                      <button
                        key={child.id}
                        onClick={() => {
                          onPageChange(child.id);
                          if (window.innerWidth < 1024) onToggle();
                        }}
                        className="w-full flex items-center space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 mobile-nav-item"
                      >
                        <child.icon className="h-4 w-4" />
                        <span className="truncate">{child.label}</span>
                      </button>
                    ));
                } else if (favorites.includes(item.id)) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onPageChange(item.id);
                        if (window.innerWidth < 1024) onToggle();
                      }}
                      className="w-full flex items-center space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 mobile-nav-item"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 sm:space-y-2">
          <ul className="space-y-2">
            {filteredItems.map((item) => renderMenuItem(item))}
          </ul>
          
          {/* No results message */}
          {searchTerm && filteredItems.length === 0 && (
            <div className="text-center py-8 text-white/60">
              <Search className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Nenhum item encontrado</p>
              <p className="text-xs mt-1">Tente outro termo de busca</p>
            </div>
          )}
        </nav>

        {/* Quick Actions */}
        {userType === 'admin' && (
          <div className="p-3 sm:p-4 border-t border-white/20">
            <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider mb-3">
              Ações Rápidas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onPageChange('usuarios');
                  if (window.innerWidth < 1024) onToggle();
                }}
                className="flex items-center justify-center space-x-2 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 text-white text-xs mobile-button"
              >
                <Plus className="h-3 w-3" />
                <span>Usuário</span>
              </button>
              <button
                onClick={() => {
                  onPageChange('alunos');
                  if (window.innerWidth < 1024) onToggle();
                }}
                className="flex items-center justify-center space-x-2 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 text-white text-xs mobile-button"
              >
                <Plus className="h-3 w-3" />
                <span>Aluno</span>
              </button>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 sm:p-6 border-t-2 border-white/20 flex-shrink-0" 
             style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
          <button
            onClick={() => {
              if (propUser && propUser.id === 'preview-user') {
                // Modo preview - não fazer logout real
                console.log('Preview mode - logout simulado');
              } else {
                if (confirm('Tem certeza que deseja sair do sistema?')) {
                  signOut();
                }
              }
            }}
            className="w-full flex items-center space-x-3 sm:space-x-4 px-3 sm:px-4 py-3 text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 rounded-lg sm:rounded-xl hover:shadow-xl group font-semibold border border-white/20 hover:border-red-400 mobile-button"
          >
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-red-500/80 group-hover:bg-red-600 transition-all duration-300 flex-shrink-0 shadow-lg">
              <LogOut className="h-5 w-5 text-white drop-shadow-sm" />
            </div>
            <span className="text-xs sm:text-sm font-semibold truncate drop-shadow-sm">
              <span className="hidden sm:inline">Sair do Sistema</span>
              <span className="sm:hidden">Sair</span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}