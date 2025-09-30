import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit3, Trash2, Save, X, CheckCircle, BookOpen, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { useDataService } from '../../lib/dataService';
import type { PeriodoLetivo } from '../../lib/supabase.types';

interface PeriodoLetivoFormData {
  nome: string;
  tipo: 'bimestre' | 'trimestre' | 'semestre' | 'anual';
  data_inicio: string;
  data_fim: string;
  ano_letivo: string;
  ativo: boolean;
}

export default function PeriodoLetivoPage() {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  
  const [periodos, setPeriodos] = useState<PeriodoLetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPeriodo, setEditingPeriodo] = useState<PeriodoLetivo | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PeriodoLetivoFormData>({
    nome: '',
    tipo: 'bimestre',
    data_inicio: '',
    data_fim: '',
    ano_letivo: new Date().getFullYear().toString(),
    ativo: true
  });

  // Carregar períodos letivos
  useEffect(() => {
    const loadPeriodos = async () => {
      if (!dataService) return;
      
      try {
        setLoading(true);
        const periodosData = await dataService.getPeriodosLetivos?.() || [];
        setPeriodos(periodosData);
      } catch (error) {
        console.error('Erro ao carregar períodos letivos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPeriodos();
  }, [dataService]);

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'bimestre',
      data_inicio: '',
      data_fim: '',
      ano_letivo: new Date().getFullYear().toString(),
      ativo: true
    });
    setEditingPeriodo(null);
    setShowForm(false);
  };

  // Abrir formulário para edição
  const handleEdit = (periodo: PeriodoLetivo) => {
    setEditingPeriodo(periodo);
    setFormData({
      nome: periodo.nome,
      tipo: periodo.tipo,
      data_inicio: periodo.data_inicio.split('T')[0],
      data_fim: periodo.data_fim.split('T')[0],
      ano_letivo: periodo.ano_letivo.toString(),
      ativo: periodo.ativo
    });
    setShowForm(true);
  };

  // Validar formulário
  const validateForm = (): string | null => {
    if (!formData.nome.trim()) return 'Nome é obrigatório';
    if (!formData.data_inicio) return 'Data de início é obrigatória';
    if (!formData.data_fim) return 'Data de fim é obrigatória';
    if (!formData.ano_letivo.trim()) return 'Ano letivo é obrigatório';

    const dataInicio = new Date(formData.data_inicio);
    const dataFim = new Date(formData.data_fim);
    
    if (dataFim <= dataInicio) {
      return 'Data de fim deve ser posterior à data de início';
    }

    // Verificar sobreposição com outros períodos (exceto o que está sendo editado)
    const periodosSemEdicao = periodos.filter(p => p.id !== editingPeriodo?.id);
    const temSobreposicao = periodosSemEdicao.some(periodo => {
      const pInicio = new Date(periodo.data_inicio);
      const pFim = new Date(periodo.data_fim);
      
      return (dataInicio >= pInicio && dataInicio <= pFim) ||
             (dataFim >= pInicio && dataFim <= pFim) ||
             (dataInicio <= pInicio && dataFim >= pFim);
    });

    if (temSobreposicao) {
      return 'Este período se sobrepõe a um período existente';
    }

    return null;
  };

  // Salvar período letivo
  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    try {
      setSaving(true);
      
      const periodoData = {
        ...formData,
        data_inicio: new Date(formData.data_inicio).toISOString(),
        data_fim: new Date(formData.data_fim).toISOString(),
        ano_letivo: parseInt(formData.ano_letivo)
      };

      if (editingPeriodo) {
        await dataService.updatePeriodoLetivo?.(editingPeriodo.id, periodoData);
        setPeriodos(prev => prev.map(p => 
          p.id === editingPeriodo.id ? { ...p, ...periodoData } : p
        ));
      } else {
        const novoPeriodo = await dataService.createPeriodoLetivo?.(periodoData);
        if (novoPeriodo) {
          setPeriodos(prev => [...prev, novoPeriodo]);
        }
      }

      resetForm();
    } catch (error) {
      console.error('Erro ao salvar período letivo:', error);
      alert('Erro ao salvar período letivo');
    } finally {
      setSaving(false);
    }
  };

  // Deletar período letivo
  const handleDelete = async (periodo: PeriodoLetivo) => {
    if (!confirm(`Tem certeza que deseja excluir o período "${periodo.nome}"?`)) return;

    try {
      await dataService.deletePeriodoLetivo?.(periodo.id);
      setPeriodos(prev => prev.filter(p => p.id !== periodo.id));
    } catch (error) {
      console.error('Erro ao deletar período letivo:', error);
      alert('Erro ao deletar período letivo');
    }
  };

  // Alternar status ativo
  const toggleAtivo = async (periodo: PeriodoLetivo) => {
    try {
      const novoStatus = !periodo.ativo;
      await dataService.updatePeriodoLetivo?.(periodo.id, { ativo: novoStatus });
      setPeriodos(prev => prev.map(p => 
        p.id === periodo.id ? { ...p, ativo: novoStatus } : p
      ));
    } catch (error) {
      console.error('Erro ao alterar status do período:', error);
      alert('Erro ao alterar status do período');
    }
  };

  // Verificar se está no período atual
  const isCurrentPeriod = (periodo: PeriodoLetivo) => {
    const hoje = new Date();
    const inicio = new Date(periodo.data_inicio);
    const fim = new Date(periodo.data_fim);
    return hoje >= inicio && hoje <= fim && periodo.ativo;
  };

  // Formataar data para exibição
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuração de Períodos Letivos</h1>
                <p className="text-gray-600 mt-1">
                  Gerencie bimestres, trimestres e semestres do ano letivo
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Período</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Períodos</p>
                <p className="text-2xl font-bold text-gray-900">{periodos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Períodos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {periodos.filter(p => p.ativo).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Período Atual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {periodos.filter(p => isCurrentPeriod(p)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ano Letivo</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Períodos */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Períodos Letivos Configurados
            </h2>
          </div>

          <div className="overflow-x-auto">
            {periodos.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum período configurado
                </h3>
                <p className="text-gray-600 mb-4">
                  Configure o primeiro período letivo para começar a usar o sistema de validação.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Criar Primeiro Período
                </button>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Início
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Fim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ano Letivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {periodos.map((periodo) => (
                    <tr key={periodo.id} className={isCurrentPeriod(periodo) ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            isCurrentPeriod(periodo) ? 'bg-green-500' : 
                            periodo.ativo ? 'bg-blue-500' : 'bg-gray-300'
                          }`}></div>
                          <div className="text-sm font-medium text-gray-900">
                            {periodo.nome}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          periodo.tipo === 'bimestre' ? 'bg-blue-100 text-blue-800' :
                          periodo.tipo === 'trimestre' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {periodo.tipo.charAt(0).toUpperCase() + periodo.tipo.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(periodo.data_inicio)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(periodo.data_fim)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {periodo.ano_letivo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {isCurrentPeriod(periodo) && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Atual
                            </span>
                          )}
                          <button
                            onClick={() => toggleAtivo(periodo)}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              periodo.ativo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {periodo.ativo ? 'Ativo' : 'Inativo'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(periodo)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(periodo)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPeriodo ? 'Editar Período Letivo' : 'Novo Período Letivo'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Período
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: 1º Bimestre 2024"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Período
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bimestre">Bimestre</option>
                    <option value="trimestre">Trimestre</option>
                    <option value="semestre">Semestre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ano Letivo
                  </label>
                  <input
                    type="text"
                    value={formData.ano_letivo}
                    onChange={(e) => setFormData(prev => ({ ...prev, ano_letivo: e.target.value }))}
                    placeholder="2024"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Período ativo</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}