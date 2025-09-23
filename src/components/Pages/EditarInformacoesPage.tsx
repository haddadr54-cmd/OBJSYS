import React, { useState, useEffect } from 'react';
import { School, Save, MapPin, Phone, Mail, Globe, Clock, Calendar, User, Building, Hash, FileText, Camera, Upload, Check, AlertCircle, RotateCcw } from 'lucide-react';

interface EscolaInfo {
  // Informações Básicas
  nome: string;
  razaoSocial: string;
  cnpj: string;
  codigoMec: string;
  tipoEnsino: string[];
  
  // Endereço
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  
  // Contatos
  telefone: string;
  celular: string;
  whatsapp: string;
  email: string;
  emailSecretaria: string;
  website: string;
  
  // Horários
  horarioFuncionamento: string;
  horarioSecretaria: string;
  horarioAtendimento: string;
  
  // Direção
  diretor: string;
  coordenador: string;
  secretario: string;
  
  // Informações Acadêmicas
  anoLetivo: string;
  inicioAnoLetivo: string;
  fimAnoLetivo: string;
  totalTrimestres: number;
  
  // Redes Sociais
  facebook: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  
  // Documentos
  logoUrl: string;
  brasaoUrl: string;
  certificados: string[];
  
  // Configurações
  mensagemBoasVindas: string;
  missao: string;
  visao: string;
  valores: string[];
}

export function EditarInformacoesPage() {
  const [info, setInfo] = useState<EscolaInfo>({
    // Informações Básicas
    nome: 'Colégio Objetivo',
    razaoSocial: 'Colégio Objetivo Ltda',
    cnpj: '12.345.678/0001-90',
    codigoMec: '12345678',
    tipoEnsino: ['Ensino Fundamental', 'Ensino Médio'],
    
    // Endereço
    endereco: 'Rua das Flores',
    numero: '123',
    complemento: 'Sala 101',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    
    // Contatos
    telefone: '(11) 1234-5678',
    celular: '(11) 99999-9999',
    whatsapp: '(11) 99999-9999',
    email: 'contato@objetivo.edu.br',
    emailSecretaria: 'secretaria@objetivo.edu.br',
    website: 'https://objetivo.edu.br',
    
    // Horários
    horarioFuncionamento: '07:00 às 18:00',
    horarioSecretaria: '08:00 às 17:00',
    horarioAtendimento: '08:00 às 12:00 e 14:00 às 17:00',
    
    // Direção
    diretor: 'Dr. João Silva',
    coordenador: 'Profa. Maria Santos',
    secretario: 'Carlos Oliveira',
    
    // Informações Acadêmicas
    anoLetivo: '2024',
    inicioAnoLetivo: '2024-02-05',
    fimAnoLetivo: '2024-12-15',
    totalTrimestres: 4,
    
    // Redes Sociais
    facebook: 'https://facebook.com/colegioobjetivo',
    instagram: 'https://instagram.com/colegioobjetivo',
    youtube: 'https://youtube.com/colegioobjetivo',
    linkedin: 'https://linkedin.com/company/colegioobjetivo',
    
    // Documentos
    logoUrl: '/logo-objetivo.png',
    brasaoUrl: '',
    certificados: [],
    
    // Configurações
    mensagemBoasVindas: 'Bem-vindos ao Colégio Objetivo! Educação de excelência para o futuro dos seus filhos.',
    missao: 'Formar cidadãos críticos e conscientes, preparados para os desafios do futuro.',
    visao: 'Ser referência em educação de qualidade, inovação e formação integral.',
    valores: ['Excelência', 'Inovação', 'Ética', 'Responsabilidade Social', 'Respeito']
  });
  
  const [activeTab, setActiveTab] = useState<'basicas' | 'endereco' | 'contatos' | 'academico' | 'equipe' | 'social' | 'documentos' | 'institucional'>('basicas');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = () => {
    const savedInfo = localStorage.getItem('escolaInfo');
    if (savedInfo) {
      try {
        const parsedInfo = JSON.parse(savedInfo);
        setInfo({ ...info, ...parsedInfo });
      } catch (error) {
        console.error('Erro ao carregar informações:', error);
      }
    }
  };

  const saveInfo = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      // Validar informações obrigatórias
      const newErrors: Record<string, string> = {};
      
      if (!info.nome.trim()) {
        newErrors.nome = 'Nome da escola é obrigatório';
      }
      
      if (!info.email.trim()) {
        newErrors.email = 'E-mail é obrigatório';
      }
      
      if (!info.telefone.trim()) {
        newErrors.telefone = 'Telefone é obrigatório';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      // Salvar no localStorage
      localStorage.setItem('escolaInfo', JSON.stringify(info));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar informações:', error);
      setErrors({ submit: 'Erro ao salvar informações' });
    } finally {
      setLoading(false);
    }
  };

  const resetInfo = () => {
    if (confirm('Tem certeza que deseja restaurar as informações padrão? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('escolaInfo');
      loadInfo();
    }
  };

  const handleImageUpload = (field: 'logoUrl' | 'brasaoUrl', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrors({ ...errors, [field]: 'Imagem deve ter no máximo 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setInfo({ ...info, [field]: result });
        setErrors({ ...errors, [field]: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const addValor = () => {
    const novoValor = prompt('Digite um novo valor:');
    if (novoValor && !info.valores.includes(novoValor)) {
      setInfo({ ...info, valores: [...info.valores, novoValor] });
    }
  };

  const removeValor = (index: number) => {
    setInfo({ ...info, valores: info.valores.filter((_, i) => i !== index) });
  };

  const addTipoEnsino = () => {
    const novoTipo = prompt('Digite um novo tipo de ensino:');
    if (novoTipo && !info.tipoEnsino.includes(novoTipo)) {
      setInfo({ ...info, tipoEnsino: [...info.tipoEnsino, novoTipo] });
    }
  };

  const removeTipoEnsino = (index: number) => {
    setInfo({ ...info, tipoEnsino: info.tipoEnsino.filter((_, i) => i !== index) });
  };

  const tabs = [
    { id: 'basicas', label: 'Básicas', icon: School },
    { id: 'endereco', label: 'Endereço', icon: MapPin },
    { id: 'contatos', label: 'Contatos', icon: Phone },
    { id: 'academico', label: 'Acadêmico', icon: Calendar },
    { id: 'equipe', label: 'Equipe', icon: User },
    { id: 'social', label: 'Redes Sociais', icon: Globe },
    { id: 'documentos', label: 'Documentos', icon: FileText },
    { id: 'institucional', label: 'Institucional', icon: Building }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <School className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🏫 Editar Informações da Escola
            </h1>
            <p className="text-gray-600 text-lg font-medium">Configure todos os dados institucionais</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={resetInfo}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Restaurar</span>
          </button>
          <button
            onClick={saveInfo}
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
            <span className="text-sm font-medium">Informações salvas com sucesso!</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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
          {/* Aba Informações Básicas */}
          {activeTab === 'basicas' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informações Básicas da Escola</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Escola *
                  </label>
                  <input
                    type="text"
                    value={info.nome}
                    onChange={(e) => setInfo({ ...info, nome: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.nome ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nome completo da instituição"
                  />
                  {errors.nome && (
                    <p className="text-red-600 text-xs mt-1">{errors.nome}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razão Social
                  </label>
                  <input
                    type="text"
                    value={info.razaoSocial}
                    onChange={(e) => setInfo({ ...info, razaoSocial: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Razão social da empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={info.cnpj}
                    onChange={(e) => setInfo({ ...info, cnpj: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código MEC
                  </label>
                  <input
                    type="text"
                    value={info.codigoMec}
                    onChange={(e) => setInfo({ ...info, codigoMec: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Código do MEC"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipos de Ensino Oferecidos
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {info.tipoEnsino.map((tipo, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tipo}
                      <button
                        onClick={() => removeTipoEnsino(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={addTipoEnsino}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Aba Endereço */}
          {activeTab === 'endereco' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Endereço Completo</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logradouro
                  </label>
                  <input
                    type="text"
                    value={info.endereco}
                    onChange={(e) => setInfo({ ...info, endereco: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rua, Avenida, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    value={info.numero}
                    onChange={(e) => setInfo({ ...info, numero: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={info.complemento}
                    onChange={(e) => setInfo({ ...info, complemento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sala, Andar, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={info.bairro}
                    onChange={(e) => setInfo({ ...info, bairro: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome do bairro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={info.cidade}
                    onChange={(e) => setInfo({ ...info, cidade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome da cidade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={info.estado}
                    onChange={(e) => setInfo({ ...info, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione o estado</option>
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="PR">Paraná</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="BA">Bahia</option>
                    <option value="GO">Goiás</option>
                    <option value="DF">Distrito Federal</option>
                    {/* Adicionar outros estados conforme necessário */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={info.cep}
                    onChange={(e) => setInfo({ ...info, cep: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba Contatos */}
          {activeTab === 'contatos' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informações de Contato</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone Principal *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={info.telefone}
                      onChange={(e) => setInfo({ ...info, telefone: e.target.value })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.telefone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="(11) 1234-5678"
                    />
                  </div>
                  {errors.telefone && (
                    <p className="text-red-600 text-xs mt-1">{errors.telefone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Celular/WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={info.celular}
                      onChange={(e) => setInfo({ ...info, celular: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail Principal *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={info.email}
                      onChange={(e) => setInfo({ ...info, email: e.target.value })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="contato@escola.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail da Secretaria
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={info.emailSecretaria}
                      onChange={(e) => setInfo({ ...info, emailSecretaria: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="secretaria@escola.com"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      value={info.website}
                      onChange={(e) => setInfo({ ...info, website: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://escola.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Horários de Funcionamento</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Funcionamento Geral
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={info.horarioFuncionamento}
                        onChange={(e) => setInfo({ ...info, horarioFuncionamento: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="07:00 às 18:00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secretaria
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={info.horarioSecretaria}
                        onChange={(e) => setInfo({ ...info, horarioSecretaria: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="08:00 às 17:00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Atendimento aos Pais
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={info.horarioAtendimento}
                        onChange={(e) => setInfo({ ...info, horarioAtendimento: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="08:00 às 12:00 e 14:00 às 17:00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba Acadêmico */}
          {activeTab === 'academico' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informações Acadêmicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ano Letivo Atual
                  </label>
                  <input
                    type="text"
                    value={info.anoLetivo}
                    onChange={(e) => setInfo({ ...info, anoLetivo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total de Trimestres
                  </label>
                  <select
                    value={info.totalTrimestres}
                    onChange={(e) => setInfo({ ...info, totalTrimestres: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={2}>2 Semestres</option>
                    <option value={3}>3 Trimestres</option>
                    <option value={4}>4 Bimestres</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Início do Ano Letivo
                  </label>
                  <input
                    type="date"
                    value={info.inicioAnoLetivo}
                    onChange={(e) => setInfo({ ...info, inicioAnoLetivo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fim do Ano Letivo
                  </label>
                  <input
                    type="date"
                    value={info.fimAnoLetivo}
                    onChange={(e) => setInfo({ ...info, fimAnoLetivo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba Equipe */}
          {activeTab === 'equipe' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Equipe Diretiva</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diretor(a)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={info.diretor}
                      onChange={(e) => setInfo({ ...info, diretor: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome do diretor"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coordenador(a)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={info.coordenador}
                      onChange={(e) => setInfo({ ...info, coordenador: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome do coordenador"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secretário(a)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={info.secretario}
                      onChange={(e) => setInfo({ ...info, secretario: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome do secretário"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba Redes Sociais */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Redes Sociais e Presença Digital</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      value={info.facebook}
                      onChange={(e) => setInfo({ ...info, facebook: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://facebook.com/escola"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      value={info.instagram}
                      onChange={(e) => setInfo({ ...info, instagram: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://instagram.com/escola"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      value={info.youtube}
                      onChange={(e) => setInfo({ ...info, youtube: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://youtube.com/escola"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      value={info.linkedin}
                      onChange={(e) => setInfo({ ...info, linkedin: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/company/escola"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba Documentos */}
          {activeTab === 'documentos' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Documentos e Imagens</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo da Escola */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo da Escola
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {info.logoUrl ? (
                        <img src={info.logoUrl} alt="Logo" className="w-full h-full object-cover" />
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
                  {errors.logoUrl && (
                    <p className="text-red-600 text-xs mt-1">{errors.logoUrl}</p>
                  )}
                </div>

                {/* Brasão */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brasão/Símbolo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {info.brasaoUrl ? (
                        <img src={info.brasaoUrl} alt="Brasão" className="w-full h-full object-cover" />
                      ) : (
                        <Building className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('brasaoUrl', e)}
                        className="hidden"
                        id="brasao-upload"
                      />
                      <label
                        htmlFor="brasao-upload"
                        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">Escolher Brasão</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG/JPG até 5MB</p>
                    </div>
                  </div>
                  {errors.brasaoUrl && (
                    <p className="text-red-600 text-xs mt-1">{errors.brasaoUrl}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Aba Institucional */}
          {activeTab === 'institucional' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informações Institucionais</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem de Boas-vindas
                </label>
                <textarea
                  value={info.mensagemBoasVindas}
                  onChange={(e) => setInfo({ ...info, mensagemBoasVindas: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mensagem que aparece na página inicial..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Missão
                </label>
                <textarea
                  value={info.missao}
                  onChange={(e) => setInfo({ ...info, missao: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Missão da instituição..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visão
                </label>
                <textarea
                  value={info.visao}
                  onChange={(e) => setInfo({ ...info, visao: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Visão de futuro da instituição..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valores Institucionais
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {info.valores.map((valor, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {valor}
                      <button
                        onClick={() => removeValor(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={addValor}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                  >
                    + Adicionar Valor
                  </button>
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

      {/* Preview das Informações */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview das Informações</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Informações Básicas</h4>
            <p className="text-sm text-gray-600">Nome: {info.nome}</p>
            <p className="text-sm text-gray-600">CNPJ: {info.cnpj}</p>
            <p className="text-sm text-gray-600">Ano Letivo: {info.anoLetivo}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Contatos</h4>
            <p className="text-sm text-gray-600">Telefone: {info.telefone}</p>
            <p className="text-sm text-gray-600">E-mail: {info.email}</p>
            <p className="text-sm text-gray-600">Website: {info.website}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Endereço</h4>
            <p className="text-sm text-gray-600">
              {info.endereco}, {info.numero} - {info.bairro}
            </p>
            <p className="text-sm text-gray-600">{info.cidade} - {info.estado}</p>
            <p className="text-sm text-gray-600">CEP: {info.cep}</p>
          </div>
        </div>
      </div>
    </div>
  );
}