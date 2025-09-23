import React, { useState, useEffect } from 'react';
import { X, BookOpen, Users, User, Clock, AlertCircle, Check, Palette } from 'lucide-react';
import { getAllTurmas, getAllUsuarios, createDisciplina, updateDisciplina } from '../../lib/supabase';
import type { Disciplina, Turma, Usuario } from '../../lib/supabase';

interface DisciplinaModalProps {
  isOpen: boolean;
  onClose: () => void;
  disciplina?: Disciplina | null;
  onSave: () => void;
}

export function DisciplinaModal({ isOpen, onClose, disciplina, onSave }: DisciplinaModalProps) {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [professores, setProfessores] = useState<Usuario[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    carga_horaria: '',
    professor_id: '',
    turma_id: '',
    cor: '#3B82F6',
    descricao: '',
    ativa: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (disciplina) {
      setFormData({
        nome: disciplina.nome,
        codigo: (disciplina as any).codigo || '',
        carga_horaria: (disciplina as any).carga_horaria?.toString() || '',
        professor_id: disciplina.professor_id || '',
        turma_id: disciplina.turma_id || '',
        cor: (disciplina as any).cor || '#3B82F6',
        descricao: (disciplina as any).descricao || '',
        ativa: (disciplina as any).ativa ?? true
      });
    } else {
      setFormData({
        nome: '',
        codigo: '',
        carga_horaria: '',
        professor_id: '',
        turma_id: '',
        cor: '#3B82F6',
        descricao: '',
        ativa: true
      });
    }
    setErrors({});
    setSuccess(false);
  }, [disciplina, isOpen]);

  const fetchData = async () => {
    try {
      const [turmasData, usuariosData] = await Promise.all([
        getAllTurmas(),
        getAllUsuarios()
      ]);
      
      setTurmas(turmasData);
      setProfessores(usuariosData.filter(u => u.tipo_usuario === 'professor'));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim() || formData.nome.length < 2) {
      newErrors.nome = 'Nome da disciplina deve ter pelo menos 2 caracteres';
    }

    if (!formData.codigo.trim() || formData.codigo.length < 2) {
      newErrors.codigo = 'Código deve ter pelo menos 2 caracteres';
    }

    if (!formData.turma_id) {
      newErrors.turma_id = 'Turma é obrigatória';
    }

    // Professor não é obrigatório - pode ser atribuído depois

    if (formData.carga_horaria && (isNaN(parseInt(formData.carga_horaria)) || parseInt(formData.carga_horaria) < 1)) {
      newErrors.carga_horaria = 'Carga horária deve ser um número maior que 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const disciplinaData = {
        nome: formData.nome,
        professor_id: formData.professor_id || null,
        turma_id: formData.turma_id,
      };

      if (disciplina) {
        await updateDisciplina(disciplina.id, disciplinaData);
        console.log('✅ Disciplina atualizada');
      } else {
        await createDisciplina(disciplinaData);
        console.log('✅ Disciplina criada');
      }

      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar disciplina:', error);
      setErrors({ submit: 'Erro ao salvar disciplina' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      codigo: '',
      carga_horaria: '',
      professor_id: '',
      turma_id: '',
      cor: '#3B82F6',
      descricao: '',
      ativa: true
    });
    setErrors({});
    setSuccess(false);
  };

  const coresDisponiveis = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {disciplina ? 'Editar Disciplina' : 'Nova Disciplina'}
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
                {disciplina ? 'Disciplina atualizada com sucesso!' : 'Disciplina cadastrada com sucesso!'}
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome da Disciplina */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Disciplina *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nome ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Matemática, Português"
              />
              {errors.nome && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.nome}
                </p>
              )}
            </div>

            {/* Código */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código/Sigla *
              </label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.codigo ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: MAT, POR, CIE"
                maxLength={5}
              />
              {errors.codigo && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.codigo}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Turma */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Turma *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.turma_id}
                  onChange={(e) => setFormData({ ...formData, turma_id: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.turma_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione uma turma</option>
                  {turmas.map(turma => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome} - {turma.ano_letivo}
                    </option>
                  ))}
                </select>
              </div>
              {errors.turma_id && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.turma_id}
                </p>
              )}
            </div>

            {/* Professor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professor Responsável *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.professor_id}
                  onChange={(e) => setFormData({ ...formData, professor_id: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.professor_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione um professor</option>
                  {professores.map(professor => (
                    <option key={professor.id} value={professor.id}>
                      {professor.nome}
                    </option>
                  ))}
                </select>
              </div>
              {errors.professor_id && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.professor_id}
                </p>
              )}
            </div>
          </div>

          {/* Carga Horária */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carga Horária Semanal
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                min="1"
                max="40"
                value={formData.carga_horaria}
                onChange={(e) => setFormData({ ...formData, carga_horaria: e.target.value })}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.carga_horaria ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: 4 (horas por semana)"
              />
            </div>
            {errors.carga_horaria && (
              <p className="text-red-600 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.carga_horaria}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Número de horas semanais da disciplina (opcional)
            </p>
          </div>

          {/* Cor da Disciplina */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor da Disciplina
            </label>
            <div className="flex items-center space-x-3 mb-3">
              <Palette className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Escolha uma cor para identificar a disciplina</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {coresDisponiveis.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setFormData({ ...formData, cor })}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    formData.cor === cor ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: cor }}
                  title={cor}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center space-x-3">
              <input
                type="color"
                value={formData.cor}
                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.cor}
                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Objetivos da disciplina, conteúdo programático..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.ativa ? 'ativa' : 'inativa'}
              onChange={(e) => setFormData({ ...formData, ativa: e.target.value === 'ativa' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
            </select>
          </div>

          {/* Informações Adicionais */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Informações Importantes:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• O código da disciplina deve ser único</li>
              <li>• A cor ajuda na identificação visual nos relatórios</li>
              <li>• Disciplinas inativas não aparecem nas listas de seleção</li>
              <li>• A carga horária é usada para cálculos de relatórios</li>
              <li>• Professor e turma podem ser atribuídos posteriormente</li>
            </ul>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : disciplina ? 'Salvar Alterações' : 'Cadastrar Disciplina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}