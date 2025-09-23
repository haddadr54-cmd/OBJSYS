import React, { useState, useEffect } from 'react';
import { X, School, Users, BookOpen, User, Calendar, Save, Edit, Plus, Trash2, AlertCircle, Check, Clock, Grid } from 'lucide-react';
import { 
  getAllTurmas, 
  getAllUsuarios, 
  getAllAlunos, 
  updateTurma,
  getAllDisciplinas,
  getTurmaDisciplinas,
  createTurmaDisciplina,
  updateTurmaDisciplina,
  deleteTurmaDisciplina,
  getHorariosByTurma,
  createHorarioAula,
  updateHorarioAula,
  deleteHorarioAula
} from '../../lib/supabase';
import type { Turma, Disciplina, Usuario, Aluno, TurmaDisciplina, HorarioAula } from '../../lib/supabase';
import { ScheduleModal } from './ScheduleModal';

interface TurmaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  turma: Turma | null;
  onSave: () => void;
}

export function TurmaDetailModal({ isOpen, onClose, turma, onSave }: TurmaDetailModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'disciplinas' | 'cronograma'>('info');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [todasDisciplinas, setTodasDisciplinas] = useState<Disciplina[]>([]);
  const [professores, setProfessores] = useState<Usuario[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmaDisciplinas, setTurmaDisciplinas] = useState<TurmaDisciplina[]>([]);
  const [horarios, setHorarios] = useState<HorarioAula[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingHorario, setEditingHorario] = useState<HorarioAula | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    serie: '',
    turno: 'Manhã' as 'Manhã' | 'Tarde' | 'Noite' | 'Integral',
    ano_letivo: '',
    capacidade: '',
    descricao: '',
    ativa: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (turma) {
      setFormData({
        nome: turma.nome,
        serie: (turma as any).serie || '',
        turno: (turma as any).turno || 'Manhã',
        ano_letivo: turma.ano_letivo,
        capacidade: (turma as any).capacidade?.toString() || '',
        descricao: (turma as any).descricao || '',
        ativa: (turma as any).ativa ?? true
      });
    }
  }, [turma]);

  const fetchData = async () => {
    if (!turma) return;
    
    try {
      const [todasDisciplinasData, usuariosData, alunosData, turmaDisciplinasData, horariosData] = await Promise.all([
        getAllDisciplinas(), 
        getAllUsuarios(),
        getAllAlunos(),
        getTurmaDisciplinas(turma.id),
        getHorariosByTurma(turma.id)
      ]);
      
      setTodasDisciplinas(todasDisciplinasData);
      setProfessores(usuariosData.filter(u => u.tipo_usuario === 'professor'));
      
      // Filtrar alunos da turma
      const alunosTurma = alunosData.filter(a => a.turma_id === turma.id);
      setAlunos(alunosTurma);

      setTurmaDisciplinas(turmaDisciplinasData);
      setHorarios(horariosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleSave = async () => {
    if (!turma) return;
    
    setLoading(true);
    try {
      await updateTurma(turma.id, {
        nome: formData.nome,
        serie: formData.serie,
        turno: formData.turno,
        ano_letivo: formData.ano_letivo,
        capacidade: formData.capacidade ? parseInt(formData.capacidade) : undefined,
        descricao: formData.descricao,
        ativa: formData.ativa
      });

      setSuccess(true);
      setEditMode(false);
      setTimeout(() => {
        setSuccess(false);
        onSave();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDisciplina = async (disciplinaId: string, professorId?: string) => {
    if (!turma) return;
    
    try {
      await createTurmaDisciplina({
        turma_id: turma.id,
        disciplina_id: disciplinaId,
        professor_id: professorId || null,
        carga_horaria_semanal: 2,
        ativa: true
      });
      
      // Recarregar dados
      const turmaDisciplinasData = await getTurmaDisciplinas(turma.id);
      setTurmaDisciplinas(turmaDisciplinasData);
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
    }
  };

  const handleRemoveDisciplina = async (turmaDisciplinaId: string) => {
    try {
      await deleteTurmaDisciplina(turmaDisciplinaId);
      
      // Recarregar dados
      const turmaDisciplinasData = await getTurmaDisciplinas(turma!.id);
      setTurmaDisciplinas(turmaDisciplinasData);
    } catch (error) {
      console.error('Erro ao remover disciplina:', error);
    }
  };

  const handleUpdateTurmaDisciplina = async (id: string, updates: Partial<TurmaDisciplina>) => {
    try {
      await updateTurmaDisciplina(id, updates);
      
      // Recarregar dados
      const turmaDisciplinasData = await getTurmaDisciplinas(turma!.id);
      setTurmaDisciplinas(turmaDisciplinasData);
    } catch (error) {
      console.error('Erro ao atualizar disciplina:', error);
    }
  };

  const handleScheduleSave = async () => {
    // Recarregar horários
    const horariosData = await getHorariosByTurma(turma!.id);
    setHorarios(horariosData);
  };

  const getDiasSemanaNomes = () => {
    return ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  };

  const getHorariosPorDia = (dia: number) => {
    return horarios.filter(h => h.dia_semana === dia).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  };

  const calcularIdadeMedia = () => {
    if (alunos.length === 0) return 0;
    
    const hoje = new Date();
    const idades = alunos.map(aluno => {
      const nascimento = new Date((aluno as any).data_nascimento || '2010-01-01');
      return hoje.getFullYear() - nascimento.getFullYear();
    });
    
    return Math.round(idades.reduce((acc, idade) => acc + idade, 0) / idades.length);
  };

  if (!isOpen || !turma) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500 rounded-full text-white">
              <School className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {editMode ? 'Editar Turma' : 'Detalhes da Turma'}
              </h3>
              <p className="text-sm text-gray-500">
                Criada em {new Date(turma.criado_em).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border-b border-green-200">
            <div className="flex items-center space-x-2 text-green-700">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Turma atualizada com sucesso!</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <School className="h-4 w-4" />
                <span>Informações</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('disciplinas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'disciplinas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Grade de Disciplinas</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('cronograma')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'cronograma'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Grid className="h-4 w-4" />
                <span>Cronograma</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {activeTab === 'info' && (
            <>
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Informações Básicas
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Turma
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{turma.nome}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Série/Ano
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.serie}
                        onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: 5º Ano, Ensino Médio - 1º"
                      />
                    ) : (
                      <p className="text-gray-900">{(turma as any).serie || 'Não definido'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Turno
                    </label>
                    {editMode ? (
                      <select
                        value={formData.turno}
                        onChange={(e) => setFormData({ ...formData, turno: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Manhã">Manhã</option>
                        <option value="Tarde">Tarde</option>
                        <option value="Noite">Noite</option>
                        <option value="Integral">Integral</option>
                      </select>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{(turma as any).turno || 'Não definido'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ano Letivo
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.ano_letivo}
                        onChange={(e) => setFormData({ ...formData, ano_letivo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{turma.ano_letivo}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Configurações
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacidade
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        value={formData.capacidade}
                        onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: 30"
                      />
                    ) : (
                      <p className="text-gray-900">{(turma as any).capacidade || 'Não definida'} alunos</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    {editMode ? (
                      <select
                        value={formData.ativa ? 'ativa' : 'inativa'}
                        onChange={(e) => setFormData({ ...formData, ativa: e.target.value === 'ativa' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="ativa">Ativa</option>
                        <option value="inativa">Inativa</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        (turma as any).ativa 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(turma as any).ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Criação
                    </label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(turma.criado_em).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Estatísticas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Alunos</p>
                          <p className="text-2xl font-bold text-blue-900">{alunos.length}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Disciplinas</p>
                          <p className="text-2xl font-bold text-green-900">{turmaDisciplinas.length}</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Idade Média</p>
                          <p className="text-2xl font-bold text-purple-900">{calcularIdadeMedia()}</p>
                        </div>
                        <User className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-600">Ocupação</p>
                          <p className="text-2xl font-bold text-yellow-900">
                            {(turma as any).capacidade ? Math.round((alunos.length / (turma as any).capacidade) * 100) : 0}%
                          </p>
                        </div>
                        <School className="h-8 w-8 text-yellow-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              {(editMode || (turma as any).descricao) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                    Descrição
                  </h4>
                  {editMode ? (
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descrição da turma, observações especiais..."
                    />
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {(turma as any).descricao || 'Nenhuma descrição fornecida.'}
                    </p>
                  )}
                </div>
              )}

              {/* Lista de Alunos */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                  Alunos Matriculados ({alunos.length})
                </h4>
                {alunos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhum aluno matriculado nesta turma</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {alunos.map((aluno) => (
                      <div key={aluno.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {aluno.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{aluno.nome}</h5>
                            <p className="text-sm text-gray-500">Matrícula: {(aluno as any).matricula || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'disciplinas' && (
            <div className="space-y-6">
              {/* Header da Grade */}
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">
                  Grade de Disciplinas ({turmaDisciplinas.length})
                </h4>
                <div className="flex items-center space-x-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddDisciplina(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Adicionar disciplina...</option>
                    {todasDisciplinas
                      .filter(d => !turmaDisciplinas.some(td => td.disciplina_id === d.id))
                      .map(disciplina => (
                        <option key={disciplina.id} value={disciplina.id}>
                          {disciplina.nome}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Lista de Disciplinas */}
              {turmaDisciplinas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhuma disciplina vinculada a esta turma</p>
                  <p className="text-sm mt-2">Use o seletor acima para adicionar disciplinas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {turmaDisciplinas.map((turmaDisciplina) => (
                    <div key={turmaDisciplina.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: turmaDisciplina.disciplina?.cor || '#3B82F6' }}
                          >
                            {turmaDisciplina.disciplina?.codigo || turmaDisciplina.disciplina?.nome.charAt(0)}
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{turmaDisciplina.disciplina?.nome}</h5>
                            <p className="text-sm text-gray-500">{turmaDisciplina.disciplina?.codigo}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">Professor:</label>
                            <select
                              value={turmaDisciplina.professor_id || ''}
                              onChange={(e) => handleUpdateTurmaDisciplina(turmaDisciplina.id, {
                                professor_id: e.target.value || null
                              })}
                              className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Sem professor</option>
                              {professores.map(professor => (
                                <option key={professor.id} value={professor.id}>
                                  {professor.nome}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">Carga:</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={turmaDisciplina.carga_horaria_semanal}
                              onChange={(e) => handleUpdateTurmaDisciplina(turmaDisciplina.id, {
                                carga_horaria_semanal: parseInt(e.target.value)
                              })}
                              className="w-16 text-sm px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="text-sm text-gray-500">h/sem</span>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveDisciplina(turmaDisciplina.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cronograma' && (
            <div className="space-y-6">
              {/* Header do Cronograma */}
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">
                  Cronograma Semanal de Aulas
                </h4>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Novo Horário</span>
                </button>
              </div>

              {/* Grade de Horários */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-8 gap-0">
                  {/* Header */}
                  <div className="bg-gray-50 p-3 border-b border-gray-200 font-medium text-gray-700 text-center">
                    Horário
                  </div>
                  {getDiasSemanaNomes().map((dia, index) => (
                    <div key={index} className="bg-gray-50 p-3 border-b border-gray-200 font-medium text-gray-700 text-center">
                      {dia}
                    </div>
                  ))}
                  
                  {/* Horários */}
                  {Array.from({ length: 8 }, (_, i) => {
                    const hora = 7 + i; // Começar às 7h
                    const horaFormatada = `${hora.toString().padStart(2, '0')}:00`;
                    
                    return (
                      <React.Fragment key={i}>
                        <div className="p-3 border-b border-gray-200 text-center text-sm text-gray-600 bg-gray-50">
                          {horaFormatada}
                        </div>
                        {[1, 2, 3, 4, 5, 6, 7].map((dia) => {
                          const horariosNoDia = getHorariosPorDia(dia).filter(h => {
                            const horaInicio = parseInt(h.hora_inicio.split(':')[0]);
                            return horaInicio === hora;
                          });
                          
                          return (
                            <div key={dia} className="p-2 border-b border-gray-200 min-h-[60px]">
                              {horariosNoDia.map((horario) => (
                                <div
                                  key={horario.id}
                                  className="p-2 rounded text-xs cursor-pointer hover:shadow-md transition-shadow"
                                  style={{ backgroundColor: horario.disciplina?.cor + '20', borderLeft: `3px solid ${horario.disciplina?.cor}` }}
                                  onClick={() => {
                                    setEditingHorario(horario);
                                    setShowScheduleModal(true);
                                  }}
                                >
                                  <div className="font-medium text-gray-900">{horario.disciplina?.nome}</div>
                                  <div className="text-gray-600">{horario.professor?.nome}</div>
                                  {horario.sala && <div className="text-gray-500">Sala: {horario.sala}</div>}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Resumo dos Horários */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Resumo da Semana</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total de aulas por semana:</p>
                    <p className="text-lg font-bold text-blue-600">{horarios.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Disciplinas com horário:</p>
                    <p className="text-lg font-bold text-green-600">
                      {new Set(horarios.map(h => h.disciplina_id)).size}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {editMode && activeTab === 'info' && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={() => {
                setEditMode(false);
                // Resetar form data
                if (turma) {
                  setFormData({
                    nome: turma.nome,
                    serie: (turma as any).serie || '',
                    turno: (turma as any).turno || 'Manhã',
                    ano_letivo: turma.ano_letivo,
                    capacidade: (turma as any).capacidade?.toString() || '',
                    descricao: (turma as any).descricao || '',
                    ativa: (turma as any).ativa ?? true
                  });
                }
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        )}

        {/* Modal de Cronograma */}
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setEditingHorario(null);
          }}
          turma={turma}
          horario={editingHorario}
          onSave={handleScheduleSave}
        />
      </div>
    </div>
  );
}