import { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/auth';
import { useAuth } from './contexts/auth';
import { LogoProvider } from './contexts/logo';
import { GlobalConfigProvider } from './contexts/globalConfig';
import { NotificationProvider } from './contexts/notification';
import { LoginForm } from './components/Auth/LoginForm';
import { SidebarManager } from './components/Layout/SidebarManager';
// Dashboards lazy loaded for route-level code splitting
const ParentDashboard = lazy(() => import('./components/Dashboard/ParentDashboard').then(m => ({ default: m.ParentDashboard })));
const AdminDashboard = lazy(() => import('./components/Dashboard/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const TeacherDashboard = lazy(() => import('./components/Dashboard/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
import { isSupabaseConfigured } from './lib/supabase';


function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Marca conteúdo como pronto para prevenir flash
  useEffect(() => {
    // Import dinâmico para evitar problemas de bundling
    import('./utils/antiFlash').then(({ antiFlash }) => {
      antiFlash.markContentReady();
    });
  }, []);
  
  // Prefetch otimizado: carrega dashboards baseado no tipo de usuário
  useEffect(() => {
    // Prefetch dashboards para navegação rápida
    if (!user) return;
    const preloadDashboards = async () => {
      switch (user.tipo_usuario) {
        case 'admin':
          await import('./components/Dashboard/AdminDashboard');
          setTimeout(() => {
            import('./components/Dashboard/TeacherDashboard');
            import('./components/Dashboard/ParentDashboard');
          }, 2000);
          break;
        case 'professor':
          await import('./components/Dashboard/TeacherDashboard');
          setTimeout(() => {
            import('./components/Dashboard/AdminDashboard');
            import('./components/Dashboard/ParentDashboard');
          }, 2000);
          break;
        case 'pai':
          await import('./components/Dashboard/ParentDashboard');
          setTimeout(() => {
            import('./components/Dashboard/AdminDashboard');
            import('./components/Dashboard/TeacherDashboard');
          }, 2000);
          break;
      }
    };
    window.requestIdleCallback(() => preloadDashboards(), { timeout: 3000 });
  }, [user?.tipo_usuario]);

  // Verificar se está no modo preview da tela de login
  const isLoginPreview = window.location.pathname === '/login-preview' || 
                         window.location.search.includes('preview=login') ||
                         window.location.hash.includes('login-preview');

  // Verificar se está no modo preview do sidebar
  const isSidebarPreview = window.location.pathname === '/sidebar-preview' || 
                           window.location.search.includes('preview=sidebar') ||
                           window.location.hash.includes('sidebar-preview');

  // Se estiver no modo preview, sempre mostrar LoginForm
  if (isLoginPreview) {
    console.log('🎭 Modo preview da tela de login ativado');
    return <LoginForm />;
  }

  // Se estiver no modo preview do sidebar, mostrar apenas o sidebar
  if (isSidebarPreview) {
    console.log('🎭 Modo preview do sidebar ativado');
    
    // Criar usuário mock baseado no tipo especificado na URL
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('userType') || 'admin';
    
    const mockUser = {
      id: 'preview-user',
      nome: userType === 'admin' ? 'Admin Preview' : 
            userType === 'professor' ? 'Professor Preview' : 
            'Pai Preview',
      email: `${userType}@preview.com`,
      tipo_usuario: userType as 'admin' | 'professor' | 'pai',
      telefone: '(11) 99999-9999',
      ativo: true,
      criado_em: new Date().toISOString()
    };
    
    return (
      <div className="flex h-screen bg-gray-50">
        <SidebarManager
          currentPage="dashboard"
          onPageChange={() => {}}
          isOpen={true}
          onToggle={() => {}}
          mockUser={mockUser}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Preview do Menu Lateral</h2>
            <p className="text-gray-600">Usuário: {mockUser.nome}</p>
            <p className="text-gray-500 text-sm">Tipo: {mockUser.tipo_usuario}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('AppContent render:', { user: !!user, loading, userType: user?.tipo_usuario });

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-xl font-medium text-gray-700">Carregando sistema...</p>
          <p className="text-sm text-gray-500 mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  // Se não há usuário, mostrar login
  if (!user) {
    console.log('Renderizando LoginForm - usuário não encontrado');
    return <LoginForm />;
  }

  console.log('Renderizando dashboard para usuário:', user.tipo_usuario);

  // Renderizar dashboard baseado no tipo de usuário
  console.log('🔍 [App] Renderizando dashboard:', {
    userType: user.tipo_usuario,
    currentPage,
    timestamp: new Date().toISOString()
  });
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"><div className="text-center"><div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div><p className="text-xl font-medium text-gray-700">Carregando painel...</p><p className="text-sm text-gray-500 mt-2">Preparando módulos</p></div></div>}>
      {(() => {
        switch (user.tipo_usuario) {
          case 'pai':
            return <ParentDashboard 
              onNavigate={(page: string) => {
                setCurrentPage(page);
              }} 
              currentPage={currentPage} 
            />;
          case 'admin':
            return <AdminDashboard 
              onNavigate={(page: string) => {
                setCurrentPage(page);
              }} 
              currentPage={currentPage} 
            />;
          case 'professor':
            return <TeacherDashboard 
              onNavigate={(page: string) => {
                setCurrentPage(page);
              }} 
              currentPage={currentPage} 
            />;
          default:
            console.error('[ERRO] Tipo de usuário desconhecido ou não definido:', user);
            return (
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-100">
                <div className="text-center">
                  <div className="animate-bounce rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-6"></div>
                  <p className="text-2xl font-bold text-red-700">Erro: Tipo de usuário não reconhecido</p>
                  <p className="text-lg text-gray-700 mt-2">Entre em contato com o suporte ou revise o cadastro do usuário.</p>
                  <pre className="mt-4 p-4 bg-white rounded-lg shadow text-left text-xs text-gray-700 max-w-xl mx-auto overflow-x-auto">{JSON.stringify(user, null, 2)}</pre>
                </div>
              </div>
            );
        }
      })()}
    </Suspense>
  );
}

function App() {
  console.log('App component mounted');
  return (
    <LogoProvider>
      <AuthProvider>
        <GlobalConfigProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
          {!isSupabaseConfigured && (
            <div className="fixed bottom-3 right-3 z-50 select-none">
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 shadow border border-amber-200">
                Modo offline (demo)
              </div>
            </div>
          )}
        </GlobalConfigProvider>
      </AuthProvider>
    </LogoProvider>
  );
}

export default App;