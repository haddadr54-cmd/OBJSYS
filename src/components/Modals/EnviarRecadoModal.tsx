import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Users, User, Send, AlertCircle, Check } from 'lucide-react';
import { 
  getTurmasByProfessor, 
  getAllAlunos,
  createRecado 
} from '../../lib/supabase';
import type { Turma, Aluno } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface EnviarRecadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EnviarRecadoModal({ isOpen, onClose, onSave }: EnviarRecadoModalProps) {
  const { user } = useAuth();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [formData, setFormData] = useState({
    destinatario_tipo: 'turma' as 'turma' | 'aluno' | 'geral',
    destinatario_id: '',
    titulo: '',
    conteudo: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && user) {
      fetchData();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (formData.destinatario_tipo === 'aluno' && formData.destinatario_id) {
      // Buscar alunos da turma selecionada
      fetchAlunosDaTurma();
    }
  }, [formData.destinatario_tipo, formData.destinatario_id]);

  const fetchData = async () => {
    try {
      const turmasData = await getTurmasByProfessor(user!.id);
      setTurmas(turmasData);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const fetchAlunosDaTurma = async () => {
    try {
      const todosAlunos = await getAllAlunos();
      const alunosDaTurma = todosAlunos.filter(a => a.turma_id === formData.destinatario_id);
      setAlunos(alunosDaTurma);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }

    if (!formData.conteudo.trim()) {
      newErrors.conteudo = 'Mensagem é obrigatória';
    }

    if (formData.destinatario_tipo !== 'geral' && !formData.destinatario_id) {
      newErrors.destinatario = 'Selecione o destinatário';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createRecado({
        titulo: formData.titulo,
        conteudo: formData.conteudo,
        destinatario_tipo: formData.destinatario_tipo,
        destinatario_id: formData.destinatario_tipo === 'geral' ? null : formData.destinatario_id,
        enviado_por: user!.id
      });

      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Erro ao enviar recado:', error);
      setErrors({ submit: 'Erro ao enviar recado' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      destinatario_tipo: 'turma',
      destinatario_id: '',
      titulo: '',
      conteudo: ''
    });
    setErrors({});
    setSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-full">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Enviar Recado</h3>
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
              <span className="text-sm font-medium">Recado enviado com sucesso!</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Tipo de Destinatário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Destinatário *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, destinatario_tipo: 'geral', destinatario_id: '' })}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  formData.destinatario_tipo === 'geral'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Users className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Geral</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, destinatario_tipo: 'turma', destinatario_id: '' })}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  formData.destinatario_tipo === 'turma'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Users className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Turma</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, destinatario_tipo: 'aluno', destinatario_id: '' })}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  formData.destinatario_tipo === 'aluno'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <User className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Aluno</span>
              </button>
            </div>
          </div>

          {/* Seleção de Destinatário Específico */}
          {formData.destinatario_tipo === 'turma' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selecionar Turma *
              </label>
              <select
                value={formData.destinatario_id}
                onChange={(e) => setFormData({ ...formData, destinatario_id: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.destinatario ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione uma turma</option>
                {turmas.map(turma => (
                  <option key={turma.id} value={turma.id}>{turma.nome}</option>
                ))}
              </select>
              {errors.destinatario && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.destinatario}
                </p>
              )}
            </div>
          )}

          {formData.destinatario_tipo === 'aluno' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecionar Turma *
                </label>
                <select
                  value={formData.destinatario_id}
                  onChange={(e) => setFormData({ ...formData, destinatario_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma turma primeiro</option>
                  {turmas.map(turma => (
                    <option key={turma.id} value={turma.id}>{turma.nome}</option>
                  ))}
                </select>
              </div>

              {formData.destinatario_id && alunos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecionar Aluno *
                  </label>
                  <select
                    value={formData.destinatario_id}
                    onChange={(e) => setFormData({ ...formData, destinatario_id: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.destinatario ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione um aluno</option>
                    {alunos.map(aluno => (
                      <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                    ))}
                  </select>
                  {errors.destinatario && (
                    <p className="text-red-600 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.destinatario}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assunto *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.titulo ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Digite o assunto do recado"
            />
            {errors.titulo && (
              <p className="text-red-600 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.titulo}
              </p>
            )}
          </div>

          {/* Conteúdo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem *
            </label>
            <textarea
              value={formData.conteudo}
              onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.conteudo ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Digite a mensagem do recado..."
            />
            {errors.conteudo && (
              <p className="text-red-600 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.conteudo}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.conteudo.length}/500 caracteres
            </p>
          </div>

          {/* Preview do Destinatário */}
          {formData.destinatario_tipo !== 'geral' && formData.destinatario_id && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Destinatário:</h4>
              <div className="flex items-center space-x-2">
                {formData.destinatario_tipo === 'turma' ? (
                  <>
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Turma: {turmas.find(t => t.id === formData.destinatario_id)?.nome}
                    </span>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Aluno: {alunos.find(a => a.id === formData.destinatario_id)?.nome}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {formData.destinatario_tipo === 'geral' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Recado será enviado para todos os pais e responsáveis
                </span>
              </div>
            </div>
          )}

          {/* Mensagem quando não há turmas */}
          {turmas.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
              disabled={loading || success}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Enviando...' : 'Enviar Recado'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}