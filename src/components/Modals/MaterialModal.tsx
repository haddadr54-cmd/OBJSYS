import React, { useState, useEffect } from 'react';
import { X, FileText, Video, Link, Image, Upload, Save, AlertCircle, Check, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDataService } from '../../lib/dataService';
import type { Turma, Disciplina, Material } from '../../lib/supabase';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material?: Material | null;
  onSave: () => void;
}

export function MaterialModal({ isOpen, onClose, material, onSave }: MaterialModalProps) {
  const { user } = useAuth();
  const { isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [formData, setFormData] = useState({
    disciplina_id: '',
    titulo: '',
    tipo: 'pdf' as 'pdf' | 'video' | 'link',
    arquivo_url: '',
    descricao: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isOpen && user) {
      fetchData();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (material) {
      setFormData({
        disciplina_id: material.disciplina_id,
        titulo: material.titulo,
        tipo: material.tipo,
        arquivo_url: material.arquivo_url || '',
        descricao: material.descricao || ''
      });
    } else {
      setFormData({
        disciplina_id: '',
        titulo: '',
        tipo: 'pdf',
        arquivo_url: '',
        descricao: ''
      });
    }
    setErrors({});
    setSuccess(false);
    setUploadProgress(0);
  }, [material, isOpen]);

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

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo de material é obrigatório';
    }

    if (formData.tipo === 'link' && !formData.arquivo_url.trim()) {
      newErrors.arquivo_url = 'URL é obrigatória para links';
    } else if (formData.tipo === 'link' && formData.arquivo_url.trim()) {
      try {
        new URL(formData.arquivo_url);
      } catch {
        newErrors.arquivo_url = 'URL inválida';
      }
    }

    if (formData.tipo === 'video' && formData.arquivo_url.trim()) {
      const isYouTube = formData.arquivo_url.includes('youtube.com') || formData.arquivo_url.includes('youtu.be');
      const isVimeo = formData.arquivo_url.includes('vimeo.com');
      if (!isYouTube && !isVimeo) {
        newErrors.arquivo_url = 'URL deve ser do YouTube ou Vimeo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamanho do arquivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, arquivo_url: 'Arquivo deve ter no máximo 10MB' });
        return;
      }

      // Validar tipo de arquivo
      const allowedTypes = {
        pdf: ['application/pdf'],
        imagem: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      };

      if (formData.tipo === 'pdf' && !allowedTypes.pdf.includes(file.type)) {
        setErrors({ ...errors, arquivo_url: 'Apenas arquivos PDF são permitidos' });
        return;
      }

      if (formData.tipo === 'imagem' && !allowedTypes.imagem.includes(file.type)) {
        setErrors({ ...errors, arquivo_url: 'Apenas imagens JPG, PNG, GIF ou WebP são permitidas' });
        return;
      }

      // Simular upload com progress
      setUploadProgress(0);
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      };

      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData({ ...formData, arquivo_url: result });
        setErrors({ ...errors, arquivo_url: '' });
        setUploadProgress(100);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (material) {
        // Editar material existente
        await dataService.updateMaterial(material.id, formData);
        console.log('✅ Material atualizado');
      } else {
        // Criar novo material
        await dataService.createMaterial(formData);
        console.log('✅ Material criado');
      }

      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      setErrors({ submit: 'Erro ao salvar material' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      disciplina_id: '',
      titulo: '',
      tipo: 'pdf',
      arquivo_url: '',
      descricao: ''
    });
    setErrors({});
    setSuccess(false);
    setUploadProgress(0);
  };

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'link':
        return <Link className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
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
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {material ? 'Editar Material' : 'Novo Material Didático'}
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
                {material ? 'Material atualizado com sucesso!' : 'Material criado com sucesso!'}
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de Material */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Material *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'pdf', label: 'PDF', icon: FileText, color: 'red' },
                { value: 'video', label: 'Vídeo', icon: Video, color: 'purple' },
                { value: 'link', label: 'Link', icon: Link, color: 'blue' }
              ].map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo: value as any, arquivo_url: '' })}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    formData.tipo === value
                      ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`p-2 bg-${color}-100 rounded-full w-fit mx-auto mb-2`}>
                    <Icon className={`h-5 w-5 text-${color}-600`} />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
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
              Título do Material *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.titulo ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={`Ex: ${
                formData.tipo === 'pdf' ? 'Apostila de Matemática - Frações' :
                formData.tipo === 'video' ? 'Vídeo Aula - Sistema Solar' :
                formData.tipo === 'link' ? 'Site Educativo - Português' :
                'Diagrama - Ciclo da Água'
              }`}
            />
            {errors.titulo && (
              <p className="text-red-600 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.titulo}
              </p>
            )}
          </div>

          {/* Upload/URL do Arquivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.tipo === 'link' ? 'URL do Link *' :
               formData.tipo === 'video' ? 'URL do Vídeo' :
               'Arquivo'}
            </label>
            
            {formData.tipo === 'link' || formData.tipo === 'video' ? (
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  value={formData.arquivo_url}
                  onChange={(e) => setFormData({ ...formData, arquivo_url: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.arquivo_url ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={
                    formData.tipo === 'link' ? 'https://exemplo.com' :
                    'https://youtube.com/watch?v=... ou https://vimeo.com/...'
                  }
                />
              </div>
            ) : (
              <div className="space-y-3">
                {formData.arquivo_url && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getIconForType(formData.tipo)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Arquivo selecionado</p>
                        <p className="text-xs text-gray-500">
                          {formData.tipo === 'pdf' ? 'Documento PDF' : 'Imagem'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, arquivo_url: '' })}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}% carregado</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="arquivo-upload"
                  />
                  <label
                    htmlFor="arquivo-upload"
                    className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <Upload className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Clique para selecionar PDF
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Arquivos PDF até 10MB
                  </p>
                </div>
              </div>
            )}
            
            {errors.arquivo_url && (
              <p className="text-red-600 text-xs mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.arquivo_url}
              </p>
            )}
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
              placeholder={`Descreva o material, como usar, objetivos de aprendizagem...`}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.descricao.length}/500 caracteres
            </p>
          </div>

          {/* Dicas por Tipo */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              {formData.tipo === 'pdf' ? '📄 Dicas para PDFs:' :
               formData.tipo === 'video' ? '🎥 Dicas para Vídeos:' :
               '🔗 Dicas para Links:'}
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {formData.tipo === 'pdf' && (
                <>
                  <li>• Use PDFs com texto pesquisável</li>
                  <li>• Organize o conteúdo em capítulos</li>
                  <li>• Inclua exercícios e exemplos</li>
                  <li>• Mantenha boa qualidade de imagem</li>
                </>
              )}
              {formData.tipo === 'video' && (
                <>
                  <li>• Use YouTube ou Vimeo para melhor compatibilidade</li>
                  <li>• Vídeos de 5-15 minutos são ideais</li>
                  <li>• Inclua legendas quando possível</li>
                  <li>• Teste o áudio e qualidade da imagem</li>
                </>
              )}
              {formData.tipo === 'link' && (
                <>
                  <li>• Verifique se o site é educativo e seguro</li>
                  <li>• Teste o link antes de compartilhar</li>
                  <li>• Prefira sites com conteúdo interativo</li>
                  <li>• Evite sites com muita publicidade</li>
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
              <span>{loading ? 'Salvando...' : material ? 'Salvar Alterações' : 'Criar Material'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}