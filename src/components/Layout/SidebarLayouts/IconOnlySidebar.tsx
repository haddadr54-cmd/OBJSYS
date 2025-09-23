import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  GraduationCap,
  BookOpen,
  Settings,
  LogOut,
  X,
  Menu,
  Bell,
  ChevronRight
} from 'lucide-react';
import { useAuth } from "../../../contexts/AuthContext";

interface IconOnlySidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  menuItems: any[];
  config?: any;
}

export function IconOnlySidebar({ currentPage, onPageChange, isOpen, onToggle, menuItems, config }: IconOnlySidebarProps) {
  const { user, signOut } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Aplicar configurações quando disponíveis
  const showBadges = config?.showBadges !== false;
  const showDescriptions = config?.showDescriptions !== false;

  const renderMenuItem = (item: any) => {
    const isActive = currentPage === item.id;
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <li key={item.id} className="relative">
        <button
          onClick={() => {
            if (!hasChildren) {
              onPageChange(item.id);
              if (window.innerWidth < 1024) onToggle();
            }
          }}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`w-full p-3 rounded-xl transition-all duration-300 group relative ${
            isActive
              ? 'bg-white text-blue-700 shadow-lg'
              : 'text-white hover:bg-white/10 hover:scale-110'
          }`}
        >
          <div className="flex items-center justify-center">
            <Icon className={`h-6 w-6 ${isActive ? 'text-blue-700' : 'text-white'}`} />
          </div>
          
          {showBadges && item.badge && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {item.badge}
            </div>
          )}

          {/* Tooltip */}
          {hoveredItem === item.id && (
            <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 z-50">
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl">
                {item.label}
                {showDescriptions && item.description && (
                  <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                )}
                {hasChildren && (
                  <div className="flex items-center space-x-1 mt-1">
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-xs">{item.children.length} itens</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submenu para itens com filhos */}
          {hasChildren && hoveredItem === item.id && (
            <div className="absolute left-full ml-3 top-0 z-50">
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-48">
                {item.children.map((child: any) => {
                  const ChildIcon = child.icon;
                  return (
                    <button
                      key={child.id}
                      onClick={() => {
                        onPageChange(child.id);
                        if (window.innerWidth < 1024) onToggle();
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <ChildIcon className="h-4 w-4" />
                      <span className="text-sm">{child.label}</span>
                      {showBadges && child.badge && (
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
        </button>
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

      {/* Icon Only Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-900 to-slate-900 shadow-xl z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-20 border-r-2 border-blue-500 flex flex-col`}
      >
        {/* Icon Header */}
        <div className="flex items-center justify-center p-4 border-b border-white/20">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-blue-600 font-black text-lg">O</span>
          </div>
        </div>

        {/* Icon User */}
        <div className="flex items-center justify-center p-4 border-b border-white/20">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg shadow-lg">
            {user?.nome.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Icon Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-2">
            {menuItems.map((item) => renderMenuItem(item))}
          </ul>
        </nav>

        {/* Icon Logout */}
        <div className="p-2 border-t border-white/20">
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja sair do sistema?')) {
                signOut();
              }
            }}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
            className="w-full p-3 text-white hover:bg-red-500/80 rounded-xl transition-colors relative"
          >
            <LogOut className="h-6 w-6 mx-auto" />
            
            {hoveredItem === 'logout' && (
              <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 z-50">
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl">
                  Sair do Sistema
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
}