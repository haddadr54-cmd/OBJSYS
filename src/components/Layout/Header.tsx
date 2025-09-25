import React from 'react';
import { Menu, Bell, X, MessageSquare, Calendar, FileText, Search } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
  showSearch?: boolean;
  onSearch?: (term: string) => void;
}

export function Header({ onMenuToggle, title, showSearch = false, onSearch }: HeaderProps) {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();

  // markAsRead e markAllAsRead agora vêm do NotificationContext

  // Debug function para testar o clique do sino
  const handleBellClick = () => {
    console.log('🔔 [Header] Sino clicado!', { 
      showNotifications, 
      unreadCount,
      timestamp: new Date().toISOString() 
    });
    setShowNotifications(!showNotifications);
  };
  return (
    <header className="mobile-header header-modern relative border-b-2 border-blue-100">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-blue-50 hover:scale-110 transition-all duration-300 flex-shrink-0 micro-bounce mobile-button"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </button>
          
          {/* Logo e Nome - Mobile */}
          <div className="flex items-center space-x-3 lg:hidden flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-modern-colored animate-float">
              <span className="text-white font-black text-lg sm:text-xl">O</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-lg font-black text-gray-900 truncate leading-tight text-shadow-modern">Colégio</span>
              <span className="text-xs sm:text-sm text-blue-600 font-bold truncate -mt-1">Objetivo</span>
            </div>
          </div>
          
          {/* Título da página */}
          <div className="hidden lg:flex items-center space-x-4 flex-1">
            <h1 className="text-xl lg:text-2xl xl:text-3xl font-black text-gray-900 truncate text-gradient-objetivo">{title}</h1>
            
            {/* Search bar */}
            {showSearch && (
              <div className="relative max-w-xs lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    onSearch?.(e.target.value);
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <div className="relative">
            <button 
              onClick={handleBellClick}
              className="relative p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-blue-50 hover:scale-110 transition-all duration-300 flex-shrink-0 micro-bounce mobile-button"
            >
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white text-xs font-black animate-bounce shadow-modern">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown de Notificações */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 sm:mt-4 w-72 sm:w-80 lg:w-96 glass-card rounded-2xl sm:rounded-3xl z-[999] max-h-80 sm:max-h-96 overflow-y-auto animate-slide-in-up shadow-2xl border-2 border-blue-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl sm:rounded-t-3xl">
                  <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3 shadow-lg">
                      <Bell className="h-4 w-4 text-white" />
                    </div>
                    Notificações
                  </h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold whitespace-nowrap px-2 sm:px-3 py-1 rounded-full hover:bg-blue-100 transition-all duration-300"
                      >
                        <span className="hidden sm:inline">Marcar todas como lidas</span>
                        <span className="sm:hidden">Marcar todas</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1.5 sm:p-2 hover:bg-white hover:bg-opacity-50 rounded-full transition-all duration-300 hover:scale-110 mobile-button"
                      style={{ zIndex: 1001 }}
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Lista de Notificações */}
                <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      </div>
                      <p className="text-sm sm:text-base text-gray-500 font-medium">Nenhuma notificação</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.map((notification) => {
                        const Icon = notification.type === 'recado' ? MessageSquare : notification.type === 'prova_tarefa' ? Calendar : notification.type === 'material' ? FileText : Bell;
                        return (
                          <div
                            key={notification.id}
                            className={`p-3 sm:p-5 hover:bg-blue-50 transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                              !notification.read ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3 sm:space-x-4">
                              <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg ${
                                notification.type === 'recado' ? 'bg-purple-100' :
                                notification.type === 'prova_tarefa' ? 'bg-blue-100' :
                                'bg-green-100'
                              } flex-shrink-0`}>
                                <Icon className={`h-4 w-4 ${notification.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className={`text-sm sm:text-base font-bold ${
                                    !notification.read ? 'text-gray-900' : 'text-gray-700'
                                  } line-clamp-2 sm:truncate pr-2`}>
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex-shrink-0 animate-pulse shadow-lg"></div>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 line-clamp-2 font-medium">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1 sm:mt-2 font-semibold">
                                  {new Date(notification.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-2xl sm:rounded-b-3xl">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      // Navegar para página de notificações usando o sistema de navegação
                      window.dispatchEvent(new CustomEvent('navigate', { detail: 'notificacoes' }));
                    }}
                    className="w-full text-center text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-bold py-2 sm:py-3 hover:bg-blue-100 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl mobile-button"
                  >
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showNotifications && (
        <div
          className="mobile-sidebar-overlay" 
          onClick={() => setShowNotifications(false)}
          style={{ zIndex: 998 }}
        />
      )}
    </header>
  );
}