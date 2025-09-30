import { useState, useEffect } from 'react';
import { X, BookOpen, Calendar, MessageSquare, TrendingUp, Users, User, Phone, Mail, GraduationCap, FileText, Clock, Star } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { MEDIA_MINIMA_APROVACAO, getSituacaoAcademica, getNotaTextColor, formatarNota } from '../../lib/gradeConfig';
import type { Aluno, Nota, ProvaTarefa, Recado, Turma } from '../../lib/supabase.types';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  aluno: Aluno;
  allNotas: Nota[];
  allProvasTarefas: ProvaTarefa[];
  allRecados: Recado[];
  _allTurmas: Turma[]; // Prefixo underscore para indicar não utilizado atualmente
  allDisciplinas: any[];
}

export function StudentProfileModal({ 
  isOpen, 
  onClose, 
  aluno, 
  allNotas, 
  allProvasTarefas, 
  allRecados, 
  // _allTurmas removido (não usado)
  allDisciplinas 
}: StudentProfileModalProps) {
  const { isSupabaseConnected } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [notasAluno, setNotasAluno] = useState<Nota[]>([]);
  const [provasTarefasAluno, setProvasTarefasAluno] = useState<ProvaTarefa[]>([]);
  const [recadosAluno, setRecadosAluno] = useState<Recado[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('📋 [StudentProfileModal] Modal renderizado!', { 
    aluno: aluno.nome,
    alunoId: aluno.id,
    turma: aluno.turma?.nome || 'Turma não definida',
  responsavel: (aluno as any).responsavel?.nome || 'Responsável não definido',
    totalNotas: allNotas.length,
    totalProvas: allProvasTarefas.length,
    totalRecados: allRecados.length,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    if (isOpen && aluno) {
      filterStudentData();
    }
  }, [isOpen, aluno, allNotas, allProvasTarefas, allRecados]);

  const filterStudentData = () => {
    console.log('🔍 [StudentProfileModal] Filtrando dados do aluno:', {
      alunoId: aluno.id,
      turmaId: aluno.turma_id,
      totalNotasDisponiveis: allNotas.length,
      totalProvasDisponiveis: allProvasTarefas.length,
      totalRecadosDisponiveis: allRecados.length
    });

    // Verificação de compatibilidade de tipos nos IDs
    console.log('� [StudentProfileModal] Verificando compatibilidade dos dados:', {
      totalNotas: allNotas.length,
      alunoId: aluno.id,
      primeiraNotaAlunoId: allNotas[0]?.aluno_id,
      matchExato: allNotas.filter(n => n.aluno_id === aluno.id).length
    });

    setLoading(true);
    
    try {
      // Filtrar notas do aluno
      const notasFiltradas = allNotas.filter(nota => {
        console.log('🔍 Comparando:', { nota_aluno_id: nota.aluno_id, aluno_id: aluno.id, match: nota.aluno_id === aluno.id });
        return nota.aluno_id === aluno.id;
      });
      console.log('📝 Notas filtradas:', notasFiltradas.length, notasFiltradas);
      setNotasAluno(notasFiltradas);

      // Filtrar provas/tarefas da turma do aluno
      const provasFiltradas = allProvasTarefas.filter(prova => {
        if (isSupabaseConnected) {
          return prova.disciplina?.turma_id === aluno.turma_id;
        } else {
          return (prova as any).turma_id === aluno.turma_id;
        }
      });
      console.log('📅 Provas/Tarefas filtradas:', provasFiltradas.length, provasFiltradas);
      setProvasTarefasAluno(provasFiltradas);

      // Filtrar recados relevantes para o aluno
      const recadosFiltrados = allRecados.filter(recado => {
        return (
          recado.destinatario_tipo === 'geral' ||
          (recado.destinatario_tipo === 'turma' && recado.destinatario_id === aluno.turma_id) ||
          (recado.destinatario_tipo === 'aluno' && recado.destinatario_id === aluno.id)
        );
      });
      console.log('💬 Recados filtrados:', recadosFiltrados.length, recadosFiltrados);
      setRecadosAluno(recadosFiltrados);
    } catch (error) {
      console.error('❌ Erro ao filtrar dados do aluno:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularMediaGeral = () => {
    if (notasAluno.length === 0) return 0;
    const soma = notasAluno.reduce((acc, nota) => acc + (nota.nota || 0), 0);
    return soma / notasAluno.length;
  };

  const calcularMediaPorDisciplina = (disciplinaId: string) => {
    const notasDisciplina = notasAluno.filter(nota => nota.disciplina_id === disciplinaId);
    if (notasDisciplina.length === 0) return 0;
    const soma = notasDisciplina.reduce((acc, nota) => acc + (nota.nota || 0), 0);
    return soma / notasDisciplina.length;
  };

  const getDisciplinaNome = (disciplinaId: string) => {
    const disciplina = allDisciplinas.find(d => d.id === disciplinaId);
    return disciplina?.nome || 'Disciplina não encontrada';
  };

  const getDisciplinaCor = (disciplinaId: string) => {
    const disciplina = allDisciplinas.find(d => d.id === disciplinaId);
    return disciplina?.cor || '#3B82F6';
  };

  const getProximasProvas = () => {
    const hoje = new Date().toISOString().split('T')[0];
    return provasTarefasAluno
      .filter(prova => {
        const dataProva = isSupabaseConnected ? prova.data : (prova as any).data_entrega;
        return dataProva >= hoje;
      })
      .sort((a, b) => {
        const dataA = isSupabaseConnected ? a.data : (a as any).data_entrega;
        const dataB = isSupabaseConnected ? b.data : (b as any).data_entrega;
        return dataA.localeCompare(dataB);
      })
      .slice(0, 5);
  };

  const getRecadosRecentes = () => {
    return recadosAluno
      .sort((a, b) => new Date(b.data_envio).getTime() - new Date(a.data_envio).getTime())
      .slice(0, 5);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border-4 border-blue-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={() => {
              console.log('🔒 [StudentProfileModal] Botão fechar clicado');
              onClose();
            }}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-300 z-[1001]"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="pr-16">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                {aluno.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black">{aluno.nome}</h2>
                <p className="text-blue-100">
                  Turma: {aluno.turma?.nome || 'Não definida'}
                </p>
                <p className="text-blue-100">
                  Responsável: {(aluno as any).responsavel?.nome || 'Não definido'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'info', label: 'Informações', icon: User },
              { id: 'notas', label: 'Notas', icon: BookOpen },
              { id: 'avaliacoes', label: 'Avaliações', icon: Calendar },
              { id: 'recados', label: 'Recados', icon: MessageSquare }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Carregando dados...</span>
            </div>
          ) : (
            <>
              {/* Tab: Informações */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informações Pessoais */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <User className="h-5 w-5 mr-2 text-blue-600" />
                        Informações Pessoais
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                          <p className="text-gray-800 font-medium">{aluno.nome}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Data de Nascimento</label>
                          <p className="text-gray-800">{aluno.data_nascimento || 'Não informado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">CPF</label>
                          <p className="text-gray-800">{aluno.cpf || 'Não informado'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Informações Acadêmicas */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <GraduationCap className="h-5 w-5 mr-2 text-purple-600" />
                        Informações Acadêmicas
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Turma</label>
                          <p className="text-gray-800 font-medium">{aluno.turma?.nome || 'Não definida'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Matrícula</label>
                          <p className="text-gray-800">{aluno.matricula || 'Não informado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Média Geral</label>
                          <p className="text-gray-800 font-bold text-lg">
                            {calcularMediaGeral().toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações do Responsável */}
                  {aluno.responsavel && (
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-green-600" />
                        Responsável
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Nome</label>
                          <p className="text-gray-800 font-medium">{aluno.responsavel.nome}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Telefone</label>
                          <p className="text-gray-800 flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {aluno.responsavel.telefone || 'Não informado'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email</label>
                          <p className="text-gray-800 flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {aluno.responsavel.email || 'Não informado'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Notas */}
              {activeTab === 'notas' && (
                <div className="space-y-6">
                  {notasAluno.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Nenhuma nota encontrada</p>
                    </div>
                  ) : (
                    <>
                      {/* Resumo das Notas */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                          Resumo Acadêmico
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-3xl font-black text-blue-600">{calcularMediaGeral().toFixed(1)}</p>
                            <p className="text-sm text-gray-600">Média Geral</p>
                          </div>
                          <div className="text-center">
                            <p className="text-3xl font-black text-purple-600">{notasAluno.length}</p>
                            <p className="text-sm text-gray-600">Total de Notas</p>
                          </div>
                          <div className="text-center">
                            <p className="text-3xl font-black text-green-600">
                              {notasAluno.filter(n => (n.nota || 0) >= MEDIA_MINIMA_APROVACAO).length}
                            </p>
                            <p className="text-sm text-gray-600">Notas ≥ {formatarNota(MEDIA_MINIMA_APROVACAO)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Lista de Notas por Disciplina */}
                      <div className="space-y-4">
                        {Array.from(new Set(notasAluno.map(n => n.disciplina_id))).map(disciplinaId => {
                          const notasDisciplina = notasAluno.filter(n => n.disciplina_id === disciplinaId);
                          const mediaDisciplina = calcularMediaPorDisciplina(disciplinaId);
                          const nomeDisciplina = getDisciplinaNome(disciplinaId);
                          const corDisciplina = getDisciplinaCor(disciplinaId);

                          return (
                            <div key={disciplinaId} className="bg-white border-2 border-gray-100 rounded-2xl p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-gray-800 flex items-center">
                                  <div 
                                    className="w-4 h-4 rounded-full mr-3"
                                    style={{ backgroundColor: corDisciplina }}
                                  ></div>
                                  {nomeDisciplina}
                                </h4>
                                <div className="text-right">
                                  <p className="text-2xl font-black" style={{ color: corDisciplina }}>
                                    {mediaDisciplina.toFixed(1)}
                                  </p>
                                  <p className="text-sm text-gray-600">Média</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {notasDisciplina.map(nota => (
                                  <div key={nota.id} className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-600">
                                        {nota.tipo || 'Avaliação'}
                                      </span>
                                      <span 
                                        className={`text-lg font-bold ${getNotaTextColor(nota.nota || 0)}`}
                                      >
                                        {nota.nota?.toFixed(1) || '0.0'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      {nota.data_lancamento ? new Date(nota.data_lancamento).toLocaleDateString('pt-BR') : '—'}
                                    </p>
                                    {nota.observacoes && (
                                      <p className="text-xs text-gray-600 mt-2 italic">
                                        {nota.observacoes}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab: Avaliações */}
              {activeTab === 'avaliacoes' && (
                <div className="space-y-6">
                  {provasTarefasAluno.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Nenhuma avaliação encontrada</p>
                    </div>
                  ) : (
                    <>
                      {/* Próximas Avaliações */}
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-orange-600" />
                          Próximas Avaliações
                        </h3>
                        <div className="space-y-3">
                          {getProximasProvas().map(prova => {
                            const dataProva = isSupabaseConnected ? prova.data : (prova as any).data_entrega;
                            const disciplinaNome = isSupabaseConnected 
                              ? prova.disciplina?.nome 
                              : getDisciplinaNome((prova as any).disciplina_id);
                            
                            return (
                              <div key={prova.id} className="flex items-center justify-between bg-white rounded-xl p-4">
                                <div>
                                  <p className="font-medium text-gray-800">{prova.titulo}</p>
                                  <p className="text-sm text-gray-600">{disciplinaNome}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-orange-600">
                                    {new Date(dataProva).toLocaleDateString('pt-BR')}
                                  </p>
                                  <p className="text-xs text-gray-500 capitalize">{prova.tipo}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Todas as Avaliações */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-600" />
                          Todas as Avaliações
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {provasTarefasAluno.map(prova => {
                            const dataProva = isSupabaseConnected ? prova.data : (prova as any).data_entrega;
                            const disciplinaNome = isSupabaseConnected 
                              ? prova.disciplina?.nome 
                              : getDisciplinaNome((prova as any).disciplina_id);
                            const corDisciplina = isSupabaseConnected 
                              ? prova.disciplina?.cor 
                              : getDisciplinaCor((prova as any).disciplina_id);
                            
                            return (
                              <div key={prova.id} className="bg-white border-2 border-gray-100 rounded-2xl p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 mb-1">{prova.titulo}</h4>
                                    <p className="text-sm text-gray-600 flex items-center">
                                      <div 
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: corDisciplina || '#3B82F6' }}
                                      ></div>
                                      {disciplinaNome}
                                    </p>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    prova.tipo === 'prova' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {prova.tipo}
                                  </span>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Data:</span>
                                    <span className="font-medium">
                                      {new Date(dataProva).toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                  
                                  {prova.valor && (
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">Valor:</span>
                                      <span className="font-medium">{prova.valor} pontos</span>
                                    </div>
                                  )}
                                </div>
                                
                                {prova.descricao && (
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-sm text-gray-600">{prova.descricao}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab: Recados */}
              {activeTab === 'recados' && (
                <div className="space-y-6">
                  {recadosAluno.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Nenhum recado encontrado</p>
                    </div>
                  ) : (
                    <>
                      {/* Recados Recentes */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <Star className="h-5 w-5 mr-2 text-green-600" />
                          Recados Recentes
                        </h3>
                        <div className="space-y-3">
                          {getRecadosRecentes().map(recado => (
                            <div key={recado.id} className="bg-white rounded-xl p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">{recado.titulo}</p>
                                  <p className="text-sm text-gray-600">
                                    De: {recado.remetente?.nome || 'Sistema'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">
                                    {new Date(recado.data_envio).toLocaleDateString('pt-BR')}
                                  </p>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    recado.destinatario_tipo === 'geral' ? 'bg-blue-100 text-blue-800' :
                                    recado.destinatario_tipo === 'turma' ? 'bg-purple-100 text-purple-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {recado.destinatario_tipo === 'geral' ? 'Geral' :
                                     recado.destinatario_tipo === 'turma' ? 'Turma' : 'Individual'}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">{recado.conteudo}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Todos os Recados */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                          Todos os Recados
                        </h3>
                        <div className="space-y-4">
                          {recadosAluno.map(recado => (
                            <div key={recado.id} className="bg-white border-2 border-gray-100 rounded-2xl p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h4 className="text-lg font-bold text-gray-800 mb-2">{recado.titulo}</h4>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>De: {recado.remetente?.nome || 'Sistema'}</span>
                                    <span>•</span>
                                    <span>{new Date(recado.data_envio).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  recado.destinatario_tipo === 'geral' ? 'bg-blue-100 text-blue-800' :
                                  recado.destinatario_tipo === 'turma' ? 'bg-purple-100 text-purple-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {recado.destinatario_tipo === 'geral' ? 'Geral' :
                                   recado.destinatario_tipo === 'turma' ? 'Turma' : 'Individual'}
                                </span>
                              </div>
                              
                              <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 leading-relaxed">{recado.conteudo}</p>
                              </div>
                              
                              {recado.anexos && recado.anexos.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <p className="text-sm font-medium text-gray-600 mb-2">Anexos:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {recado.anexos.map((anexo, index) => (
                                      <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                        <span>{anexo.nome || anexo.id || 'Anexo'}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}