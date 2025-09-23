import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  ClipboardList, 
  TrendingUp, 
  LogOut, 
  Plus, 
  Zap,
  Settings,
  School,
  BarChart3,
  Menu,
  Shield,
  Database,
  FileText,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Key,
  AlertTriangle,
  CheckCircle,
  Info,
  Save,
  X,
  RotateCcw,
  Monitor,
  Palette,
  HelpCircle,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDataService } from '../../lib/dataService';
import { SidebarManager } from '../Layout/SidebarManager';
import { Header } from '../Layout/Header';

import { NotasPage } from '../Pages/NotasPage';
import { AgendaPage } from '../Pages/AgendaPage';
import { MateriaisPage } from '../Pages/MateriaisPage';
import { RecadosPage } from '../Pages/RecadosPage';
import { PerfilPage } from '../Pages/PerfilPage';
import { UsuariosPage } from '../Pages/UsuariosPage';
import { AlunosAdminPage } from '../Pages/AlunosAdminPage';
import { TurmasPage } from '../Pages/TurmasPage';
import { DisciplinasPage } from '../Pages/DisciplinasPage';
import { RelatoriosPage } from '../Pages/RelatoriosPage';
import { ConfiguracoesPage } from '../Pages/ConfiguracoesPage';
import { EditarInformacoesPage } from '../Pages/EditarInformacoesPage';
import { PersonalizacaoVisualPage } from '../Pages/PersonalizacaoVisualPage';
import { PersonalizacaoSidebarPage } from '../Pages/PersonalizacaoSidebarPage';
import { DadosImportExportPage } from '../Pages/DadosImportExportPage';
import { ManutencaoPage } from '../Pages/ManutencaoPage';
import { AuditoriaPage } from '../Pages/AuditoriaPage';
import { NotificacoesPage } from '../Pages/NotificacoesPage';
import { ConfiguracaoAjudaPage } from '../Pages/ConfiguracaoAjudaPage';
import { PermissoesPage } from '../Pages/PermissoesPage';
import { PresencaPage } from '../Pages/PresencaPage';
import { WhatsAppPage } from '../Pages/WhatsAppPage';
import { PersonalizacaoLoginPage } from '../Pages/PersonalizacaoLoginPage';

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard Administrativo',
  usuarios: 'Gerenciar Usuários',
  alunos: 'Gerenciar Alunos',
  turmas: 'Gerenciar Turmas',
  disciplinas: 'Gerenciar Disciplinas',
  relatorios: 'Relatórios e Análises',
  configuracoes: 'Configurações do Sistema',
  'editar-informacoes': 'Informações da Escola',
  'personalizacao-visual': 'Personalização Visual',
  'personalizacao-sidebar': 'Personalizar Menu Lateral',
  'personalizacao-login': 'Personalizar Tela de Login',
  'dados-importexport': 'Gestão de Dados',
  'manutencao': 'Manutenção do Sistema',
  'auditoria': 'Auditoria e Logs',
  'permissoes': 'Gestão de Permissões',
  'configuracao-ajuda': 'Configuração de Ajuda',
  'recados': 'Central de Recados',
  'materiais': 'Gestão de Materiais',
  'agenda': 'Agenda Escolar',
  'notas': 'Gestão de Notas',
  'presenca': 'Controle de Presença',
  'notificacoes': 'Central de Notificações',
  'whatsapp': 'WhatsApp Business',
  'perfil': 'Meu Perfil'
};

export function AdminDashboard({ onNavigate, currentPage = 'dashboard' }: AdminDashboardProps) {
  const { user, isSupabaseConnected, signOut } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalAlunos: 0,
    totalTurmas: 0,
    totalDisciplinas: 0,
    totalNotas: 0,
    mediaGeral: 0,
    usuariosPorTipo: {
      admin: 0,
      professor: 0,
      pai: 0,
    }
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
      await signOut();
    }
  }, [signOut]);

  const handleNavigate = useCallback((pageId: string) => {
    console.log('🔍 [AdminDashboard] handleNavigate chamado:', {
      pageId,
      currentPage,
      userType: user?.tipo_usuario,
      timestamp: new Date().toISOString()
    });
    
    if (pageId === 'sair') {
      handleLogout();
    } else {
      console.log('🔍 [AdminDashboard] Chamando onNavigate com:', pageId);
      onNavigate?.(pageId);
    }
    setSidebarOpen(false);
  }, [onNavigate, handleLogout]);

  useEffect(() => {
    fetchStats();
    
    // Escutar eventos de navegação do header
    const handleNavigateEvent = (event: CustomEvent) => {
      handleNavigate(event.detail);
    };
    
    window.addEventListener('navigate', handleNavigateEvent as EventListener);
    
    return () => {
      window.removeEventListener('navigate', handleNavigateEvent as EventListener);
    };
  }, [currentPage, handleNavigate]);

  const fetchStats = async () => {
    try {
      const statsData = await dataService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <p className="text-2xl font-bold text-gray-700">Carregando painel administrativo...</p>
            <p className="text-lg text-gray-500 mt-2">Aguarde um momento</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Header de Boas-vindas */}
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-blue-200 mobile-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl sm:rounded-3xl shadow-lg mx-auto sm:mx-0">
                <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  👑 Olá, {user?.nome.split(' ')[0]}!
                </h1>
                <p className="text-gray-700 mt-1 sm:mt-2 text-base sm:text-lg lg:text-xl font-bold">
                  Painel de controle administrativo
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-end">
              <div className="flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl sm:rounded-2xl text-sm sm:text-base lg:text-lg font-black shadow-lg">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">Sistema Online</span>
                <span className="sm:hidden">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas Principais */}
        <div className="mobile-stats-grid">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl shadow-xl border-2 border-blue-200 mobile-card hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-black text-blue-600 uppercase tracking-wide">👥 Usuários</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-700">{stats.totalUsuarios}</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1 sm:mt-2">
                  <div className="text-xs text-blue-600">
                    Admin: {stats.usuariosPorTipo.admin} | Prof: {stats.usuariosPorTipo.professor} | Pais: {stats.usuariosPorTipo.pai}
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl sm:rounded-2xl shadow-xl border-2 border-green-200 mobile-card hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-black text-green-600 uppercase tracking-wide">🎓 Alunos</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-green-700">{stats.totalAlunos}</p>
                <p className="text-xs text-green-600 mt-1 sm:mt-2">Matriculados ativos</p>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
                <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-200 mobile-card hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-black text-purple-600 uppercase tracking-wide">🏫 Turmas</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-purple-700">{stats.totalTurmas}</p>
                <p className="text-xs text-purple-600 mt-1 sm:mt-2">Turmas ativas</p>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
                <School className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl sm:rounded-2xl shadow-xl border-2 border-orange-200 mobile-card hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-black text-orange-600 uppercase tracking-wide">📚 Disciplinas</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-orange-700">{stats.totalDisciplinas}</p>
                <p className="text-xs text-orange-600 mt-1 sm:mt-2">Disciplinas cadastradas</p>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl sm:rounded-2xl shadow-lg">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Seção: Gestão de Pessoas */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-gray-200 mobile-card">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg mx-auto sm:mx-0">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900">👥 Gestão de Pessoas</h2>
              <p className="text-gray-600 font-semibold text-sm sm:text-base">Gerencie usuários, alunos e permissões</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <button
              onClick={() => handleNavigate('usuarios')}
              className="group mobile-card bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-400 rounded-xl sm:rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
                <div className="p-3 sm:p-4 bg-blue-500 rounded-lg sm:rounded-xl text-white group-hover:scale-110 transition-transform mx-auto sm:mx-0">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-black text-blue-900">Usuários</h3>
                  <p className="text-blue-700 font-bold text-sm sm:text-base">Gerenciar contas</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-black text-blue-600">{stats.totalUsuarios}</span>
                <span className="text-xs sm:text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-white px-2 sm:px-3 py-1 rounded-lg">
                  <span className="hidden sm:inline">Gerenciar →</span>
                  <span className="sm:hidden">→</span>
                </span>
              </div>
            </button>

            <button
              onClick={() => handleNavigate('alunos')}
              className="group mobile-card bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 hover:border-green-400 rounded-xl sm:rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
                <div className="p-3 sm:p-4 bg-green-500 rounded-lg sm:rounded-xl text-white group-hover:scale-110 transition-transform mx-auto sm:mx-0">
                  <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-black text-green-900">Alunos</h3>
                  <p className="text-green-700 font-bold text-sm sm:text-base">Cadastrar e editar</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-black text-green-600">{stats.totalAlunos}</span>
                <span className="text-xs sm:text-sm text-green-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-white px-2 sm:px-3 py-1 rounded-lg">
                  <span className="hidden sm:inline">Gerenciar →</span>
                  <span className="sm:hidden">→</span>
                </span>
              </div>
            </button>

            <button
              onClick={() => handleNavigate('permissoes')}
              className="group mobile-card bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-2 border-red-200 hover:border-red-400 rounded-xl sm:rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl sm:col-span-2 lg:col-span-1"
            >
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
                <div className="p-3 sm:p-4 bg-red-500 rounded-lg sm:rounded-xl text-white group-hover:scale-110 transition-transform mx-auto sm:mx-0">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-black text-red-900">Permissões</h3>
                  <p className="text-red-700 font-bold text-sm sm:text-base">Controle de acesso</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-black text-red-600">Segurança</span>
                <span className="text-xs sm:text-sm text-red-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-white px-2 sm:px-3 py-1 rounded-lg">
                  <span className="hidden sm:inline">Configurar →</span>
                  <span className="sm:hidden">→</span>
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Seção: Gestão Acadêmica */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg">
              <School className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">🏫 Gestão Acadêmica</h2>
              <p className="text-gray-600 font-semibold">Organize turmas, disciplinas e conteúdo</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleNavigate('turmas')}
              className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-400 rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-4 bg-purple-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <School className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-purple-900">Turmas</h3>
                  <p className="text-purple-700 font-bold">Organizar turmas</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-purple-600">{stats.totalTurmas}</span>
                <span className="text-sm text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-white px-3 py-1 rounded-lg">
                  Gerenciar →
                </span>
              </div>
            </button>

            <button
              onClick={() => handleNavigate('disciplinas')}
              className="group p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-4 bg-indigo-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-indigo-900">Disciplinas</h3>
                  <p className="text-indigo-700 font-bold">Matérias e conteúdo</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-indigo-600">{stats.totalDisciplinas}</span>
                <span className="text-sm text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-white px-3 py-1 rounded-lg">
                  Gerenciar →
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Seção: Relatórios e Análises */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">📊 Relatórios e Análises</h2>
              <p className="text-gray-600 font-semibold">Dados e insights do sistema</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleNavigate('relatorios')}
              className="group p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-2 border-emerald-200 hover:border-emerald-400 rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-4 bg-emerald-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-emerald-900">Relatórios</h3>
                  <p className="text-emerald-700 font-bold">Análises e estatísticas</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-emerald-600">Disponível</span>
                <span className="text-sm text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-white px-3 py-1 rounded-lg">
                  Acessar →
                </span>
              </div>
            </button>

            <button
              onClick={() => handleNavigate('auditoria')}
              className="group p-6 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 border-2 border-pink-200 hover:border-pink-400 rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-4 bg-pink-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <Database className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-pink-900">Auditoria</h3>
                  <p className="text-pink-700 font-bold">Logs e monitoramento</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-pink-600">Ativo</span>
                <span className="text-sm text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-white px-3 py-1 rounded-lg">
                  Visualizar →
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Seção: Configurações */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-gray-500 to-gray-700 rounded-2xl shadow-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">🔧 Configurações do Sistema</h2>
              <p className="text-gray-600 font-semibold">Personalize e configure o sistema</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => handleNavigate('configuracoes')}
              className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-2 border-gray-200 hover:border-gray-400 rounded-2xl text-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="p-4 bg-gray-500 rounded-xl text-white mx-auto mb-4 group-hover:scale-110 transition-transform w-fit">
                <Settings className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Sistema</h3>
              <p className="text-gray-600 font-semibold text-sm">Configurações gerais</p>
            </button>

            <button
              onClick={() => handleNavigate('personalizacao-visual')}
              className="group p-6 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 border-2 border-pink-200 hover:border-pink-400 rounded-2xl text-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="p-4 bg-pink-500 rounded-xl text-white mx-auto mb-4 group-hover:scale-110 transition-transform w-fit">
                <Palette className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black text-pink-900 mb-2">Visual</h3>
              <p className="text-pink-600 font-semibold text-sm">Cores e aparência</p>
            </button>

            <button
              onClick={() => handleNavigate('personalizacao-sidebar')}
              className="group p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl text-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="p-4 bg-indigo-500 rounded-xl text-white mx-auto mb-4 group-hover:scale-110 transition-transform w-fit">
                <Menu className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black text-indigo-900 mb-2">Menu</h3>
              <p className="text-indigo-600 font-semibold text-sm">Personalizar sidebar</p>
            </button>

            <button
              onClick={() => handleNavigate('personalizacao-login')}
              className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-400 rounded-2xl text-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="p-4 bg-blue-500 rounded-xl text-white mx-auto mb-4 group-hover:scale-110 transition-transform w-fit">
                <Monitor className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black text-blue-900 mb-2">Login</h3>
              <p className="text-blue-600 font-semibold text-sm">Tela de entrada</p>
            </button>
          </div>
        </div>

        {/* Seção: Comunicação */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">🔔 Comunicação</h2>
              <p className="text-gray-600 font-semibold">Recados, notificações e WhatsApp</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => handleNavigate('recados')}
              className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-400 rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-4 bg-purple-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-purple-900">Recados</h3>
                  <p className="text-purple-700 font-bold">Central de comunicados</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-purple-600">Ativo</span>
                <span className="text-sm text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-white px-3 py-1 rounded-lg">
                  Gerenciar →
                </span>
              </div>
            </button>

            <button
              onClick={() => handleNavigate('notificacoes')}
              className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-400 rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-4 bg-blue-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <Calendar className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-blue-900">Notificações</h3>
                  <p className="text-blue-700 font-bold">Central de avisos</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-blue-600">Sistema</span>
                <span className="text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-white px-3 py-1 rounded-lg">
                  Visualizar →
                </span>
              </div>
            </button>

            <button
              onClick={() => handleNavigate('whatsapp')}
              className="group p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 hover:border-green-400 rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-4 bg-green-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-green-900">WhatsApp</h3>
                  <p className="text-green-700 font-bold">Comunicação direta</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-green-600">Business</span>
                <span className="text-sm text-green-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-white px-3 py-1 rounded-lg">
                  Configurar →
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Seção: Manutenção */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">🛠️ Manutenção e Dados</h2>
              <p className="text-gray-600 font-semibold">Backup, importação e manutenção</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleNavigate('dados-importexport')}
              className="group p-6 bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 border-2 border-teal-200 hover:border-teal-400 rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-4 bg-teal-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <Database className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-teal-900">Dados</h3>
                  <p className="text-teal-700 font-bold">Import/Export</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-teal-600">Backup</span>
                <span className="text-sm text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-white px-3 py-1 rounded-lg">
                  Gerenciar →
                </span>
              </div>
            </button>

            <button
              onClick={() => handleNavigate('manutencao')}
              className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-2 border-orange-200 hover:border-orange-400 rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-4 bg-orange-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-orange-900">Manutenção</h3>
                  <p className="text-orange-700 font-bold">Sistema e limpeza</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-orange-600">Sistema</span>
                <span className="text-sm text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-white px-3 py-1 rounded-lg">
                  Acessar →
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-3xl shadow-xl border-2 border-yellow-200 p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">⚡ Ações Rápidas</h2>
              <p className="text-gray-600 font-semibold">Acesso direto às funções mais usadas</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleNavigate('usuarios')}
              className="p-4 bg-white border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center"
            >
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-bold text-blue-900">+ Usuário</span>
            </button>
            <button
              onClick={() => handleNavigate('alunos')}
              className="p-4 bg-white border-2 border-green-200 rounded-xl hover:border-green-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center"
            >
              <GraduationCap className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-bold text-green-900">+ Aluno</span>
            </button>
            <button
              onClick={() => handleNavigate('turmas')}
              className="p-4 bg-white border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center"
            >
              <School className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-bold text-purple-900">+ Turma</span>
            </button>
            <button
              onClick={() => handleNavigate('relatorios')}
              className="p-4 bg-white border-2 border-emerald-200 rounded-xl hover:border-emerald-400 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center"
            >
              <BarChart3 className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <span className="text-sm font-bold text-emerald-900">Relatório</span>
            </button>
          </div>
        </div>

        {/* Status do Sistema */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">📊 Status do Sistema</h2>
              <p className="text-gray-600 font-semibold">Monitoramento em tempo real</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-green-800">Banco de Dados</p>
              <p className="text-xs text-green-600">
                {isSupabaseConnected ? 'Supabase Online' : 'Local Ativo'}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-blue-800">Segurança</p>
              <p className="text-xs text-blue-600">SSL Ativo</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
              <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-purple-800">Performance</p>
              <p className="text-xs text-purple-600">Otimizada</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <TrendingUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-yellow-800">Uptime</p>
              <p className="text-xs text-yellow-600">99.9%</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      <SidebarManager
        currentPage={currentPage}
        onPageChange={handleNavigate}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={pageTitles[currentPage] || 'Dashboard Administrativo'}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 p-6">
          <div className="max-w-7xl mx-auto mobile-container">
            {currentPage === 'dashboard' && renderDashboard()}
            {currentPage === 'usuarios' && <UsuariosPage />}
            {currentPage === 'alunos' && <AlunosAdminPage />}
            {currentPage === 'turmas' && <TurmasPage />}
            {currentPage === 'disciplinas' && <DisciplinasPage />}
            {currentPage === 'relatorios' && <RelatoriosPage />}
            {currentPage === 'configuracoes' && <ConfiguracoesPage onNavigate={handleNavigate} />}
            {currentPage === 'editar-informacoes' && <EditarInformacoesPage />}
            {currentPage === 'personalizacao-visual' && <PersonalizacaoVisualPage />}
            {currentPage === 'personalizacao-sidebar' && <PersonalizacaoSidebarPage />}
            {currentPage === 'personalizacao-login' && <PersonalizacaoLoginPage />}
            {currentPage === 'dados-importexport' && <DadosImportExportPage />}
            {currentPage === 'manutencao' && <ManutencaoPage />}
            {currentPage === 'auditoria' && <AuditoriaPage />}
            {currentPage === 'permissoes' && <PermissoesPage />}
            {currentPage === 'configuracao-ajuda' && <ConfiguracaoAjudaPage />}
            {currentPage === 'notificacoes' && <NotificacoesPage />}
            {currentPage === 'perfil' && <PerfilPage />}
            {currentPage === 'recados' && <RecadosPage />}
            {currentPage === 'materiais' && <MateriaisPage />}
            {currentPage === 'agenda' && <AgendaPage />}
            {currentPage === 'notas' && <NotasPage />}
            {currentPage === 'presenca' && <PresencaPage />}
            {currentPage === 'whatsapp' && <WhatsAppPage />}
          </div>
        </main>
      </div>
    </div>
  );
}