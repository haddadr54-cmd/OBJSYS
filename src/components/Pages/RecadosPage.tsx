import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Edit, Trash2, Search, Filter, Calendar, User, Users, School, CheckCircle, AlertCircle } from 'lucide-react';
import { ItemDetailModal } from '../Modals/ItemDetailModal';
import { useAuth } from '../../contexts/auth';
import { useDataService } from '../../lib/dataService';
import { getEstatisticasVisualizacao, getVisualizacoesByItem, registrarVisualizacao } from '../../lib/supabase';
import type { Recado } from '../../lib/supabase';
import { RecadoModal } from '../Modals/RecadoModal';
import { useRealtimeRecados } from '../../hooks/useRealtimeRecados';

export function RecadosPage() {
  const { user } = useAuth();
  const { isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [recados, setRecados] = useState<Recado[]>([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    tipo: '',
    periodo: 'todos'
  });
  const [showModal, setShowModal] = useState(false);
  const [editingRecado, setEditingRecado] = useState<Recado | null>(null);
  const [loading, setLoading] = useState(true);
  const [visualizacoes, setVisualizacoes] = useState<any>({});
  const [showVisualizacoes, setShowVisualizacoes] = useState<any>({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecado, setSelectedRecado] = useState<Recado | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const useRealtimeSource = isSupabaseConnected;
  const { recados: realtimeRecados, loading: realtimeLoading } = useRealtimeRecados({
    enabled: !!user && useRealtimeSource,
    initialFetch: true
  });

  useEffect(() => {
    if (user && !useRealtimeSource) fetchRecados();
  }, [user, useRealtimeSource]);

  useEffect(() => {
    if (useRealtimeSource) setRecados(realtimeRecados);
  }, [realtimeRecados, useRealtimeSource]);

  const fetchRecados = async () => {
    try {
      const recadosData = await dataService.getRecados();
      setRecados(recadosData);
    } catch (error) {
      console.error('Erro ao carregar recados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisualizacoes = async (recadoId: string) => {
    try {
      const stats = await getEstatisticasVisualizacao('recado', recadoId);
      const detalhes = await getVisualizacoesByItem('recado', recadoId);
      
  setVisualizacoes((prev: any) => ({
        ...prev,
        [recadoId]: { stats, detalhes }
      }));
    } catch (error) {
      console.error('Erro ao buscar visualizações:', error);
    }
  };

  const toggleVisualizacoes = async (recadoId: string) => {
    if (!visualizacoes[recadoId]) {
      await fetchVisualizacoes(recadoId);
    }
    
  setShowVisualizacoes((prev: any) => ({
      ...prev,
      [recadoId]: !prev[recadoId]
    }));
  };

  const handleViewRecado = async (recado: Recado) => {
    if (user?.tipo_usuario === 'pai') {
      try {
        await registrarVisualizacao('recado', recado.id);
      } catch (error) {
        console.error('Erro ao registrar visualização:', error);
      }
    }
    
    // Abrir modal de detalhes
    setSelectedRecado(recado);
    setShowDetailModal(true);
  };

  const recadosFiltrados = recados.filter(recado => {
    const matchBusca = !filtros.busca || 
      recado.titulo.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      recado.conteudo.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchTipo = !filtros.tipo || recado.destinatario_tipo === filtros.tipo;
    
    let matchPeriodo = true;
    if (filtros.periodo !== 'todos') {
      const dataRecado = new Date(recado.data_envio);
      const hoje = new Date();
      
      if (filtros.periodo === 'hoje') {
        matchPeriodo = dataRecado.toDateString() === hoje.toDateString();
      } else if (filtros.periodo === 'semana') {
        const semanaAtras = new Date();
        semanaAtras.setDate(hoje.getDate() - 7);
        matchPeriodo = dataRecado >= semanaAtras;
      } else if (filtros.periodo === 'mes') {
        const mesAtras = new Date();
        mesAtras.setMonth(hoje.getMonth() - 1);
        matchPeriodo = dataRecado >= mesAtras;
      }
    }
    
    return matchBusca && matchTipo && matchPeriodo;
  });

  const handleEdit = (recado: Recado) => {
    setEditingRecado(recado);
    setShowModal(true);
  };

  const handleDelete = async (recado: Recado) => {
    if (!confirm(`Tem certeza que deseja excluir o recado "${recado.titulo}"?`)) return;
    const optimistic = useRealtimeSource;
    let rollback: Recado[] | null = null;
    if (optimistic) {
      rollback = [...recados];
      setRecados(prev => prev.filter(r => r.id !== recado.id));
    }
    try {
      const ok = await dataService.deleteRecado(recado.id);
      if (!ok && rollback) setRecados(rollback);
      if (!optimistic) fetchRecados();
      // Forçar refetch leve após pequeno atraso para garantir consistência em caso de perda de evento
      if (useRealtimeSource) {
        setTimeout(() => {
          dataService.getRecados().then(latest => {
            setRecados(latest);
          }).catch(()=>{});
        }, 800);
      }
    } catch (error) {
      console.error('Erro ao excluir recado:', error);
      if (rollback) setRecados(rollback);
      alert('Erro ao excluir recado');
    }
  };

  const handleBulkDelete = async () => {
    if (!(user && (user.tipo_usuario === 'professor' || user.tipo_usuario === 'admin'))) return;
    if (recados.length === 0) return;
    if (!confirm(`Excluir TODOS os ${recados.length} recados? Esta ação é permanente.`)) return;
    setBulkDeleting(true);
    const snapshot = [...recados];
    setRecados([]); // otimista
    try {
      const ids = snapshot.map(r => r.id);
      const result = await dataService.bulkDeleteRecados(ids);
      if (result.failedIds.length > 0) {
        alert(`Falha ao excluir ${result.failedIds.length} recados.`);
        // Recarregar estado coerente
        if (useRealtimeSource) {
          setTimeout(() => {
            dataService.getRecados().then(latest => setRecados(latest)).catch(()=>{});
          }, 500);
        } else {
          setRecados(snapshot.filter(r => result.failedIds.includes(r.id))); // restaura os que falharam
        }
      }
    } catch (e) {
      console.error('Erro ao excluir todos recados:', e);
      alert('Erro ao excluir recados.');
      setRecados(snapshot);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingRecado(null);
  };

  const handleModalSave = () => {
    // Quando em realtime, o INSERT/UPDATE chegará via canal; offline refetch
    if (!useRealtimeSource) fetchRecados();
  };

  const getDestinatarioLabel = (recado: Recado) => {
    switch (recado.destinatario_tipo) {
      case 'geral':
        return 'Todos';
      case 'turma':
        return 'Turma específica';
      case 'aluno':
        return 'Aluno específico';
      default:
        return recado.destinatario_tipo;
    }
  };

  const getDestinatarioColor = (tipo: string) => {
    switch (tipo) {
      case 'geral':
        return 'bg-blue-100 text-blue-800';
      case 'turma':
        return 'bg-green-100 text-green-800';
      case 'aluno':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {user!.tipo_usuario === 'pai' ? '💌 Recados Recebidos' : 
               user!.tipo_usuario === 'professor' ? '📢 Meus Recados' : 
               '📬 Central de Recados'}
            </h1>
            {useRealtimeSource && <span className="text-xs font-semibold text-purple-600">Realtime</span>}
            <p className="text-gray-600 text-lg font-medium">
              {user!.tipo_usuario === 'pai' ? 'Comunicações importantes da escola' : 
               'Gerencie a comunicação com as famílias'}
            </p>
          </div>
        </div>
        {(user!.tipo_usuario === 'professor' || user!.tipo_usuario === 'admin') && (
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Recado</span>
            </button>
            {recados.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${bulkDeleting ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}
              >
                <Trash2 className="h-4 w-4" />
                <span>{bulkDeleting ? 'Excluindo...' : 'Excluir Todos'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título ou conteúdo..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            <option value="geral">Geral</option>
            <option value="turma">Turma</option>
            <option value="aluno">Aluno</option>
          </select>
          <select
            value={filtros.periodo}
            onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos os períodos</option>
            <option value="hoje">Hoje</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mês</option>
          </select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-200 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-110">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-purple-600 uppercase tracking-wide">💌 Total</p>
              <p className="text-3xl font-black text-purple-700">{recados.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gerais</p>
              <p className="text-2xl font-bold text-blue-600">
                {recados.filter(r => r.destinatario_tipo === 'geral').length}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Para Turmas</p>
              <p className="text-2xl font-bold text-green-600">
                {recados.filter(r => r.destinatario_tipo === 'turma').length}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <School className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Individuais</p>
              <p className="text-2xl font-bold text-purple-600">
                {recados.filter(r => r.destinatario_tipo === 'aluno').length}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-full">
              <User className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de recados */}
      <div className="space-y-4">
        {recadosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum recado encontrado</h3>
            <p className="text-gray-500">
              {user!.tipo_usuario === 'professor' 
                ? 'Crie seu primeiro recado clicando em "Novo Recado".'
                : 'Ajuste os filtros ou aguarde novos recados.'
              }
            </p>
          </div>
        ) : (
          recadosFiltrados.map((recado) => (
            <div 
              key={recado.id} 
              className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl shadow-xl border-2 border-purple-200 hover:shadow-2xl hover:border-purple-400 hover:scale-105 hover:rotate-1 transition-all duration-300 cursor-pointer group"
              onClick={() => handleViewRecado(recado)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-purple-700 transition-colors">{recado.titulo}</h3>
                      <span className={`px-3 py-1 text-xs rounded-xl font-bold shadow-sm ${getDestinatarioColor(recado.destinatario_tipo)}`}>
                        {getDestinatarioLabel(recado)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3 font-medium leading-relaxed">{recado.conteudo}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4 text-purple-500" />
                        <span className="font-bold text-gray-700">👨‍🏫 Por: {recado.autor?.nome}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="font-bold text-gray-700">📅 {new Date(recado.data_envio).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          weekday: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                    <p className="text-xs text-purple-700 mt-3 opacity-0 group-hover:opacity-100 transition-opacity font-black bg-white px-3 py-2 rounded-xl">
                      ✨ Clique para ler o recado completo
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(user!.tipo_usuario === 'professor' || user!.tipo_usuario === 'admin') && (
                      <>
                        <button 
                          onClick={() => toggleVisualizacoes(recado.id)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Ver quem visualizou"
                        >
                          {visualizacoes[recado.id]?.stats?.usuariosUnicos > 0 ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleEdit(recado)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(recado)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Estatísticas de Visualização */}
                {(user!.tipo_usuario === 'professor' || user!.tipo_usuario === 'admin') && visualizacoes[recado.id] && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>📊 Visualizações:</span>
                      <span className="font-medium">
                        {visualizacoes[recado.id].stats.usuariosUnicos} usuários únicos
                      </span>
                    </div>
                    {visualizacoes[recado.id].stats.ultimaVisualizacao && (
                      <div className="text-xs text-gray-500">
                        Última: {new Date(visualizacoes[recado.id].stats.ultimaVisualizacao).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                )}

                {/* Detalhes de Visualização */}
                {showVisualizacoes[recado.id] && visualizacoes[recado.id]?.detalhes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Quem leu este recado:</h5>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {visualizacoes[recado.id].detalhes.slice(0, 5).map((viz: any) => (
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
                      {visualizacoes[recado.id].detalhes.length > 5 && (
                        <div className="text-xs text-gray-400 text-center pt-1">
                          +{visualizacoes[recado.id].detalhes.length - 5} mais...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de criação/edição */}
      <RecadoModal
        isOpen={showModal}
        onClose={handleModalClose}
        recado={editingRecado}
        onSave={handleModalSave}
      />

      {/* Modal de detalhes */}
      <ItemDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={selectedRecado}
        type="recado"
        autorName={selectedRecado?.autor?.nome}
      />
    </div>
  );
}