import { useState, useEffect } from 'react';
import { School, Plus, Edit, Trash2, Search, Filter, BookOpen, Clock, Calendar, User } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { useDataService } from '../../lib/dataService';
import type { Turma, Aluno, Disciplina } from '../../lib/supabase';
import { TurmaModal } from '../Modals/TurmaModal';
import { TurmaDetailModal } from '../Modals/TurmaDetailModal';
import { useDataRefresh } from '../../hooks/useDataRefresh';

export function TurmasPage() {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const { refreshKey, triggerRefresh } = useDataRefresh();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    anoLetivo: '',
    turno: '',
    status: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const fetchData = async () => {
    try {
      const [turmasData, alunosData, disciplinasData] = await Promise.all([
        dataService.getTurmas(),
        dataService.getAlunos(),
        dataService.getDisciplinas()
      ]);
      
      setTurmas(turmasData);
      setAlunos(alunosData);
      setDisciplinas(disciplinasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTurmaWithStats = (turma: Turma) => {
    const alunosDaTurma = alunos.filter(a => a.turma_id === turma.id);
    const disciplinasDaTurma = disciplinas.filter(d => d.turma_id === turma.id);
    
    return {
      ...turma,
      totalAlunos: alunosDaTurma.length,
      totalDisciplinas: disciplinasDaTurma.length,
      professorNome: 'Não atribuído' // Será implementado quando necessário
    };
  };

  const turmasFiltradas = turmas.filter(turma => {
    const matchBusca = !filtros.busca || 
      turma.nome.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchAno = !filtros.anoLetivo || turma.ano_letivo === filtros.anoLetivo;
    const matchTurno = !filtros.turno || (turma as any).turno === filtros.turno;
    const matchStatus = !filtros.status || 
      (filtros.status === 'ativo' && (turma as any).ativa) ||
      (filtros.status === 'inativo' && !(turma as any).ativa);
    
    return matchBusca && matchAno && matchTurno && matchStatus;
  });

  const anosLetivos = [...new Set(turmas.map(t => t.ano_letivo))].sort();
  const turnos = ['Manhã', 'Tarde', 'Noite', 'Integral'];

  const handleEdit = (turma: Turma) => {
    setEditingTurma(turma);
    setShowModal(true);
  };

  const handleDelete = async (turma: Turma) => {
    const alunosDaTurma = alunos.filter(a => a.turma_id === turma.id);
    
    if (alunosDaTurma.length > 0) {
      alert(`Não é possível excluir a turma ${turma.nome} pois há ${alunosDaTurma.length} aluno(s) vinculado(s).`);
      return;
    }
    
    if (confirm(`Tem certeza que deseja excluir a turma ${turma.nome}?\n\nEsta ação não pode ser desfeita.`)) {
      try {
        await dataService.deleteTurma(turma.id);
        triggerRefresh();
      } catch (error) {
        console.error('Erro ao excluir turma:', error);
        if (error instanceof Error && error.message.includes('Supabase')) {
          alert('❌ Erro: Sistema requer conexão com Supabase para excluir turmas. Verifique sua conexão.');
        } else {
          alert('Erro ao excluir turma');
        }
      }
    }
  };

  const handleViewDetails = (turma: Turma) => {
    setSelectedTurma(turma);
    setShowDetailModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTurma(null);
  };

  const handleModalSave = () => {
    triggerRefresh();
  };

  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedTurma(null);
  };

  const handleDetailModalSave = () => {
    triggerRefresh();
    handleDetailModalClose();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-gray-700">Carregando turmas...</p>
          <p className="text-lg text-gray-500 mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-blue-200 p-6 sm:p-8 lg:p-12 animate-slide-in-up hover:shadow-2xl transition-all duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-6 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl sm:rounded-3xl shadow-2xl mx-auto sm:mx-0 animate-float">
              <School className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-glow">
                🏫 Gestão de Turmas
              </h1>
              <p className="text-gray-700 mt-2 sm:mt-4 text-lg sm:text-xl lg:text-2xl font-bold">
                🎯 Organize e gerencie todas as turmas da escola
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-end">
            <button 
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Nova Turma</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
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
              placeholder="Buscar por nome da turma..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filtros.anoLetivo}
            onChange={(e) => setFiltros({ ...filtros, anoLetivo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os anos letivos</option>
            {anosLetivos.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <select
            value={filtros.turno}
            onChange={(e) => setFiltros({ ...filtros, turno: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os turnos</option>
            {turnos.map(turno => (
              <option key={turno} value={turno}>{turno}</option>
            ))}
          </select>
          <select
            value={filtros.status}
            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-200 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-110">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-blue-600 uppercase tracking-wide">🏫 Total</p>
              <p className="text-3xl font-black text-blue-700">{turmas.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg">
              <School className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
              <p className="text-2xl font-bold text-green-600">{alunos.length}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disciplinas</p>
              <p className="text-2xl font-bold text-purple-600">{disciplinas.length}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-full">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Média por Turma</p>
              <p className="text-2xl font-bold text-yellow-600">
                {turmas.length > 0 ? Math.round(alunos.length / turmas.length) : 0}
              </p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-full">
              <User className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de turmas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turmasFiltradas.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma turma encontrada</h3>
            <p className="text-gray-500">Ajuste os filtros ou crie uma nova turma.</p>
          </div>
        ) : (
          turmasFiltradas.map((turma) => {
            const turmaComStats = getTurmaWithStats(turma);
            return (
              <div
                key={turma.id}
                className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-xl border-2 border-blue-200 hover:shadow-2xl hover:border-blue-400 hover:scale-110 hover:rotate-1 transition-all duration-300 cursor-pointer group"
                onClick={() => handleViewDetails(turma)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                        {turma.nome.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 group-hover:text-blue-700 transition-colors text-lg">{turma.nome}</h3>
                        <p className="text-sm text-gray-600 font-bold">📅 {turma.ano_letivo}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(turma);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Editar turma"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(turma);
                        }}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Excluir turma"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-700 font-bold">👥 Alunos</span>
                      </div>
                      <span className="text-sm font-black text-gray-900">
                        {turmaComStats.totalAlunos}
                        {(turma as any).capacidade && ` / ${(turma as any).capacidade}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Disciplinas</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{turmaComStats.totalDisciplinas}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Professor</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{turmaComStats.professorNome}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Turno</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{(turma as any).turno || 'Não definido'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Status</span>
                      </div>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full text-xs ${
                        (turma as any).ativa 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(turma as any).ativa ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Criada em</span>
                        <span>{new Date(turma.criado_em).toLocaleDateString('pt-BR')}</span>
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

      {/* Modal de criação/edição (placeholder) */}
      <TurmaModal
        isOpen={showModal}
        onClose={handleModalClose}
        turma={editingTurma}
        onSave={handleModalSave}
      />

      {/* Modal de Detalhes */}
      <TurmaDetailModal
        isOpen={showDetailModal}
        onClose={handleDetailModalClose}
        turma={selectedTurma}
        onSave={handleDetailModalSave}
      />
    </div>
  );
}