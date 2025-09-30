import { useState, useEffect } from 'react';
import { AlertTriangle, GraduationCap, BookOpen, Save, Search, Filter, Users, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { useDataService } from '../../lib/dataService';
import { getSituacaoAcademica, isRecuperacao, formatarNota, MEDIA_MINIMA_APROVACAO } from '../../lib/gradeConfig';
import type { Aluno, Nota, Disciplina, Turma } from '../../lib/supabase.types';
import { RecuperacaoModal } from '../Modals/RecuperacaoModal';

interface AlunoRecuperacao {
  aluno: Aluno;
  disciplinas: {
    disciplina: Disciplina;
    mediaFinal: number;
    notaRecuperacao?: number;
    situacao: 'recuperacao' | 'aprovado_recuperacao' | 'reprovado_final';
  }[];
  mediaGeral: number;
}

export function RecuperacaoPage() {
  console.log('🔍 [RecuperacaoPage] Componente renderizado');
  
  const { user, isSupabaseConnected } = useAuth();
  console.log('🔍 [RecuperacaoPage] Auth:', { user: !!user, isSupabaseConnected });
  
  const [notas, setNotas] = useState<Nota[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(false); // Começar com false para testar
  const [error, setError] = useState<string | null>(null);

  // Inicializar dataService apenas quando necessário
  const dataService = user ? useDataService(user, isSupabaseConnected) : null;
  console.log('🔍 [RecuperacaoPage] DataService:', !!dataService);

  const [alunosRecuperacao, setAlunosRecuperacao] = useState<AlunoRecuperacao[]>([]);
  const [filtroTurma, setFiltroTurma] = useState<string>('');
  const [filtroDisciplina, setFiltroDisciplina] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAluno, setSelectedAluno] = useState<string | null>(null);
  const [showRecuperacaoModal, setShowRecuperacaoModal] = useState(false);
  const [alunoModalData, setAlunoModalData] = useState<AlunoRecuperacao | null>(null);
  const [notasRecuperacao, setNotasRecuperacao] = useState<Record<string, Record<string, number>>>({});
  const [saving, setSaving] = useState(false);

  // Carregar dados quando componente montar
  useEffect(() => {
    const loadData = async () => {
      console.log('🔍 [RecuperacaoPage] useEffect executado');
      
      if (!user) {
        console.log('🔍 [RecuperacaoPage] Usuário não disponível');
        setError('Usuário não autenticado');
        return;
      }
      
      if (!dataService) {
        console.log('🔍 [RecuperacaoPage] DataService não disponível');
        setError('Serviço de dados não disponível');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 [RecuperacaoPage] Carregando dados reais...');
        
        const alunosData = await dataService.getAlunos();
        console.log('🔍 [RecuperacaoPage] Alunos:', alunosData?.length || 0);
        
        const notasData = await dataService.getNotas();
        console.log('🔍 [RecuperacaoPage] Notas:', notasData?.length || 0);
        
        const disciplinasData = await dataService.getDisciplinas();
        console.log('🔍 [RecuperacaoPage] Disciplinas:', disciplinasData?.length || 0);
        
        const turmasData = await dataService.getTurmas();
        console.log('🔍 [RecuperacaoPage] Turmas:', turmasData?.length || 0);
        
        setAlunos(alunosData || []);
        setNotas(notasData || []);
        setDisciplinas(disciplinasData || []);
        setTurmas(turmasData || []);
        
      } catch (error) {
        console.error('❌ [RecuperacaoPage] Erro ao carregar dados:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    // Aguardar um tick para ter certeza que tudo está inicializado
    setTimeout(loadData, 100);
  }, []); // Removendo dependências para evitar loops

  // Calcular alunos em recuperação
  useEffect(() => {
    if (!alunos.length || !notas.length || !disciplinas.length) {
      return;
    }
    const alunosComRecuperacao: AlunoRecuperacao[] = [];

    alunos.forEach(aluno => {
      const notasAluno = notas.filter(n => n.aluno_id === aluno.id);
      const disciplinasAluno: AlunoRecuperacao['disciplinas'] = [];
      let somaMedias = 0;
      let disciplinasComNota = 0;

      disciplinas.forEach(disciplina => {
        const notasDisciplina = notasAluno.filter(n => n.disciplina_id === disciplina.id);
        
        if (notasDisciplina.length > 0) {
          // Excluir notas de recuperação do cálculo da média original
          const notasSemRec = notasDisciplina.filter(n => n.tipo !== 'recuperacao');
          const baseNotas = notasSemRec.length > 0 ? notasSemRec : notasDisciplina;
          const mediaFinal = baseNotas.reduce((acc, nota) => acc + (nota.nota || 0), 0) / baseNotas.length;
          
          // Verificar se há nota de recuperação
          const notaRecuperacao = notasDisciplina.find(n => n.tipo === 'recuperacao')?.nota;
          let situacao: 'recuperacao' | 'aprovado_recuperacao' | 'reprovado_final' = 'recuperacao';
          
          if (notaRecuperacao !== undefined) {
            const mediaComRecuperacao = Math.max(mediaFinal, notaRecuperacao);
            situacao = mediaComRecuperacao >= MEDIA_MINIMA_APROVACAO ? 'aprovado_recuperacao' : 'reprovado_final';
          }

          disciplinasAluno.push({
            disciplina,
            mediaFinal,
            notaRecuperacao,
            situacao
          });

          somaMedias += mediaFinal;
          disciplinasComNota++;
        }
      });

      const mediaGeral = disciplinasComNota > 0 ? somaMedias / disciplinasComNota : 0;
      
      // Verificar se aluno tem disciplinas em recuperação
      const disciplinasEmRecuperacao = disciplinasAluno.filter(d => 
        isRecuperacao(d.mediaFinal) || d.situacao === 'recuperacao' || d.situacao === 'reprovado_final'
      );

      if (disciplinasEmRecuperacao.length > 0) {
        alunosComRecuperacao.push({
          aluno,
          disciplinas: disciplinasEmRecuperacao,
          mediaGeral
        });
        

      }
    });

    setAlunosRecuperacao(alunosComRecuperacao);
  }, [alunos, notas, disciplinas]);

  // Filtrar alunos
  const alunosFiltrados = alunosRecuperacao.filter(item => {
    const matchesSearch = item.aluno.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTurma = !filtroTurma || item.aluno.turma_id === filtroTurma;
    const matchesDisciplina = !filtroDisciplina || 
      item.disciplinas.some(d => d.disciplina.id === filtroDisciplina);
    
    return matchesSearch && matchesTurma && matchesDisciplina;
  });

  // Salvar nota de recuperação (versão para modal)
  const handleSaveNotaRecuperacaoModal = async (disciplinaId: string, nota: number) => {
    if (!alunoModalData) return;
    return handleSaveNotaRecuperacao(alunoModalData.aluno.id, disciplinaId, nota);
  };

  // Salvar nota de recuperação (versão completa)
  const handleSaveNotaRecuperacao = async (alunoId: string, disciplinaId: string, nota: number) => {
    if (!dataService) {
      return;
    }

    try {
      setSaving(true);
      
      // Verificar se já existe uma nota de recuperação
      const notaExistente = notas.find(n => 
        n.aluno_id === alunoId && 
        n.disciplina_id === disciplinaId && 
        n.tipo === 'recuperacao'
      );

      let saved: Nota | null = null;
      if (notaExistente) {
        saved = await dataService.updateNota(notaExistente.id, { nota });
      } else {
        saved = await dataService.createNota({
          aluno_id: alunoId,
          disciplina_id: disciplinaId,
          nota,
          tipo: 'recuperacao',
          trimestre: 0, // Recuperação não tem trimestre
          comentario: 'Nota de recuperação'
        });
      }

      // Atualizar estado local
      setNotasRecuperacao(prev => ({
        ...prev,
        [alunoId]: {
          ...prev[alunoId],
          [disciplinaId]: nota
        }
      }));

      // Atualizar lista de notas para refletir imediatamente na UI
      if (saved) {
        setNotas(prev => {
          const idx = prev.findIndex(n => n.id === saved!.id);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = saved!;
            return copy;
          }
          return [...prev, saved!];
        });
      }

    } catch (error) {
      console.error('❌ [RecuperacaoPage] Erro ao salvar nota de recuperação:', error);
      alert('Erro ao salvar nota de recuperação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // Estatísticas
  const estatisticas = {
    totalAlunosRecuperacao: alunosRecuperacao.length,
    disciplinasComRecuperacao: [...new Set(alunosRecuperacao.flatMap(a => a.disciplinas.map(d => d.disciplina.id)))].length,
    aprovadosRecuperacao: alunosRecuperacao.filter(a => 
      a.disciplinas.every(d => d.situacao === 'aprovado_recuperacao')
    ).length,
    reprovadosFinal: alunosRecuperacao.filter(a => 
      a.disciplinas.some(d => d.situacao === 'reprovado_final')
    ).length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados de recuperação...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
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
              <div className="bg-yellow-100 p-3 rounded-xl">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestão de Recuperação</h1>
                <p className="text-gray-600 mt-1">
                  Alunos com média abaixo de {MEDIA_MINIMA_APROVACAO.toFixed(1)} - Sistema de Recuperação
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Recarregar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alunos em Recuperação</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.totalAlunosRecuperacao}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disciplinas Afetadas</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.disciplinasComRecuperacao}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aprovados na Recuperação</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.aprovadosRecuperacao}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reprovados Final</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.reprovadosFinal}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="h-4 w-4 inline mr-1" />
                Buscar Aluno
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome do aluno..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="h-4 w-4 inline mr-1" />
                Filtrar por Turma
              </label>
              <select
                value={filtroTurma}
                onChange={(e) => setFiltroTurma(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as turmas</option>
                {turmas.map(turma => (
                  <option key={turma.id} value={turma.id}>{turma.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="h-4 w-4 inline mr-1" />
                Filtrar por Disciplina
              </label>
              <select
                value={filtroDisciplina}
                onChange={(e) => setFiltroDisciplina(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as disciplinas</option>
                {disciplinas.map(disciplina => (
                  <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Alunos em Recuperação */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Alunos Identificados para Recuperação
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {alunosFiltrados.length === 0 ? (
              <div className="p-8 text-center">
                <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum aluno em recuperação encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filtroTurma || filtroDisciplina 
                    ? 'Tente ajustar os filtros para ver mais resultados.'
                    : alunos.length === 0 
                      ? 'Nenhum dado de aluno foi carregado. Verifique a conexão com o banco de dados.'
                      : notas.length === 0
                        ? 'Nenhuma nota foi encontrada. Cadastre algumas notas primeiro.'
                        : 'Todos os alunos estão com médias satisfatórias!'}
                </p>
                
                {(alunos.length === 0 || notas.length === 0 || disciplinas.length === 0) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                    <h4 className="font-semibold text-yellow-800 mb-2">Status dos Dados:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Alunos: {alunos.length}</li>
                      <li>• Notas: {notas.length}</li>
                      <li>• Disciplinas: {disciplinas.length}</li>
                      <li>• Turmas: {turmas.length}</li>
                      <li>• Supabase: {isSupabaseConnected ? 'Conectado' : 'Desconectado'}</li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              alunosFiltrados.map((item) => (
                <div key={item.aluno.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-yellow-100 p-3 rounded-full">
                        <GraduationCap className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.aluno.nome}</h3>
                        <p className="text-sm text-gray-600">
                          Turma: {turmas.find(t => t.id === item.aluno.turma_id)?.nome} • 
                          Média Geral: <span className={`font-medium ${getSituacaoAcademica(item.mediaGeral).textColor}`}>
                            {formatarNota(item.mediaGeral)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setAlunoModalData(item);
                          setShowRecuperacaoModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                      >
                        Gerenciar Recuperação
                      </button>
                      <button
                        onClick={() => setSelectedAluno(selectedAluno === item.aluno.id ? null : item.aluno.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {selectedAluno === item.aluno.id ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                      </button>
                    </div>
                  </div>

                  {selectedAluno === item.aluno.id && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Disciplinas em Recuperação:</h4>
                      <div className="space-y-3">
                        {item.disciplinas.map((disc) => (
                          <div key={disc.disciplina.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h5 className="font-medium text-gray-900">{disc.disciplina.nome}</h5>
                                <p className="text-sm text-gray-600">
                                  Média Final: <span className={`font-medium ${getSituacaoAcademica(disc.mediaFinal).textColor}`}>
                                    {formatarNota(disc.mediaFinal)}
                                  </span>
                                  {disc.notaRecuperacao !== undefined && (
                                    <span className="ml-2">
                                      • Recuperação: <span className={`font-medium ${getSituacaoAcademica(disc.notaRecuperacao).textColor}`}>
                                        {formatarNota(disc.notaRecuperacao)}
                                      </span>
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                disc.situacao === 'aprovado_recuperacao' 
                                  ? 'bg-green-100 text-green-800'
                                  : disc.situacao === 'reprovado_final'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {disc.situacao === 'aprovado_recuperacao' ? 'Aprovado' :
                                 disc.situacao === 'reprovado_final' ? 'Reprovado' : 'Pendente'}
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <label className="text-sm font-medium text-gray-700">
                                Nota de Recuperação:
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                defaultValue={disc.notaRecuperacao || ''}
                                placeholder="0.0"
                                className="w-24 border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => {
                                  const nota = parseFloat(e.target.value) || 0;
                                  setNotasRecuperacao(prev => ({
                                    ...prev,
                                    [item.aluno.id]: {
                                      ...prev[item.aluno.id],
                                      [disc.disciplina.id]: nota
                                    }
                                  }));
                                }}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    const nota = notasRecuperacao[item.aluno.id]?.[disc.disciplina.id] || disc.notaRecuperacao || 0;
                                    handleSaveNotaRecuperacao(item.aluno.id, disc.disciplina.id, nota);
                                  }
                                }}
                              />
                              <button
                                onClick={() => {
                                  const nota = notasRecuperacao[item.aluno.id]?.[disc.disciplina.id] || disc.notaRecuperacao || 0;
                                  if (nota < 0 || nota > 10) {
                                    alert('A nota deve estar entre 0 e 10');
                                    return;
                                  }
                                  handleSaveNotaRecuperacao(item.aluno.id, disc.disciplina.id, nota);
                                }}
                                disabled={saving}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1 transition-colors"
                              >
                                <Save className="h-3 w-3" />
                                <span>{saving ? 'Salvando...' : 'Salvar'}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Recuperação */}
      {alunoModalData && (
        <RecuperacaoModal
          isOpen={showRecuperacaoModal}
          onClose={() => {
            setShowRecuperacaoModal(false);
            setAlunoModalData(null);
          }}
          aluno={alunoModalData.aluno}
          disciplinas={alunoModalData.disciplinas}
          onSaveNota={handleSaveNotaRecuperacaoModal}
          saving={saving}
        />
      )}
    </div>
  );
}

export default RecuperacaoPage;