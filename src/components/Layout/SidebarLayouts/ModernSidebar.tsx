import React, { useState } from 'react';
import { 
  LogOut,
  X,
  Search,
  Star,
  ChevronDown,
  ChevronRight,
  Bookmark,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth';

interface ModernSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  menuItems: any[];
  config?: any;
}

export function ModernSidebar({ currentPage, onPageChange, isOpen, onToggle, menuItems, config }: ModernSidebarProps) {
  const { user, signOut } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(['pessoas', 'academico']);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['dashboard', 'usuarios', 'alunos']);

  // Aplicar configurações quando disponíveis
  const showSearch = config?.showSearch !== false;
  const showFavorites = config?.showFavorites !== false;
  const showBadges = config?.showBadges !== false;
  const showDescriptions = config?.showDescriptions !== false;
  const showUserInfo = config?.showUserInfo !== false;
  
  // Config flags are derived above; avoid noisy console logs in production

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderMenuItem = (item: any, level: number = 0): React.ReactNode => {
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
                onPageChange(item.id);
                if (window.innerWidth < 1024) onToggle();
              }
            }}
            className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-300 rounded-2xl group relative overflow-hidden ${
              isActive
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl transform scale-105'
                : 'text-white hover:bg-white/10 hover:shadow-lg hover:scale-105'
            }`}
          >
            {/* Glow effect for active item */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 blur-xl"></div>
            )}
            
            <div className="flex items-center space-x-3 relative z-10">
              <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-white/20 shadow-lg' 
                  : 'bg-white/10 group-hover:bg-white/20'
              }`}>
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white'}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-white'}`}>
                    {item.label}
                  </span>
                  
                  {/* Badges */}
                  <div className="flex items-center space-x-1">
                    {showBadges && item.badge && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse">
                        {item.badge}
                      </span>
                    )}
                    {showBadges && item.isNew && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-bold">
                        NOVO
                      </span>
                    )}
                    {showBadges && item.isPopular && (
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    )}
                  </div>
                </div>
                
                {showDescriptions && item.description && (
                  <p className={`text-xs mt-1 opacity-75 ${isActive ? 'text-white' : 'text-white'}`}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 relative z-10">
              {!hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  className={`p-1 rounded-full transition-all duration-300 ${
                    isFavorite 
                      ? 'text-yellow-400' 
                      : 'text-white/50 hover:text-yellow-400'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}
              
              {hasChildren && (
                <div className="text-white/70">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              )}
            </div>
          </button>
          </div>
        </li>
        
        {/* Submenu items - rendered as separate li elements to avoid nesting */}
        {hasChildren && isExpanded && item.children.map((child: any) => (
          <React.Fragment key={`submenu-${child.id}`}>
            {renderMenuItem(child, level + 1)}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Modern Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-blue-900 to-purple-900 shadow-2xl z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-80 border-r-4 border-blue-400 flex flex-col backdrop-blur-lg`}
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e3a8a 50%, #7c3aed 100%)',
          boxShadow: '4px 0 30px rgba(59, 130, 246, 0.3)'
        }}
      >
        {/* Modern Header */}
        <div className="p-6 border-b-2 border-white/20 bg-gradient-to-r from-blue-800/50 to-purple-800/50 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-white to-blue-100 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                <span className="text-blue-600 font-black text-xl">O</span>
              </div>
              <div>
                <span className="text-2xl font-black text-white drop-shadow-lg">Objetivo</span>
                <div className="text-sm text-blue-200 font-semibold">Sistema Moderno</div>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 backdrop-blur-sm"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Modern User */}
        {showUserInfo && (
          <div className="p-6 border-b-2 border-white/20 bg-gradient-to-r from-purple-800/50 to-blue-800/50 backdrop-blur-lg">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-white to-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-2xl shadow-2xl transform hover:scale-110 transition-all duration-300">
                  {user?.nome.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="font-black text-white text-lg drop-shadow-lg">{user?.nome}</p>
                <p className="text-sm text-blue-200 font-bold bg-white/20 px-3 py-1 rounded-xl backdrop-blur-sm">
                  {user?.tipo_usuario === 'admin' ? '👑 Administrador' : 
                   user?.tipo_usuario === 'professor' ? '👨‍🏫 Professor' : 
                   '👨‍👩‍👧‍👦 Responsável'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Search */}
        {showSearch && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                type="text"
                placeholder="Buscar funcionalidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 transition-all backdrop-blur-sm"
              />
            </div>
          </div>
        )}

        {/* Favorites Section */}
        {showFavorites && favorites.length > 0 && (
          <div className="px-4 pb-4">
            <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider mb-3 flex items-center">
              <Star className="h-3 w-3 mr-2 text-yellow-400 fill-current" />
              Favoritos
            </h4>
            <div className="space-y-1">
              {menuItems
                .filter(item => favorites.includes(item.id))
                .slice(0, 3)
                .map(item => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onPageChange(item.id);
                        if (window.innerWidth < 1024) onToggle();
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                      <Star className="h-3 w-3 text-yellow-400 fill-current ml-auto" />
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Modern Navigation */}
        <nav className="flex-1 overflow-y-auto px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => renderMenuItem(item))}
          </ul>
        </nav>

        {/* Quick Stats */}
        <div className="p-4 border-t border-white/20">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="text-center p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 text-green-400 mx-auto mb-1" />
              <div className="text-xs text-white font-bold">Sistema</div>
              <div className="text-xs text-green-400">Online</div>
            </div>
            <div className="text-center p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Zap className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
              <div className="text-xs text-white font-bold">Status</div>
              <div className="text-xs text-yellow-400">Ativo</div>
            </div>
          </div>
        </div>

        {/* Modern Logout */}
        <div className="p-4 border-t-2 border-white/20">
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja sair do sistema?')) {
                signOut();
              }
            }}
            className="w-full flex items-center space-x-4 px-4 py-3 text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 rounded-2xl hover:shadow-xl group font-semibold border border-white/20 hover:border-red-400 backdrop-blur-sm"
          >
            <div className="p-2 rounded-xl bg-red-500/80 group-hover:bg-red-600 transition-all duration-300 shadow-lg">
              <LogOut className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-bold">Sair do Sistema</span>
          </button>
        </div>
      </div>
    </>
  );
}