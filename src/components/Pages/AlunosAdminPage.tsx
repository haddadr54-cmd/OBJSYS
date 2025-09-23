import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Edit, Trash2, Search, Filter, Eye, UserCheck, UserX, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDataService } from '../../lib/dataService';
import type { Aluno, Turma, Usuario } from '../../lib/supabase';
import { StudentModal } from '../Modals/StudentModal';
import { useDataRefresh } from '../../hooks/useDataRefresh';

export function AlunosAdminPage() {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const { refreshKey, triggerRefresh } = useDataRefresh();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [responsaveis, setResponsaveis] = useState<Usuario[]>([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    turma: '',
    status: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const fetchData = async () => {
    try {
      const [alunosData, turmasData, usuariosData] = await Promise.all([
        dataService.getAlunos(),
        dataService.getTurmas(),
        dataService.getUsuarios()
      ]);
      
      const responsaveisFiltrados = usuariosData.filter(u => u.tipo_usuario === 'pai');
      
      setAlunos(alunosData);
      setTurmas(turmasData);
      setResponsaveis(responsaveisFiltrados);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppToResponsavel = async (aluno: Aluno) => {
    const alunoComDetalhes = getAlunoWithDetails(aluno);
    const responsavel = alunoComDetalhes.responsavel;
    
    if (!responsavel?.telefone) {
      alert('O responsável deste aluno não possui telefone cadastrado.');
      return;
    }

    const message = `Olá ${responsavel.nome}! Esta é uma mensagem do Colégio Objetivo sobre seu filho(a) ${aluno.nome}.`;
    
    try {
      // Formatar número para Z-API (apenas números)
      const cleanNumber = responsavel.telefone.replace(/\D/g, '');
      
      const response = await fetch('https://api.z-api.io/instances/3E77C41E18874016EF0E2676AA920B85/token/485FD874492F6CFAAC3069AD/send-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanNumber,
          message: message
        })
      });
      
      const data = await response.json();
      
      if (response.ok && !data.error) {
        alert(`✅ Mensagem enviada com sucesso para ${responsavel.nome} (responsável por ${aluno.nome})!`);
      } else {
        alert(`❌ Erro ao enviar mensagem: ${data.message || data.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      alert('❌ Erro ao enviar mensagem via WhatsApp');
    }
  };
  const getAlunoWithDetails = (aluno: Aluno) => {
    const turma = turmas.find(t => t.id === aluno.turma_id);
    const responsavel = responsaveis.find(r => r.id === aluno.responsavel_id);
    return { ...aluno, turma, responsavel };
  };

  const alunosFiltrados = alunos.filter(aluno => {
    const matchBusca = !filtros.busca || 
      aluno.nome.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchTurma = !filtros.turma || aluno.turma_id === filtros.turma;
    
    return matchBusca && matchTurma;
  });

  const handleEdit = (aluno: Aluno) => {
    setSelectedStudent(aluno);
    setShowModal(true);
  };

  const handleDelete = async (aluno: Aluno) => {
    if (confirm(`Tem certeza que deseja excluir o aluno ${aluno.nome}?`)) {
      try {
        await dataService.deleteAluno(aluno.id);
        triggerRefresh();
      } catch (error) {
        console.error('Erro ao excluir aluno:', error);
        if (error instanceof Error && error.message.includes('Supabase')) {
          alert('❌ Erro: Sistema requer conexão com Supabase para excluir alunos. Verifique sua conexão.');
        } else {
          alert('Erro ao excluir aluno');
        }
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handleModalSave = async () => {
    try {
      triggerRefresh();
      handleModalClose();
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      if (error instanceof Error && error.message.includes('Supabase')) {
        alert('❌ Erro: Sistema requer conexão com Supabase para salvar alunos. Verifique sua conexão.');
      } else {
        alert('Erro ao salvar aluno');
      }
    }
  };

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
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Alunos</h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Aluno</span>
        </button>
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
              placeholder="Buscar por nome..."
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
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
              <p className="text-2xl font-bold text-gray-900">{alunos.length}</p>
            </div>
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Turmas Ativas</p>
              <p className="text-2xl font-bold text-green-600">{turmas.length}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Responsáveis</p>
              <p className="text-2xl font-bold text-purple-600">{responsaveis.length}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-full">
              <UserCheck className="h-6 w-6 text-purple-600" />
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
              <GraduationCap className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de alunos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Alunos ({alunosFiltrados.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aluno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Situação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alunosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum aluno encontrado com os filtros aplicados
                  </td>
                </tr>
              ) : (
                alunosFiltrados.map((aluno) => {
                  const alunoComDetalhes = getAlunoWithDetails(aluno);
                  return (
                    <tr key={aluno.id} className="hover:bg-blue-50 hover:shadow-md transition-all cursor-pointer group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {aluno.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">{aluno.nome}</div>
                            <div className="text-sm text-gray-500">ID: {aluno.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{alunoComDetalhes.turma?.nome || 'Sem turma'}</div>
                        <div className="text-sm text-gray-500">{alunoComDetalhes.turma?.ano_letivo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{(aluno as any).responsavel || alunoComDetalhes.responsavel?.nome || 'Sem responsável'}</div>
                        <div className="text-sm text-gray-500">{(aluno as any).email_responsavel || alunoComDetalhes.responsavel?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center space-x-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          <UserCheck className="h-3 w-3" />
                          <span>Ativo</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(aluno.criado_em).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {(alunoComDetalhes.responsavel?.telefone || (aluno as any).telefone_responsavel) && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                sendWhatsAppToResponsavel(aluno);
                              }}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Enviar WhatsApp para responsável"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(aluno);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Ver detalhes do aluno:', aluno.nome);
                            }}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(aluno);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* Modal de criação/edição (placeholder) */}
      <StudentModal
        key={selectedStudent?.id || 'new-student-modal'}
        isOpen={showModal}
        onClose={handleModalClose}
        student={selectedStudent}
        onSave={handleModalSave}
      />
    </div>
  );
}