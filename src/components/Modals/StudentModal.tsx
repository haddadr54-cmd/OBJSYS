import React, { useState, useEffect } from 'react';
import { X, GraduationCap, Calendar, Users, Phone, Mail, MapPin, AlertCircle, Check, Upload, User } from 'lucide-react';
import type { Aluno, Turma, Usuario } from '../../lib/supabase.types';
import { getAllTurmas, getAllUsuarios, createAluno, updateAluno, createUsuario } from '../../lib/supabase';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Aluno | null;
  onSave: () => void;
}

export function StudentModal({ isOpen, onClose, student, onSave }: StudentModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    matricula: '',
    turma_id: '',
    responsavel_id: '',
    responsavel: '',
    telefone_responsavel: '',
    email_responsavel: '',
    endereco: '',
    observacoes: '',
    foto_url: ''
  });
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [responsaveis, setResponsaveis] = useState<Usuario[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Carregar turmas do Supabase
    const fetchTurmas = async () => {
      try {
        const [turmasData, usuariosData] = await Promise.all([
          getAllTurmas(),
          getAllUsuarios()
        ]);
        
        if (isMounted) {
          setTurmas(turmasData);
          
          // Filtrar apenas usuários do tipo 'pai'
          const responsaveisData = usuariosData.filter(u => u.tipo_usuario === 'pai' && u.ativo);
          setResponsaveis(responsaveisData);
        }
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
      }
    };
    
    fetchTurmas();

    if (student) {
      setFormData({
        nome: student.nome,
        data_nascimento: (student as any).data_nascimento || '',
        matricula: (student as any).matricula || '',
        turma_id: student.turma_id,
        responsavel_id: student.responsavel_id || '',
        responsavel: (student as any).responsavel || '',
        telefone_responsavel: (student as any).telefone_responsavel || '',
        email_responsavel: (student as any).email_responsavel || '',
        endereco: (student as any).endereco || '',
        observacoes: (student as any).observacoes || '',
        foto_url: (student as any).foto_url || ''
      });
    } else {
      setFormData({
        nome: '',
        data_nascimento: '',
        matricula: '',
        turma_id: '',
        responsavel_id: '',
        responsavel: '',
        telefone_responsavel: '',
        email_responsavel: '',
        endereco: '',
        observacoes: '',
        foto_url: ''
      });
    }
    setErrors({});
    setSuccess(false);
    
    return () => {
      isMounted = false;
    };
  }, [student, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim() || formData.nome.length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.data_nascimento) {
      newErrors.data_nascimento = 'Data de nascimento é obrigatória';
    }

    if (!formData.turma_id) {
      newErrors.turma_id = 'Turma é obrigatória';
    }

    // Validar dados do responsável apenas se não há responsável selecionado
    if (!formData.responsavel_id) {
      if (!formData.responsavel.trim()) {
        newErrors.responsavel = 'Nome do responsável é obrigatório';
      }

      if (!formData.telefone_responsavel.trim()) {
        newErrors.telefone_responsavel = 'Telefone do responsável é obrigatório';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email_responsavel.trim()) {
        newErrors.email_responsavel = 'E-mail do responsável é obrigatório';
      } else if (!emailRegex.test(formData.email_responsavel)) {
        newErrors.email_responsavel = 'Formato de e-mail inválido';
      }

      if (!formData.endereco.trim()) {
        newErrors.endereco = 'Endereço é obrigatório';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB
        setErrors({ ...errors, foto_url: 'Imagem deve ter no máximo 2MB' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData({ ...formData, foto_url: result });
        setErrors({ ...errors, foto_url: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      let responsavelId = formData.responsavel_id;
      
      // Se não há responsável selecionado e há dados de responsável, criar novo
      if (!responsavelId && formData.responsavel.trim()) {
        const novoResponsavel = await createUsuario({
          nome: formData.responsavel,
          email: formData.email_responsavel,
          senha: '123456', // Senha padrão
          tipo_usuario: 'pai',
          telefone: formData.telefone_responsavel,
          ativo: true
        });
        
        if (novoResponsavel) {
          responsavelId = novoResponsavel.id;
        }
      }
      
      if (student) {
        // Editar aluno existente
        await updateAluno(student.id, {
          nome: formData.nome,
          turma_id: formData.turma_id,
          data_nascimento: formData.data_nascimento,
          responsavel_id: responsavelId
        });
        console.log('✅ Aluno atualizado');
      } else {
        // Criar novo aluno
        await createAluno({
          nome: formData.nome,
          turma_id: formData.turma_id,
          responsavel_id: responsavelId,
          data_nascimento: formData.data_nascimento,
          matricula: formData.matricula
        });
        console.log('✅ Aluno criado');
      }

      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      setErrors({ submit: 'Erro ao salvar aluno' });
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
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {student ? 'Editar Aluno' : 'Novo Aluno'}
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
                {student ? 'Aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!'}
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Foto do Aluno */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
              {formData.foto_url ? (
                <img src={formData.foto_url} alt="Foto do aluno" className="w-full h-full object-cover" />
              ) : (
                <GraduationCap className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="foto-upload"
              />
              <label
                htmlFor="foto-upload"
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm">Escolher Foto</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">JPG/PNG até 2MB (opcional)</p>
              {errors.foto_url && (
                <p className="text-red-600 text-xs mt-1">{errors.foto_url}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nome ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nome completo do aluno"
              />
              {errors.nome && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.nome}
                </p>
              )}
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.data_nascimento ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.data_nascimento && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.data_nascimento}
                </p>
              )}
            </div>

            {/* Matrícula */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matrícula
              </label>
              <input
                type="text"
                value={formData.matricula}
                onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Número da matrícula (opcional)"
              />
            </div>
          </div>

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

          {/* Dados do Responsável */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Dados do Responsável</h4>
            
            {/* Responsável Existente */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsável Cadastrado
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.responsavel_id}
                  onChange={(e) => setFormData({ ...formData, responsavel_id: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um responsável cadastrado</option>
                  {responsaveis.map(responsavel => (
                    <option key={responsavel.id} value={responsavel.id}>
                      {responsavel.nome} - {responsavel.email}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ou preencha os dados abaixo para criar um novo responsável
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome do Responsável */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Responsável {!formData.responsavel_id && '*'}
                </label>
                <input
                  type="text"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  disabled={!!formData.responsavel_id}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.responsavel ? 'border-red-300' : 'border-gray-300'
                  } ${formData.responsavel_id ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  placeholder="Nome completo do responsável"
                />
                {errors.responsavel && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.responsavel}
                  </p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone {!formData.responsavel_id && '*'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.telefone_responsavel}
                    onChange={(e) => setFormData({ ...formData, telefone_responsavel: e.target.value })}
                    disabled={!!formData.responsavel_id}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.telefone_responsavel ? 'border-red-300' : 'border-gray-300'
                    } ${formData.responsavel_id ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                {errors.telefone_responsavel && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.telefone_responsavel}
                  </p>
                )}
              </div>
            </div>

            {/* E-mail do Responsável */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail do Responsável {!formData.responsavel_id && '*'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email_responsavel}
                  onChange={(e) => setFormData({ ...formData, email_responsavel: e.target.value })}
                  disabled={!!formData.responsavel_id}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email_responsavel ? 'border-red-300' : 'border-gray-300'
                  } ${formData.responsavel_id ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  placeholder="responsavel@email.com"
                />
              </div>
              {errors.email_responsavel && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.email_responsavel}
                </p>
              )}
            </div>
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                rows={2}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endereco ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Rua, número, bairro, cidade"
              />
            </div>
            {errors.endereco && (
              <p className="text-red-600 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.endereco}
              </p>
            )}
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
              placeholder="Restrições alimentares, necessidades especiais, etc."
            />
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
              {loading ? 'Salvando...' : student ? 'Salvar Alterações' : 'Cadastrar Aluno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}