import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  AlertCircle, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare,
  User,
  Building,
  Globe,
  MapPin,
  Info,
  Eye,
  X
} from 'lucide-react';

interface HelpConfig {
  showHelpSections: boolean;
  helpSteps: string[];
  contactInfo: {
    secretaria: {
      nome: string;
      telefone: string;
      email?: string;
    };
    coordenacao: {
      nome: string;
      email: string;
      telefone?: string;
    };
    horario: {
      funcionamento: string;
      atendimento?: string;
    };
    endereco?: {
      rua: string;
      cidade: string;
      cep: string;
    };
    website?: string;
    whatsapp?: string;
  };
  customSections: {
    id: string;
    title: string;
    content: string;
    icon: string;
    color: string;
  }[];
}

export function ConfiguracaoAjudaPage() {
  const [config, setConfig] = useState<HelpConfig>({
    showHelpSections: true,
    helpSteps: [
      'Leia o recado com atenção',
      'Anote informações importantes',
      'Entre em contato se tiver dúvidas',
      'Acompanhe as próximas comunicações'
    ],
    contactInfo: {
      secretaria: {
        nome: 'Secretaria',
        telefone: '(11) 1234-5678',
        email: 'secretaria@escola.com'
      },
      coordenacao: {
        nome: 'Coordenação',
        email: 'coord@escola.com',
        telefone: '(11) 1234-5679'
      },
      horario: {
        funcionamento: '7h às 17h',
        atendimento: '8h às 12h e 14h às 16h'
      },
      endereco: {
        rua: 'Rua das Flores, 123',
        cidade: 'São Paulo - SP',
        cep: '01234-567'
      },
      website: 'https://escola.com',
      whatsapp: '(11) 99999-9999'
    },
    customSections: []
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [newStep, setNewStep] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSection, setNewSection] = useState({
    title: '',
    content: '',
    icon: '📋',
    color: 'blue'
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    const savedConfig = localStorage.getItem('helpConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...config, ...parsedConfig });
      } catch (error) {
        console.error('Erro ao carregar configurações de ajuda:', error);
      }
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      // Validar configurações
      const newErrors: Record<string, string> = {};
      
      if (!config.contactInfo.secretaria.nome.trim()) {
        newErrors.secretariaNome = 'Nome da secretaria é obrigatório';
      }
      
      if (!config.contactInfo.secretaria.telefone.trim()) {
        newErrors.secretariaTelefone = 'Telefone da secretaria é obrigatório';
      }
      
      if (!config.contactInfo.coordenacao.nome.trim()) {
        newErrors.coordenacaoNome = 'Nome da coordenação é obrigatório';
      }
      
      if (!config.contactInfo.coordenacao.email.trim()) {
        newErrors.coordenacaoEmail = 'E-mail da coordenação é obrigatório';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      // Salvar no localStorage
      localStorage.setItem('helpConfig', JSON.stringify(config));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setErrors({ submit: 'Erro ao salvar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const resetConfig = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão de ajuda?')) {
      localStorage.removeItem('helpConfig');
      loadConfig();
    }
  };

  const addStep = () => {
    if (newStep.trim()) {
      setConfig({
        ...config,
        helpSteps: [...config.helpSteps, newStep.trim()]
      });
      setNewStep('');
    }
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...config.helpSteps];
    newSteps[index] = value;
    setConfig({ ...config, helpSteps: newSteps });
  };

  const removeStep = (index: number) => {
    setConfig({
      ...config,
      helpSteps: config.helpSteps.filter((_, i) => i !== index)
    });
  };

  const addCustomSection = () => {
    if (newSection.title.trim() && newSection.content.trim()) {
      setConfig({
        ...config,
        customSections: [...config.customSections, {
          id: Date.now().toString(),
          ...newSection
        }]
      });
      setNewSection({ title: '', content: '', icon: '📋', color: 'blue' });
      setShowAddSection(false);
    }
  };

  const removeCustomSection = (id: string) => {
    setConfig({
      ...config,
      customSections: config.customSections.filter(s => s.id !== id)
    });
  };

  const iconOptions = ['📋', '📞', '📧', '🏫', '⏰', '📍', '💡', '❓', '✅', '⚠️', '📝', '🎯'];
  const colorOptions = [
    { value: 'blue', label: 'Azul', class: 'bg-blue-50 border-blue-200 text-blue-800' },
    { value: 'green', label: 'Verde', class: 'bg-green-50 border-green-200 text-green-800' },
    { value: 'purple', label: 'Roxo', class: 'bg-purple-50 border-purple-200 text-purple-800' },
    { value: 'yellow', label: 'Amarelo', class: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
    { value: 'red', label: 'Vermelho', class: 'bg-red-50 border-red-200 text-red-800' },
    { value: 'gray', label: 'Cinza', class: 'bg-gray-50 border-gray-200 text-gray-800' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🆘 Configuração de Ajuda
            </h1>
            <p className="text-gray-600 text-lg font-medium">Configure as seções de ajuda para os pais</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={resetConfig}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Restaurar</span>
          </button>
          <button
            onClick={saveConfig}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-700">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Configurações de ajuda salvas com sucesso!</span>
          </div>
        </div>
      )}

      {/* Configurações Gerais */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Configurações Gerais</h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.showHelpSections}
              onChange={(e) => setConfig({ ...config, showHelpSections: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Exibir seções de ajuda nos detalhes de recados/materiais
            </span>
          </label>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Como funciona:</h4>
            <p className="text-xs text-blue-700">
              Quando habilitado, os pais verão seções de ajuda com orientações e informações de contato 
              ao visualizar recados, materiais e provas/tarefas.
            </p>
          </div>
        </div>
      </div>

      {/* Seção "O que fazer agora?" */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            ✅ "O que fazer agora?"
          </h3>
          <button
            onClick={() => setShowAddSection(false)}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Passo</span>
          </button>
        </div>

        <div className="space-y-3">
          {config.helpSteps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold text-sm">{index + 1}</span>
              </div>
              {editingStep === index ? (
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        setEditingStep(null);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => setEditingStep(null)}
                    className="p-1 text-green-600 hover:text-green-800"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <p className="text-sm text-green-700 font-medium">{step}</p>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingStep(index)}
                      className="p-1 text-green-600 hover:text-green-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeStep(index)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Adicionar novo passo */}
          <div className="flex items-center space-x-3 p-3 border-2 border-dashed border-green-300 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Plus className="h-4 w-4 text-green-600" />
            </div>
            <input
              type="text"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              placeholder="Digite um novo passo..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addStep();
                }
              }}
            />
            <button
              onClick={addStep}
              disabled={!newStep.trim()}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Seção "Precisa de Ajuda?" */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Phone className="h-5 w-5 text-blue-600" />
          </div>
          📞 "Precisa de Ajuda?" - Informações de Contato
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Secretaria */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
              📋 Secretaria
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome/Título
              </label>
              <input
                type="text"
                value={config.contactInfo.secretaria.nome}
                onChange={(e) => setConfig({
                  ...config,
                  contactInfo: {
                    ...config.contactInfo,
                    secretaria: { ...config.contactInfo.secretaria, nome: e.target.value }
                  }
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.secretariaNome ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Secretaria, Atendimento"
              />
              {errors.secretariaNome && (
                <p className="text-red-600 text-xs mt-1">{errors.secretariaNome}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={config.contactInfo.secretaria.telefone}
                onChange={(e) => setConfig({
                  ...config,
                  contactInfo: {
                    ...config.contactInfo,
                    secretaria: { ...config.contactInfo.secretaria, telefone: e.target.value }
                  }
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.secretariaTelefone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="(11) 1234-5678"
              />
              {errors.secretariaTelefone && (
                <p className="text-red-600 text-xs mt-1">{errors.secretariaTelefone}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail (opcional)
              </label>
              <input
                type="email"
                value={config.contactInfo.secretaria.email || ''}
                onChange={(e) => setConfig({
                  ...config,
                  contactInfo: {
                    ...config.contactInfo,
                    secretaria: { ...config.contactInfo.secretaria, email: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="secretaria@escola.com"
              />
            </div>
          </div>

          {/* Coordenação */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
              👨‍💼 Coordenação
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome/Título
              </label>
              <input
                type="text"
                value={config.contactInfo.coordenacao.nome}
                onChange={(e) => setConfig({
                  ...config,
                  contactInfo: {
                    ...config.contactInfo,
                    coordenacao: { ...config.contactInfo.coordenacao, nome: e.target.value }
                  }
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.coordenacaoNome ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Coordenação, Direção"
              />
              {errors.coordenacaoNome && (
                <p className="text-red-600 text-xs mt-1">{errors.coordenacaoNome}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={config.contactInfo.coordenacao.email}
                onChange={(e) => setConfig({
                  ...config,
                  contactInfo: {
                    ...config.contactInfo,
                    coordenacao: { ...config.contactInfo.coordenacao, email: e.target.value }
                  }
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.coordenacaoEmail ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="coord@escola.com"
              />
              {errors.coordenacaoEmail && (
                <p className="text-red-600 text-xs mt-1">{errors.coordenacaoEmail}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone (opcional)
              </label>
              <input
                type="tel"
                value={config.contactInfo.coordenacao.telefone || ''}
                onChange={(e) => setConfig({
                  ...config,
                  contactInfo: {
                    ...config.contactInfo,
                    coordenacao: { ...config.contactInfo.coordenacao, telefone: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(11) 1234-5679"
              />
            </div>
          </div>
        </div>

        {/* Horários */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-purple-600" />
            ⏰ Horários de Funcionamento
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Funcionamento Geral
              </label>
              <input
                type="text"
                value={config.contactInfo.horario.funcionamento}
                onChange={(e) => setConfig({
                  ...config,
                  contactInfo: {
                    ...config.contactInfo,
                    horario: { ...config.contactInfo.horario, funcionamento: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="7h às 17h"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Atendimento aos Pais (opcional)
              </label>
              <input
                type="text"
                value={config.contactInfo.horario.atendimento || ''}
                onChange={(e) => setConfig({
                  ...config,
                  contactInfo: {
                    ...config.contactInfo,
                    horario: { ...config.contactInfo.horario, atendimento: e.target.value }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="8h às 12h e 14h às 16h"
              />
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2 text-indigo-600" />
            📍 Informações Adicionais
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço (opcional)
              </label>
              <input
                type="text"
                value={config.contactInfo.endereco?.rua || ''}
                onChange={(e) => setConfig({
                  ...config,
                  contactInfo: {
                    ...config.contactInfo,
                    endereco: { 
                      ...config.contactInfo.endereco,
                      rua: e.target.value,
                      cidade: config.contactInfo.endereco?.cidade || '',
                      cep: config.contactInfo.endereco?.cep || ''
                    }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Rua das Flores, 123"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website (opcional)
              </label>
              <input
                type="url"
                value={config.contactInfo.website || ''}
                onChange={(e) => setConfig({
                  ...config,
                  contactInfo: { ...config.contactInfo, website: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://escola.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp (opcional)
              </label>
              <input
                type="tel"
                value={config.contactInfo.whatsapp || ''}
                onChange={(e) => setConfig({
                  ...config,
                  contactInfo: { ...config.contactInfo, whatsapp: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Seções Personalizadas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            🎨 Seções Personalizadas
          </h3>
          <button
            onClick={() => setShowAddSection(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Seção</span>
          </button>
        </div>

        {/* Lista de Seções Personalizadas */}
        <div className="space-y-4">
          {config.customSections.map((section) => {
            const colorClass = colorOptions.find(c => c.value === section.color)?.class || 'bg-gray-50 border-gray-200 text-gray-800';
            
            return (
              <div key={section.id} className={`p-4 border rounded-lg ${colorClass}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{section.icon}</span>
                      <h4 className="font-medium">{section.title}</h4>
                    </div>
                    <p className="text-sm opacity-90">{section.content}</p>
                  </div>
                  <button
                    onClick={() => removeCustomSection(section.id)}
                    className="p-1 text-red-600 hover:text-red-800 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          
          {config.customSections.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Nenhuma seção personalizada criada</p>
              <p className="text-xs mt-1">Clique em "Nova Seção" para adicionar</p>
            </div>
          )}
        </div>

        {/* Modal para Adicionar Seção */}
        {showAddSection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Nova Seção de Ajuda</h3>
                <button
                  onClick={() => setShowAddSection(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newSection.title}
                    onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Dúvidas Frequentes"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conteúdo
                  </label>
                  <textarea
                    value={newSection.content}
                    onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Conteúdo da seção de ajuda..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ícone
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewSection({ ...newSection, icon })}
                        className={`p-2 border rounded-lg text-center transition-colors ${
                          newSection.icon === icon 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-lg">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewSection({ ...newSection, color: color.value })}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          newSection.color === color.value 
                            ? `border-${color.value}-500 ${color.class}` 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-sm font-medium">{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAddSection(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addCustomSection}
                  disabled={!newSection.title.trim() || !newSection.content.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Adicionar Seção
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <div className="p-2 bg-green-100 rounded-lg mr-3">
            <Eye className="h-5 w-5 text-green-600" />
          </div>
          👁️ Preview - Como os Pais Verão
        </h3>

        {config.showHelpSections ? (
          <div className="space-y-6">
            {/* Preview "O que fazer agora?" */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
              <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                ✅ O que fazer agora?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.helpSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm text-green-700 font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview "Precisa de Ajuda?" */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
              <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                📞 Precisa de Ajuda?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-2">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-blue-800">
                    {config.contactInfo.secretaria.nome}
                  </p>
                  <p className="text-xs text-blue-600">
                    {config.contactInfo.secretaria.telefone}
                  </p>
                  {config.contactInfo.secretaria.email && (
                    <p className="text-xs text-blue-600 mt-1">
                      {config.contactInfo.secretaria.email}
                    </p>
                  )}
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-2">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-green-800">
                    {config.contactInfo.coordenacao.nome}
                  </p>
                  <p className="text-xs text-green-600">
                    {config.contactInfo.coordenacao.email}
                  </p>
                  {config.contactInfo.coordenacao.telefone && (
                    <p className="text-xs text-green-600 mt-1">
                      {config.contactInfo.coordenacao.telefone}
                    </p>
                  )}
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-2">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-purple-800">Horário</p>
                  <p className="text-xs text-purple-600">
                    {config.contactInfo.horario.funcionamento}
                  </p>
                  {config.contactInfo.horario.atendimento && (
                    <p className="text-xs text-purple-600 mt-1">
                      Atendimento: {config.contactInfo.horario.atendimento}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Seções Personalizadas */}
            {config.customSections.map((section) => {
              const colorClass = colorOptions.find(c => c.value === section.color)?.class || 'bg-gray-50 border-gray-200 text-gray-800';
              
              return (
                <div key={section.id} className={`p-6 border-2 rounded-xl ${colorClass}`}>
                  <h4 className="text-lg font-bold mb-4 flex items-center">
                    <span className="text-xl mr-2">{section.icon}</span>
                    {section.title}
                  </h4>
                  <p className="text-sm opacity-90">{section.content}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Seções de ajuda desabilitadas</p>
            <p className="text-sm mt-1">Habilite acima para mostrar o preview</p>
          </div>
        )}
      </div>

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