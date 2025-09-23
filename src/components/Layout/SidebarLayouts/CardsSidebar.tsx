import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  GraduationCap,
  BookOpen,
  Settings,
  LogOut,
  X,
  Bell,
  Search,
  Star,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface CardsSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  menuItems: any[];
  config?: any;
}

export function CardsSidebar({ currentPage, onPageChange, isOpen, onToggle, menuItems, config }: CardsSidebarProps) {
  const { user, signOut } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(['pessoas', 'academico']);
  const [searchTerm, setSearchTerm] = useState('');

  // Aplicar configurações quando disponíveis
  const showSearch = config?.showSearch !== false;
  const showBadges = config?.showBadges !== false;
  const showDescriptions = config?.showDescriptions !== false;
  const showUserInfo = config?.showUserInfo !== false;

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const renderMenuItem = (item: any, level: number = 0) => {
    const isActive = currentPage === item.id;
    const isExpanded = expandedSections.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;

    return (
      <div key={item.id} className={level > 0 ? 'ml-4' : 'mb-3'}>
        <div
          className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
            isActive
              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <button
            onClick={() => {
              if (hasChildren) {
                toggleSection(item.id);
              } else {
                onPageChange(item.id);
                if (window.innerWidth < 1024) onToggle();
              }
            }}
            className="w-full p-4 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl shadow-lg ${
                  isActive 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200'
                }`}>
                  <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h3 className={`font-bold ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                    {item.label}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {showBadges && item.badge && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
                {showBadges && item.isNew && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-bold">
                    NOVO
                  </span>
                )}
                {showBadges && item.isPopular && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
                {hasChildren && (
                  <div className="text-gray-400">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {showDescriptions && item.description && (
              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            )}
          </button>

          {hasChildren && isExpanded && (
            <div className="px-4 pb-4">
              <div className="border-t border-gray-200 pt-3 space-y-2">
                {item.children.map((child: any) => {
                  const ChildIcon = child.icon;
                  const isChildActive = currentPage === child.id;
                  
                  return (
                    <button
                      key={child.id}
                      onClick={() => {
                        onPageChange(child.id);
                        if (window.innerWidth < 1024) onToggle();
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isChildActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <ChildIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{child.label}</span>
                      {child.badge && (
                        <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                          {child.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
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

      {/* Cards Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-50 to-blue-50 shadow-xl z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-96 border-r-2 border-blue-200 flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
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

          {/* User Card */}
          {showUserInfo && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {user?.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user?.nome}</p>
                  <p className="text-sm text-blue-600 font-semibold capitalize">
                    {user?.tipo_usuario === 'admin' ? '👑 Administrador' : 
                     user?.tipo_usuario === 'professor' ? '👨‍🏫 Professor' : 
                     '👨‍👩‍👧‍👦 Responsável'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        {showSearch && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-400 transition-all"
              />
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-3">
            {menuItems.map((item) => renderMenuItem(item))}
          </div>
        </nav>

        {/* Logout Card */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja sair do sistema?')) {
                signOut();
              }
            }}
            className="w-full bg-white border-2 border-red-200 hover:border-red-400 hover:bg-red-50 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-xl">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
              <span className="font-bold text-red-700">Sair do Sistema</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}