import React, { useDeferredValue, Suspense } from 'react';
import { Menu, Search, Bell, Home } from 'lucide-react';
// Lazy load NotificationBell to cut initial bundle (header loads fast)
const LazyNotificationBell = React.lazy(() => import('./NotificationBell'));
import { useGlobalConfig } from '../../contexts/globalConfig/useGlobalConfig';
import { useAuth } from '../../contexts/auth';

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
  showSearch?: boolean;
  onSearch?: (term: string) => void;
}

function HeaderBase({ onMenuToggle, title, showSearch = false, onSearch }: HeaderProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  // Defer propagation of search term to reduce mid‑typing expensive filter recomputations.
  const deferredSearch = useDeferredValue(searchTerm);
  React.useEffect(() => { if (showSearch && onSearch) onSearch(deferredSearch); }, [deferredSearch, onSearch, showSearch]);
  const { configs } = useGlobalConfig();
  const { user } = useAuth();
  const notificationsEnabled = configs.notifications_enabled !== false; // default true
  
  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 shadow-2xl border-b-4 border-blue-400/50 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-3 rounded-2xl bg-white/10 hover:bg-white/20 hover:scale-110 transition-all duration-300 flex-shrink-0 border border-white/20 backdrop-blur-sm group"
          >
            <Menu className="h-6 w-6 text-white group-hover:text-blue-100" />
          </button>
          
          {/* Logo e Nome - Mobile */}
          <div className="flex items-center space-x-4 lg:hidden flex-1 min-w-0">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-white to-blue-100 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-white/20">
                <span className="text-blue-600 font-black text-xl">O</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-black text-white truncate leading-tight drop-shadow-lg">Sistema</span>
              <span className="text-sm text-blue-200 font-bold truncate -mt-1">Objetivo</span>
            </div>
          </div>
          
          {/* Título da página */}
          <div className="hidden lg:flex items-center space-x-6 flex-1">
            <h1 className="text-2xl xl:text-3xl font-black text-white truncate drop-shadow-lg">{title}</h1>
            
            {/* Search bar */}
            {showSearch && (
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Buscar no sistema..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); }}
                  className="pl-12 pr-6 py-3 bg-white/10 border border-white/20 rounded-2xl focus:bg-white/20 focus:border-white/40 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-300 w-full focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 flex-shrink-0">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }))}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20 backdrop-blur-sm group"
              title="Ir para o Dashboard"
            >
              <Home className="h-5 w-5 text-white group-hover:text-blue-100" />
            </button>
          </div>

          {/* Notifications */}
          {notificationsEnabled && (
            <Suspense fallback={
              <div className="w-12 h-12 flex items-center justify-center animate-pulse rounded-xl bg-gradient-to-br from-white/10 to-blue-100/20 border border-white/20 backdrop-blur-sm">
                <Bell className="h-5 w-5 text-white/80 drop-shadow-sm" />
              </div>
            }>
              <LazyNotificationBell
                onNavigateToNotifications={() =>
                  window.dispatchEvent(new CustomEvent('navigate', { detail: 'notificacoes' }))
                }
              />
            </Suspense>
          )}

          {/* User Profile */}
          {user && (
            <div className="flex items-center space-x-3 bg-white/10 rounded-2xl px-4 py-2 border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-white to-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm shadow-lg">
                  {user.nome?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-white truncate max-w-32">{user.nome}</p>
                <p className="text-xs text-blue-200 capitalize">{user.tipo_usuario}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Memoize to avoid needless re-renders when parent state changes unrelated to header.
export const Header = React.memo(HeaderBase);

export default Header;