import { useState, useEffect } from 'react';
import { ClipboardList, Calendar, Users, Check, X, Save, Filter, BookOpen, UserCheck, UserX, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { useDataService } from '../../lib/dataService';
import type { Turma, Aluno } from '../../lib/supabase.types';

interface PresencaAluno {
  alunoId: string;
  presente: boolean;
  justificativa?: string;
}

export function PresencaPage() {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmaSelected, setTurmaSelected] = useState('');
  // Funções utilitárias para tratar datas em horário local
  const getTodayLocalISO = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`; // YYYY-MM-DD no fuso local
  };

  const formatPtBrFromISO = (iso: string) => {
    if (!iso || typeof iso !== 'string' || !iso.includes('-')) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  const [dataSelected, setDataSelected] = useState(getTodayLocalISO());
  const [presencas, setPresencas] = useState<PresencaAluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [disciplinaSelected, setDisciplinaSelected] = useState('');
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [presencasExistentes, setPresencasExistentes] = useState<any[]>([]);
  const [quickMode, setQuickMode] = useState(false);
  const [bulkAction, setBulkAction] = useState<'todos-presentes' | 'todos-ausentes' | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, isSupabaseConnected]);

  useEffect(() => {
    if (turmaSelected && dataService && user) {
      fetchDisciplinas();
    }
  }, [turmaSelected, dataService, user]);

  useEffect(() => {
    if (turmaSelected && disciplinaSelected && dataSelected) {
      loadPresencasExistentes();
    }
  }, [turmaSelected, disciplinaSelected, dataSelected]);

  const fetchDisciplinas = async () => {
    if (!dataService || !turmaSelected || !user) return;
    
    try {
      console.log('🔍 [PresencaPage] Carregando disciplinas para turma:', turmaSelected);
      
      const todasDisciplinas = await dataService.getDisciplinas();
      console.log('🔍 [PresencaPage] Total disciplinas:', todasDisciplinas?.length || 0);
      
      if (!todasDisciplinas) {
        console.warn('⚠️ [PresencaPage] Nenhuma disciplina retornada pelo dataService');
        setDisciplinas([]);
        return;
      }
      
      // Filtrar disciplinas da turma selecionada
      const disciplinasDaTurma = todasDisciplinas.filter(d => {
        console.log('🔍 [PresencaPage] Verificando disciplina:', {
          nome: d.nome,
          turma_id: d.turma_id,
          professor_id: d.professor_id,
          turmaSelected,
          userId: user.id
        });
        
        return d.turma_id === turmaSelected;
      });
      
      console.log('🔍 [PresencaPage] Disciplinas da turma encontradas:', disciplinasDaTurma.length);
      setDisciplinas(disciplinasDaTurma);
      
      // Se só há uma disciplina, selecionar automaticamente
      if (disciplinasDaTurma.length === 1) {
        setDisciplinaSelected(disciplinasDaTurma[0].id);
        console.log('🔍 [PresencaPage] Auto-selecionada disciplina:', disciplinasDaTurma[0].nome);
      }
    } catch (error) {
      console.error('❌ [PresencaPage] Erro ao carregar disciplinas:', error);
      setDisciplinas([]);
    }
  };

  const fetchData = async () => {
    try {
      const [turmasData, alunosData] = await Promise.all([
        dataService.getTurmas(),
        dataService.getAlunos()
      ]);

      setTurmas(turmasData);
      setAlunos(alunosData);
      
      if (turmasData.length > 0 && !turmaSelected) {
        setTurmaSelected(turmasData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPresencasExistentes = async () => {
    try {
      console.log('🔄 [PresencaPage] Carregando presenças existentes...', {
        turmaSelected,
        dataSelected,
        disciplinaSelected
      });

      const presencasData = await dataService.getPresencasByTurmaData(turmaSelected, dataSelected, disciplinaSelected);
      
      console.log('✅ [PresencaPage] Presenças carregadas:', {
        quantidade: presencasData.length,
        presencas: presencasData
      });
      
      setPresencasExistentes(presencasData);
      
      // Inicializar presenças com dados existentes ou padrão
      initializePresencas(presencasData);
    } catch (error) {
      console.error('❌ [PresencaPage] Erro ao carregar presenças existentes:', error);
      initializePresencas([]);
    }
  };

  const initializePresencas = (presencasData: any[] = []) => {
    const alunosDaTurma = alunos.filter(a => a.turma_id === turmaSelected);
    const presencasIniciais = alunosDaTurma.map(aluno => {
      const presencaExistente = presencasData.find(p => p.aluno_id === aluno.id);
      return {
        alunoId: aluno.id,
        presente: presencaExistente ? presencaExistente.presente : true,
        justificativa: ''
      };
    });
    setPresencas(presencasIniciais);
  };

  const aplicarPresencaEmMassa = (presente: boolean) => {
    setPresencas(prev => prev.map(p => ({ ...p, presente })));
    setBulkAction(presente ? 'todos-presentes' : 'todos-ausentes');
    setTimeout(() => setBulkAction(null), 1000);
  };

  const updatePresenca = (alunoId: string, presente: boolean) => {
    setPresencas(prev => prev.map(p => 
      p.alunoId === alunoId ? { ...p, presente } : p
    ));
  };

  // Removida função updateJustificativa não utilizada (campo de justificativa não implementado na UI atual)

  const salvarPresencas = async () => {
    if (!disciplinaSelected) {
      alert('Selecione uma disciplina antes de salvar as presenças');
      return;
    }

    setSaving(true);
    try {
      console.log('💾 [PresencaPage] Iniciando salvamento de presenças...', {
        totalPresencas: presencas.length,
        disciplinaSelected,
        dataSelected
      });

      // Limitar concorrência para evitar pico de requisições (ex: 5 em paralelo)
      const concurrency = 5;
      let idx = 0;
      let sucessos = 0;
      let erros = 0;

      const tarefas = presencas.map(presencaData => async () => {
        const presencaExistente = presencasExistentes.find(p => p.aluno_id === presencaData.alunoId);
        try {
          if (presencaExistente) {
            console.log(`🔄 [PresencaPage] Atualizando presença existente - Aluno: ${presencaData.alunoId}`);
            await dataService.updatePresenca(presencaExistente.id, { presente: presencaData.presente });
          } else {
            console.log(`➕ [PresencaPage] Criando nova presença - Aluno: ${presencaData.alunoId}`);
            await dataService.createPresenca({
              aluno_id: presencaData.alunoId,
              data_aula: dataSelected,
              presente: presencaData.presente,
              disciplina_id: disciplinaSelected
            });
          }
          sucessos++;
        } catch (e) {
          console.error(`❌ [PresencaPage] Erro ao salvar presença do aluno ${presencaData.alunoId}:`, e);
          erros++;
        }
      });

      // Executor de fila com limite
      const runBatch = async () => {
        while (idx < tarefas.length) {
          const slice = tarefas.slice(idx, idx + concurrency).map(fn => fn());
          idx += concurrency;
          await Promise.all(slice);
        }
      };
      await runBatch();

      console.log('📊 [PresencaPage] Salvamento concluído:', { sucessos, erros });

      if (erros === 0) {
        alert(`✅ Todas as presenças foram salvas com sucesso! (${sucessos} registros)`);
      } else if (sucessos === 0) {
        alert('❌ Falha ao salvar todas as presenças. Verifique a conexão.');
      } else {
        alert(`⚠️ Presenças salvas parcialmente: ${sucessos} sucessos, ${erros} erros`);
      }

      await loadPresencasExistentes();
    } catch (error) {
      console.error('Erro ao salvar presenças:', error);
      alert('❌ Erro geral ao salvar presenças: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const alunosDaTurma = alunos.filter(a => a.turma_id === turmaSelected);
  const totalPresentes = presencas.filter(p => p.presente).length;
  const totalAusentes = presencas.filter(p => !p.presente).length;

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
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <ClipboardList className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ✅ Controle de Presença
            </h1>
            <p className="text-gray-600 text-lg font-medium">Sistema rápido e eficiente</p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl text-sm font-black shadow-lg">
            <Zap className="h-5 w-5" />
            <span>⚡ Sistema Rápido</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {turmaSelected && disciplinaSelected && (
            <>
              <button
                onClick={() => setQuickMode(!quickMode)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  quickMode 
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {quickMode ? 'Modo Normal' : 'Modo Rápido'}
              </button>
              <button 
                onClick={salvarPresencas}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Salvando...' : 'Salvar Presenças'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Seleção</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
            <select
              value={turmaSelected}
              onChange={(e) => {
                setTurmaSelected(e.target.value);
                setDisciplinaSelected('');
                setPresencas([]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione uma turma</option>
              {turmas.map(turma => (
                <option key={turma.id} value={turma.id}>{turma.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
            <select
              value={disciplinaSelected}
              onChange={(e) => {
                setDisciplinaSelected(e.target.value);
                setPresencas([]);
              }}
              disabled={!turmaSelected}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                !turmaSelected ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="">Selecione uma disciplina</option>
              {disciplinas.map(disciplina => (
                <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Aula</label>
            <input
              type="date"
              value={dataSelected}
              onChange={(e) => {
                setDataSelected(e.target.value);
                setPresencas([]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {turmaSelected && (
        <>
          {/* Informações da Seleção */}
          {disciplinaSelected && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {turmas.find(t => t.id === turmaSelected)?.nome}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {disciplinas.find(d => d.id === disciplinaSelected)?.nome}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {formatPtBrFromISO(dataSelected)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-110">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-gray-600 uppercase tracking-wide">👥 Total</p>
                  <p className="text-3xl font-black text-gray-700">{alunosDaTurma.length}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-200 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-110">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-green-600 uppercase tracking-wide">✅ Presentes</p>
                  <p className="text-3xl font-black text-green-700">{totalPresentes}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg">
                  <Check className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-xl border-2 border-red-200 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-110">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-red-600 uppercase tracking-wide">❌ Ausentes</p>
                  <p className="text-3xl font-black text-red-700">{totalAusentes}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-lg">
                  <X className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-200 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-110">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-blue-600 uppercase tracking-wide">📊 % Presença</p>
                  <p className="text-3xl font-black text-blue-700">
                    {alunosDaTurma.length > 0 ? Math.round((totalPresentes / alunosDaTurma.length) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg">
                  <ClipboardList className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Lista de chamada */}
          {disciplinaSelected && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Lista de Chamada - {turmas.find(t => t.id === turmaSelected)?.nome}
                  </h2>
                  <div className="flex items-center space-x-4">
                    {/* Ações em Massa */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => aplicarPresencaEmMassa(true)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                          bulkAction === 'todos-presentes'
                            ? 'bg-green-200 text-green-800 scale-105'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Todos Presentes</span>
                      </button>
                      <button
                        onClick={() => aplicarPresencaEmMassa(false)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                          bulkAction === 'todos-ausentes'
                            ? 'bg-red-200 text-red-800 scale-105'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        <UserX className="h-4 w-4" />
                        <span>Todos Ausentes</span>
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{formatPtBrFromISO(dataSelected)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {alunosDaTurma.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhum aluno encontrado nesta turma</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alunosDaTurma.map((aluno) => {
                      const presencaAluno = presencas.find(p => p.alunoId === aluno.id);
                      const isPresente = presencaAluno?.presente;
                      return (
                        <div 
                          key={aluno.id} 
                          className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                            isPresente === true ? 'border-green-200 bg-green-50' :
                            isPresente === false ? 'border-red-200 bg-red-50' :
                            'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                              isPresente === true ? 'bg-green-500' :
                              isPresente === false ? 'bg-red-500' :
                              'bg-blue-500'
                            }`}>
                              {aluno.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">{aluno.nome}</h4>
                              <p className="text-sm text-gray-500">
                                {isPresente === true ? '✅ Presente' :
                                 isPresente === false ? '❌ Ausente' :
                                 '⏳ Aguardando'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {quickMode ? (
                              /* Modo Rápido - Toggle único */
                              <button
                                onClick={() => updatePresenca(aluno.id, !isPresente)}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                                  isPresente 
                                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg' 
                                    : 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                                }`}
                              >
                                {isPresente ? (
                                  <>
                                    <Check className="h-5 w-5" />
                                    <span>Presente</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="h-5 w-5" />
                                    <span>Ausente</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              /* Modo Normal - Dois botões */
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updatePresenca(aluno.id, true)}
                                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${
                                    isPresente === true
                                      ? 'bg-green-500 text-white shadow-lg'
                                      : 'bg-gray-200 text-gray-700 hover:bg-green-100 hover:text-green-700'
                                  }`}
                                >
                                  <Check className="h-4 w-4" />
                                  <span>Presente</span>
                                </button>
                                <button
                                  onClick={() => updatePresenca(aluno.id, false)}
                                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${
                                    isPresente === false
                                      ? 'bg-red-500 text-white shadow-lg'
                                      : 'bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-700'
                                  }`}
                                >
                                  <X className="h-4 w-4" />
                                  <span>Ausente</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {!disciplinaSelected && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma disciplina</h3>
              <p className="text-gray-500">Escolha uma disciplina para fazer a chamada dos alunos de forma rápida e prática.</p>
            </div>
          )}
        </>
      )}

      {!turmaSelected && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma turma</h3>
          <p className="text-gray-500">Escolha uma turma e data para fazer a chamada dos alunos de forma eficiente.</p>
        </div>
      )}
    </div>
  );
}