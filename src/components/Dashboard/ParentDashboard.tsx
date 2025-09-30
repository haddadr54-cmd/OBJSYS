import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BookOpen, Calendar, MessageSquare, FileText, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import { ItemDetailModal } from '../Modals/ItemDetailModal';
import { useAuth } from '../../contexts/auth';
import { useDataService } from '../../lib/dataService';
import { registrarVisualizacao } from '../../lib/supabase';
// Import centralizado dos títulos das páginas para evitar dependência circular com App
import { pageTitles } from '../../utils/pageTitles';
import { SidebarManager } from '../Layout/SidebarManager';
import { Header } from '../Layout/Header';
import { getMediaGradientClasses, formatarNota } from '../../lib/gradeConfig';
// Lazy loaded pages to reduce initial bundle size
const NotasPage = lazy(() => import('../Pages/NotasPage').then(m => ({ default: m.NotasPage })));
const AgendaPage = lazy(() => import('../Pages/AgendaPage').then(m => ({ default: m.AgendaPage })));
const MateriaisPage = lazy(() => import('../Pages/MateriaisPage').then(m => ({ default: m.MateriaisPage })));
const RecadosPage = lazy(() => import('../Pages/RecadosPage').then(m => ({ default: m.RecadosPage })));
const PerfilPage = lazy(() => import('../Pages/PerfilPage').then(m => ({ default: m.PerfilPage })));
const NotificacoesPage = lazy(() => import('../Pages/NotificacoesPage').then(m => ({ default: m.NotificacoesPage })));
import { StudentProfileModal } from '../Modals/StudentProfileModal'; // Força re-resolução
import type { Aluno, Nota, ProvaTarefa, Recado, Turma } from '../../lib/supabase.types';

interface ParentDashboardProps {
  onNavigate?: (page: string) => void;
  // The current page is passed as a prop to allow the dashboard to render the correct sub-page.
  currentPage?: string;
}

export function ParentDashboard({ onNavigate, currentPage = 'dashboard' }: ParentDashboardProps) {
  const { user, isSupabaseConnected, signOut } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [allNotas, setAllNotas] = useState<Nota[]>([]);
  const [proximasProvas, setProximasProvas] = useState<ProvaTarefa[]>([]);
  const [allProvasTarefas, setAllProvasTarefas] = useState<ProvaTarefa[]>([]);
  const [allRecados, setAllRecados] = useState<Recado[]>([]);
  const [allTurmas, setAllTurmas] = useState<Turma[]>([]);
  const [allDisciplinas, setAllDisciplinas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProvaTarefa | Recado | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'prova_tarefa' | 'recado'>('prova_tarefa');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

  const handleLogout = useCallback(async () => {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
      await signOut();
    }
  }, [signOut]);

  const handleNavigate = useCallback((pageId: string) => {
    console.log('🔍 [ParentDashboard] handleNavigate chamado:', {
      pageId,
      currentPage,
      userType: user?.tipo_usuario,
      timestamp: new Date().toISOString()
    });
    
    if (pageId === 'sair') {
      handleLogout();
    } else {
      console.log('🔍 [ParentDashboard] Chamando onNavigate com:', pageId);
      onNavigate?.(pageId);
    }
    setSidebarOpen(false);
  }, [onNavigate, handleLogout]);

  useEffect(() => {
    if (user) {
      fetchDashboardData(); // Fetch all necessary data for the dashboard and modals
    }
    
    // Escutar eventos de navegação do header
    const handleCustomEventNavigation = (event: CustomEvent) => {
      handleNavigate(event.detail);
    };

    window.addEventListener('navigate', handleCustomEventNavigation as EventListener);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('navigate', handleCustomEventNavigation as EventListener);
    };
  }, [user, isSupabaseConnected, handleNavigate]);

  const fetchDashboardData = async () => {
    try {
      const [alunosData, turmasData, notasData, provasTarefasData, recadosData, disciplinasData] = await Promise.all([
        dataService.getAlunos(),
        dataService.getTurmas(),
        dataService.getNotas(),
        dataService.getProvasTarefas(), // Fetch all provas/tarefas
        dataService.getRecados(), // Fetch all recados
        dataService.getDisciplinas() // Fetch all disciplines
      ]);

      console.log('🏠 [ParentDashboard] Dados carregados:', {
        alunos: alunosData.length,
        turmas: turmasData.length,
        notas: notasData.length,
        provasTarefas: provasTarefasData.length,
        recados: recadosData.length,
        disciplinas: disciplinasData.length
      });
      
      console.log('🏠 [ParentDashboard] Primeiro aluno:', alunosData[0]);
      console.log('🏠 [ParentDashboard] Primeira nota:', notasData[0]);

      setAlunos(alunosData);
      setAllTurmas(turmasData); // Set all turmas
      setAllNotas(notasData); // Set all notas
      
      // Filtrar próximas provas/tarefas
      const hoje = new Date().toISOString().split('T')[0];
      const proximasProvasData = provasTarefasData.filter(p => {
        const dataField = isSupabaseConnected ? p.data : (p as any).data_entrega;
        return dataField >= hoje;
      }).sort((a, b) => {
        const dataA = isSupabaseConnected ? a.data : (a as any).data_entrega;
        const dataB = isSupabaseConnected ? b.data : (b as any).data_entrega;
        return dataA.localeCompare(dataB);
      });

      setProximasProvas(proximasProvasData);
      setAllProvasTarefas(provasTarefasData); // Set all provas/tarefas
      setAllRecados(recadosData); // Set all recados
      setAllDisciplinas(disciplinasData); // Set all disciplines
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewItem = async (item: ProvaTarefa | Recado, type: 'prova_tarefa' | 'recado') => {
    try {
      await registrarVisualizacao(type, item.id);
    } catch (error) {
      console.error('Erro ao registrar visualização:', error);
    }
    
    setSelectedItem(item);
    setSelectedItemType(type);
    setShowDetailModal(true);
  };

  const [showStudentProfileModal, setShowStudentProfileModal] = useState(false); // State to control StudentProfileModal visibility

  const handleViewAlunoDetails = (aluno: Aluno) => {
    console.log('🎓 [ParentDashboard] Card do aluno clicado!', { 
      aluno: aluno.nome,
      alunoId: aluno.id,
      turma: aluno.turma?.nome,
      timestamp: new Date().toISOString()
    });
    setSelectedAluno(aluno);
    setShowStudentProfileModal(true);
  };

  // Se não estiver no dashboard, renderizar a página específica
  if (currentPage !== 'dashboard') {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <SidebarManager
          currentPage={currentPage}
          onPageChange={handleNavigate}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            title={pageTitles[currentPage] || 'Portal do Responsável'}
          />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto mobile-container">
              <Suspense fallback={<div className="py-10 text-center text-gray-500 font-medium">Carregando página...</div>}>
                {currentPage === 'notas' && <NotasPage />}
                {currentPage === 'agenda' && <AgendaPage />}
                {currentPage === 'materiais' && <MateriaisPage />}
                {currentPage === 'recados' && <RecadosPage />}
                {currentPage === 'notificacoes' && <NotificacoesPage />}
                {currentPage === 'perfil' && <PerfilPage />}
              </Suspense>
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
        onPageChange={handleNavigate}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title="Portal do Responsável"
        />
        
        <main className="content-modern">
          <div className="mobile-container space-y-6 sm:space-y-8 lg:space-y-12">
        {/* Header de Boas-vindas */}
            <div className="glass-card rounded-2xl sm:rounded-3xl mobile-card animate-slide-in-up hover-lift">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h1 className="mobile-heading heading-modern animate-glow">
                    Olá, {user?.nome.split(' ')[0]}! 👋
                  </h1>
                  <p className="text-gray-600 mt-2 sm:mt-4 text-base sm:text-xl font-semibold subheading-modern">
                    Acompanhe o desenvolvimento acadêmico dos seus filhos
                  </p>
                </div>
                <div className="flex items-center justify-center sm:justify-end">
                  <div className="flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl sm:rounded-3xl text-sm sm:text-base font-black shadow-modern animate-bounce-soft status-online">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full animate-pulse shadow-lg"></div>
                    <span className="hidden sm:inline">Online</span>
                    <span className="sm:hidden">✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo dos Filhos */}
            {alunos.length > 0 && (
              <div className="glass-card rounded-2xl sm:rounded-3xl mobile-card animate-slide-in-up delay-100">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gradient-objetivo mb-6 sm:mb-8 lg:mb-12 flex items-center">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl shadow-modern mr-3 sm:mr-6 animate-bounce-soft">
                    <Star className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
                  </div> 
                  ⭐ Resumo dos Seus Filhos
                </h2>
                <div className="mobile-grid">
                  {alunos.map((aluno) => {
                    return (
                      <div key={aluno.id} className="card-modern mobile-card bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 border-2 border-blue-300 hover:border-blue-500 animate-scale-in cursor-pointer select-none" onClick={() => handleViewAlunoDetails(aluno)} style={{ 
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none'
                      }}>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-4 sm:mb-6">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center text-white font-black text-xl sm:text-2xl lg:text-3xl shadow-modern-colored animate-float mx-auto sm:mx-0">
                            {aluno.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-center sm:text-left">
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900">{aluno.nome}</h3>
                            <p className="text-sm sm:text-base text-gray-700 font-bold">🏫 {aluno.turma?.nome}</p>
                            <p className="text-xs sm:text-sm text-gray-600 font-semibold">📅 {aluno.turma?.ano_letivo}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 sm:pt-6 border-t-2 border-blue-300">
                          <span className="text-sm sm:text-base font-black text-gray-800 whitespace-nowrap">📊 Média Geral:</span>
                          <div className={`px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl lg:text-2xl shadow-modern animate-glow ${getMediaGradientClasses(dataService.calcularMediaAluno(aluno.id, allNotas))}`}>
                            {formatarNota(dataService.calcularMediaAluno(aluno.id, allNotas))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Menu Principal */}
            <div className="mobile-grid">
              {/* Notas & Boletim */}
              <button
                onClick={() => handleNavigate('notas')}
                className="card-modern group mobile-card bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-400 text-left animate-scale-in delay-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl sm:rounded-3xl text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-modern-colored mx-auto sm:mx-0">
                    <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-black text-blue-900">Notas</h3>
                    <p className="text-sm sm:text-base text-blue-700 font-bold">Boletim escolar</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-blue-600 animate-glow">{allNotas.length}</span>
                  <span className="text-xs sm:text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 font-black bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg">
                    <span className="hidden sm:inline">Ver boletim →</span>
                    <span className="sm:hidden">Ver →</span>
                  </span>
                </div>
              </button>

              {/* Agenda */}
              <button
                onClick={() => handleNavigate('agenda')}
                className="card-modern group mobile-card bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-2 border-amber-200 hover:border-amber-400 text-left animate-scale-in delay-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl sm:rounded-3xl text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-modern-colored mx-auto sm:mx-0">
                    <Calendar className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-black text-amber-900">Agenda</h3>
                    <p className="text-sm sm:text-base text-amber-700 font-bold">Provas e tarefas</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-amber-600 animate-glow">{proximasProvas.length}</span>
                  <span className="text-xs sm:text-sm text-amber-600 opacity-0 group-hover:opacity-100 transition-all duration-300 font-black bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg">
                    <span className="hidden sm:inline">Ver agenda →</span>
                    <span className="sm:hidden">Ver →</span>
                  </span>
                </div>
              </button>

              {/* Materiais */}
              <button
                onClick={() => handleNavigate('materiais')}
                className="card-modern group mobile-card bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-2 border-emerald-200 hover:border-emerald-400 text-left animate-scale-in delay-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl sm:rounded-3xl text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-modern-colored mx-auto sm:mx-0">
                    <FileText className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-black text-emerald-900">Materiais</h3>
                    <p className="text-sm sm:text-base text-emerald-700 font-bold">Recursos didáticos</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg sm:text-2xl font-black text-emerald-600 animate-glow">Disponível</span>
                  <span className="text-xs sm:text-sm text-emerald-600 opacity-0 group-hover:opacity-100 transition-all duration-300 font-black bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg">
                    <span className="hidden sm:inline">Ver materiais →</span>
                    <span className="sm:hidden">Ver →</span>
                  </span>
                </div>
              </button>

              {/* Recados */}
              <button
                onClick={() => handleNavigate('recados')}
                className="card-modern group mobile-card bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-400 text-left animate-scale-in delay-400"
              >
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl sm:rounded-3xl text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-modern-colored mx-auto sm:mx-0">
                    <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-black text-purple-900">Recados</h3>
                    <p className="text-sm sm:text-base text-purple-700 font-bold">Comunicados</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-purple-600 animate-glow">{allRecados.length}</span>
                  <span className="text-xs sm:text-sm text-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300 font-black bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg">
                    <span className="hidden sm:inline">Ver recados →</span>
                    <span className="sm:hidden">Ver →</span>
                  </span>
                </div>
              </button>
            </div>

            {/* Alertas Importantes */}
            {proximasProvas.length > 0 && (
              <div className="glass-card rounded-2xl sm:rounded-3xl mobile-card bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200 animate-slide-in-up delay-200">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6 sm:mb-8">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl sm:rounded-2xl shadow-modern animate-bounce-soft mx-auto sm:mx-0">
                    <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-amber-900">
                      ⚠️ Próximas Avaliações
                    </h3>
                    <p className="text-amber-700 font-bold text-sm sm:text-base lg:text-lg">Fique atento às datas importantes</p>
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  {proximasProvas.slice(0, 3).map((prova) => {
                    const dataField = isSupabaseConnected ? prova.data : (prova as any).data_entrega;
                    const hoje = new Date().toISOString().split('T')[0];
                    const isHoje = dataField === hoje;
                    const diffTime = new Date(dataField).getTime() - new Date(hoje).getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div 
                        key={prova.id}
                        className="card-modern p-4 sm:p-6 bg-white border-2 border-amber-200 hover:border-amber-400 cursor-pointer interactive-modern"
                        onClick={() => handleViewItem(prova, 'prova_tarefa')}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                          <div>
                            <h4 className="font-black text-gray-900 text-base sm:text-lg">{prova.titulo}</h4>
                            <p className="text-gray-600 font-semibold text-sm sm:text-base">{prova.disciplina?.nome}</p>
                          </div>
                          <div className="text-center sm:text-right">
                            <div className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base font-black shadow-lg animate-pulse ${
                              isHoje ? 'bg-red-500 text-white animate-pulse' :
                              diffDays <= 3 ? 'bg-amber-500 text-white' :
                              'bg-green-500 text-white'
                            }`}>
                              {isHoje ? '🔔 HOJE' : `${diffDays} dias`}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 font-semibold">
                              {new Date(dataField).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Estatísticas Gerais */}
            <div className="glass-card rounded-2xl sm:rounded-3xl mobile-card animate-slide-in-up delay-300">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-modern mr-0 sm:mr-4 animate-bounce-soft mx-auto sm:mx-0">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-center sm:text-left">Resumo Geral</span>
              </h2>
              <div className="mobile-stats-grid">
                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl hover-lift">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600 mb-2 sm:mb-3 animate-glow">{alunos.length}</div>
                  <div className="text-xs sm:text-sm lg:text-base font-bold text-blue-800">👨‍👩‍👧‍👦 Filhos</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl sm:rounded-2xl hover-lift">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-600 mb-2 sm:mb-3 animate-glow">{allNotas.length}</span>
                  <div className="text-xs sm:text-sm lg:text-base font-bold text-emerald-800">📝 Notas</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl sm:rounded-2xl hover-lift">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-600 mb-2 sm:mb-3 animate-glow">{proximasProvas.length}</div>
                  <div className="text-xs sm:text-sm lg:text-base font-bold text-amber-800">📅 Próximas Provas</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl sm:rounded-2xl hover-lift">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-purple-600 mb-2 sm:mb-3 animate-glow">
                    {alunos.length > 0
                      ? formatarNota(alunos.reduce((acc, aluno) => acc + dataService.calcularMediaAluno(aluno.id, allNotas), 0) / alunos.length)
                      : '0.0'
                    }
                  </div>
                  <div className="text-xs sm:text-sm lg:text-base font-bold text-purple-800">📊 Média Geral</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de detalhes */}
      <ItemDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={selectedItem}
        type={selectedItemType}
        turmaName={
          selectedItemType === 'prova_tarefa' && selectedItem 
            ? (() => {
                const prova = selectedItem as ProvaTarefa;
                if (isSupabaseConnected) {
                  return allTurmas.find(t => t.id === prova.disciplina?.turma_id)?.nome;
                } else {
                  const { localDB } = require('../../lib/localDatabase');
                  return localDB.getTurmas().find((t: any) => t.id === (prova as any).turma_id)?.nome;
                }
              })()
            : undefined
        }
        disciplinaName={
          selectedItemType === 'prova_tarefa' && selectedItem 
            ? (() => {
                const prova = selectedItem as ProvaTarefa;
                if (isSupabaseConnected) {
                  return prova.disciplina?.nome;
                } else {
                  const { localDB } = require('../../lib/localDatabase');
                  const disciplinas = localDB.getDisciplinas();
                  return disciplinas.find((d: any) => d.id === prova.disciplina_id)?.nome;
                }
              })()
            : undefined
        }
        autorName={
          selectedItemType === 'recado' && selectedItem 
            ? (() => {
                const recado = selectedItem as Recado;
                if (isSupabaseConnected) {
                  return recado.autor?.nome;
                } else {
                  const { localDB } = require('../../lib/localDatabase');
                  const usuarios = localDB.getUsuarios();
                  return usuarios.find((u: any) => u.id === (recado as any).autor_id)?.nome;
                }
              })()
            : undefined
        }
      />

      {/* Student Profile Modal */}
      {selectedAluno && showStudentProfileModal && (
        <StudentProfileModal
          isOpen={showStudentProfileModal}
          onClose={() => {
            console.log('🔒 [ParentDashboard] Fechando modal do perfil do aluno');
            setShowStudentProfileModal(false);
            setSelectedAluno(null);
          }}
          aluno={selectedAluno}
          allNotas={allNotas}
          allProvasTarefas={allProvasTarefas}
          allRecados={allRecados}
          _allTurmas={allTurmas}
          allDisciplinas={allDisciplinas}
        />
      )}
    </div>
  );
}