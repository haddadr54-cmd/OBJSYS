import React, { useState, useEffect } from 'react';
import { X, Calendar, BookOpen, Users, FileText, Save, AlertCircle, Check, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { useDataService } from '../../lib/dataService';
import type { Turma, Disciplina, ProvaTarefa } from '../../lib/supabase';

interface ProvaTarefaModalProps {
  isOpen: boolean;
  onClose: () => void;
  provaTarefa?: ProvaTarefa | null;
  onSave: () => void;
}

export function ProvaTarefaModal({ isOpen, onClose, provaTarefa, onSave }: ProvaTarefaModalProps) {
  const { user } = useAuth();
  const { isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [formData, setFormData] = useState({
    disciplina_id: '',
    titulo: '',
    tipo: 'prova' as 'prova' | 'tarefa',
    data: '',
    descricao: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchData();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (provaTarefa) {
      setFormData({
        disciplina_id: provaTarefa.disciplina_id,
        titulo: provaTarefa.titulo,
        tipo: provaTarefa.tipo,
        data: provaTarefa.data,
        descricao: provaTarefa.descricao || ''
      });
    } else {
      setFormData({
        disciplina_id: '',
        titulo: '',
        tipo: 'prova',
        data: '',
        descricao: ''
      });
    }
    setErrors({});
    setSuccess(false);
  }, [provaTarefa, isOpen]);

  const fetchData = async () => {
    try {
      const [turmasData, disciplinasData] = await Promise.all([
        dataService.getTurmas(),
        dataService.getDisciplinas()
      ]);
      
      setTurmas(turmasData);
      setDisciplinas(disciplinasData);
      
      // Se há apenas uma disciplina, selecionar automaticamente
      if (disciplinasData.length === 1) {
        setFormData(prev => ({ ...prev, disciplina_id: disciplinasData[0].id }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.disciplina_id) {
      newErrors.disciplina_id = 'Disciplina é obrigatória';
    }

    if (!formData.titulo.trim() || formData.titulo.length < 3) {
      newErrors.titulo = 'Título deve ter pelo menos 3 caracteres';
    }

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    } else {
      const dataProva = new Date(formData.data);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (dataProva < hoje) {
        newErrors.data = 'Data não pode ser no passado';
      }
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (provaTarefa) {
        // Editar prova/tarefa existente
       await dataService.updateProvaTarefa(provaTarefa.id, formData);
        console.log('✅ Prova/Tarefa atualizada');
      } else {
        // Criar nova prova/tarefa
       await dataService.createProvaTarefa(formData);
        console.log('✅ Prova/Tarefa criada');
      }

      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar prova/tarefa:', error);
      setErrors({ submit: 'Erro ao salvar prova/tarefa' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      disciplina_id: '',
      titulo: '',
      tipo: 'prova',
      data: '',
      descricao: ''
    });
    setErrors({});
    setSuccess(false);
  };

  if (!isOpen) return null;

  const disciplinaAtual = disciplinas.find(d => d.id === formData.disciplina_id);
  const turmaAtual = turmas.find(t => t.id === disciplinaAtual?.turma_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {provaTarefa ? 'Editar Prova/Tarefa' : 'Nova Prova/Tarefa'}
            </h3>
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
              <span className="text-sm font-medium">
                {provaTarefa ? 'Prova/Tarefa atualizada com sucesso!' : 'Prova/Tarefa criada com sucesso!'}
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de Atividade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Atividade *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipo: 'prova' })}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  formData.tipo === 'prova'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="p-2 bg-red-100 rounded-full w-fit mx-auto mb-2">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <span className="text-sm font-medium">Prova</span>
                <p className="text-xs text-gray-500 mt-1">Avaliação formal</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipo: 'tarefa' })}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  formData.tipo === 'tarefa'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="p-2 bg-blue-100 rounded-full w-fit mx-auto mb-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Tarefa</span>
                <p className="text-xs text-gray-500 mt-1">Trabalho/Exercício</p>
              </button>
            </div>
            {errors.tipo && (
              <p className="text-red-600 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.tipo}
              </p>
            )}
          </div>

          {/* Disciplina */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disciplina *
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={formData.disciplina_id}
                onChange={(e) => setFormData({ ...formData, disciplina_id: e.target.value })}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.disciplina_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione uma disciplina</option>
                {disciplinas.map(disciplina => (
                  <option key={disciplina.id} value={disciplina.id}>
                    {disciplina.nome}
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

          {/* Informações da Seleção */}
          {formData.disciplina_id && disciplinaAtual && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: disciplinaAtual.cor || '#3B82F6' }}
                  ></div>
                  <span className="text-sm font-medium text-blue-800">
                    {disciplinaAtual.nome}
                  </span>
                </div>
                {turmaAtual && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {turmaAtual.nome}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.titulo ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={`Ex: ${formData.tipo === 'prova' ? 'Prova de Matemática - Frações' : 'Exercícios sobre Sistema Solar'}`}
            />
            {errors.titulo && (
              <p className="text-red-600 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.titulo}
              </p>
            )}
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Entrega/Aplicação *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.data ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.data && (
              <p className="text-red-600 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.data}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Data mínima: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição/Instruções
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Descreva ${formData.tipo === 'prova' ? 'o conteúdo da prova, materiais permitidos...' : 'as instruções da tarefa, critérios de avaliação...'}`}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.descricao.length}/500 caracteres
            </p>
          </div>

          {/* Informações Adicionais */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              {formData.tipo === 'prova' ? '📝 Dicas para Provas:' : '📚 Dicas para Tarefas:'}
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {formData.tipo === 'prova' ? (
                <>
                  <li>• Defina claramente o conteúdo que será cobrado</li>
                  <li>• Informe materiais permitidos (calculadora, consulta, etc.)</li>
                  <li>• Especifique duração e formato da prova</li>
                  <li>• Comunique critérios de avaliação</li>
                </>
              ) : (
                <>
                  <li>• Explique claramente o que deve ser entregue</li>
                  <li>• Defina formato de entrega (físico, digital, etc.)</li>
                  <li>• Especifique critérios de avaliação</li>
                  <li>• Informe se é individual ou em grupo</li>
                </>
              )}
            </ul>
          </div>

          {/* Mensagem quando não há disciplinas */}
          {disciplinas.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma disciplina atribuída
              </h3>
              <p className="text-gray-500">
                Você ainda não possui disciplinas atribuídas. Entre em contato com o administrador.
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
        {disciplinas.length > 0 && (
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
              <span>{loading ? 'Salvando...' : provaTarefa ? 'Salvar Alterações' : 'Criar Atividade'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}