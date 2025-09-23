import React, { useState, useEffect } from 'react';
import { X, Clock, BookOpen, User, MapPin, Save, AlertCircle, Check, Trash2 } from 'lucide-react';
import { 
  getTurmaDisciplinas,
  getAllUsuarios,
  createHorarioAula,
  updateHorarioAula,
  deleteHorarioAula
} from '../../lib/supabase';
import type { Turma, HorarioAula, TurmaDisciplina, Usuario } from '../../lib/supabase';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  turma: Turma | null;
  horario?: HorarioAula | null;
  onSave: () => void;
}

export function ScheduleModal({ isOpen, onClose, turma, horario, onSave }: ScheduleModalProps) {
  const [formData, setFormData] = useState({
    disciplina_id: '',
    professor_id: '',
    dia_semana: 1,
    hora_inicio: '07:00',
    hora_fim: '07:50',
    sala: '',
    observacoes: ''
  });
  const [turmaDisciplinas, setTurmaDisciplinas] = useState<TurmaDisciplina[]>([]);
  const [professores, setProfessores] = useState<Usuario[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && turma) {
      fetchData();
    }
  }, [isOpen, turma]);

  useEffect(() => {
    if (horario) {
      setFormData({
        disciplina_id: horario.disciplina_id,
        professor_id: horario.professor_id || '',
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fim: horario.hora_fim,
        sala: horario.sala || '',
        observacoes: horario.observacoes || ''
      });
    } else {
      setFormData({
        disciplina_id: '',
        professor_id: '',
        dia_semana: 1,
        hora_inicio: '07:00',
        hora_fim: '07:50',
        sala: '',
        observacoes: ''
      });
    }
    setErrors({});
    setSuccess(false);
  }, [horario, isOpen]);

  const fetchData = async () => {
    if (!turma) return;
    
    try {
      const [turmaDisciplinasData, usuariosData] = await Promise.all([
        getTurmaDisciplinas(turma.id),
        getAllUsuarios()
      ]);
      
      setTurmaDisciplinas(turmaDisciplinasData);
      setProfessores(usuariosData.filter(u => u.tipo_usuario === 'professor'));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.disciplina_id) {
      newErrors.disciplina_id = 'Disciplina é obrigatória';
    }

    if (!formData.hora_inicio) {
      newErrors.hora_inicio = 'Hora de início é obrigatória';
    }

    if (!formData.hora_fim) {
      newErrors.hora_fim = 'Hora de fim é obrigatória';
    }

    if (formData.hora_inicio && formData.hora_fim && formData.hora_inicio >= formData.hora_fim) {
      newErrors.hora_fim = 'Hora de fim deve ser posterior à hora de início';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !turma) return;

    setLoading(true);
    try {
      if (horario) {
        // Editar horário existente
        await updateHorarioAula(horario.id, {
          disciplina_id: formData.disciplina_id,
          professor_id: formData.professor_id || null,
          dia_semana: formData.dia_semana,
          hora_inicio: formData.hora_inicio,
          hora_fim: formData.hora_fim,
          sala: formData.sala || null,
          observacoes: formData.observacoes || null
        });
        console.log('✅ Horário atualizado');
      } else {
        // Criar novo horário
        await createHorarioAula({
          turma_id: turma.id,
          disciplina_id: formData.disciplina_id,
          professor_id: formData.professor_id || null,
          dia_semana: formData.dia_semana,
          hora_inicio: formData.hora_inicio,
          hora_fim: formData.hora_fim,
          sala: formData.sala || null,
          observacoes: formData.observacoes || null,
          ativo: true
        });
        console.log('✅ Horário criado');
      }

      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
      setErrors({ submit: 'Erro ao salvar horário' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!horario) return;
    
    if (confirm('Tem certeza que deseja excluir este horário?')) {
      try {
        await deleteHorarioAula(horario.id);
        onSave();
        onClose();
        resetForm();
      } catch (error) {
        console.error('Erro ao excluir horário:', error);
        setErrors({ submit: 'Erro ao excluir horário' });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      disciplina_id: '',
      professor_id: '',
      dia_semana: 1,
      hora_inicio: '07:00',
      hora_fim: '07:50',
      sala: '',
      observacoes: ''
    });
    setErrors({});
    setSuccess(false);
  };

  const getDiasSemanaNomes = () => {
    return [
      { value: 1, label: 'Segunda-feira' },
      { value: 2, label: 'Terça-feira' },
      { value: 3, label: 'Quarta-feira' },
      { value: 4, label: 'Quinta-feira' },
      { value: 5, label: 'Sexta-feira' },
      { value: 6, label: 'Sábado' },
      { value: 7, label: 'Domingo' }
    ];
  };

  if (!isOpen || !turma) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {horario ? 'Editar Horário' : 'Novo Horário de Aula'}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {horario && (
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
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
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border-b border-green-200">
            <div className="flex items-center space-x-2 text-green-700">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">
                {horario ? 'Horário atualizado com sucesso!' : 'Horário criado com sucesso!'}
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Disciplina */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disciplina *
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={formData.disciplina_id}
                onChange={(e) => {
                  setFormData({ ...formData, disciplina_id: e.target.value });
                  // Auto-selecionar professor se houver apenas um para a disciplina
                  const turmaDisciplina = turmaDisciplinas.find(td => td.disciplina_id === e.target.value);
                  if (turmaDisciplina?.professor_id) {
                    setFormData(prev => ({ ...prev, professor_id: turmaDisciplina.professor_id || '' }));
                  }
                }}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.disciplina_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione uma disciplina</option>
                {turmaDisciplinas.map(td => (
                  <option key={td.id} value={td.disciplina_id}>
                    {td.disciplina?.nome}
                  </option>
                ))}
              </select>
            </div>
            {errors.disciplina_id && (
              <p className="text-red-600 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.disciplina_id}
              </p>
            )}
          </div>

          {/* Professor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professor
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={formData.professor_id}
                onChange={(e) => setFormData({ ...formData, professor_id: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um professor (opcional)</option>
                {professores.map(professor => (
                  <option key={professor.id} value={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dia da Semana e Horários */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dia da Semana *
              </label>
              <select
                value={formData.dia_semana}
                onChange={(e) => setFormData({ ...formData, dia_semana: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {getDiasSemanaNomes().map(dia => (
                  <option key={dia.value} value={dia.value}>{dia.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Início *
              </label>
              <input
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.hora_inicio ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.hora_inicio && (
                <p className="text-red-600 text-xs mt-1">{errors.hora_inicio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Fim *
              </label>
              <input
                type="time"
                value={formData.hora_fim}
                onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.hora_fim ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.hora_fim && (
                <p className="text-red-600 text-xs mt-1">{errors.hora_fim}</p>
              )}
            </div>
          </div>

          {/* Sala */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sala/Local
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.sala}
                onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Sala 101, Laboratório, Quadra"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observações especiais sobre esta aula..."
            />
          </div>

          {/* Preview */}
          {formData.disciplina_id && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Preview do Horário:</h4>
              <div className="text-sm text-blue-700">
                <p><strong>Disciplina:</strong> {turmaDisciplinas.find(td => td.disciplina_id === formData.disciplina_id)?.disciplina?.nome}</p>
                <p><strong>Professor:</strong> {professores.find(p => p.id === formData.professor_id)?.nome || 'Não atribuído'}</p>
                <p><strong>Dia:</strong> {getDiasSemanaNomes().find(d => d.value === formData.dia_semana)?.label}</p>
                <p><strong>Horário:</strong> {formData.hora_inicio} às {formData.hora_fim}</p>
                {formData.sala && <p><strong>Local:</strong> {formData.sala}</p>}
              </div>
            </div>
          )}

          {/* Mensagem quando não há disciplinas */}
          {turmaDisciplinas.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma disciplina na grade
              </h3>
              <p className="text-gray-500">
                Adicione disciplinas à grade da turma antes de criar horários.
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
        </form>

        {/* Footer */}
        {turmaDisciplinas.length > 0 && (
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
              disabled={loading || success}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Salvando...' : horario ? 'Salvar Alterações' : 'Criar Horário'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}