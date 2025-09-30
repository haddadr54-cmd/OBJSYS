import { useState } from 'react';
import { 
  Home, 
  Users, 
  GraduationCap,
  Settings,
  LogOut,
  X,
  BarChart3,
  MessageSquare,
  FileText
} from 'lucide-react';
import { useAuth } from "../../../contexts/auth";

interface TabsSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  menuItems: any[];
  config?: any;
}

export function TabsSidebar({ currentPage, onPageChange, isOpen, onToggle, menuItems, config }: TabsSidebarProps) {
  const { user, signOut } = useAuth();
  const [activeCategory, setActiveCategory] = useState('main');

  // Aplicar configurações quando disponíveis
  const showBadges = config?.showBadges !== false;
  const showDescriptions = config?.showDescriptions !== false;
  const showUserInfo = config?.showUserInfo !== false;

  // Organizar itens por categoria
  const categories = {
    main: {
      label: 'Principal',
      icon: Home,
      items: menuItems.filter(item => ['dashboard', 'perfil'].includes(item.id))
    },
    people: {
      label: 'Pessoas',
      icon: Users,
      items: menuItems.filter(item => item.id.includes('usuarios') || item.id.includes('alunos') || item.id.includes('permissoes'))
    },
    academic: {
      label: 'Acadêmico',
      icon: GraduationCap,
      items: menuItems.filter(item => ['turmas', 'disciplinas', 'notas', 'presenca'].includes(item.id))
    },
    communication: {
      label: 'Comunicação',
      icon: MessageSquare,
      items: menuItems.filter(item => ['recados', 'notificacoes', 'whatsapp'].includes(item.id))
    },
    content: {
      label: 'Conteúdo',
      icon: FileText,
      items: menuItems.filter(item => ['materiais', 'agenda'].includes(item.id))
    },
    reports: {
      label: 'Relatórios',
      icon: BarChart3,
      items: menuItems.filter(item => ['relatorios', 'auditoria'].includes(item.id))
    },
    settings: {
      label: 'Configurações',
      icon: Settings,
      items: menuItems.filter(item => item.id.includes('configuracoes') || item.id.includes('personalizacao') || item.id.includes('manutencao'))
    }
  };

  const renderTabContent = () => {
    const category = categories[activeCategory as keyof typeof categories];
    if (!category) return null;

    return (
      <div className="space-y-2">
        {category.items.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                if (window.innerWidth < 1024) onToggle();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-300 rounded-xl ${
                isActive
                  ? 'bg-white text-blue-700 shadow-lg'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                isActive ? 'bg-blue-600' : 'bg-gray-100'
              }`}>
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium">{item.label}</span>
                {showDescriptions && item.description && (
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                )}
              </div>
              {showBadges && item.badge && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Tabs Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white shadow-xl z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-80 border-r-2 border-gray-200 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">O</span>
            </div>
            <div>
              <span className="text-xl font-black text-gray-900">Objetivo</span>
              <div className="text-sm text-gray-600 font-semibold">Sistema Escolar</div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* User info */}
        {showUserInfo && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {user?.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900">{user?.nome}</p>
                <p className="text-sm text-gray-600 capitalize">
                  {user?.tipo_usuario === 'admin' ? 'Administrador' : 
                   user?.tipo_usuario === 'professor' ? 'Professor' : 
                   'Responsável'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {Object.entries(categories).map(([key, category]) => {
              const Icon = category.icon;
              const isActive = activeCategory === key;
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium whitespace-nowrap">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderTabContent()}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja sair do sistema?')) {
                signOut();
              }
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sair do Sistema</span>
          </button>
        </div>
      </div>
    </>
  );
}