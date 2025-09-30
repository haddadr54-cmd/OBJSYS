import { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Search, Filter, Video, Link, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { ItemDetailModal } from '../Modals/ItemDetailModal';
import { useAuth } from '../../contexts/auth';
import { useDataService } from '../../lib/dataService';
import { getEstatisticasVisualizacao, getVisualizacoesByItem, registrarVisualizacao } from '../../lib/supabase';
import type { Material, Turma, Disciplina } from '../../lib/supabase';
import { MaterialModal } from '../Modals/MaterialModal';
import { useRealtimeMateriais } from '../../hooks/useRealtimeMateriais';

export function MateriaisPage() {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    turma: '',
    disciplina: '',
    tipo: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [visualizacoes, setVisualizacoes] = useState<any>({});
  const [showVisualizacoes, setShowVisualizacoes] = useState<any>({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const useRealtimeSource = isSupabaseConnected;
  const { materiais: realtimeMateriais, loading: realtimeLoading } = useRealtimeMateriais({
    enabled: !!user && useRealtimeSource,
    initialFetch: true
  });

  useEffect(() => {
    if (user && !useRealtimeSource) fetchData();
  }, [user, useRealtimeSource]);

  useEffect(() => {
    if (useRealtimeSource) {
      setMateriais(realtimeMateriais);
    }
  }, [realtimeMateriais, useRealtimeSource]);

  const fetchData = async () => {
    try {
      const [materiaisData, turmasData, disciplinasData] = await Promise.all([
        dataService.getMateriais(),
        dataService.getTurmas(),
        dataService.getDisciplinas()
      ]);
      
      setMateriais(materiaisData);
      setTurmas(turmasData);
      setDisciplinas(disciplinasData);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
    } finally {
      setLoading(false);
      // Buscar visualizações após carregar materiais
      if (materiais.length > 0) {
        fetchVisualizacoes();
      }
    }
  };

  const fetchVisualizacoes = async () => {
    if (user!.tipo_usuario === 'professor' || user!.tipo_usuario === 'admin') {
      try {
        const stats: any = {};
        for (const material of materiais) {
          const estatisticas = await getEstatisticasVisualizacao('material', material.id);
          stats[material.id] = { stats: estatisticas };
        }
        setVisualizacoes(stats);
      } catch (error) {
        console.error('Erro ao buscar visualizações:', error);
      }
    }
  };

  const toggleVisualizacoes = async (materialId: string) => {
    if (showVisualizacoes[materialId]) {
  setShowVisualizacoes((prev: any) => ({ ...prev, [materialId]: false }));
    } else {
      try {
        const detalhes = await getVisualizacoesByItem('material', materialId);
  setVisualizacoes((prev: any) => ({
          ...prev,
          [materialId]: { ...prev[materialId], detalhes }
        }));
  setShowVisualizacoes((prev: any) => ({ ...prev, [materialId]: true }));
      } catch (error) {
        console.error('Erro ao buscar detalhes de visualização:', error);
      }
    }
  };

  const materiaisFiltrados = materiais.filter(material => {
    const matchBusca = !filtros.busca || 
      material.titulo.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchTurma = !filtros.turma || material.disciplina?.turma_id === filtros.turma;
    const matchDisciplina = !filtros.disciplina || material.disciplina_id === filtros.disciplina;
    const matchTipo = !filtros.tipo || material.tipo === filtros.tipo;
    
    return matchBusca && matchTurma && matchDisciplina && matchTipo;
  });

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setShowModal(true);
  };

  const handleDelete = async (material: Material) => {
    if (!confirm(`Tem certeza que deseja excluir "${material.titulo}"?`)) return;
    const optimistic = useRealtimeSource;
    let rollback: Material[] | null = null;
    if (optimistic) {
      rollback = [...materiais];
      setMateriais(prev => prev.filter(m => m.id !== material.id));
    }
    try {
      await dataService.deleteMaterial(material.id);
      if (!optimistic) fetchData();
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      if (rollback) setMateriais(rollback);
      alert('Erro ao excluir material');
    }
  };

  const handleView = (material: Material) => {
    // Registrar visualização para pais
    if (user!.tipo_usuario === 'pai') {
      registrarVisualizacao('material', material.id).catch(error => {
        console.error('Erro ao registrar visualização:', error);
      });
    }
    
    // Abrir modal de detalhes
    setSelectedMaterial(material);
    setShowDetailModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingMaterial(null);
  };

  const handleModalSave = () => {
    // Se offline precisamos refazer; se realtime, virá via evento
    if (!useRealtimeSource) fetchData();
  };

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'link':
        return <Link className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'pdf':
        return 'PDF';
      case 'video':
        return 'Vídeo';
      case 'link':
        return 'Link';
      default:
        return 'Material';
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'pdf':
        return 'bg-red-100 text-red-700';
      case 'video':
        return 'bg-purple-100 text-purple-700';
      case 'link':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if ((loading && !useRealtimeSource) || (useRealtimeSource && realtimeLoading)) {
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
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {user!.tipo_usuario === 'pai' ? '📚 Materiais dos Filhos' : 
               user!.tipo_usuario === 'professor' ? '🎯 Meus Materiais Didáticos' : 
               '📖 Gestão de Materiais'}
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              {user!.tipo_usuario === 'pai' ? 'Recursos educacionais disponíveis' : 
               'Compartilhe conhecimento com seus alunos'}
            </p>
          </div>
        </div>
        {(user!.tipo_usuario === 'professor' || user!.tipo_usuario === 'admin') && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Material</span>
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título..."
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
          <select
            value={filtros.disciplina}
            onChange={(e) => setFiltros({ ...filtros, disciplina: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as disciplinas</option>
            {disciplinas.map(disciplina => (
              <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>
            ))}
          </select>
          <select
            value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            <option value="pdf">PDF</option>
            <option value="video">Vídeo</option>
            <option value="link">Link</option>
          </select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-200 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-110">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-blue-600 uppercase tracking-wide">📚 Total</p>
              <p className="text-3xl font-black text-blue-700">{materiais.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-xl border-2 border-red-200 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-110">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-red-600 uppercase tracking-wide">📄 PDFs</p>
              <p className="text-3xl font-black text-red-700">
                {materiais.filter(m => m.tipo === 'pdf').length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-200 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-110">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-purple-600 uppercase tracking-wide">🎥 Vídeos</p>
              <p className="text-3xl font-black text-purple-700">
                {materiais.filter(m => m.tipo === 'video').length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg">
              <Video className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-200 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-110">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-blue-600 uppercase tracking-wide">🔗 Links</p>
              <p className="text-3xl font-black text-blue-700">
                {materiais.filter(m => m.tipo === 'link').length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg">
              <Link className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de materiais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materiaisFiltrados.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum material encontrado</h3>
            <p className="text-gray-500">
              {user!.tipo_usuario === 'professor' 
                ? 'Crie seu primeiro material didático clicando em "Novo Material".'
                : 'Ajuste os filtros ou aguarde novos materiais serem adicionados.'
              }
            </p>
          </div>
        ) : (
          materiaisFiltrados.map((material) => (
            <div 
              key={material.id} 
              className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl shadow-xl border-2 border-gray-200 hover:shadow-2xl hover:border-blue-400 hover:scale-110 hover:rotate-1 transition-all duration-300 cursor-pointer group"
              onClick={() => handleView(material)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg">
                      {getIconForType(material.tipo)}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 text-lg">{material.titulo}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-3 py-1 text-xs rounded-xl font-bold shadow-sm ${getTypeColor(material.tipo)}`}>
                          {getTypeLabel(material.tipo)}
                        </span>
                        <div className="flex items-center space-x-1">
                          <div 
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: material.disciplina?.cor || '#3B82F6' }}
                          ></div>
                          <span className="text-xs text-gray-600 font-semibold">
                            {material.disciplina?.nome}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {(user!.tipo_usuario === 'professor' || user!.tipo_usuario === 'admin') && (
                      <>
                        <button 
                          onClick={() => toggleVisualizacoes(material.id)}
                          className="text-gray-600 hover:text-green-600 p-1 rounded hover:bg-green-50"
                          title="Ver quem visualizou"
                        >
                          {visualizacoes[material.id]?.stats?.usuariosUnicos > 0 ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                        </button>
                      <button 
                        onClick={() => handleEdit(material)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      </>
                    )}
                    {(user!.tipo_usuario === 'professor' || user!.tipo_usuario === 'admin') && (
                      <button 
                        onClick={() => handleDelete(material)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {material.descricao && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{material.descricao}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-bold">🏫 Turma:</span>
                    <span className="font-black text-gray-900">
                      {turmas.find(t => t.id === material.disciplina?.turma_id)?.nome || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-bold">📚 Disciplina:</span>
                    <span className="font-black text-gray-900">{material.disciplina?.nome}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-bold">📅 Criado em:</span>
                    <span className="text-gray-700 font-semibold">
                      📅 {new Date(material.criado_em).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        weekday: 'short'
                      })}
                    </span>
                  </div>
                  
                  {/* Estatísticas de Visualização para Professores */}
                  {(user!.tipo_usuario === 'professor' || user!.tipo_usuario === 'admin') && visualizacoes[material.id] && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-bold">👁️ Visualizações:</span>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="font-black text-green-700">
                          {visualizacoes[material.id].stats.usuariosUnicos}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Detalhes de Visualização */}
                {showVisualizacoes[material.id] && visualizacoes[material.id]?.detalhes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Quem visualizou:</h5>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {visualizacoes[material.id].detalhes.slice(0, 3).map((viz: any) => (
                        <div key={viz.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{viz.usuario?.nome}</span>
                          <span className="text-gray-500">
                            {new Date(viz.visualizado_em).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      ))}
                      {visualizacoes[material.id].detalhes.length > 3 && (
                        <div className="text-xs text-gray-400 text-center pt-1">
                          +{visualizacoes[material.id].detalhes.length - 3} mais...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-blue-700 text-center font-black opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 px-3 py-2 rounded-xl">
                    ✨ Clique para {material.tipo === 'link' ? 'abrir link' : 
                                   material.tipo === 'video' ? 'assistir vídeo' : 
                                   'visualizar/baixar'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de criação/edição */}
      <MaterialModal
        isOpen={showModal}
        onClose={handleModalClose}
        material={editingMaterial}
        onSave={handleModalSave}
      />

      {/* Modal de detalhes */}
      <ItemDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={selectedMaterial}
        type="material"
        turmaName={selectedMaterial ? turmas.find(t => t.id === selectedMaterial.disciplina?.turma_id)?.nome : ''}
        disciplinaName={selectedMaterial?.disciplina?.nome}
      />
    </div>
  );
}