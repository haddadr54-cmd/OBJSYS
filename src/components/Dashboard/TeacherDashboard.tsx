import React, { useState, useEffect, useCallback } from 'react';
import { Users, GraduationCap, BookOpen, Calendar, MessageSquare, ClipboardList, TrendingUp, LogOut, Plus, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDataService } from '../../lib/dataService';
import { SidebarManager } from '../Layout/SidebarManager';
import { Header } from '../Layout/Header';

import { NotasPage } from '../Pages/NotasPage';
import { AgendaPage } from '../Pages/AgendaPage';
import { MateriaisPage } from '../Pages/MateriaisPage';
import { RecadosPage } from '../Pages/RecadosPage';
import { PerfilPage } from '../Pages/PerfilPage';
import { AlunosTeacherPage } from '../Pages/AlunosTeacherPage';
import { TurmasTeacherPage } from '../Pages/TurmasTeacherPage';
import { PresencaPage } from '../Pages/PresencaPage';
import { NotificacoesPage } from '../Pages/NotificacoesPage';

interface TeacherDashboardProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  turmas: 'Turmas',
  alunos: 'Alunos',
  notas: 'Lançar Notas',
  presenca: 'Presença',
  agenda: 'Provas/Tarefas',
  materiais: 'Materiais',
  recados: 'Recados',
  perfil: 'Perfil',
};

export function TeacherDashboard({ onNavigate, currentPage = 'dashboard' }: TeacherDashboardProps) {
  const { user, isSupabaseConnected, signOut } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [stats, setStats] = useState({
    totalTurmas: 0,
    totalAlunos: 0,
    totalDisciplinas: 0,
    totalNotas: 0,
    mediaGeral: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
      await signOut();
    }
  }, [signOut]);

  const handlePageChange = useCallback((page: string) => {
    console.log('🔍 [TeacherDashboard] handlePageChange chamado:', {
      page,
      currentPage,
      userType: user?.tipo_usuario,
      timestamp: new Date().toISOString()
    });
    
    if (page === 'sair') {
      handleLogout();
    } else {
      console.log('🔍 [TeacherDashboard] Chamando onNavigate com:', page);
      onNavigate?.(page);
    }
    setSidebarOpen(false);
  }, [onNavigate, handleLogout]);

  useEffect(() => {
    fetchStats();
    
    // Escutar eventos de navegação do header
    const handleNavigateEvent = (event: CustomEvent) => {
      handlePageChange(event.detail);
    };
    
    window.addEventListener('navigate', handleNavigateEvent as EventListener);
    
    return () => {
      window.removeEventListener('navigate', handleNavigateEvent as EventListener);
    };
  }, [handlePageChange]);

  const fetchStats = async () => {
    try {
      const statsData = await dataService.getStats();
      setStats({
        totalTurmas: statsData.totalTurmas,
        totalAlunos: statsData.totalAlunos,
        totalDisciplinas: statsData.totalDisciplinas,
        totalNotas: statsData.totalNotas,
        mediaGeral: statsData.mediaGeral,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Se não estiver no dashboard, renderizar a página específica
  if (currentPage !== 'dashboard') {
    return (
      <div className="flex h-screen bg-gray-50">
        <SidebarManager
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            title={pageTitles[currentPage] || 'Painel do Professor'}
          />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {currentPage === 'turmas' && <TurmasTeacherPage onPageChange={handlePageChange} />}
              {currentPage === 'alunos' && <AlunosTeacherPage onPageChange={handlePageChange} />}
              {currentPage === 'notas' && <NotasPage />}
              {currentPage === 'presenca' && <PresencaPage />}
              {currentPage === 'agenda' && <AgendaPage />}
              {currentPage === 'materiais' && <MateriaisPage />}
              {currentPage === 'recados' && <RecadosPage />}
              {currentPage === 'notificacoes' && <NotificacoesPage />}
              {currentPage === 'perfil' && <PerfilPage />}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen layout-modern flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-large mx-auto mb-8 animate-glow"></div>
          <p className="text-2xl font-black text-gray-700 animate-pulse">Carregando informações...</p>
          <p className="text-lg text-gray-500 mt-4 font-semibold">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen layout-modern overflow-hidden">
      <SidebarManager
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title="Painel do Professor"
        />
        
        <main className="content-modern">
          <div className="mobile-container space-y-6 sm:space-y-8 lg:space-y-12">
        {/* Header de Boas-vindas */}
            <div className="glass-card rounded-2xl sm:rounded-3xl mobile-card animate-slide-in-up hover-lift">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl heading-modern animate-glow text-center sm:text-left">
                    🌟 Olá, Professor {user?.nome.split(' ')[0]}!
                  </h1>
                  <p className="text-gray-700 mt-2 sm:mt-4 text-sm sm:text-base lg:text-lg xl:text-xl font-bold subheading-modern text-center sm:text-left">
                    🚀 Gerencie suas turmas e alunos com eficiência máxima
                  </p>
                </div>
                <div className="flex items-center justify-center sm:justify-end">
                  <div className="flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl sm:rounded-3xl text-sm sm:text-base font-black shadow-modern animate-bounce-soft status-online">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full animate-pulse shadow-lg"></div>
                    <span className="hidden sm:inline">✅ Online</span>
                    <span className="sm:hidden">✅</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estatísticas Principais */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="stat-card-modern bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 animate-slide-in-up delay-100 mobile-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-black text-blue-600 uppercase tracking-wider">🏫 Turmas</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-700 animate-glow">{stats.totalTurmas}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-modern-colored animate-float">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="stat-card-modern bg-gradient-to-br from-white to-green-50 border-2 border-green-200 animate-slide-in-up delay-200 mobile-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-black text-green-600 uppercase tracking-wider">🎓 Alunos</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-green-700 animate-glow">{stats.totalAlunos}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-modern-colored animate-float">
                    <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="stat-card-modern bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 animate-slide-in-up delay-300 mobile-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-black text-purple-600 uppercase tracking-wider">📝 Notas</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-700 animate-glow">{stats.totalNotas}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-modern-colored animate-float">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="stat-card-modern bg-gradient-to-br from-white to-amber-50 border-2 border-amber-200 animate-slide-in-up delay-400 mobile-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-black text-amber-600 uppercase tracking-wider">📊 Média</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-700 animate-glow">{stats.mediaGeral.toFixed(1)}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-modern-colored animate-float">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 animate-slide-in-up delay-200">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gradient-objetivo mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl shadow-modern mr-0 sm:mr-4 lg:mr-6 animate-bounce-soft mx-auto sm:mx-0">
                  <Zap className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
                </div>
                <span className="text-center sm:text-left">⚡ Ações Rápidas</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Lançar Notas */}
                <button
                  onClick={() => handlePageChange('notas')}
                  className="card-modern group p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 border-2 border-blue-300 hover:border-blue-500 text-center sm:text-left animate-scale-in delay-100"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                    <div className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl sm:rounded-3xl text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-modern-colored mx-auto sm:mx-0">
                      <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-blue-900">📝 Notas</h3>
                      <p className="text-sm sm:text-base text-blue-700 font-bold">Lançamento rápido</p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-blue-700 opacity-0 group-hover:opacity-100 transition-all duration-300 font-black bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg">
                    ⚡ Sistema otimizado →
                  </span>
                </button>

                {/* Presença */}
                <button
                  onClick={() => handlePageChange('presenca')}
                  className="card-modern group p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 hover:border-green-400 text-center sm:text-left animate-scale-in delay-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                    <div className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl sm:rounded-3xl text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-modern-colored mx-auto sm:mx-0">
                      <ClipboardList className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl font-black text-green-900">Presença</h3>
                      <p className="text-sm sm:text-base text-green-700 font-bold">Chamada ágil</p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-green-600 opacity-0 group-hover:opacity-100 transition-all duration-300 font-black bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg">
                    Controle rápido →
                  </span>
                </button>

                {/* Provas/Tarefas */}
                <button
                  onClick={() => handlePageChange('agenda')}
                  className="card-modern group p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-400 text-center sm:text-left animate-scale-in delay-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                    <div className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl sm:rounded-3xl text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-modern-colored mx-auto sm:mx-0">
                      <Calendar className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl font-black text-purple-900">Agenda</h3>
                      <p className="text-sm sm:text-base text-purple-700 font-bold">Provas e tarefas</p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300 font-black bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg">
                    Criar avaliações →
                  </span>
                </button>

                {/* Materiais */}
                <button
                  onClick={() => handlePageChange('materiais')}
                  className="card-modern group p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-2 border-amber-200 hover:border-amber-400 text-center sm:text-left animate-scale-in delay-400"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                    <div className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl sm:rounded-3xl text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-modern-colored mx-auto sm:mx-0">
                      <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl font-black text-amber-900">Materiais</h3>
                      <p className="text-sm sm:text-base text-amber-700 font-bold">Recursos didáticos</p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-amber-600 opacity-0 group-hover:opacity-100 transition-all duration-300 font-black bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg">
                    Compartilhar →
                  </span>
                </button>
              </div>
            </div>

            {/* Menu Secundário */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 animate-slide-in-up delay-300">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-modern mr-0 sm:mr-4 animate-bounce-soft mx-auto sm:mx-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-center sm:text-left">Gestão Acadêmica</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Turmas */}
                <button
                  onClick={() => handlePageChange('turmas')}
                  className="card-modern p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-2 border-indigo-200 hover:border-indigo-400 text-center animate-scale-in delay-100"
                >
                  <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-modern w-fit mx-auto mb-4 sm:mb-6 hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-indigo-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-indigo-900 mb-2 sm:mb-3">Minhas Turmas</h3>
                  <p className="text-sm sm:text-base text-indigo-700 font-semibold">Gerenciar turmas atribuídas</p>
                </button>

                {/* Alunos */}
                <button
                  onClick={() => handlePageChange('alunos')}
                  className="card-modern p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-2 border-emerald-200 hover:border-emerald-400 text-center animate-scale-in delay-200"
                >
                  <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-modern w-fit mx-auto mb-4 sm:mb-6 hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-emerald-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-900 mb-2 sm:mb-3">Meus Alunos</h3>
                  <p className="text-sm sm:text-base text-emerald-700 font-semibold">Visualizar e gerenciar alunos</p>
                </button>

                {/* Recados */}
                <button
                  onClick={() => handlePageChange('recados')}
                  className="card-modern p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 border-2 border-pink-200 hover:border-pink-400 text-center animate-scale-in delay-300 sm:col-span-2 lg:col-span-1"
                >
                  <div className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-modern w-fit mx-auto mb-4 sm:mb-6 hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-pink-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-pink-900 mb-2 sm:mb-3">Recados</h3>
                  <p className="text-sm sm:text-base text-pink-700 font-semibold">Comunicar com pais</p>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}