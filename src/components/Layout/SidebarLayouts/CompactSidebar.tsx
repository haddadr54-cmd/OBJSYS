import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  GraduationCap,
  BookOpen,
  Settings,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  Bell,
  Search,
  Star,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface CompactSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  menuItems: any[];
  config?: any;
}

export function CompactSidebar({ currentPage, onPageChange, isOpen, onToggle, menuItems, config }: CompactSidebarProps) {
  const { user, signOut } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
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
      <li key={item.id} className={level > 0 ? 'ml-2' : ''}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleSection(item.id);
            } else {
              onPageChange(item.id);
              if (window.innerWidth < 1024) onToggle();
            }
          }}
          className={`w-full flex items-center justify-between px-2 py-2 text-left transition-all duration-200 rounded-lg group ${
            isActive
              ? 'bg-white text-blue-700 shadow-md'
              : 'text-white hover:bg-white/10'
          }`}
        >
          <div className="flex items-center space-x-2 min-w-0">
            <div className={`p-1.5 rounded-md ${
              isActive ? 'bg-blue-600' : 'bg-white/20'
            }`}>
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-white'}`} />
            </div>
            <span className="text-xs font-medium truncate">{item.label}</span>
            
            {showDescriptions && item.description && (
              <p className="text-xs text-white/70 mt-1 truncate">{item.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {showBadges && item.badge && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                {item.badge}
              </span>
            )}
            
            {hasChildren && (
              <div className="text-white/70">
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </div>
            )}
          </div>
        </button>

        {hasChildren && isExpanded && (
          <div className="mt-1 ml-2 space-y-1">
            {item.children.map((child: any) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </li>
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

      {/* Compact Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-900 to-slate-900 shadow-xl z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 border-r-2 border-blue-500 flex flex-col`}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">OBJ</span>
            </div>
            <div>
              <span className="text-white font-bold text-sm">Objetivo</span>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded hover:bg-blue-700/50"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Compact User info */}
        {showUserInfo && (
          <div className="p-3 border-b border-white/20">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                {user?.nome.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white text-sm truncate">{user?.nome}</p>
                <p className="text-xs text-blue-100 truncate">
                  {user?.tipo_usuario === 'admin' ? 'Admin' : 
                   user?.tipo_usuario === 'professor' ? 'Professor' : 
                   'Responsável'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Compact Search */}
        {showSearch && (
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-white/50" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 text-xs focus:bg-white/20 focus:border-white/40"
              />
            </div>
          </div>
        )}

        {/* Compact Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => renderMenuItem(item))}
          </ul>
        </nav>

        {/* Compact Logout */}
        <div className="p-2 border-t border-white/20">
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja sair do sistema?')) {
                signOut();
              }
            }}
            className="w-full flex items-center space-x-2 px-2 py-2 text-white hover:bg-red-500/80 rounded-lg transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </>
  );
}