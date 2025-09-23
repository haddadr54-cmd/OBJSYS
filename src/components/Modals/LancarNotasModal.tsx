import React, { useState, useEffect } from 'react';
import { X, BookOpen, Users, Calendar, Save, AlertCircle, Check, Zap, Calculator, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDataService } from '../../lib/dataService';
import type { Turma, Disciplina, Aluno } from '../../lib/supabase';

interface LancarNotasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface NotaAluno {
  alunoId: string;
  nota: string;
  comentario: string;
}

export function LancarNotasModal({ isOpen, onClose, onSave }: LancarNotasModalProps) {
  const { user } = useAuth();
  const { isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmaSelected, setTurmaSelected] = useState('');
  const [disciplinaSelected, setDisciplinaSelected] = useState('');
  const [trimestre, setTrimestre] = useState('1');
  const [tipoAvaliacao, setTipoAvaliacao] = useState('');
  const [descricaoAvaliacao, setDescricaoAvaliacao] = useState('');
  const [notas, setNotas] = useState<NotaAluno[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quickFillMode, setQuickFillMode] = useState(false);
  const [quickFillValue, setQuickFillValue] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      fetchData();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (turmaSelected) {
      fetchAlunos();
      fetchDisciplinas();
    }
  }, [turmaSelected]);

  useEffect(() => {
    if (disciplinaSelected) {
      initializeNotas();
    }
  }, [disciplinaSelected, alunos]);

  const fetchData = async () => {
    try {
      const turmasData = await dataService.getTurmas();
      setTurmas(turmasData);
      
      if (turmasData.length === 1) {
        setTurmaSelected(turmasData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const fetchDisciplinas = async () => {
    try {
      const todasDisciplinas = await dataService.getDisciplinas();
      const disciplinasDaTurma = todasDisciplinas.filter(d => d.turma_id === turmaSelected);
      setDisciplinas(disciplinasDaTurma);
      
      if (disciplinasDaTurma.length === 1) {
        setDisciplinaSelected(disciplinasDaTurma[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error);
    }
  };

  const fetchAlunos = async () => {
    try {
      const alunosDaTurma = await dataService.getAlunos();
      setAlunos(alunosDaTurma);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    }
  };

  const initializeNotas = () => {
    const alunosDaTurma = alunos.filter(a => a.turma_id === turmaSelected);
    const notasIniciais = alunosDaTurma.map(aluno => ({
      alunoId: aluno.id,
      nota: '',
      comentario: ''
    }));
    setNotas(notasIniciais);
  };

  const preencherTodasNotas = () => {
    if (quickFillValue && !isNaN(parseFloat(quickFillValue))) {
      setNotas(prev => prev.map(n => ({ ...n, nota: quickFillValue })));
      setQuickFillMode(false);
      setQuickFillValue('');
    }
  };

  const calcularMedia = () => {
    const notasValidas = notas.filter(n => n.nota && !isNaN(parseFloat(n.nota)));
    if (notasValidas.length === 0) return 0;
    return notasValidas.reduce((acc, n) => acc + parseFloat(n.nota), 0) / notasValidas.length;
  };

  const updateNota = (alunoId: string, field: 'nota' | 'comentario', value: string) => {
    setNotas(prev => prev.map(n => 
      n.alunoId === alunoId ? { ...n, [field]: value } : n
    ));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!turmaSelected) {
      newErrors.turma = 'Selecione uma turma';
    }

    if (!disciplinaSelected) {
      newErrors.disciplina = 'Selecione uma disciplina';
    }

    if (!tipoAvaliacao) {
      newErrors.tipo = 'Selecione o tipo de avaliação';
    }

    if (!descricaoAvaliacao.trim()) {
      newErrors.descricao = 'Descrição da avaliação é obrigatória';
    }

    // Validar notas
    const notasComErro = notas.filter(n => {
      if (n.nota && (isNaN(parseFloat(n.nota)) || parseFloat(n.nota) < 0 || parseFloat(n.nota) > 10)) {
        return true;
      }
      return false;
    });

    if (notasComErro.length > 0) {
      newErrors.notas = 'Algumas notas são inválidas (devem estar entre 0 e 10)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Salvar apenas notas que foram preenchidas
      const notasParaSalvar = notas.filter(n => n.nota.trim() !== '');
      
      for (const notaData of notasParaSalvar) {
        await dataService.createNota({
          aluno_id: notaData.alunoId,
          disciplina_id: disciplinaSelected,
          trimestre: parseInt(trimestre),
          nota: parseFloat(notaData.nota),
          comentario: notaData.comentario || null
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
      setErrors({ submit: 'Erro ao salvar notas' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTurmaSelected('');
    setDisciplinaSelected('');
    setTrimestre('1');
    setTipoAvaliacao('');
    setDescricaoAvaliacao('');
    setNotas([]);
    setErrors({});
    setSuccess(false);
  };

  if (!isOpen) return null;

  const turmaAtual = turmas.find(t => t.id === turmaSelected);
  const disciplinaAtual = disciplinas.find(d => d.id === disciplinaSelected);
  const alunosDaTurma = alunos.filter(a => a.turma_id === turmaSelected);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Lançamento Rápido de Notas</h3>
              <p className="text-sm text-gray-500">Sistema otimizado para agilidade</p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border-b border-green-200">
            <div className="flex items-center space-x-2 text-green-700">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Notas lançadas com sucesso!</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Seleção de Turma e Disciplina */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Turma *
              </label>
              <select
                value={turmaSelected}
                onChange={(e) => {
                  setTurmaSelected(e.target.value);
                  setDisciplinaSelected('');
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.turma ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione uma turma</option>
                {turmas.map(turma => (
                  <option key={turma.id} value={turma.id}>{turma.nome}</option>
                ))}
              </select>
              {errors.turma && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.turma}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disciplina *
              </label>
              <select
                value={disciplinaSelected}
                onChange={(e) => setDisciplinaSelected(e.target.value)}
                disabled={!turmaSelected}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.disciplina ? 'border-red-300' : 'border-gray-300'
                } ${!turmaSelected ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Selecione uma disciplina</option>
                {disciplinas.map(disciplina => (
                  <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>
                ))}
              </select>
              {errors.disciplina && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.disciplina}
                </p>
              )}
            </div>
          </div>

          {/* Configurações da Avaliação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trimestre *
              </label>
              <select
                value={trimestre}
                onChange={(e) => setTrimestre(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="1">1º Trimestre</option>
                <option value="2">2º Trimestre</option>
                <option value="3">3º Trimestre</option>
                <option value="4">4º Trimestre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Avaliação *
              </label>
              <select
                value={tipoAvaliacao}
                onChange={(e) => setTipoAvaliacao(e.target.value)}
                className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.tipo ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione o tipo</option>
                <option value="prova">Prova</option>
                <option value="trabalho">Trabalho</option>
                <option value="participacao">Participação</option>
                <option value="recuperacao">Recuperação</option>
              </select>
              {errors.tipo && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.tipo}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <input
                type="text"
                value={descricaoAvaliacao}
                onChange={(e) => setDescricaoAvaliacao(e.target.value)}
                className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.descricao ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Prova de Frações"
              />
              {errors.descricao && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.descricao}
                </p>
              )}
            </div>
          </div>

          {/* Informações da Seleção */}
          {turmaSelected && disciplinaSelected && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {turmaAtual?.nome}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {disciplinaAtual?.nome}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {trimestre}º Trimestre
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Alunos para Lançamento de Notas */}
          {disciplinaSelected && alunosDaTurma.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-900">
                  Lançar Notas ({alunosDaTurma.length} alunos)
                </h4>
                <div className="flex items-center space-x-4">
                  {/* Preenchimento Rápido */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={quickFillValue}
                      onChange={(e) => setQuickFillValue(e.target.value)}
                      placeholder="Nota"
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={preencherTodasNotas}
                      disabled={!quickFillValue}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Aplicar a Todos</span>
                    </button>
                  </div>
                  
                  {/* Estatística em Tempo Real */}
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                    <Calculator className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Média: {calcularMedia().toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {errors.notas && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.notas}
                  </p>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alunosDaTurma.map((aluno) => {
                  const notaAluno = notas.find(n => n.alunoId === aluno.id);
                  const nota = parseFloat(notaAluno?.nota || '0');
                  return (
                    <div 
                      key={aluno.id} 
                      className={`flex items-center space-x-4 p-4 border-2 rounded-lg transition-all ${
                        nota >= 7 ? 'border-green-200 bg-green-50' :
                        nota >= 5 ? 'border-yellow-200 bg-yellow-50' :
                        nota > 0 ? 'border-red-200 bg-red-50' :
                        'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                          nota >= 7 ? 'bg-green-500' :
                          nota >= 5 ? 'bg-yellow-500' :
                          nota > 0 ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}>
                          {aluno.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 text-lg">{aluno.nome}</h5>
                          <p className="text-sm text-gray-500">
                            {nota > 0 ? (
                              <span className={`font-medium ${
                                nota >= 7 ? 'text-green-600' :
                                nota >= 5 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                Nota atual: {nota.toFixed(1)}
                              </span>
                            ) : (
                              'Aguardando nota'
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nota (0-10)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={notaAluno?.nota || ''}
                            onChange={(e) => updateNota(aluno.id, 'nota', e.target.value)}
                            className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg text-center text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="0.0"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comentário (opcional)
                          </label>
                          <input
                            type="text"
                            value={notaAluno?.comentario || ''}
                            onChange={(e) => updateNota(aluno.id, 'comentario', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Observações..."
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Resumo das Notas */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{notas.filter(n => n.nota.trim() !== '').length}</div>
                    <div className="text-sm text-blue-800">Notas Lançadas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {notas.filter(n => parseFloat(n.nota) >= 7).length}
                    </div>
                    <div className="text-sm text-green-800">Aprovados (≥7)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {notas.filter(n => parseFloat(n.nota) >= 5 && parseFloat(n.nota) < 7).length}
                    </div>
                    <div className="text-sm text-yellow-800">Recuperação (5-6.9)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {notas.filter(n => parseFloat(n.nota) > 0 && parseFloat(n.nota) < 5).length}
                    </div>
                    <div className="text-sm text-red-800">Reprovados {"(<5)"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem quando não há turmas */}
          {turmas.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma turma atribuída
              </h3>
              <p className="text-gray-500">
                Você ainda não possui turmas atribuídas. Entre em contato com o administrador.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {errors.submit}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {turmas.length > 0 && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || success || !disciplinaSelected || notas.filter(n => n.nota.trim() !== '').length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Save className="h-4 w-4" />
              <span className="font-semibold">{loading ? 'Salvando...' : `Salvar ${notas.filter(n => n.nota.trim() !== '').length} Notas`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}