import { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, Search, Filter, Users, School, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { useDataService } from '../../lib/dataService';
import type { Disciplina, Turma, Usuario } from '../../lib/supabase.types';
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
      {/* Header - padrão Turmas */}
      <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-blue-200 p-6 sm:p-8 lg:p-12 hover:shadow-2xl transition-all duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-6 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl sm:rounded-3xl shadow-2xl mx-auto sm:mx-0">
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Nova Disciplina</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros - padrão Turmas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome da disciplina..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filtros.turma}
            onChange={(e) => setFiltros({ ...filtros, turma: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as turmas</option>
            {turmas.map(turma => (
              <option key={turma.id} value={turma.id}>{turma.nome}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <select
            value={filtros.professor}
            onChange={(e) => setFiltros({ ...filtros, professor: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os professores</option>
            {professores.map(professor => (
              <option key={professor.id} value={professor.id}>{professor.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Estatísticas - padrão Turmas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-200 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-110">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-blue-600 uppercase tracking-wide">📚 Total</p>
              <p className="text-3xl font-black text-blue-700">{disciplinas.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg"><BookOpen className="h-8 w-8 text-white" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Professores</p>
              <p className="text-2xl font-bold text-green-600">{professores.length}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Turmas</p>
              <p className="text-2xl font-bold text-blue-600">{turmas.length}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-full">
              <School className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Média por Turma</p>
              <p className="text-2xl font-bold text-yellow-600">{turmas.length > 0 ? Math.round(disciplinas.length / turmas.length) : 0}</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-full">
              <BookOpen className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de disciplinas - padrão Turmas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {disciplinasFiltradas.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma disciplina encontrada</h3>
            <p className="text-gray-500">Ajuste os filtros ou crie uma nova disciplina.</p>
          </div>
        ) : (
          disciplinasFiltradas.map((disciplina) => {
            const disciplinaComDetalhes = getDisciplinaWithDetails(disciplina);
            return (
              <div
                key={disciplina.id}
                className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-xl border-2 border-blue-200 hover:shadow-2xl hover:border-blue-400 hover:scale-110 hover:rotate-1 transition-all duration-300 cursor-pointer group"
                onClick={() => handleViewDetails(disciplina)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                        {disciplina.codigo || disciplina.nome.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 group-hover:text-blue-700 transition-colors text-lg">{disciplina.nome}</h3>
                        <p className="text-sm text-gray-600 font-bold">{disciplina.codigo || 'Sem código'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(disciplina);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Editar disciplina"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(disciplina);
                        }}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Excluir disciplina"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <School className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-700 font-bold">🏫 Turma</span>
                      </div>
                      <span className="text-sm font-black text-gray-900 truncate max-w-40">
                        {disciplinaComDetalhes.turma?.nome || 'Não atribuída'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700 font-bold">👨‍🏫 Professor</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-40">
                        {disciplinaComDetalhes.professor?.nome || 'Não atribuído'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-gray-700 font-bold">⏰ Carga</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {(disciplina as any).carga_horaria || 0}h
                      </span>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Criada em</span>
                        <span>{new Date(disciplina.criado_em).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity font-black bg-blue-100 px-3 py-2 rounded-xl">
                      ✨ Clique para ver detalhes completos
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