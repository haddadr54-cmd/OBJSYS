import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Filter, Eye, Edit, Trash2, BookOpen, Users, CheckCircle, AlertCircle, Grid, School } from 'lucide-react';
import { ItemDetailModal } from '../Modals/ItemDetailModal';
import { useAuth } from '../../contexts/AuthContext';
import { useDataService } from '../../lib/dataService';
import { getEstatisticasVisualizacao, getVisualizacoesByItem, registrarVisualizacao, getHorariosByTurma } from '../../lib/supabase';
import type { ProvaTarefa, Turma, Disciplina } from '../../lib/supabase';
import { ProvaTarefaModal } from '../Modals/ProvaTarefaModal';

export function AgendaPage() {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [provasTarefas, setProvasTarefas] = useState<ProvaTarefa[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'agenda' | 'cronograma'>('agenda');
  const [visualizacoes, setVisualizacoes] = useState<any>({});
  const [showVisualizacoes, setShowVisualizacoes] = useState<{ [key: string]: boolean }>({});
  const [filtros, setFiltros] = useState({
    turma: '',
    disciplina: '',
    tipo: '',
    periodo: 'proximas'
  });
  const [showModal, setShowModal] = useState(false);
  const [editingProvaTarefa, setEditingProvaTarefa] = useState<ProvaTarefa | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProvaTarefa | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (user?.tipo_usuario === 'pai' && turmas.length > 0) {
      fetchHorarios();
    }
  }, [user, turmas]);

  const fetchData = async () => {
    try {
      const [provasData, turmasData, disciplinasData] = await Promise.all([
        dataService.getProvasTarefas(),
        dataService.getTurmas(),
        dataService.getDisciplinas()
      ]);
      
      setProvasTarefas(provasData);
      setTurmas(turmasData);
      setDisciplinas(disciplinasData);
      
      // Buscar visualizações para professores e admins
      if (user!.tipo_usuario === 'professor' || user!.tipo_usuario === 'admin') {
        await fetchVisualizacoes();
      }
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHorarios = async () => {
    try {
      const todosHorarios: any[] = [];
      for (const turma of turmas) {
        const horariosTurma = await getHorariosByTurma(turma.id);
        todosHorarios.push(...horariosTurma.map(h => ({ ...h, turma })));
      }
      setHorarios(todosHorarios);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    }
  };

  const provasFiltradas = provasTarefas.filter(prova => {
    const hoje = new Date().toISOString().split('T')[0];
    const dataProva = prova.data;
    
    let filtroData = true;
    if (filtros.periodo === 'proximas') {
      filtroData = dataProva >= hoje;
    } else if (filtros.periodo === 'passadas') {
      filtroData = dataProva < hoje;
    } else if (filtros.periodo === 'hoje') {
      filtroData = dataProva === hoje;
    } else if (filtros.periodo === 'semana') {
      const proximaSemana = new Date();
      proximaSemana.setDate(proximaSemana.getDate() + 7);
      filtroData = dataProva >= hoje && dataProva <= proximaSemana.toISOString().split('T')[0];
    }

    return (
      filtroData &&
      (!filtros.turma || prova.disciplina?.turma_id === filtros.turma) &&
      (!filtros.disciplina || prova.disciplina_id === filtros.disciplina) &&
      (!filtros.tipo || prova.tipo === filtros.tipo)
    );
  });

  const agruparPorData = (provas: ProvaTarefa[]) => {
    const grupos: { [key: string]: ProvaTarefa[] } = {};
    provas.forEach(prova => {
      const data = prova.data;
      if (!grupos[data]) {
        grupos[data] = [];
      }
      grupos[data].push(prova);
    });
    return grupos;
  };

  const getDiasSemanaNomes = () => {
    return ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  };

  const getHorariosPorDia = (dia: number) => {
    return horarios.filter(h => h.dia_semana === dia).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  };

  const renderCronogramaView = () => {
    if (horarios.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum horário encontrado</h3>
          <p className="text-gray-500">Os horários das aulas dos seus filhos aparecerão aqui quando forem configurados.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Resumo por Turma - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {turmas.map(turma => {
            const horariosTurma = horarios.filter(h => h.turma_id === turma.id);
            const disciplinasUnicas = new Set(horariosTurma.map(h => h.disciplina_id)).size;
            
            return (
              <div key={turma.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {turma.nome.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{turma.nome}</h3>
                    <p className="text-xs text-gray-500">{turma.ano_letivo}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Aulas/semana:</span>
                    <span className="text-xs font-medium text-gray-900">{horariosTurma.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Disciplinas:</span>
                    <span className="text-xs font-medium text-gray-900">{disciplinasUnicas}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grade de Horários por Turma */}
        {turmas.map(turma => {
          const horariosTurma = horarios.filter(h => h.turma_id === turma.id);
          if (horariosTurma.length === 0) return null;
          
          return (
            <div key={turma.id} className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <School className="h-5 w-5 text-blue-600" />
                  <h2 className="text-base font-semibold text-gray-900">{turma.nome}</h2>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {turma.ano_letivo}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                {/* Mobile-First Schedule Layout */}
                <div className="block md:hidden">
                  {/* Mobile: Day-by-day view */}
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6, 7].map((dia) => {
                      const horariosNoDia = horariosTurma.filter(h => h.dia_semana === dia);
                      if (horariosNoDia.length === 0) return null;
                      
                      const diasNomes = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
                      const diasEmojis = ['📚', '📖', '✏️', '📝', '🎯', '🌟', '🎨'];
                      const diasCores = ['blue', 'green', 'purple', 'amber', 'red', 'indigo', 'pink'];
                      
                      return (
                        <div key={dia} className={`bg-gradient-to-r from-${diasCores[dia - 1]}-50 to-${diasCores[dia - 1]}-100 rounded-2xl p-4 border-2 border-${diasCores[dia - 1]}-200 shadow-lg`}>
                          <h4 className={`font-black text-${diasCores[dia - 1]}-800 mb-4 text-center text-lg flex items-center justify-center space-x-2`}>
                            <span className="text-2xl">{diasEmojis[dia - 1]}</span>
                            <span>{diasNomes[dia - 1]}</span>
                          </h4>
                          <div className="space-y-3">
                            {horariosNoDia
                              .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                              .map((horario) => (
                                <div
                                  key={horario.id}
                                  className="p-4 rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 bg-white border-l-4"
                                  style={{ 
                                    borderLeftColor: horario.disciplina?.cor,
                                    background: `linear-gradient(135deg, ${horario.disciplina?.cor}10, ${horario.disciplina?.cor}20)`
                                  }}
                                  onClick={() => {
                                    alert(`📚 ${horario.disciplina?.nome}\n\n👨‍🏫 Professor: ${horario.professor?.nome || 'Não atribuído'}\n\n🕐 Horário: ${horario.hora_inicio} - ${horario.hora_fim}\n\n🏫 Local: ${horario.sala || 'Não informada'}\n\n📝 Observações: ${horario.observacoes || 'Sem observações especiais'}`);
                                  }}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        className="w-4 h-4 rounded-full shadow-sm"
                                        style={{ backgroundColor: horario.disciplina?.cor }}
                                      ></div>
                                      <div className="font-black text-gray-900 text-base" title={horario.disciplina?.nome}>
                                        {horario.disciplina?.nome}
                                      </div>
                                    </div>
                                    <div className={`px-3 py-1 bg-${diasCores[dia - 1]}-100 text-${diasCores[dia - 1]}-800 rounded-full text-xs font-bold`}>
                                      {horario.hora_inicio} - {horario.hora_fim}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="text-gray-700 text-sm font-semibold flex items-center space-x-1" title={horario.professor?.nome}>
                                      <span>👨‍🏫</span>
                                      <span>{horario.professor?.nome || 'Professor TBD'}</span>
                                    </div>
                                    {horario.sala && (
                                      <div className="text-gray-600 text-xs font-medium flex items-center space-x-1 bg-white px-2 py-1 rounded-full" title={`Sala: ${horario.sala}`}>
                                        <span>📍</span>
                                        <span>{horario.sala}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Desktop: Traditional grid view - Enhanced */}
                <div className="hidden md:block overflow-x-auto">
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-8 gap-0 min-w-[700px]">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-3 border border-gray-300 font-black text-gray-800 text-center text-sm">
                        ⏰ Horário
                      </div>
                      {getDiasSemanaNomes().map((dia, index) => {
                        const diasEmojis = ['📚', '📖', '✏️', '📝', '🎯', '🌟', '🎨'];
                        const diasCores = ['blue', 'green', 'purple', 'amber', 'red', 'indigo', 'pink'];
                        return (
                          <div key={index} className={`bg-gradient-to-b from-${diasCores[index]}-100 to-${diasCores[index]}-200 p-3 border border-gray-300 font-black text-${diasCores[index]}-800 text-center text-sm`}>
                            <div className="flex flex-col items-center space-y-1">
                              <span className="text-lg">{diasEmojis[index]}</span>
                              <span>{dia}</span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Horários */}
                      {Array.from({ length: 8 }, (_, i) => {
                        const hora = 7 + i;
                        const horaFormatada = `${hora.toString().padStart(2, '0')}:00`;
                        
                        return (
                          <React.Fragment key={i}>
                            <div className="p-3 border border-gray-300 text-center text-sm text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 font-bold">
                              {horaFormatada}
                            </div>
                            {[1, 2, 3, 4, 5, 6, 7].map((dia) => {
                              const horariosNoDia = horariosTurma.filter(h => {
                                const horaInicio = parseInt(h.hora_inicio.split(':')[0]);
                                return h.dia_semana === dia && horaInicio === hora;
                              });
                              
                              return (
                                <div key={dia} className="p-2 border border-gray-300 min-h-[70px] bg-white hover:bg-gray-50 transition-colors">
                                  {horariosNoDia.map((horario) => (
                                    <div
                                      key={horario.id}
                                      className="p-2 rounded-lg text-xs mb-1 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 border-l-4"
                                      style={{ 
                                        backgroundColor: horario.disciplina?.cor + '25', 
                                        borderLeftColor: horario.disciplina?.cor,
                                        background: `linear-gradient(135deg, ${horario.disciplina?.cor}20, ${horario.disciplina?.cor}35)`
                                      }}
                                      onClick={() => {
                                        alert(`📚 ${horario.disciplina?.nome}\n\n👨‍🏫 Professor: ${horario.professor?.nome || 'Não atribuído'}\n\n🕐 Horário: ${horario.hora_inicio} - ${horario.hora_fim}\n\n🏫 Local: ${horario.sala || 'Não informada'}\n\n📝 Observações: ${horario.observacoes || 'Sem observações especiais'}`);
                                      }}
                                    >
                                      <div className="font-black text-gray-900 truncate text-sm mb-1" title={horario.disciplina?.nome}>
                                        {horario.disciplina?.nome}
                                      </div>
                                      <div className="text-gray-700 truncate text-xs font-semibold" title={horario.professor?.nome}>
                                        👨‍🏫 {horario.professor?.nome || 'Professor TBD'}
                                      </div>
                                      {horario.sala && (
                                        <div className="text-gray-600 truncate text-xs font-medium" title={`Sala: ${horario.sala}`}>
                                          📍 {horario.sala}
                                        </div>
                                      )}
                                      <div className="text-gray-500 text-xs font-bold mt-1">
                                        🕐 {horario.hora_inicio} - {horario.hora_fim}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Legenda Enhanced */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
                    <h4 className="text-sm font-black text-gray-900 mb-3 flex items-center">
                      <span className="text-lg mr-2">🎨</span>
                      Disciplinas da Turma:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {[...new Set(horariosTurma.map(h => h.disciplina_id))].map(disciplinaId => {
                        const disciplina = horariosTurma.find(h => h.disciplina_id === disciplinaId)?.disciplina;
                        if (!disciplina) return null;
                        
                        return (
                          <div key={disciplinaId} className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-sm">
                            <div 
                              className="w-4 h-4 rounded-full shadow-sm"
                              style={{ backgroundColor: disciplina.cor }}
                            ></div>
                            <span className="text-sm font-semibold text-gray-800 truncate">{disciplina.nome}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const fetchVisualizacoes = async () => {
    try {
      const stats: any = {};
      for (const prova of provasTarefas) {
        const estatisticas = await getEstatisticasVisualizacao('prova_tarefa', prova.id);
        stats[prova.id] = { stats: estatisticas };
      }
      setVisualizacoes(stats);
    } catch (error) {
      console.error('Erro ao buscar visualizações:', error);
    }
  };

  const toggleVisualizacoes = async (provaId: string) => {
    if (!showVisualizacoes[provaId]) {
      try {
        const detalhes = await getVisualizacoesByItem('prova_tarefa', provaId);
        setVisualizacoes(prev => ({
          ...prev,
          [provaId]: {
            ...prev[provaId],
            detalhes
          }
        }));
      } catch (error) {
        console.error('Erro ao buscar detalhes de visualização:', error);
      }
    }
    
    setShowVisualizacoes(prev => ({
      ...prev,
      [provaId]: !prev[provaId]
    }));
  };

  const handleViewItem = async (prova: ProvaTarefa) => {
    if (user!.tipo_usuario === 'pai') {
      try {
        await registrarVisualizacao('prova_tarefa', prova.id);
      } catch (error) {
        console.error('Erro ao registrar visualização:', error);
      }
    }
    
    // Abrir modal de detalhes
    setSelectedItem(prova);
    setShowDetailModal(true);
  };

  const handleEdit = (provaTarefa: ProvaTarefa) => {
    setEditingProvaTarefa(provaTarefa);
    setShowModal(true);
  };

  const handleDelete = async (provaTarefa: ProvaTarefa) => {
    if (confirm(`Tem certeza que deseja excluir "${provaTarefa.titulo}"?`)) {
      try {
        await dataService.deleteProvaTarefa(provaTarefa.id);
        fetchData();
      } catch (error) {
        console.error('Erro ao excluir prova/tarefa:', error);
        alert('Erro ao excluir prova/tarefa');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProvaTarefa(null);
  };

  const handleModalSave = () => {
    fetchData();
  };

  const gruposProvas = agruparPorData(provasFiltradas);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {user!.tipo_usuario === 'pai' ? '📅 Agenda dos Filhos' : 
               user!.tipo_usuario === 'professor' ? 'Minhas Provas & Tarefas' : 
               'Agenda Escolar'}
            </h1>
            {user!.tipo_usuario === 'pai' && (
              <p className="text-gray-600 text-lg font-medium">Acompanhe todas as atividades escolares</p>
            )}
          </div>
        </div>
        {(user!.tipo_usuario === 'professor' || user!.tipo_usuario === 'admin') && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Prova/Tarefa</span>
          </button>
        )}
      </div>

      {/* Tabs para Pais */}
      {user!.tipo_usuario === 'pai' && (
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-lg border-2 border-blue-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-2 sm:space-x-8 px-4 sm:px-6">
              <button
                onClick={() => setActiveTab('agenda')}
                className={`py-4 px-3 sm:px-1 border-b-4 font-bold text-sm sm:text-base transition-all duration-300 ${
                  activeTab === 'agenda'
                    ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded-t-lg'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`p-2 rounded-lg ${activeTab === 'agenda' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="hidden sm:inline">Provas & Tarefas</span>
                  <span className="sm:hidden">Agenda</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('cronograma')}
                className={`py-4 px-3 sm:px-1 border-b-4 font-bold text-sm sm:text-base transition-all duration-300 ${
                  activeTab === 'cronograma'
                    ? 'border-purple-500 text-purple-600 bg-purple-50 rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50 rounded-t-lg'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`p-2 rounded-lg ${activeTab === 'cronograma' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="hidden sm:inline">Cronograma de Aulas</span>
                  <span className="sm:hidden">Horários</span>
                </div>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Conteúdo baseado na aba ativa */}
      {user!.tipo_usuario === 'pai' && activeTab === 'cronograma' ? (
        renderCronogramaView()
      ) : (
        <>
          {/* Resumo */}
          {(user!.tipo_usuario !== 'pai' || activeTab === 'agenda') && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border-2 border-blue-200 p-4 sm:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-wide">Hoje</p>
                  <p className="text-2xl sm:text-3xl font-black text-blue-700">
                    {provasTarefas.filter(p => {
                      const dataProva = p.data;
                      return dataProva === new Date().toISOString().split('T')[0];
                    }).length}
                  </p>
                  <p className="text-xs text-blue-500 font-medium">atividades</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-lg border-2 border-yellow-200 p-4 sm:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-yellow-600 uppercase tracking-wide">Esta Semana</p>
                  <p className="text-2xl sm:text-3xl font-black text-yellow-700">
                    {(() => {
                      const hoje = new Date().toISOString().split('T')[0];
                      const proximaSemana = new Date();
                      proximaSemana.setDate(proximaSemana.getDate() + 7);
                      return provasTarefas.filter(p => {
                        const dataProva = p.data;
                        return dataProva >= hoje && 
                               dataProva <= proximaSemana.toISOString().split('T')[0];
                      }
                      ).length;
                    })()}
                  </p>
                  <p className="text-xs text-yellow-500 font-medium">atividades</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-lg border-2 border-red-200 p-4 sm:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-red-600 uppercase tracking-wide">Provas</p>
                  <p className="text-2xl sm:text-3xl font-black text-red-700">
                    {provasTarefas.filter(p => p.tipo === 'prova').length}
                  </p>
                  <p className="text-xs text-red-500 font-medium">avaliações</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">P</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg border-2 border-green-200 p-4 sm:p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-green-600 uppercase tracking-wide">Trabalhos</p>
                  <p className="text-2xl sm:text-3xl font-black text-green-700">
                    {provasTarefas.filter(p => ['tarefa', 'trabalho', 'projeto'].includes(p.tipo)).length}
                  </p>
                  <p className="text-xs text-green-500 font-medium">atividades</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">T</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* Filtros - apenas para agenda */}
          {(user!.tipo_usuario !== 'pai' || activeTab === 'agenda') && (
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg border-2 border-gray-200 p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <h3 className="font-black text-gray-900 text-base sm:text-lg">🔍 Filtros</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">📅 Período</label>
                  <select
                    value={filtros.periodo}
                    onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold bg-white shadow-sm"
                  >
                    <option value="proximas">Próximas</option>
                    <option value="hoje">Hoje</option>
                    <option value="semana">Esta semana</option>
                    <option value="passadas">Passadas</option>
                    <option value="todas">Todas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">🏫 Turma</label>
                  <select
                    value={filtros.turma}
                    onChange={(e) => setFiltros({ ...filtros, turma: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold bg-white shadow-sm"
                  >
                    <option value="">Todas as turmas</option>
                    {turmas.map(turma => (
                      <option key={turma.id} value={turma.id}>{turma.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">📚 Disciplina</label>
                  <select
                    value={filtros.disciplina}
                    onChange={(e) => setFiltros({ ...filtros, disciplina: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold bg-white shadow-sm"
                  >
                    <option value="">Todas as disciplinas</option>
                    {disciplinas.map(disciplina => (
                      <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">📝 Tipo</label>
                  <select
                    value={filtros.tipo}
                    onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold bg-white shadow-sm"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="prova">Prova</option>
                    <option value="tarefa">Tarefa</option>
                    <option value="trabalho">Trabalho</option>
                    <option value="projeto">Projeto</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Lista de provas/tarefas agrupadas por data */}
          <div className="space-y-6">
            {Object.keys(gruposProvas).length === 0 ? (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-gray-200 p-12 text-center">
                <div className="p-6 bg-gray-100 rounded-full w-fit mx-auto mb-6">
                  <Calendar className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">📅 Nenhuma atividade encontrada</h3>
                <p className="text-gray-600 text-lg">Ajuste os filtros ou aguarde novas atividades.</p>
              </div>
            ) : (
              Object.entries(gruposProvas).map(([data, provas]) => (
                <div key={data} className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-200 overflow-hidden">
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black">
                          📅 {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </h2>
                        <p className="text-blue-100 text-sm font-medium">
                          {new Date(data + 'T00:00:00').getFullYear()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
                          <div className="text-2xl font-black">{provas.length}</div>
                          <div className="text-xs font-bold">
                            {provas.length === 1 ? 'atividade' : 'atividades'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="space-y-4 sm:space-y-6">
                      {provas.map((prova) => {
                        const hoje = new Date().toISOString().split('T')[0];
                        const dataProva = prova.data;
                        const isVencida = dataProva < hoje;
                        const isHoje = dataProva === hoje;
                        const diffTime = new Date(dataProva).getTime() - new Date(hoje).getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        return (
                          <div 
                            key={prova.id} 
                            className={`p-4 sm:p-6 rounded-2xl transition-all cursor-pointer hover:shadow-2xl hover:scale-105 group border-2 ${
                              isVencida ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100' :
                              isHoje ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100 animate-pulse' :
                              diffDays <= 3 ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100' :
                              'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100'
                            }`}
                            onClick={() => handleViewItem(prova)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-3">
                                  <span className={`px-3 py-2 text-sm font-black rounded-xl shadow-md ${
                                    prova.tipo === 'prova' ? 'bg-red-500 text-white' :
                                    'bg-blue-500 text-white'
                                  }`}>
                                    {prova.tipo === 'prova' ? '📝 PROVA' : '📚 TAREFA'}
                                  </span>
                                  <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-xl shadow-sm">
                                    <div 
                                      className="w-4 h-4 rounded-full shadow-sm"
                                      style={{ backgroundColor: prova.disciplina?.cor || '#3B82F6' }}
                                    ></div>
                                    <span className="text-sm font-bold text-gray-800">
                                      {prova.disciplina?.nome}
                                    </span>
                                  </div>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-blue-700 transition-colors mb-2 leading-tight">{prova.titulo}</h3>
                                {prova.descricao && (
                                  <p className="text-sm sm:text-base text-gray-700 mb-3 font-medium leading-relaxed">{prova.descricao}</p>
                                )}
                                <div className="flex items-center space-x-3 text-sm mb-3">
                                  <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-xl shadow-sm">
                                    <span>🏫</span>
                                    <span className="font-bold text-gray-700">
                                      {turmas.find(t => t.id === prova.disciplina?.turma_id)?.nome}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-xl shadow-sm">
                                    <span>📅</span>
                                    <span className="font-bold text-gray-700">
                                      {new Date(dataProva).toLocaleDateString('pt-BR', {
                                        weekday: 'short',
                                        day: '2-digit',
                                        month: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 px-3 py-2 rounded-xl">
                                  👆 Toque para ver detalhes completos e dicas de preparação
                                </p>
                              </div>
                              <div className="flex flex-col items-end space-y-3">
                                {/* Status Badge */}
                                <div className={`px-4 py-3 rounded-2xl font-black text-sm shadow-lg ${
                                  isVencida ? 'bg-red-500 text-white' :
                                  isHoje ? 'bg-yellow-500 text-white animate-bounce' :
                                  diffDays <= 3 ? 'bg-orange-500 text-white' :
                                  'bg-green-500 text-white'
                                }`}>
                                  {isVencida ? '❌ VENCIDA' :
                                   isHoje ? '🔔 HOJE!' :
                                   diffDays <= 3 ? `⚠️ ${diffDays} DIAS` :
                                   `✅ ${diffDays} DIAS`}
                                </div>
                                
                                {/* Action Buttons for Teachers/Admins */}
                                {(user!.tipo_usuario === 'professor' || user!.tipo_usuario === 'admin') && (
                                  <div className="flex items-center space-x-2">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleVisualizacoes(prova.id);
                                      }}
                                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                      title="Ver quem visualizou"
                                    >
                                      {visualizacoes[prova.id]?.stats?.usuariosUnicos > 0 ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <AlertCircle className="h-4 w-4" />
                                      )}
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(prova);
                                      }}
                                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(prova);
                                      }}
                                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Estatísticas de Visualização */}
                            {(user!.tipo_usuario === 'professor' || user!.tipo_usuario === 'admin') && visualizacoes[prova.id] && (
                              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                  <span className="font-bold">📊 Visualizações:</span>
                                  <span className="font-black text-green-600">
                                    {visualizacoes[prova.id].stats.usuariosUnicos} usuários únicos
                                  </span>
                                </div>
                                {visualizacoes[prova.id].stats.ultimaVisualizacao && (
                                  <div className="text-xs text-gray-500">
                                    Última: {new Date(visualizacoes[prova.id].stats.ultimaVisualizacao).toLocaleString('pt-BR')}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Detalhes de Visualização */}
                            {showVisualizacoes[prova.id] && visualizacoes[prova.id]?.detalhes && (
                              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                                <h5 className="text-sm font-black text-gray-900 mb-3">📈 Histórico de Visualizações:</h5>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                  {visualizacoes[prova.id].detalhes.slice(0, 5).map((viz: any) => (
                                    <div key={viz.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg shadow-sm">
                                      <span className="font-bold text-gray-700">{viz.usuario?.nome}</span>
                                      <span className="font-medium text-gray-600">
                                        {new Date(viz.visualizado_em).toLocaleString('pt-BR', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                  ))}
                                  {visualizacoes[prova.id].detalhes.length > 5 && (
                                    <div className="text-xs font-bold text-blue-600 text-center pt-2 bg-blue-50 rounded-lg p-2">
                                      +{visualizacoes[prova.id].detalhes.length - 5} mais...
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Modal de criação/edição */}
      <ProvaTarefaModal
        isOpen={showModal}
        onClose={handleModalClose}
        provaTarefa={editingProvaTarefa}
        onSave={handleModalSave}
      />

      {/* Modal de detalhes */}
      <ItemDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={selectedItem}
        type="prova_tarefa"
        turmaName={selectedItem ? turmas.find(t => t.id === selectedItem.disciplina?.turma_id)?.nome : ''}
        disciplinaName={selectedItem?.disciplina?.nome}
      />
    </div>
  );
}