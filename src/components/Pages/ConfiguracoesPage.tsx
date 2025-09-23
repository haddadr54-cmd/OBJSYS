import React, { useState, useEffect } from 'react';
import { Settings, School, Palette, Shield, Bell, Database, Calendar, Save, Upload, Download, RotateCcw, Eye, EyeOff, Volume2, VolumeX, Check, AlertCircle, User, Mail, Phone, MapPin, Globe, Clock, Lock, Key, FileText, BarChart3, Zap, Monitor, Smartphone, Tablet, GraduationCap, Grid, Square, Circle, Camera, Paintbrush, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLogoConfig } from '../../contexts/LogoContext';

interface SystemConfig {
  // Informações da Escola
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolWebsite: string;
  
  // Configurações de Aparência
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  backgroundImageUrl: string;
  
  // Configurações de Sistema
  enableNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  
  // Configurações de Segurança
  passwordMinLength: number;
  sessionTimeout: number;
  enableTwoFactor: boolean;
  
  // Configurações Acadêmicas
  academicYear: string;
  gradeScale: 'decimal' | 'letter';
  attendanceRequired: number;
  
  // Configurações de Interface
  theme: 'light' | 'dark' | 'auto';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
}

interface ConfiguracoesPageProps {
  onNavigate?: (page: string) => void;
}

export function ConfiguracoesPage({ onNavigate }: ConfiguracoesPageProps = {}) {
  const { user } = useAuth();
  const { logoConfig, updateLogoConfig } = useLogoConfig();
  const [activeTab, setActiveTab] = useState<'geral' | 'aparencia' | 'sistema' | 'seguranca' | 'academico' | 'interface'>('geral');
  const [config, setConfig] = useState<SystemConfig>({
    // Informações da Escola
    schoolName: 'Colégio Objetivo',
    schoolAddress: 'Rua das Flores, 123 - Centro',
    schoolPhone: '(11) 1234-5678',
    schoolEmail: 'contato@objetivo.edu.br',
    schoolWebsite: 'https://objetivo.edu.br',
    
    // Configurações de Aparência
    primaryColor: '#002776',
    secondaryColor: '#3B82F6',
    accentColor: '#8B5CF6',
    logoUrl: '/logo-objetivo.png',
    backgroundImageUrl: '',
    
    // Configurações de Sistema
    enableNotifications: true,
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    autoBackup: true,
    backupFrequency: 'daily',
    
    // Configurações de Segurança
    passwordMinLength: 6,
    sessionTimeout: 60,
    enableTwoFactor: false,
    
    // Configurações Acadêmicas
    academicYear: '2024',
    gradeScale: 'decimal',
    attendanceRequired: 75,
    
    // Configurações de Interface
    theme: 'light',
    language: 'pt-BR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    const savedConfig = localStorage.getItem('systemConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...config, ...parsedConfig });
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      // Validar configurações
      const newErrors: Record<string, string> = {};
      
      if (!config.schoolName.trim()) {
        newErrors.schoolName = 'Nome da escola é obrigatório';
      }
      
      if (config.passwordMinLength < 4 || config.passwordMinLength > 20) {
        newErrors.passwordMinLength = 'Tamanho mínimo deve estar entre 4 e 20 caracteres';
      }
      
      if (config.sessionTimeout < 15 || config.sessionTimeout > 480) {
        newErrors.sessionTimeout = 'Timeout deve estar entre 15 e 480 minutos';
      }
      
      if (config.attendanceRequired < 50 || config.attendanceRequired > 100) {
        newErrors.attendanceRequired = 'Frequência deve estar entre 50% e 100%';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      // Salvar no localStorage
      localStorage.setItem('systemConfig', JSON.stringify(config));
      
      // Atualizar configurações do logo
      updateLogoConfig({
        logoUrl: config.logoUrl,
        systemName: config.schoolName
      });
      
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
    if (confirm('Tem certeza que deseja restaurar as configurações padrão? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('systemConfig');
      loadConfig();
    }
  };

  const handleImageUpload = (field: 'logoUrl' | 'backgroundImageUrl', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrors({ ...errors, [field]: 'Imagem deve ter no máximo 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setConfig({ ...config, [field]: result });
        setErrors({ ...errors, [field]: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'geral', label: 'Geral', icon: School },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
    { id: 'sistema', label: 'Sistema', icon: Settings },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'academico', label: 'Acadêmico', icon: GraduationCap },
    { id: 'interface', label: 'Interface', icon: Monitor }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={resetConfig}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Restaurar Padrão</span>
          </button>
          <button
            onClick={() => onNavigate?.('permissoes')}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Shield className="h-4 w-4" />
            <span>Gerenciar Permissões</span>
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
            <span className="text-sm font-medium">Configurações salvas com sucesso!</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Aba Geral */}
          {activeTab === 'geral' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informações da Escola</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Escola *
                  </label>
                  <input
                    type="text"
                    value={config.schoolName}
                    onChange={(e) => setConfig({ ...config, schoolName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.schoolName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nome da instituição"
                  />
                  {errors.schoolName && (
                    <p className="text-red-600 text-xs mt-1">{errors.schoolName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ano Letivo
                  </label>
                  <input
                    type="text"
                    value={config.academicYear}
                    onChange={(e) => setConfig({ ...config, academicYear: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={config.schoolAddress}
                    onChange={(e) => setConfig({ ...config, schoolAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Endereço completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={config.schoolPhone}
                    onChange={(e) => setConfig({ ...config, schoolPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={config.schoolEmail}
                    onChange={(e) => setConfig({ ...config, schoolEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contato@escola.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={config.schoolWebsite}
                    onChange={(e) => setConfig({ ...config, schoolWebsite: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://escola.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba Aparência */}
          {activeTab === 'aparencia' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Personalização Visual</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo da Escola */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo da Escola
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {config.logoUrl ? (
                        <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <School className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('logoUrl', e)}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">Escolher Logo</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG/JPG até 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Cores do Sistema */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cores do Sistema
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Cor Primária</p>
                        <p className="text-xs text-gray-500">{config.primaryColor}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={config.secondaryColor}
                        onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Cor Secundária</p>
                        <p className="text-xs text-gray-500">{config.secondaryColor}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={config.accentColor}
                        onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Cor de Destaque</p>
                        <p className="text-xs text-gray-500">{config.accentColor}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba Sistema */}
          {activeTab === 'sistema' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configurações do Sistema</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notificações
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.enableNotifications}
                        onChange={(e) => setConfig({ ...config, enableNotifications: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Habilitar notificações</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.enableEmailNotifications}
                        onChange={(e) => setConfig({ ...config, enableEmailNotifications: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Notificações por e-mail</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.enableSmsNotifications}
                        onChange={(e) => setConfig({ ...config, enableSmsNotifications: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Notificações por SMS</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Automático
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.autoBackup}
                        onChange={(e) => setConfig({ ...config, autoBackup: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Habilitar backup automático</span>
                    </label>
                    
                    {config.autoBackup && (
                      <select
                        value={config.backupFrequency}
                        onChange={(e) => setConfig({ ...config, backupFrequency: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="daily">Diário</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba Segurança */}
          {activeTab === 'seguranca' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configurações de Segurança</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tamanho Mínimo da Senha
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="20"
                    value={config.passwordMinLength}
                    onChange={(e) => setConfig({ ...config, passwordMinLength: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.passwordMinLength ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.passwordMinLength && (
                    <p className="text-red-600 text-xs mt-1">{errors.passwordMinLength}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timeout da Sessão (minutos)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="480"
                    value={config.sessionTimeout}
                    onChange={(e) => setConfig({ ...config, sessionTimeout: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.sessionTimeout ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.sessionTimeout && (
                    <p className="text-red-600 text-xs mt-1">{errors.sessionTimeout}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.enableTwoFactor}
                      onChange={(e) => setConfig({ ...config, enableTwoFactor: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Habilitar autenticação de dois fatores</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Aba Acadêmico */}
          {activeTab === 'academico' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configurações Acadêmicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sistema de Notas
                  </label>
                  <select
                    value={config.gradeScale}
                    onChange={(e) => setConfig({ ...config, gradeScale: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="decimal">Decimal (0-10)</option>
                    <option value="letter">Letras (A-F)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequência Mínima Obrigatória (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={config.attendanceRequired}
                    onChange={(e) => setConfig({ ...config, attendanceRequired: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.attendanceRequired ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.attendanceRequired && (
                    <p className="text-red-600 text-xs mt-1">{errors.attendanceRequired}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Aba Interface */}
          {activeTab === 'interface' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configurações de Interface</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tema
                  </label>
                  <select
                    value={config.theme}
                    onChange={(e) => setConfig({ ...config, theme: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Idioma
                  </label>
                  <select
                    value={config.language}
                    onChange={(e) => setConfig({ ...config, language: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formato de Data
                  </label>
                  <select
                    value={config.dateFormat}
                    onChange={(e) => setConfig({ ...config, dateFormat: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                    <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                    <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formato de Hora
                  </label>
                  <select
                    value={config.timeFormat}
                    onChange={(e) => setConfig({ ...config, timeFormat: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="24h">24 horas</option>
                    <option value="12h">12 horas (AM/PM)</option>
                  </select>
                </div>
              </div>
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
      </div>

      {/* Informações do Sistema */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-800">Banco de Dados</p>
            <p className="text-xs text-blue-600">Supabase</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-800">Segurança</p>
            <p className="text-xs text-green-600">SSL Ativo</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-800">Performance</p>
            <p className="text-xs text-purple-600">Otimizada</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-yellow-800">Uptime</p>
            <p className="text-xs text-yellow-600">99.9%</p>
          </div>
        </div>
      </div>
    </div>
  );
}