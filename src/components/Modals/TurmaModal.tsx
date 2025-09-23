import React, { useState, useEffect } from 'react';
import { X, School, Users, Clock, Calendar, User, AlertCircle, Check, Hash } from 'lucide-react';
import { Turma } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useDataService } from '../../lib/dataService';

interface TurmaModalProps {
  isOpen: boolean;
  onClose: () => void;
  turma?: Turma | null;
  onSave: () => void;
}

export function TurmaModal({ isOpen, onClose, turma, onSave }: TurmaModalProps) {
  const { user } = useAuth();
  const dataService = useDataService(user, true); // true for Supabase connection
  const [formData, setFormData] = useState({
    nome: '',
    serie: '',
    turno: 'Manhã' as 'Manhã' | 'Tarde' | 'Noite' | 'Integral',
    ano_letivo: new Date().getFullYear().toString(),
    professor_id: '',
    capacidade: '',
    ativo: true,
    observacoes: ''
  });
  const [professores, setProfessores] = useState<any[]>([]);
  const [todasDisciplinas, setTodasDisciplinas] = useState<any[]>([]);
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<string[]>([]);
  const [professoresDisciplinas, setProfessoresDisciplinas] = useState<{[key: string]: string}>({});
  const [novaDisciplina, setNovaDisciplina] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Carregar professores do Supabase
    const fetchProfessores = async () => {
      try {
        const { getAllUsuarios, getAllDisciplinas } = await import('../../lib/supabase');
        const [usuarios, disciplinas] = await Promise.all([
          getAllUsuarios(),
          getAllDisciplinas()
        ]);
        
        const professoresData = usuarios.filter(u => u.tipo_usuario === 'professor' && u.ativo);
        setProfessores(professoresData);
        setTodasDisciplinas(disciplinas);
      } catch (error) {
        console.error('Erro ao carregar professores:', error);
      }
    };
    
    fetchProfessores();

    if (turma) {
      setFormData({
        nome: turma.nome,
        serie: (turma as any).serie || '',
        turno: (turma as any).turno || 'Manhã',
        ano_letivo: turma.ano_letivo,
        professor_id: (turma as any).professor_id || '',
        capacidade: (turma as any).capacidade?.toString() || '',
        ativo: (turma as any).ativa ?? true,
        observacoes: (turma as any).observacoes || ''
      });
    } else {
      setFormData({
        nome: '',
        serie: '',
        turno: 'Manhã',
        ano_letivo: new Date().getFullYear().toString(),
        professor_id: '',
        capacidade: '',
        ativo: true,
        observacoes: ''
      });
    }
    setErrors({});
    setSuccess(false);
  }, [turma, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim() || formData.nome.length < 2) {
      newErrors.nome = 'Nome da turma deve ter pelo menos 2 caracteres';
    }

    if (!formData.serie.trim()) {
      newErrors.serie = 'Série é obrigatória';
    }

    if (!formData.ano_letivo.trim()) {
      newErrors.ano_letivo = 'Ano letivo é obrigatório';
    } else {
      const ano = parseInt(formData.ano_letivo);
      if (isNaN(ano) || ano < 2020 || ano > 2030) {
        newErrors.ano_letivo = 'Ano letivo deve estar entre 2020 e 2030';
      }
    }

    if (!formData.turno) {
      newErrors.turno = 'Turno é obrigatório';
    }

    if (formData.capacidade && (isNaN(parseInt(formData.capacidade)) || parseInt(formData.capacidade) < 1)) {
      newErrors.capacidade = 'Capacidade deve ser um número maior que 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const adicionarDisciplina = () => {
    if (novaDisciplina && !disciplinasSelecionadas.includes(novaDisciplina)) {
      setDisciplinasSelecionadas(prev => [...prev, novaDisciplina]);
      setNovaDisciplina('');
    }
  };

  const removeDisciplina = (disciplinaId: string) => {
    setDisciplinasSelecionadas(prev => prev.filter(id => id !== disciplinaId));
    setProfessoresDisciplinas(prev => {
      const newState = { ...prev };
      delete newState[disciplinaId];
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      let turmaId: string;
      
      if (turma) {
        // Editar turma existente
        const turmaAtualizada = await dataService.updateTurma(turma.id, {
          nome: formData.nome,
          serie: formData.serie,
          turno: formData.turno,
          ano_letivo: formData.ano_letivo,
          professor_id: formData.professor_id || null,
          capacidade: formData.capacidade ? parseInt(formData.capacidade) : null,
          ativa: formData.ativo,
          observacoes: formData.observacoes
        });
        turmaId = turma.id;
        console.log('✅ Turma atualizada');
      } else {
        // Criar nova turma
        const novaTurma = await dataService.createTurma({
          nome: formData.nome,
          serie: formData.serie,
          turno: formData.turno,
          ano_letivo: formData.ano_letivo,
          professor_id: formData.professor_id || null,
          capacidade: formData.capacidade ? parseInt(formData.capacidade) : null,
          observacoes: formData.observacoes,
          ativa: formData.ativo
        });
        turmaId = novaTurma?.id || '';
        console.log('✅ Turma criada');
      }

      // Atualizar disciplinas da turma
      if (turmaId && disciplinasSelecionadas.length > 0) {
        const { updateDisciplina } = await import('../../lib/supabase');
        
        for (const disciplinaId of disciplinasSelecionadas) {
          await updateDisciplina(disciplinaId, {
            turma_id: turmaId,
            professor_id: professoresDisciplinas[disciplinaId] || null
          });
        }
        console.log('✅ Disciplinas da turma atualizadas');
      }

      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
      setErrors({ submit: 'Erro ao salvar turma' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <School className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {turma ? 'Editar Turma' : 'Nova Turma'}
            </h3>
          </div>
          <button
            onClick={onClose}
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
                {turma ? 'Turma atualizada com sucesso!' : 'Turma cadastrada com sucesso!'}
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome da Turma */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Turma *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nome ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: 5º Ano A, 3º B"
              />
              {errors.nome && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.nome}
                </p>
              )}
            </div>

            {/* Série */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Série *
              </label>
              <input
                type="text"
                value={formData.serie}
                onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.serie ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: 5º Ano, Ensino Médio - 1º"
              />
              {errors.serie && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.serie}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Turno */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Turno *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.turno}
                  onChange={(e) => setFormData({ ...formData, turno: e.target.value as any })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.turno ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                  <option value="Integral">Integral</option>
                </select>
              </div>
              {errors.turno && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.turno}
                </p>
              )}
            </div>

            {/* Ano Letivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano Letivo *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="2020"
                  max="2030"
                  value={formData.ano_letivo}
                  onChange={(e) => setFormData({ ...formData, ano_letivo: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.ano_letivo ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="2025"
                />
              </div>
              {errors.ano_letivo && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.ano_letivo}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Professor Responsável */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professor Responsável
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
              <p className="text-xs text-gray-500 mt-1">
                Pode ser atribuído posteriormente
              </p>
            </div>

            {/* Capacidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacidade de Alunos
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.capacidade}
                  onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.capacidade ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 30"
                />
              </div>
              {errors.capacidade && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.capacidade}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.ativo ? 'ativo' : 'inativo'}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.value === 'ativo' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Disciplinas da Turma</h4>
            
            <div className="space-y-3">
              {disciplinasSelecionadas.map((disciplinaId) => {
                const disciplina = todasDisciplinas.find(d => d.id === disciplinaId);
                if (!disciplina) return null;
                
                return (
                  <div key={disciplinaId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: disciplina.cor || '#3B82F6' }}
                      >
                        {disciplina.codigo || disciplina.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{disciplina.nome}</p>
                        <p className="text-sm text-gray-500">{disciplina.codigo}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={professoresDisciplinas[disciplinaId] || ''}
                        onChange={(e) => setProfessoresDisciplinas(prev => ({
                          ...prev,
                          [disciplinaId]: e.target.value
                        }))}
                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sem professor</option>
                        {professores.map(professor => (
                          <option key={professor.id} value={professor.id}>
                            {professor.nome}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeDisciplina(disciplinaId)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {/* Adicionar Nova Disciplina */}
              <div className="flex items-center space-x-3">
                <select
                  value={novaDisciplina}
                  onChange={(e) => setNovaDisciplina(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma disciplina para adicionar</option>
                  {todasDisciplinas
                    .filter(d => !disciplinasSelecionadas.includes(d.id))
                    .map(disciplina => (
                      <option key={disciplina.id} value={disciplina.id}>
                        {disciplina.nome} ({disciplina.codigo})
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={adicionarDisciplina}
                  disabled={!novaDisciplina}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adicionar
                </button>
              </div>
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
              placeholder="Comentários gerais sobre a turma..."
            />
          </div>

          {/* Informações Adicionais */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Informações Importantes:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• O nome da turma deve ser único por ano letivo</li>
              <li>• O professor responsável pode ser atribuído posteriormente</li>
              <li>• A capacidade é opcional e serve como referência</li>
              <li>• Turmas inativas não aparecem nas listas de seleção</li>
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
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : turma ? 'Salvar Alterações' : 'Cadastrar Turma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}