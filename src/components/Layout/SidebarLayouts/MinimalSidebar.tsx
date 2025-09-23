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
  ChevronDown,
  ChevronRight,
  Dot
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface MinimalSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  menuItems: any[];
  config?: any;
}

export function MinimalSidebar({ currentPage, onPageChange, isOpen, onToggle, menuItems, config }: MinimalSidebarProps) {
  const { user, signOut } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Aplicar configurações quando disponíveis
  const showBadges = config?.showBadges !== false;
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
      <li key={item.id} className={level > 0 ? 'ml-6' : ''}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleSection(item.id);
            } else {
              onPageChange(item.id);
              if (window.innerWidth < 1024) onToggle();
            }
          }}
          className={`w-full flex items-center justify-between py-2 px-3 text-left transition-all duration-200 rounded-md group ${
            isActive
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-3">
            {level === 0 ? (
              <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
            ) : (
              <Dot className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
            )}
            <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {item.label}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
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
        </button>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
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

      {/* Minimal Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-72 border-r border-gray-200 flex flex-col`}
      >
        {/* Minimal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="font-bold text-gray-900">Objetivo</span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Minimal User */}
        {showUserInfo && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm">
                {user?.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{user?.nome}</p>
                <p className="text-xs text-gray-500">
                  {user?.tipo_usuario === 'admin' ? 'Admin' : 
                   user?.tipo_usuario === 'professor' ? 'Professor' : 
                   'Responsável'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Minimal Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => renderMenuItem(item))}
          </ul>
        </nav>

        {/* Minimal Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja sair do sistema?')) {
                signOut();
              }
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
}