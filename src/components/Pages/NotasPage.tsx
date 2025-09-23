import React, { useState, useEffect } from 'react';
import { BookOpen, Filter, Download, Eye, User, Calendar, MessageSquare, TrendingUp, X, Users, Plus, Save, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDataService } from '../../lib/dataService';
import { localDB } from '../../lib/localDatabase';
import type { Nota, Aluno, Disciplina, Recado, ProvaTarefa } from '../../lib/supabase';
import { ItemDetailModal } from '../Modals/ItemDetailModal';
import { LancarNotasModal } from '../Modals/LancarNotasModal';

export function NotasPage() {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [recados, setRecados] = useState<Recado[]>([]);
  const [provasTarefas, setProvasTarefas] = useState<ProvaTarefa[]>([]);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [showAlunoDetail, setShowAlunoDetail] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProvaTarefa | Recado | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'prova_tarefa' | 'recado'>('prova_tarefa');
  const [showLancarNotasModal, setShowLancarNotasModal] = useState(false);
  const [quickGradeMode, setQuickGradeMode] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedDisciplina, setSelectedDisciplina] = useState('');
  const [showNotaDetailModal, setShowNotaDetailModal] = useState(false);
  const [selectedNota, setSelectedNota] = useState<Nota | null>(null);
  const [filtros, setFiltros] = useState({
    aluno: '',
    disciplina: '',
    bimestre: '',
    tipo: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          await dataService.loadPermissions();
        } catch (e) {
          console.warn('Erro ao carregar permissões:', e);
        }
        await fetchData();
      })();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [notasData, alunosData, disciplinasData, recadosData, provasData] = await Promise.all([
        dataService.getNotas(),
        dataService.getAlunos(),
        dataService.getDisciplinas(),
        dataService.getRecados(),
        dataService.getProvasTarefas()
      ]);

      // Ordenar por data de criação
      const notasOrdenadas = notasData.sort((a, b) => {
        const dataA = a.criado_em;
        const dataB = b.criado_em;
        return dataB.localeCompare(dataA);
      });
      
      setNotas(notasOrdenadas);
      setAlunos(alunosData);
      setDisciplinas(disciplinasData);
      
      setRecados(recadosData);
      setProvasTarefas(provasData);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotaWithDetails = (nota: Nota) => {
    if (isSupabaseConnected) {
      return nota; // Detalhes já vêm incluídos do Supabase
    } else {
      const disciplinas = localDB.getDisciplinas();
      const alunos = localDB.getAlunos();
      const disciplina = disciplinas.find(d => d.id === nota.disciplina_id);
      const aluno = alunos.find(a => a.id === nota.aluno_id);
      return { ...nota, disciplina, aluno };
    }
  };

  const calcularMediaAluno = (alunoId: string, disciplinaId?: string) => {
    return dataService.calcularMediaAluno(alunoId, notas, disciplinaId);
  };

  const handleViewAlunoDetails = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setShowAlunoDetail(true);
  };

  const handleViewItem = (item: ProvaTarefa | Recado, type: 'prova_tarefa' | 'recado') => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setShowDetailModal(true);
  };

  const handleViewNota = (nota: Nota) => {
    setSelectedNota(nota);
    setShowNotaDetailModal(true);
  };

  // Edit/Delete handlers
  const [showEditNotaModal, setShowEditNotaModal] = useState(false);
  const [editingNota, setEditingNota] = useState<Nota | null>(null);
  const [editNotaValue, setEditNotaValue] = useState('');
  const [editComentario, setEditComentario] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const handleEditClick = (nota: Nota) => {
    setEditingNota(nota);
    setEditNotaValue(nota.nota != null ? String(nota.nota) : '');
    setEditComentario(nota.comentario || '');
    setShowEditNotaModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingNota) return;
    const value = parseFloat(editNotaValue as any);
    if (isNaN(value)) {
      alert('Informe uma nota válida entre 0 e 10');
      return;
    }

    setEditLoading(true);
    try {
      await dataService.updateNota(editingNota.id, { nota: value, comentario: editComentario });
      // atualizar lista localmente
      setNotas(prev => prev.map(n => n.id === editingNota.id ? { ...n, nota: value, comentario: editComentario } : n));
      setShowEditNotaModal(false);
      setEditingNota(null);
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      alert('Erro ao atualizar nota');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteNota = async (nota: Nota) => {
    const ok = window.confirm('Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita.');
    if (!ok) return;
    try {
      const success = await dataService.deleteNota(nota.id);
      if (success) {
        setNotas(prev => prev.filter(n => n.id !== nota.id));
      } else {
        alert('Falha ao excluir nota');
      }
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
      alert('Erro ao excluir nota');
    }
  };
  const notasFiltradas = notas.filter(nota => {
    return (
      (!filtros.aluno || nota.aluno_id === filtros.aluno) &&
      (!filtros.disciplina || nota.disciplina_id === filtros.disciplina) &&
      (!filtros.bimestre || (nota.trimestre || (nota as any).bimestre)?.toString() === filtros.bimestre) &&
      (!filtros.tipo || true) // Remover filtro de tipo pois não existe na tabela Supabase
    );
  });

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
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {user!.tipo_usuario === 'pai' ? '📊 Boletim dos Filhos' : 
               user!.tipo_usuario === 'professor' ? '📝 Notas Lançadas' : 
               '🎯 Gestão de Notas'}
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              {user!.tipo_usuario === 'pai' ? 'Acompanhe o desempenho acadêmico' : 
               'Sistema de lançamento de notas'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
          {dataService.hasPermissionId('grades_create') && (
            <button 
              onClick={() => setShowLancarNotasModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Lançar Notas</span>
            </button>
          )}
        </div>
      </div>

      {/* Lançamento Rápido de Notas - Apenas para Professores */}
      {dataService.hasPermissionId('grades_create') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
              Lançamento Rápido de Notas
            </h3>
            <button
              onClick={() => setQuickGradeMode(!quickGradeMode)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                quickGradeMode 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {quickGradeMode ? 'Cancelar' : 'Ativar Modo Rápido'}
            </button>
          </div>
          
          {quickGradeMode && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={selectedTurma}
                  onChange={(e) => setSelectedTurma(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma turma</option>
                  {/* Implementar lista de turmas do professor */}
                </select>
                <select
                  value={selectedDisciplina}
                  onChange={(e) => setSelectedDisciplina(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma disciplina</option>
                  {/* Implementar lista de disciplinas do professor */}
                </select>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Modo Rápido:</strong> Selecione turma e disciplina para lançar notas de forma ágil
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900 text-sm sm:text-base">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Aluno</label>
            <select
              value={filtros.aluno}
              onChange={(e) => setFiltros({ ...filtros, aluno: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Todos os alunos</option>
              {alunos.map(aluno => (
                <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Disciplina</label>
            <select
              value={filtros.disciplina}
              onChange={(e) => setFiltros({ ...filtros, disciplina: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Todas as disciplinas</option>
              {disciplinas.map(disciplina => (
                <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Trimestre</label>
            <select
              value={filtros.bimestre}
              onChange={(e) => setFiltros({ ...filtros, bimestre: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Todos os trimestres</option>
              <option value="1">1º Trimestre</option>
              <option value="2">2º Trimestre</option>
              <option value="3">3º Trimestre</option>
              <option value="4">4º Trimestre</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Todos os tipos</option>
              {!isSupabaseConnected && <option value="prova">Prova</option>}
              <option value="trabalho">Trabalho</option>
              <option value="participacao">Participação</option>
              <option value="recuperacao">Recuperação</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumo por aluno (para pais) */}
      {user!.tipo_usuario === 'pai' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg mr-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            🌟 Boletim dos Filhos
          </h2>
          {alunos.map(aluno => (
            <div key={aluno.id} className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-xl border-2 border-blue-200 mb-6">
              {/* Header do Aluno */}
              <div 
                className="p-4 sm:p-6 border-b-2 border-blue-200 bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 cursor-pointer hover:from-blue-200 hover:to-indigo-200 transition-all group rounded-t-2xl"
                onClick={() => handleViewAlunoDetails(aluno)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-2xl">
                      {aluno.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-blue-700 transition-colors">{aluno.nome}</h3>
                      <p className="text-sm sm:text-base text-gray-700 font-bold">🏫 {aluno.turma?.nome} • 📅 {aluno.turma?.ano_letivo}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span className="text-xs sm:text-sm text-blue-600 font-bold">
                            📝 {notas.filter(n => n.aluno_id === aluno.id).length} notas
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-purple-500" />
                          <span className={`text-xs sm:text-sm font-black ${
                            calcularMediaAluno(aluno.id) >= 7 ? 'text-green-700' :
                            calcularMediaAluno(aluno.id) >= 5 ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                            📊 Média: {calcularMediaAluno(aluno.id).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-2xl text-lg sm:text-xl font-black shadow-xl ${
                      calcularMediaAluno(aluno.id) >= 7 ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
                      calcularMediaAluno(aluno.id) >= 5 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                      'bg-gradient-to-r from-red-400 to-red-600 text-white'
                    }`}>
                      {calcularMediaAluno(aluno.id).toFixed(1)}
                    </div>
                    <p className="text-xs text-blue-700 mt-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block font-black bg-white px-3 py-1 rounded-xl">
                      ✨ Clique para ver detalhes completos
                    </p>
                  </div>
                </div>
              </div>

              {/* Notas por Disciplina */}
              <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-b-2xl">
                <h4 className="text-lg sm:text-xl font-black text-gray-900 mb-4 sm:mb-6 flex items-center">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg mr-3">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  📚 Notas por Disciplina
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {disciplinas.map(disciplina => {
                    const notasDisciplina = notas.filter(n => 
                      n.aluno_id === aluno.id && n.disciplina_id === disciplina.id
                    );
                    if (notasDisciplina.length === 0) return null;
                    
                    const media = notasDisciplina.reduce((acc, nota) => acc + (nota.nota || 0), 0) / notasDisciplina.length;
                    
                    return (
                      <div key={disciplina.id} className="border-2 border-gray-300 rounded-2xl p-4 sm:p-5 hover:border-blue-400 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div 
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white font-black text-base sm:text-lg shadow-lg"
                              style={{ backgroundColor: disciplina.cor || '#3B82F6' }}
                            >
                              {disciplina.nome.charAt(0)}
                            </div>
                            <div>
                              <h5 className="font-black text-gray-900 text-sm sm:text-base">{disciplina.nome}</h5>
                              <p className="text-xs sm:text-sm text-gray-600 font-bold">📝 {notasDisciplina.length} nota(s)</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`px-3 sm:px-4 py-2 rounded-2xl text-sm sm:text-base font-black shadow-lg ${
                              media >= 7 ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' :
                              media >= 5 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                              'bg-gradient-to-r from-red-400 to-red-600 text-white'
                            }`}>
                              {media.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Lista de Notas da Disciplina */}
                        <div className="space-y-1.5 sm:space-y-2">
                          {notasDisciplina.sort((a, b) => (b.trimestre || 0) - (a.trimestre || 0)).map(nota => (
                            <div key={nota.id} className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all">
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-1 sm:space-y-0">
                                  <span className="text-xs sm:text-sm font-black text-gray-800">
                                    📅 {nota.trimestre}º Trimestre
                                  </span>
                                  <span className="text-xs text-gray-600 font-semibold">
                                    {new Date(nota.criado_em).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                                {nota.comentario && (
                                  <p className="text-xs sm:text-sm text-gray-700 mt-1 italic line-clamp-2 font-medium">💬 "{nota.comentario}"</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 ml-2">
                                <span className={`text-lg sm:text-xl font-black ${
                                  (nota.nota || 0) >= 7 ? 'text-green-700' :
                                  (nota.nota || 0) >= 5 ? 'text-yellow-700' :
                                  'text-red-700'
                                }`}>
                                  {(nota.nota || 0).toFixed(1)}
                                </span>
                                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm ${
                                  (nota.nota || 0) >= 7 ? 'bg-green-500' :
                                  (nota.nota || 0) >= 5 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabela de notas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Notas Detalhadas ({notasFiltradas.length})
          </h2>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aluno
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disciplina
                </th>
                {!isSupabaseConnected && <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Tipo
                </th>}
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nota
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Trimestre
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Comentário
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={isSupabaseConnected ? 6 : 7} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
                    Nenhuma nota encontrada com os filtros aplicados
                  </td>
                </tr>
              ) : (
                notasFiltradas.map((nota) => {
                  const notaComDetalhes = getNotaWithDetails(nota);
                  return (
                    <tr key={nota.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold mr-2 sm:mr-3 flex-shrink-0">
                            {notaComDetalhes.aluno?.nome.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {notaComDetalhes.aluno?.nome || 'Aluno não encontrado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2 flex-shrink-0"
                            style={{ backgroundColor: (notaComDetalhes.disciplina as any)?.cor || '#3B82F6' }}
                          ></div>
                          <span className="text-xs sm:text-sm text-gray-900 truncate">
                            {notaComDetalhes.disciplina?.nome || 'Disciplina não encontrada'}
                          </span>
                        </div>
                      </td>
                      {!isSupabaseConnected && <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full ${
                          (nota as any).tipo === 'prova' ? 'bg-red-100 text-red-800' :
                          (nota as any).tipo === 'trabalho' ? 'bg-blue-100 text-blue-800' :
                          (nota as any).tipo === 'participacao' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {(nota as any).tipo}
                        </span>
                      </td>}
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`text-base sm:text-lg font-bold ${
                          (nota.nota || (nota as any).valor || 0) >= 7 ? 'text-green-600' :
                          (nota.nota || (nota as any).valor || 0) >= 5 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {(nota.nota || (nota as any).valor || 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                        {nota.trimestre || (nota as any).bimestre}º
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                        {nota.comentario || '-'}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewNota(nota)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Ver detalhes da nota"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          {(dataService.hasPermissionId('grades_edit') || dataService.hasPermissionId('grades_delete')) && (
                            <>
                              {dataService.hasPermissionId('grades_edit') && (
                                <button
                                  onClick={() => handleEditClick(nota)}
                                  className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors"
                                  title="Editar nota"
                                >
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                              )}
                              {dataService.hasPermissionId('grades_delete') && (
                                <button
                                  onClick={() => handleDeleteNota(nota)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                  title="Excluir nota"
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes do Aluno */}
      {showAlunoDetail && selectedAluno && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                  {selectedAluno.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{selectedAluno.nome}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{selectedAluno.turma?.nome} • {selectedAluno.turma?.ano_letivo}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAlunoDetail(false)}
                className="p-1.5 sm:p-2 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* Estatísticas do Aluno */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Desempenho Acadêmico</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-blue-600">Média Geral</p>
                        <p className={`text-xl sm:text-2xl font-bold ${
                          calcularMediaAluno(selectedAluno.id) >= 7 ? 'text-green-600' :
                          calcularMediaAluno(selectedAluno.id) >= 5 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {calcularMediaAluno(selectedAluno.id).toFixed(1)}
                        </p>
                      </div>
                      <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-green-600">Total Notas</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-900">
                          {notas.filter(n => n.aluno_id === selectedAluno.id).length}
                        </p>
                      </div>
                      <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-purple-600">Recados</p>
                        <p className="text-xl sm:text-2xl font-bold text-purple-900">
                          {recados.filter(r => 
                            r.destinatario_tipo === 'geral' || 
                            (r.destinatario_tipo === 'turma' && r.destinatario_id === selectedAluno.turma_id) ||
                            (r.destinatario_tipo === 'aluno' && r.destinatario_id === selectedAluno.id)
                          ).length}
                        </p>
                      </div>
                      <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-yellow-600">Próximas Provas</p>
                        <p className="text-xl sm:text-2xl font-bold text-yellow-900">
                          {provasTarefas.filter(p => {
                            const hoje = new Date().toISOString().split('T')[0];
                            return p.disciplina?.turma_id === selectedAluno.turma_id && p.data >= hoje;
                          }).length}
                        </p>
                      </div>
                      <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas por Disciplina */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Notas por Disciplina</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {disciplinas.map(disciplina => {
                    const notasDisciplina = notas.filter(n => 
                      n.aluno_id === selectedAluno.id && n.disciplina_id === disciplina.id
                    );
                    if (notasDisciplina.length === 0) return null;
                    
                    const media = notasDisciplina.reduce((acc, nota) => acc + (nota.nota || 0), 0) / notasDisciplina.length;
                    
                    return (
                      <div key={disciplina.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                          <div 
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                            style={{ backgroundColor: disciplina.cor || '#3B82F6' }}
                          ></div>
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm sm:text-base">{disciplina.nome}</h5>
                            <p className="text-xs sm:text-sm text-gray-500">{notasDisciplina.length} nota(s)</p>
                          </div>
                          <div className="ml-auto">
                            <span className={`text-base sm:text-lg font-bold ${
                              media >= 7 ? 'text-green-600' :
                              media >= 5 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {media.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          {notasDisciplina.map(nota => (
                            <div key={nota.id} className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-gray-600 truncate flex-1 mr-2">
                                {nota.trimestre}º Trimestre
                                {nota.comentario && ` • ${nota.comentario}`}
                              </span>
                              <span className={`font-medium flex-shrink-0 ${
                                (nota.nota || 0) >= 7 ? 'text-green-600' :
                                (nota.nota || 0) >= 5 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {(nota.nota || 0).toFixed(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Próximas Provas/Tarefas do Aluno */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Próximas Avaliações</h4>
                {(() => {
                  const proximasProvas = provasTarefas.filter(p => {
                    const hoje = new Date().toISOString().split('T')[0];
                    return p.disciplina?.turma_id === selectedAluno.turma_id && p.data >= hoje;
                  }).sort((a, b) => a.data.localeCompare(b.data));
                  
                  return proximasProvas.length === 0 ? (
                    <p className="text-gray-500 text-center py-3 sm:py-4 text-sm">Nenhuma avaliação próxima</p>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {proximasProvas.slice(0, 5).map(prova => (
                        <div 
                          key={prova.id}
                          className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                          onClick={() => handleViewItem(prova, 'prova_tarefa')}
                        >
                          <div className="p-1.5 sm:p-2 bg-yellow-50 rounded-full flex-shrink-0">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 text-sm sm:text-base truncate">{prova.titulo}</h5>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">{prova.disciplina?.nome}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              {new Date(prova.data).toLocaleDateString('pt-BR')}
                            </p>
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full ${
                              prova.tipo === 'prova' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {prova.tipo}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Recados Relacionados */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recados Recentes</h4>
                {(() => {
                  const recadosAluno = recados.filter(r => 
                    r.destinatario_tipo === 'geral' || 
                    (r.destinatario_tipo === 'turma' && r.destinatario_id === selectedAluno.turma_id) ||
                    (r.destinatario_tipo === 'aluno' && r.destinatario_id === selectedAluno.id)
                  ).slice(0, 5);
                  
                  return recadosAluno.length === 0 ? (
                    <p className="text-gray-500 text-center py-3 sm:py-4 text-sm">Nenhum recado recente</p>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {recadosAluno.map(recado => (
                        <div 
                          key={recado.id}
                          className="flex items-start space-x-3 sm:space-x-4 p-2 sm:p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer"
                          onClick={() => handleViewItem(recado, 'recado')}
                        >
                          <div className="p-1.5 sm:p-2 bg-purple-50 rounded-full flex-shrink-0">
                            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 text-sm sm:text-base truncate">{recado.titulo}</h5>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{recado.conteudo}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Por: {recado.autor?.nome} • {new Date(recado.data_envio).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full flex-shrink-0 ${
                            recado.destinatario_tipo === 'geral' ? 'bg-blue-100 text-blue-800' :
                            recado.destinatario_tipo === 'turma' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {recado.destinatario_tipo}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAlunoDetail(false)}
                className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes de itens */}
      <ItemDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={selectedItem}
        type={selectedItemType}
        turmaName={selectedAluno?.turma?.nome}
        disciplinaName={
          selectedItemType === 'prova_tarefa' && selectedItem 
            ? (selectedItem as ProvaTarefa).disciplina?.nome
            : undefined
        }
        autorName={
          selectedItemType === 'recado' && selectedItem 
            ? (selectedItem as Recado).autor?.nome
            : undefined
        }
      />

      {/* Modal de edição de nota */}
      {showEditNotaModal && editingNota && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Editar Nota</h3>
              <button onClick={() => setShowEditNotaModal(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Aluno</label>
                <p className="font-medium text-gray-900">{editingNota.aluno?.nome || 'Aluno'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Disciplina</label>
                <p className="font-medium text-gray-900">{editingNota.disciplina?.nome || ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nota (0-10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={editNotaValue}
                  onChange={(e) => setEditNotaValue(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Comentário</label>
                <input
                  type="text"
                  value={editComentario}
                  onChange={(e) => setEditComentario(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={() => setShowEditNotaModal(false)} className="px-4 py-2 border rounded-lg text-gray-700">Cancelar</button>
              <button onClick={handleSaveEdit} disabled={editLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{editLoading ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Lançamento de Notas */}
      <LancarNotasModal
        isOpen={showLancarNotasModal}
        onClose={() => setShowLancarNotasModal(false)}
        onSave={() => {
          setShowLancarNotasModal(false);
          fetchData();
        }}
      />

      {/* Modal de Detalhes da Nota */}
      <ItemDetailModal
        isOpen={showNotaDetailModal}
        onClose={() => {
          setShowNotaDetailModal(false);
          setSelectedNota(null);
        }}
        item={selectedNota}
        type="nota"
        turmaName={selectedNota ? turmas.find(t => t.id === selectedNota.aluno?.turma_id)?.nome : ''}
        disciplinaName={selectedNota?.disciplina?.nome}
        autorName={selectedNota?.aluno?.nome}
      />
    </div>
  );
}