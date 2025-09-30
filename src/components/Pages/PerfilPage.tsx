import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Shield, Camera, Save, Edit, Eye, EyeOff, Lock, AlertCircle, Check, GraduationCap, BookOpen, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { useDataService } from '../../lib/dataService';
import type { Aluno, Nota } from '../../lib/supabase';

export function PerfilPage() {
  const { user } = useAuth();
  const { isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loadingFilhos, setLoadingFilhos] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    avatar_url: ''
  });
  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    atual: false,
    nova: false,
    confirmar: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome,
        email: user.email,
        telefone: user.telefone || '',
        avatar_url: user.avatar_url || ''
      });
      
      // Carregar filhos se for pai
      if (user.tipo_usuario === 'pai') {
        fetchFilhos();
      }
    }
  }, [user]);

  const fetchFilhos = async () => {
    try {
      setLoadingFilhos(true);
      const filhosData = await dataService.getAlunos();
      setAlunos(filhosData);
      
      // Carregar notas dos filhos
      const notasPromises = filhosData.map(() => 
        dataService.getNotas()
      );
      const notasResults = await Promise.all(notasPromises);
      const todasNotas = notasResults.flat().filter(nota => 
        filhosData.some(filho => filho.id === nota.aluno_id)
      );
      setNotas(todasNotas);
    } catch (error) {
      console.error('Erro ao carregar filhos:', error);
    } finally {
      setLoadingFilhos(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, avatar: 'Imagem deve ter no máximo 2MB' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData({ ...formData, avatar_url: result });
        setErrors({ ...errors, avatar: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim() || formData.nome.length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (formData.telefone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Formato: (11) 99999-9999';
    }

    if (showPasswordChange) {
      if (!passwordData.senhaAtual) {
        newErrors.senhaAtual = 'Senha atual é obrigatória';
      }

      if (!passwordData.novaSenha || passwordData.novaSenha.length < 6) {
        newErrors.novaSenha = 'Nova senha deve ter pelo menos 6 caracteres';
      }

      if (passwordData.novaSenha !== passwordData.confirmarSenha) {
        newErrors.confirmarSenha = 'Senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData: any = {
        nome: formData.nome,
        telefone: formData.telefone,
        avatar_url: formData.avatar_url
      };

      if (showPasswordChange && passwordData.novaSenha) {
        updateData.senha = passwordData.novaSenha;
      }

      await dataService.updateUsuario(user!.id, updateData);

      setSuccess(true);
      setEditMode(false);
      setShowPasswordChange(false);
      setPasswordData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setErrors({ submit: 'Erro ao atualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const getTipoUsuarioLabel = (tipo: string) => {
    switch (tipo) {
      case 'admin':
        return 'Administrador';
      case 'professor':
        return 'Professor';
      case 'pai':
        return 'Pai/Responsável';
      default:
        return tipo;
    }
  };

  const getTipoUsuarioColor = (tipo: string) => {
    switch (tipo) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'professor':
        return 'bg-green-100 text-green-800';
      case 'pai':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const FilhosSection = () => {
    if (loadingFilhos) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Carregando filhos...</p>
          </div>
        </div>
      );
    }

    if (alunos.length === 0) {
      return (
        <div className="text-center py-8">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum filho cadastrado</p>
          <p className="text-sm text-gray-400 mt-1">
            Entre em contato com a escola para vincular seus filhos
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {alunos.map((filho) => {
          const notasFilho = notas.filter(nota => nota.aluno_id === filho.id);
          // Corrigir: garantir que a propriedade correta de Nota está sendo usada
          // Supondo que a propriedade correta seja 'nota.nota' (ajuste conforme o modelo real)
          const mediaGeral = notasFilho.length > 0 
            ? notasFilho.reduce((acc, nota) => acc + (typeof nota.nota === 'number' ? nota.nota : 0), 0) / notasFilho.length 
            : 0;

          return (
            <div key={filho.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {filho.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{filho.nome}</h3>
                    <p className="text-sm text-gray-500">
                      {filho.turma_id ? 'Turma cadastrada' : 'Sem turma'}
                    </p>
                    {filho.data_nascimento && (
                      <p className="text-xs text-gray-400">
                        Nascimento: {new Date(filho.data_nascimento).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {mediaGeral > 0 ? mediaGeral.toFixed(1) : '--'}
                  </div>
                  <div className="text-xs text-gray-500">Média Geral</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 text-sm">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600">
                    {notasFilho.length} notas lançadas
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">
                    Ativo
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-gray-600">
                    Desde {new Date(filho.criado_em || Date.now()).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Usuário não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <User className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        </div>
        <div className="flex space-x-2">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Editar Perfil</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditMode(false);
                  setShowPasswordChange(false);
                  setFormData({
                    nome: user.nome,
                    email: user.email,
                    telefone: user.telefone || '',
                    avatar_url: user.avatar_url || ''
                  });
                  setPasswordData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
                  setErrors({});
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-700">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Perfil atualizado com sucesso!</span>
          </div>
        </div>
      )}

      {/* Perfil Principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Informações Pessoais</h2>
        </div>
        <div className="p-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                  {formData.avatar_url ? (
                    <img 
                      src={formData.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.nome.charAt(0).toUpperCase()
                  )}
                </div>
                {editMode && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="cursor-pointer text-white"
                    >
                      <Camera className="h-6 w-6" />
                    </label>
                  </div>
                )}
              </div>
              {errors.avatar && (
                <p className="text-red-600 text-xs mt-1">{errors.avatar}</p>
              )}
            </div>

            {/* Informações */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.nome ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{user.nome}</p>
                  )}
                  {errors.nome && (
                    <p className="text-red-600 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.nome}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    O email não pode ser alterado
                  </p>
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  {editMode ? (
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          telefone: formatTelefone(e.target.value) 
                        })}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.telefone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{user.telefone || 'Não informado'}</p>
                    </div>
                  )}
                  {errors.telefone && (
                    <p className="text-red-600 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.telefone}
                    </p>
                  )}
                </div>

                {/* Tipo de Usuário */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Usuário
                  </label>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className={`px-3 py-1 text-sm rounded-full ${getTipoUsuarioColor(user.tipo_usuario)}`}>
                      {getTipoUsuarioLabel(user.tipo_usuario)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data de Criação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Membro desde
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">
                    {new Date(user.criado_em).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alterar Senha */}
      {editMode && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Segurança</h2>
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Lock className="h-4 w-4" />
                <span>{showPasswordChange ? 'Cancelar' : 'Alterar Senha'}</span>
              </button>
            </div>
          </div>
          
          {showPasswordChange && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Senha Atual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha Atual *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPasswords.atual ? 'text' : 'password'}
                      value={passwordData.senhaAtual}
                      onChange={(e) => setPasswordData({ ...passwordData, senhaAtual: e.target.value })}
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.senhaAtual ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, atual: !showPasswords.atual })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.atual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.senhaAtual && (
                    <p className="text-red-600 text-xs mt-1">{errors.senhaAtual}</p>
                  )}
                </div>

                {/* Nova Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPasswords.nova ? 'text' : 'password'}
                      value={passwordData.novaSenha}
                      onChange={(e) => setPasswordData({ ...passwordData, novaSenha: e.target.value })}
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.novaSenha ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, nova: !showPasswords.nova })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.nova ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.novaSenha && (
                    <p className="text-red-600 text-xs mt-1">{errors.novaSenha}</p>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nova Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPasswords.confirmar ? 'text' : 'password'}
                      value={passwordData.confirmarSenha}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmarSenha: e.target.value })}
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.confirmarSenha ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Confirmar senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirmar: !showPasswords.confirmar })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmarSenha && (
                    <p className="text-red-600 text-xs mt-1">{errors.confirmarSenha}</p>
                  )}
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-1">Dicas de Segurança:</h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Use pelo menos 6 caracteres</li>
                  <li>• Combine letras, números e símbolos</li>
                  <li>• Não use informações pessoais</li>
                  <li>• Mantenha sua senha segura</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Informações do Sistema */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Informações do Sistema</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID do Usuário
              </label>
              <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded border">
                {user.id}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status da Conta
              </label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                user.ativo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.ativo ? '✅ Ativa' : '❌ Inativa'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Último Login
              </label>
              <p className="text-gray-900">
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conexão
              </label>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isSupabaseConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-900">
                  {isSupabaseConnected ? 'Supabase (Nuvem)' : 'Local (Navegador)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permissões do Usuário */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Permissões e Acesso</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.tipo_usuario === 'admin' && (
              <>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Gerenciar usuários</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Gerenciar alunos</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Gerenciar turmas</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Gerenciar disciplinas</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Ver relatórios</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Configurações</span>
                </div>
              </>
            )}

            {user.tipo_usuario === 'professor' && (
              <>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Gerenciar turmas atribuídas</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Lançar notas</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Controlar presença</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Criar materiais</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Enviar recados</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Criar provas/tarefas</span>
                </div>
              </>
            )}

            {user.tipo_usuario === 'pai' && (
              <>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Ver notas dos filhos</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Ver agenda escolar</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Receber recados</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Acessar materiais</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Ver presença</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas Pessoais */}
      {user.tipo_usuario === 'professor' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Minhas Estatísticas</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-blue-800">Turmas</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-green-800">Alunos</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-purple-800">Notas Lançadas</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">0</div>
                <div className="text-sm text-yellow-800">Materiais</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {user.tipo_usuario === 'pai' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">👨‍👩‍👧‍👦 Meus Filhos</h2>
          </div>
          <div className="p-6">
            <FilhosSection />
          </div>
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {errors.submit}
          </p>
        </div>
      )}
    </div>
  );
}