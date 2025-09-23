import React, { useState, useEffect } from 'react';
import { X, BookOpen, Users, User, Calendar, Save, Edit, Plus, Trash2, AlertCircle, Check } from 'lucide-react';
import { getAllTurmas, getAllUsuarios, updateDisciplina, getAllDisciplinas } from '../../lib/supabase';
import type { Disciplina, Turma, Usuario } from '../../lib/supabase';

interface DisciplinaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  disciplina: Disciplina | null;
  onSave: () => void;
}

export function DisciplinaDetailModal({ isOpen, onClose, disciplina, onSave }: DisciplinaDetailModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [professores, setProfessores] = useState<Usuario[]>([]);
  const [turmasAssociadas, setTurmasAssociadas] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    descricao: '',
    cor: '#3B82F6',
    professor_id: '',
    ativa: true
  });

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
        descricao: (disciplina as any).descricao || '',
        cor: (disciplina as any).cor || '#3B82F6',
        professor_id: disciplina.professor_id || '',
        ativa: (disciplina as any).ativa ?? true
      });
      
      // Se a disciplina tem turma_id, adicionar à lista de turmas associadas
      if (disciplina.turma_id) {
        setTurmasAssociadas([disciplina.turma_id]);
      }
    }
  }, [disciplina]);

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

  const handleSave = async () => {
    if (!disciplina) return;
    
    setLoading(true);
    try {
      await updateDisciplina(disciplina.id, {
        nome: formData.nome,
        codigo: formData.codigo,
        descricao: formData.descricao,
        cor: formData.cor,
        professor_id: formData.professor_id || null,
        ativa: formData.ativa
      });

      setSuccess(true);
      setEditMode(false);
      setTimeout(() => {
        setSuccess(false);
        onSave();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar disciplina:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTurmaAssociada = (turmaId: string) => {
    if (!turmasAssociadas.includes(turmaId)) {
      setTurmasAssociadas([...turmasAssociadas, turmaId]);
    }
  };

  const removeTurmaAssociada = (turmaId: string) => {
    setTurmasAssociadas(turmasAssociadas.filter(id => id !== turmaId));
  };

  const getProfessorNome = (professorId: string) => {
    const professor = professores.find(p => p.id === professorId);
    return professor?.nome || 'Não atribuído';
  };

  const getTurmaNome = (turmaId: string) => {
    const turma = turmas.find(t => t.id === turmaId);
    return turma?.nome || 'Turma não encontrada';
  };

  if (!isOpen || !disciplina) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div 
              className="p-3 rounded-full text-white"
              style={{ backgroundColor: formData.cor }}
            >
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {editMode ? 'Editar Disciplina' : 'Detalhes da Disciplina'}
              </h3>
              <p className="text-sm text-gray-500">
                Criada em {new Date(disciplina.criado_em).toLocaleDateString('pt-BR')}
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
              <span className="text-sm font-medium">Disciplina atualizada com sucesso!</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Informações Básicas
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Disciplina
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{disciplina.nome}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código/Sigla
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: MAT, POR, CIE"
                  />
                ) : (
                  <p className="text-gray-900">{(disciplina as any).codigo || 'Não definido'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor da Disciplina
                </label>
                {editMode ? (
                  <div className="flex items-center space-x-3">
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
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: (disciplina as any).cor || '#3B82F6' }}
                    ></div>
                    <span className="text-gray-900">{(disciplina as any).cor || '#3B82F6'}</span>
                  </div>
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
                    (disciplina as any).ativa 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {(disciplina as any).ativa ? 'Ativa' : 'Inativa'}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Atribuições
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professor Responsável
                </label>
                {editMode ? (
                  <select
                    value={formData.professor_id}
                    onChange={(e) => setFormData({ ...formData, professor_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um professor</option>
                    {professores.map(professor => (
                      <option key={professor.id} value={professor.id}>
                        {professor.nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getProfessorNome(disciplina.professor_id || '').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-900">{getProfessorNome(disciplina.professor_id || '')}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Turma Associada
                </label>
                <div className="text-gray-900">
                  {disciplina.turma_id ? getTurmaNome(disciplina.turma_id) : 'Nenhuma turma associada'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Criação
                </label>
                <div className="flex items-center space-x-2 text-gray-900">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{new Date(disciplina.criado_em).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              Descrição
            </h4>
            {editMode ? (
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descrição da disciplina, objetivos, conteúdo programático..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {(disciplina as any).descricao || 'Nenhuma descrição fornecida.'}
              </p>
            )}
          </div>

          {/* Estatísticas */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              Estatísticas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Turmas</p>
                    <p className="text-2xl font-bold text-blue-900">1</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Alunos</p>
                    <p className="text-2xl font-bold text-green-900">0</p>
                  </div>
                  <User className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Notas</p>
                    <p className="text-2xl font-bold text-purple-900">0</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {editMode && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={() => {
                setEditMode(false);
                // Resetar form data
                if (disciplina) {
                  setFormData({
                    nome: disciplina.nome,
                    codigo: (disciplina as any).codigo || '',
                    descricao: (disciplina as any).descricao || '',
                    cor: (disciplina as any).cor || '#3B82F6',
                    professor_id: disciplina.professor_id || '',
                    ativa: (disciplina as any).ativa ?? true
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
      </div>
    </div>
  );
}