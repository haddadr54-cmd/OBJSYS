import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LogoProvider } from './contexts/LogoContext';
import { GlobalConfigProvider } from './utils/configManager.tsx';
import { LoginForm } from './components/Auth/LoginForm';
import { SidebarManager } from './components/Layout/SidebarManager';
import { ParentDashboard } from './components/Dashboard/ParentDashboard';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { TeacherDashboard } from './components/Dashboard/TeacherDashboard';

export const pageTitles: Record<string, string> = {
  'dashboard': 'Dashboard',
  'notas': 'Notas & Boletim',
  'agenda': 'Agenda',
  'materiais': 'Materiais',
  'recados': 'Recados',
  'notificacoes': 'Notificações',
  'perfil': 'Perfil do Aluno',
  'usuarios': 'Gerenciar Usuários',
  'alunos': 'Gerenciar Alunos',
  'turmas': 'Gerenciar Turmas',
  'disciplinas': 'Gerenciar Disciplinas',
  'relatorios': 'Relatórios',
  'alunos-teacher': 'Meus Alunos',
  'turmas-teacher': 'Minhas Turmas',
  'presenca': 'Controle de Presença',
  'provas-tarefas': 'Provas e Tarefas',
  'lancar-notas': 'Lançar Notas',
  'permissoes': 'Gestão de Permissões',
  'configuracoes': 'Configurações do Sistema',
  'auditoria': 'Auditoria e Logs',
  'editar-informacoes': 'Editar Informações da Escola',
  'personalizacao-visual': 'Personalização Visual',
  'personalizacao-sidebar': 'Personalizar Menu Lateral',
  'personalizacao-login': 'Personalizar Tela de Login',
  'dados-importexport': 'Dados - Import/Export',
  'manutencao': 'Manutenção do Sistema',
  'configuracao-ajuda': 'Configuração de Ajuda',
  'whatsapp': 'WhatsApp Business'
};

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Log para monitorar mudanças de página
  useEffect(() => {
    console.log('🔍 [App] currentPage mudou para:', {
      currentPage,
      userType: user?.tipo_usuario,
      timestamp: new Date().toISOString()
    });
  }, [currentPage, user?.tipo_usuario]);

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
          config={null}
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
  
  switch (user.tipo_usuario) {
    case 'pai':
      return <ParentDashboard 
        onNavigate={(page) => {
          console.log('🔍 [App] setCurrentPage chamado pelo ParentDashboard:', page);
          setCurrentPage(page);
        }} 
        currentPage={currentPage} 
      />;
    case 'admin':
      return <AdminDashboard 
        onNavigate={(page) => {
          console.log('🔍 [App] setCurrentPage chamado pelo AdminDashboard:', page);
          setCurrentPage(page);
        }} 
        currentPage={currentPage} 
      />;
    case 'professor':
      return <TeacherDashboard 
        onNavigate={(page) => {
          console.log('🔍 [App] setCurrentPage chamado pelo TeacherDashboard:', page);
          setCurrentPage(page);
        }} 
        currentPage={currentPage} 
      />;
    default:
      console.log('Tipo de usuário desconhecido, usando ParentDashboard');
      return <ParentDashboard 
        onNavigate={(page) => {
          console.log('🔍 [App] setCurrentPage chamado pelo ParentDashboard (default):', page);
          setCurrentPage(page);
        }} 
        currentPage={currentPage} 
      />;
  }
}

function App() {
  console.log('App component mounted');
  return (
    <LogoProvider>
      <AuthProvider>
        <GlobalConfigProvider>
          <AppContent />
        </GlobalConfigProvider>
      </AuthProvider>
    </LogoProvider>
  );
}

export default App;