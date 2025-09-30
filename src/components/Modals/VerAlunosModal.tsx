import { useState, useEffect } from 'react';
import { X, GraduationCap, Users, Search, Eye, BookOpen, Calendar, Phone, Mail } from 'lucide-react';
import {
  getNotasByAluno,
  getAllUsuarios
} from '../../lib/supabase';
import type { Turma, Aluno, Nota, Usuario } from '../../lib/supabase.types';
import { useAuth } from '../../contexts/auth';
import { useDataService } from '../../lib/dataService';
import { getNotaTextColor } from '../../lib/gradeConfig';

interface VerAlunosModalProps {
  isOpen: boolean;
  onClose: () => void;
  aluno?: Aluno; // Novo: aluno selecionado opcional
}

interface AlunoDetalhado extends Aluno {
  turma?: Turma;
  responsavel?: Usuario;
  notas?: Nota[];
  mediaGeral: number;
  totalPresencas: number;
  percentualPresenca: number;
}

export function VerAlunosModal({ isOpen, onClose, aluno }: VerAlunosModalProps) {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<AlunoDetalhado[]>([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    turma: ''
  });
  const [selectedAluno, setSelectedAluno] = useState<AlunoDetalhado | null>(null);
  const [loading, setLoading] = useState(false);

  // Carrega dados ao abrir o modal
  useEffect(() => {
    if (isOpen && user) {
      fetchData();
    }
  }, [isOpen, user]);

  // Se receber um aluno por props, abre direto o perfil desse aluno
  useEffect(() => {
    // Se vier aluno por props, tenta abrir o perfil assim que possível
    if (aluno) {
      if (alunos.length > 0) {
        const encontrado = alunos.find(a => a.id === aluno.id);
        if (encontrado) {
          setSelectedAluno(encontrado);
        } else {
          setSelectedAluno(null);
        }
      } else {
        // Se ainda não carregou alunos, cria um placeholder parcial
        setSelectedAluno(prev => prev && prev.id === aluno.id ? prev : {
          ...aluno,
          turma: undefined,
          responsavel: undefined,
          notas: [],
          mediaGeral: 0,
          totalPresencas: 0,
          percentualPresenca: 0
        });
      }
    } else {
      setSelectedAluno(null);
    }
  }, [aluno, alunos]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const turmasData = await dataService.getTurmas();
      setTurmas(turmasData);

      if (turmasData.length > 0) {
        const turmaIds = turmasData.map(t => t.id);
        const todosAlunos = await dataService.getAlunos();
        const todosUsuarios = isSupabaseConnected ? await getAllUsuarios() : [];
        
        // Para professores, filtrar apenas alunos das suas turmas
        const alunosDasTurmas = user!.tipo_usuario === 'professor' 
          ? todosAlunos.filter(a => turmaIds.includes(a.turma_id))
          : todosAlunos;
        
        // Enriquecer dados dos alunos
        const alunosDetalhados: AlunoDetalhado[] = [];
        
        for (const aluno of alunosDasTurmas) {
          const turma = turmasData.find(t => t.id === aluno.turma_id);
          const responsavel = todosUsuarios.find(u => u.id === aluno.responsavel_id);
          
          let notas: Nota[] = [];
          try {
            if (isSupabaseConnected) {
              notas = await getNotasByAluno(aluno.id);
            } else {
              const todasNotas = await dataService.getNotas();
              notas = todasNotas.filter(n => n.aluno_id === aluno.id);
            }
          } catch (error) {
            console.error('Erro ao carregar notas do aluno:', error);
            notas = [];
          }
          
          const mediaGeral = notas.length > 0 
            ? notas.reduce((acc, nota) => acc + (nota.nota || 0), 0) / notas.length 
            : 0;
          
          alunosDetalhados.push({
            ...aluno,
            turma,
            responsavel,
            notas,
            mediaGeral,
            totalPresencas: 0, // Será implementado quando necessário
            percentualPresenca: 0
          });
        }
        
        setAlunos(alunosDetalhados);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const alunosFiltrados = alunos.filter(aluno => {
    const matchBusca = !filtros.busca || 
      aluno.nome.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchTurma = !filtros.turma || aluno.turma_id === filtros.turma;
    
    return matchBusca && matchTurma;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Meus Alunos</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome do aluno..."
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

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Alunos</p>
                  <p className="text-2xl font-bold text-blue-900">{alunos.length}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Turmas</p>
                  <p className="text-2xl font-bold text-green-900">{turmas.length}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Média Geral</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {alunos.length > 0 
                      ? (alunos.reduce((acc, a) => acc + a.mediaGeral, 0) / alunos.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Com Notas</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {alunos.filter(a => a.notas && a.notas.length > 0).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Lista de Alunos */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : turmas.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma turma atribuída
              </h3>
              <p className="text-gray-500">
                Você ainda não possui turmas atribuídas. Entre em contato com o administrador.
              </p>
            </div>
          ) : alunosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum aluno encontrado com os filtros aplicados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alunosFiltrados.map((aluno) => (
                <div key={aluno.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {aluno.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{aluno.nome}</h4>
                        <p className="text-sm text-gray-500">{aluno.turma?.nome}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAluno(aluno)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Média Geral:</span>
                      <span className={`text-sm font-bold ${getNotaTextColor(aluno.mediaGeral)}`}>
                        {aluno.mediaGeral.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Notas:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {aluno.notas?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Responsável:</span>
                      <span className="text-sm text-gray-900">
                        {aluno.responsavel?.nome || 'Não informado'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedAluno(aluno)}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver Perfil Completo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Detalhes do Aluno */}
        {selectedAluno && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedAluno.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedAluno.nome}</h3>
                    <p className="text-sm text-gray-500">{selectedAluno.turma?.nome}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAluno(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Nome Completo</label>
                      <p className="text-gray-900">{selectedAluno.nome}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Turma</label>
                      <p className="text-gray-900">{selectedAluno.turma?.nome}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Matrícula</label>
                      <p className="text-gray-900">{selectedAluno.id.slice(0, 8)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Data de Criação</label>
                      <p className="text-gray-900">
                        {new Date(selectedAluno.criado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dados do Responsável */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Responsável</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Nome</label>
                      <p className="text-gray-900">{selectedAluno.responsavel?.nome || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{selectedAluno.responsavel?.email || 'Não informado'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Telefone</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{selectedAluno.responsavel?.telefone || 'Não informado'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desempenho Acadêmico */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Desempenho Acadêmico</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Média Geral</p>
                          <p className={`text-2xl font-bold ${getNotaTextColor(selectedAluno.mediaGeral)}`}>
                            {selectedAluno.mediaGeral.toFixed(1)}
                          </p>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Total Notas</p>
                          <p className="text-2xl font-bold text-green-900">
                            {selectedAluno.notas?.length || 0}
                          </p>
                        </div>
                        <Calendar className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Presença</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {selectedAluno.percentualPresenca}%
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Histórico de Notas */}
                  {selectedAluno.notas && selectedAluno.notas.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Histórico de Notas</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Disciplina
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Nota
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Trimestre
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Comentário
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedAluno.notas.map((nota) => (
                              <tr key={nota.id}>
                                <td className="px-3 py-2 text-gray-900">
                                  {nota.disciplina?.nome}
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`font-medium ${getNotaTextColor(nota.nota || 0)}`}>
                                    {(nota.nota || 0).toFixed(1)}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-gray-600">
                                  {nota.trimestre}º
                                </td>
                                <td className="px-3 py-2 text-gray-600">
                                  {nota.comentario || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}