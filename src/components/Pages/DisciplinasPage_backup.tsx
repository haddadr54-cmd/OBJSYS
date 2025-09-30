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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 p-6" style={{backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)'}}>
      <div className="space-y-8">
        {/* Header Ultra Moderno */}
        <div className="relative bg-white rounded-[2rem] shadow-2xl border-2 border-indigo-200 p-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="relative">
                <div className="p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-[2rem] shadow-2xl transform hover:scale-110 transition-transform duration-500 group">
                  <BookOpen className="h-16 w-16 text-white group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-4 border-white animate-pulse shadow-xl flex items-center justify-center">
                  <span className="text-white text-sm font-black">{disciplinas.length}</span>
                </div>
              </div>
              
              <div className="text-center lg:text-left">
                <h1 className="text-6xl font-black bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 bg-clip-text text-transparent mb-4">
                  Sistema de Disciplinas
                </h1>
                <p className="text-gray-700 text-2xl font-bold mb-4">Gestão Acadêmica Inteligente e Completa</p>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2 bg-emerald-100 rounded-full px-4 py-2 border-2 border-emerald-200">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-700 font-bold uppercase tracking-wide">Sistema Online</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 border-2 border-blue-200">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-bold">{disciplinas.length} Disciplinas</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-purple-100 rounded-full px-4 py-2 border-2 border-purple-200">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-700 font-bold">{professores.length} Professores</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center lg:items-end space-y-4">
              <button 
                onClick={() => setShowModal(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-110 hover:rotate-1 transition-all duration-500 font-black text-xl border-2 border-white"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center space-x-3">
                  <Plus className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                  <span>✨ Nova Disciplina</span>
                </div>
              </button>
              
              <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl p-4 border-2 border-indigo-200 shadow-xl">
                <p className="text-3xl font-black text-indigo-800">{new Date().getDate()}</p>
                <p className="text-sm text-indigo-600 uppercase tracking-wider font-bold">
                  {new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Filtros Ultra Moderna */}
        <div className="relative bg-white rounded-[2rem] shadow-2xl border-2 border-indigo-200 p-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-indigo-500/3 to-purple-500/3"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="relative">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-2xl">
                <Filter className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent">Filtros Inteligentes</h3>
                <p className="text-gray-600 text-lg font-semibold">Encontre disciplinas rapidamente</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-indigo-400" />
                  <input
                    type="text"
                    placeholder="� Buscar disciplina..."
                    value={filtros.busca}
                    onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                    className="w-full pl-14 pr-6 py-5 bg-white border-2 border-indigo-200 rounded-2xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 placeholder-indigo-300"
                  />
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <select
                  value={filtros.turma}
                  onChange={(e) => setFiltros({ ...filtros, turma: e.target.value })}
                  className="relative w-full px-6 py-5 bg-white border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="">🏫 Todas as turmas</option>
                  {turmas.map(turma => (
                    <option key={turma.id} value={turma.id}>{turma.nome}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <select
                  value={filtros.professor}
                  onChange={(e) => setFiltros({ ...filtros, professor: e.target.value })}
                  className="relative w-full px-6 py-5 bg-white border-2 border-pink-200 rounded-2xl focus:ring-4 focus:ring-pink-500 focus:border-pink-500 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="">👨‍🏫 Todos os professores</option>
                  {professores.map(professor => (
                    <option key={professor.id} value={professor.id}>{professor.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {/* Card Total Disciplinas */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-70 transition-all duration-500"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl border-2 border-indigo-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2">📚 Total</p>
                  <p className="text-5xl font-black text-indigo-800 mb-2">{disciplinas.length}</p>
                  <p className="text-sm text-indigo-600 font-bold bg-indigo-100 rounded-full px-3 py-1">Disciplinas</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"></div>
            </div>
          </div>
          
          {/* Card Professores */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-70 transition-all duration-500"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl border-2 border-emerald-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-2">👨‍🏫 Professores</p>
                  <p className="text-5xl font-black text-emerald-800 mb-2">{professores.length}</p>
                  <p className="text-sm text-emerald-600 font-bold bg-emerald-100 rounded-full px-3 py-1">Ativos</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 rounded-3xl shadow-2xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-500">
                  <Users className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="h-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"></div>
            </div>
          </div>
          
          {/* Card Turmas */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-70 transition-all duration-500"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl border-2 border-blue-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-black text-blue-600 uppercase tracking-widest mb-2">🏫 Turmas</p>
                  <p className="text-5xl font-black text-blue-800 mb-2">{turmas.length}</p>
                  <p className="text-sm text-blue-600 font-bold bg-blue-100 rounded-full px-3 py-1">Ativas</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-blue-500 via-cyan-600 to-blue-700 rounded-3xl shadow-2xl transform rotate-6 group-hover:rotate-12 transition-transform duration-500">
                  <School className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="h-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"></div>
            </div>
          </div>
          
          {/* Card Média */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-70 transition-all duration-500"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl border-2 border-amber-100 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-black text-amber-600 uppercase tracking-widest mb-2">📊 Média</p>
                  <p className="text-5xl font-black text-amber-800 mb-2">
                    {turmas.length > 0 ? Math.round(disciplinas.length / turmas.length) : 0}
                  </p>
                  <p className="text-sm text-amber-600 font-bold bg-amber-100 rounded-full px-3 py-1">Por turma</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 rounded-3xl shadow-2xl transform -rotate-6 group-hover:-rotate-12 transition-transform duration-500">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Grid de Disciplinas Ultra Moderno */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {disciplinasFiltradas.length === 0 ? (
            <div className="col-span-full relative bg-white rounded-[2rem] shadow-2xl border-2 border-gray-200 p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50"></div>
              <div className="relative">
                <div className="p-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-fit mx-auto mb-8 shadow-2xl">
                  <BookOpen className="h-24 w-24 text-gray-400 animate-pulse" />
                </div>
                <h3 className="text-4xl font-black text-gray-900 mb-6">📚 Nenhuma disciplina encontrada</h3>
                <p className="text-gray-600 text-xl font-semibold mb-8">Ajuste os filtros ou crie uma nova disciplina</p>
                <button 
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  ✨ Criar Primeira Disciplina
                </button>
              </div>
            </div>
          ) : (
            disciplinasFiltradas.map((disciplina) => {
              const disciplinaComDetalhes = getDisciplinaWithDetails(disciplina);
              return (
                <div 
                  key={disciplina.id} 
                  className="group relative bg-white rounded-[2rem] shadow-2xl border-2 border-indigo-100 hover:shadow-3xl hover:border-indigo-300 hover:scale-105 hover:-rotate-1 transition-all duration-500 cursor-pointer overflow-hidden"
                  onClick={() => handleViewDetails(disciplina)}
                >
                  {/* Gradient overlay para hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <div 
                            className="w-20 h-20 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                            style={{ backgroundColor: disciplina.cor || '#6366F1' }}
                          >
                            {disciplina.codigo || disciplina.nome.charAt(0)}
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full border-3 border-white shadow-xl flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-gray-900 group-hover:text-indigo-700 transition-colors mb-2 leading-tight">{disciplina.nome}</h3>
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="bg-indigo-100 text-indigo-800 text-sm font-bold px-3 py-1 rounded-full">
                              {disciplina.codigo || 'Sem código'}
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                              <span className="text-sm text-emerald-600 font-bold">
                                {(disciplina as any).ativa !== false ? 'Ativa' : 'Inativa'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(disciplina);
                          }}
                          className="p-3 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl border-2 border-indigo-200 hover:border-indigo-600"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(disciplina);
                          }}
                          className="p-3 text-red-600 hover:text-white hover:bg-red-600 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl border-2 border-red-200 hover:border-red-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Informações da Disciplina */}
                    <div className="space-y-4 mb-8">
                      <div className="relative group/item">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur opacity-20 group-hover/item:opacity-40 transition duration-300"></div>
                        <div className="relative flex items-center justify-between p-4 bg-white rounded-2xl shadow-lg border border-blue-100">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                              <School className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-800">Turma</span>
                          </div>
                          <span className="text-lg font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
                            {disciplinaComDetalhes.turma?.nome || 'Não atribuída'}
                          </span>
                        </div>
                      </div>

                      <div className="relative group/item">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl blur opacity-20 group-hover/item:opacity-40 transition duration-300"></div>
                        <div className="relative flex items-center justify-between p-4 bg-white rounded-2xl shadow-lg border border-emerald-100">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                              <Users className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-800">Professor</span>
                          </div>
                          <span className="text-lg font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                            {disciplinaComDetalhes.professor?.nome?.split(' ')[0] || 'Não atribuído'}
                          </span>
                        </div>
                      </div>

                      <div className="relative group/item">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-20 group-hover/item:opacity-40 transition duration-300"></div>
                        <div className="relative flex items-center justify-between p-4 bg-white rounded-2xl shadow-lg border border-purple-100">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                              <Clock className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-800">Carga Horária</span>
                          </div>
                          <span className="text-lg font-black text-purple-600 bg-purple-50 px-4 py-2 rounded-xl">
                            {(disciplina as any).carga_horaria || 0}h
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer do Card */}
                    <div className="border-t-2 border-gradient-to-r from-indigo-100 to-purple-100 pt-6">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="font-semibold">Criada em:</span>
                        <span className="font-bold">{new Date(disciplina.criado_em).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      <div className="text-center">
                        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-indigo-100 group-hover:border-indigo-300 transition-colors">
                          <p className="text-indigo-600 font-bold text-lg group-hover:text-indigo-800 transition-colors">
                            👆 Clique para ver detalhes completos
                          </p>
                        </div>
                      </div>
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
    </div>
  );
}