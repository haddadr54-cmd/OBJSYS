import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, Search, Filter, Eye, Users, School, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDataService } from '../../lib/dataService';
import type { Disciplina, Turma, Usuario } from '../../lib/supabase';
import { DisciplinaModal } from '../Modals/DisciplinaModal';
import { DisciplinaDetailModal } from '../Modals/DisciplinaDetailModal';
import { useDataRefresh } from '../../hooks/useDataRefresh';

export function DisciplinasPage() {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const { refreshKey, triggerRefresh } = useDataRefresh();
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [professores, setProfessores] = useState<Usuario[]>([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    turma: '',
    professor: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDisciplina, setSelectedDisciplina] = useState<Disciplina | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const fetchData = async () => {
    try {
      const [disciplinasData, turmasData] = await Promise.all([
        dataService.getDisciplinas(),
        dataService.getTurmas()
      ]);
      
      setDisciplinas(disciplinasData);
      setTurmas(turmasData);
      
      // Buscar professores apenas se for admin
      if (user?.tipo_usuario === 'admin') {
        const usuariosData = await dataService.getUsuarios();
        const professoresData = usuariosData.filter(u => u.tipo_usuario === 'professor');
        setProfessores(professoresData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisciplinaWithDetails = (disciplina: Disciplina) => {
    const turma = turmas.find(t => t.id === disciplina.turma_id);
    const professor = professores.find(p => p.id === disciplina.professor_id);
    return { ...disciplina, turma, professor };
  };

  const disciplinasFiltradas = disciplinas.filter(disciplina => {
    const matchBusca = !filtros.busca || 
      disciplina.nome.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchTurma = !filtros.turma || disciplina.turma_id === filtros.turma;
    const matchProfessor = !filtros.professor || disciplina.professor_id === filtros.professor;
    
    return matchBusca && matchTurma && matchProfessor;
  });

  const handleEdit = (disciplina: Disciplina) => {
    setEditingDisciplina(disciplina);
    setShowModal(true);
  };

  const handleDelete = (disciplina: Disciplina) => {
    if (confirm(`Tem certeza que deseja excluir a disciplina ${disciplina.nome}?\n\nEsta ação não pode ser desfeita.`)) {
      handleDeleteDisciplina(disciplina.id);
    }
  };

  const handleDeleteDisciplina = async (disciplinaId: string) => {
    try {
      await dataService.deleteDisciplina(disciplinaId);
      triggerRefresh();
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error);
      if (error instanceof Error && error.message.includes('Supabase')) {
        alert('❌ Erro: Sistema requer conexão com Supabase para excluir disciplinas. Verifique sua conexão.');
      } else {
        alert('Erro ao excluir disciplina');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingDisciplina(null);
  };

  const handleModalSave = () => {
    triggerRefresh();
  };

  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedDisciplina(null);
  };

  const handleDetailModalSave = () => {
    triggerRefresh();
    handleDetailModalClose();
  };

  const handleViewDetails = (disciplina: Disciplina) => {
    setSelectedDisciplina(disciplina);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-gray-700">Carregando disciplinas...</p>
          <p className="text-lg text-gray-500 mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-white via-purple-50 to-indigo-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-purple-200 p-6 sm:p-8 lg:p-12 animate-slide-in-up hover:shadow-2xl transition-all duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-6 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-2xl sm:rounded-3xl shadow-2xl mx-auto sm:mx-0 animate-float">
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent animate-glow">
                📚 Gestão de Disciplinas
              </h1>
              <p className="text-gray-700 mt-2 sm:mt-4 text-lg sm:text-xl lg:text-2xl font-bold">
                🎯 Organize e gerencie todas as matérias do currículo
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-end">
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 font-black text-lg"
            >
              <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Nova Disciplina</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-gray-200 p-6 sm:p-8 animate-slide-in-up delay-100">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
            <Filter className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900">🔍 Filtros Inteligentes</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="🔎 Buscar disciplina..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            />
          </div>
          <select
            value={filtros.turma}
            onChange={(e) => setFiltros({ ...filtros, turma: e.target.value })}
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <option value="">🏫 Todas as turmas</option>
            {turmas.map(turma => (
              <option key={turma.id} value={turma.id}>{turma.nome}</option>
            ))}
          </select>
          <select
            value={filtros.professor}
            onChange={(e) => setFiltros({ ...filtros, professor: e.target.value })}
            className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <option value="">👨‍🏫 Todos os professores</option>
            {professores.map(professor => (
              <option key={professor.id} value={professor.id}>{professor.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-purple-200 p-4 sm:p-6 lg:p-8 hover:shadow-2xl hover:scale-110 hover:rotate-1 transition-all duration-500 animate-slide-in-up delay-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm lg:text-base font-black text-purple-600 uppercase tracking-wider">📚 Total</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-purple-700 animate-glow">{disciplinas.length}</p>
              <p className="text-xs sm:text-sm text-purple-500 font-bold">Disciplinas</p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl sm:rounded-3xl shadow-2xl animate-float">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-green-200 p-4 sm:p-6 lg:p-8 hover:shadow-2xl hover:scale-110 hover:rotate-1 transition-all duration-500 animate-slide-in-up delay-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm lg:text-base font-black text-green-600 uppercase tracking-wider">👨‍🏫 Professores</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-green-700 animate-glow">{professores.length}</p>
              <p className="text-xs sm:text-sm text-green-500 font-bold">Ativos</p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl sm:rounded-3xl shadow-2xl animate-float">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-blue-200 p-4 sm:p-6 lg:p-8 hover:shadow-2xl hover:scale-110 hover:rotate-1 transition-all duration-500 animate-slide-in-up delay-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm lg:text-base font-black text-blue-600 uppercase tracking-wider">🏫 Turmas</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-blue-700 animate-glow">{turmas.length}</p>
              <p className="text-xs sm:text-sm text-blue-500 font-bold">Ativas</p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl sm:rounded-3xl shadow-2xl animate-float">
              <School className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-amber-200 p-4 sm:p-6 lg:p-8 hover:shadow-2xl hover:scale-110 hover:rotate-1 transition-all duration-500 animate-slide-in-up delay-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm lg:text-base font-black text-amber-600 uppercase tracking-wider">📊 Média</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-amber-700 animate-glow">
                {turmas.length > 0 ? Math.round(disciplinas.length / turmas.length) : 0}
              </p>
              <p className="text-xs sm:text-sm text-amber-500 font-bold">Por turma</p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl sm:rounded-3xl shadow-2xl animate-float">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de disciplinas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {disciplinasFiltradas.length === 0 ? (
          <div className="col-span-full bg-gradient-to-br from-white via-gray-50 to-purple-50 rounded-3xl shadow-2xl border-2 border-gray-200 p-12 sm:p-16 lg:p-20 text-center animate-slide-in-up">
            <div className="p-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-fit mx-auto mb-8 animate-bounce-soft">
              <BookOpen className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-6">📚 Nenhuma disciplina encontrada</h3>
            <p className="text-gray-600 text-lg sm:text-xl font-semibold">Ajuste os filtros ou crie uma nova disciplina.</p>
          </div>
        ) : (
          disciplinasFiltradas.map((disciplina) => {
            const disciplinaComDetalhes = getDisciplinaWithDetails(disciplina);
            return (
              <div 
                key={disciplina.id} 
                className="bg-gradient-to-br from-white via-purple-50 to-indigo-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-purple-200 hover:shadow-2xl hover:border-purple-400 hover:scale-110 hover:rotate-1 transition-all duration-500 cursor-pointer group animate-scale-in"
                onClick={() => handleViewDetails(disciplina)}
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-2xl animate-float"
                        style={{ backgroundColor: disciplina.cor || '#3B82F6' }}
                      >
                        {disciplina.codigo || disciplina.nome.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-purple-700 transition-colors leading-tight">{disciplina.nome}</h3>
                        <p className="text-sm sm:text-base text-gray-600 font-bold">{disciplina.codigo || 'Sem código'}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs sm:text-sm text-green-600 font-bold">
                            {(disciplina as any).ativa ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(disciplina);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-900 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:scale-110"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(disciplina);
                        }}
                        className="p-2 text-red-600 hover:text-red-900 rounded-xl hover:bg-red-50 transition-all duration-300 hover:scale-110"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <School className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-sm sm:text-base font-bold text-gray-700">🏫 Turma</span>
                      </div>
                      <span className="text-sm sm:text-base font-black text-blue-600 truncate max-w-24">
                        {disciplinaComDetalhes.turma?.nome || 'Não atribuída'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-green-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-sm sm:text-base font-bold text-gray-700">👨‍🏫 Professor</span>
                      </div>
                      <span className="text-sm sm:text-base font-black text-green-600 truncate max-w-24">
                        {disciplinaComDetalhes.professor?.nome || 'Não atribuído'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Clock className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-sm sm:text-base font-bold text-gray-700">⏰ Carga</span>
                      </div>
                      <span className="text-sm sm:text-base font-black text-purple-600">
                        {(disciplina as any).carga_horaria || 0}h
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Criada em</span>
                      <span>{new Date(disciplina.criado_em).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-purple-100">
                    <p className="text-xs sm:text-sm text-purple-600 text-center font-bold animate-pulse">
                      👆 Clique para ver detalhes completos
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de criação/edição */}
      <DisciplinaModal
        isOpen={showModal}
        onClose={handleModalClose}
        disciplina={editingDisciplina}
        onSave={handleModalSave}
      />

      {/* Modal de Detalhes */}
      <DisciplinaDetailModal
        isOpen={showDetailModal}
        onClose={handleDetailModalClose}
        disciplina={selectedDisciplina}
        onSave={handleDetailModalSave}
      />
    </div>
  );
}