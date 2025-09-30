import React from 'react';
import { X, Calendar, BookOpen, Users, Clock, FileText, Video, Link, User, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { getSituacaoAcademica } from '../../lib/gradeConfig';
import type { ProvaTarefa, Recado, Material, Nota } from '../../lib/supabase.types';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ProvaTarefa | Recado | Material | Nota | null;
  type: 'prova_tarefa' | 'recado' | 'material' | 'nota';
  turmaName?: string;
  disciplinaName?: string;
  autorName?: string;
}

export function ItemDetailModal({ 
  isOpen, 
  onClose, 
  item, 
  type, 
  turmaName, 
  disciplinaName, 
  autorName 
}: ItemDetailModalProps) {
  const { user } = useAuth();
  
  // Load help configuration from localStorage
  const [helpConfig, setHelpConfig] = React.useState<any>(null);
  
  React.useEffect(() => {
    const savedConfig = localStorage.getItem('helpConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setHelpConfig(config);
      } catch (error) {
        console.error('Erro ao carregar configurações de ajuda:', error);
      }
    } else {
      // Default configuration
      setHelpConfig({
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
            telefone: '(11) 1234-5678'
          },
          coordenacao: {
            nome: 'Coordenação',
            email: 'coord@escola.com'
          },
          horario: {
            funcionamento: '7h às 17h'
          }
        },
        customSections: []
      });
    }
  }, []);
  
  if (!isOpen || !item) return null;

  const getIcon = () => {
    switch (type) {
      case 'prova_tarefa':
        return <Calendar className="h-6 w-6 text-blue-600" />;
      case 'recado':
        return <MessageSquare className="h-6 w-6 text-purple-600" />;
      case 'material':
        const material = item as Material;
        switch (material.tipo) {
          case 'pdf':
            return <FileText className="h-6 w-6 text-red-600" />;
          case 'video':
            return <Video className="h-6 w-6 text-purple-600" />;
          case 'link':
            return <Link className="h-6 w-6 text-blue-600" />;
          default:
            return <FileText className="h-6 w-6 text-gray-600" />;
        }
      case 'nota':
        return <BookOpen className="h-6 w-6 text-green-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-600" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'prova_tarefa':
        const prova = item as ProvaTarefa;
        return `${prova.tipo === 'prova' ? 'Prova' : 'Tarefa'}: ${prova.titulo}`;
      case 'recado':
        return `Recado: ${(item as Recado).titulo}`;
      case 'material':
        const material = item as Material;
        return `Material: ${material.titulo}`;
      case 'nota':
        const nota = item as Nota;
        return `Nota: ${nota.disciplina?.nome || 'Disciplina'} - ${nota.aluno?.nome || autorName}`;
      default:
        return '';
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'prova_tarefa':
        const prova = item as ProvaTarefa;
        return prova.tipo === 'prova' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200';
      case 'recado':
        return 'bg-purple-50 border-purple-200';
      case 'material':
        const material = item as Material;
        switch (material.tipo) {
          case 'pdf':
            return 'bg-red-50 border-red-200';
          case 'video':
            return 'bg-purple-50 border-purple-200';
          case 'link':
            return 'bg-blue-50 border-blue-200';
          default:
            return 'bg-gray-50 border-gray-200';
        }
      case 'nota':
        const nota = item as Nota;
        const notaValor = nota.nota || 0;
        const situacao = getSituacaoAcademica(notaValor);
        return `${situacao.bgColor.replace('bg-', 'bg-').replace('-500', '-50')} ${situacao.borderColor.replace('border-', 'border-').replace('-500', '-200')}`;
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const isVencido = () => {
    if (type === 'prova_tarefa') {
      const prova = item as ProvaTarefa;
      const hoje = new Date().toISOString().split('T')[0];
      return prova.data < hoje;
    }
    return false;
  };

  const isHoje = () => {
    if (type === 'prova_tarefa') {
      const prova = item as ProvaTarefa;
      const hoje = new Date().toISOString().split('T')[0];
      return prova.data === hoje;
    }
    return false;
  };

  const getDiasRestantes = () => {
    if (type === 'prova_tarefa') {
      const prova = item as ProvaTarefa;
      const hoje = new Date();
      const dataProva = new Date(prova.data);
      const diffTime = dataProva.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const renderProvaTarefaContent = () => {
    const prova = item as ProvaTarefa;
    const diasRestantes = getDiasRestantes();
    
    return (
      <>
        {/* Status da Prova/Tarefa */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
            {isVencido() ? (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Vencida</span>
              </div>
            ) : isHoje() ? (
              <div className="flex items-center space-x-2 text-yellow-600">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Hoje</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  {diasRestantes === 1 ? 'Amanhã' : `${diasRestantes} dias restantes`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Informações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  prova.tipo === 'prova' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {prova.tipo === 'prova' ? 'Prova' : 'Tarefa'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data</label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">
                  {new Date(prova.data).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Disciplina</label>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">{disciplinaName}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Turma</label>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">{turmaName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição */}
        {prova.descricao && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Descrição/Instruções</label>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{prova.descricao}</p>
            </div>
          </div>
        )}

        {/* Dicas de Preparação */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            {prova.tipo === 'prova' ? '📚 Dicas para a Prova:' : '📝 Dicas para a Tarefa:'}
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {prova.tipo === 'prova' ? (
              <>
                <li>• Revise todo o conteúdo estudado</li>
                <li>• Organize seus materiais de estudo</li>
                <li>• Descanse bem na véspera</li>
                <li>• Chegue com antecedência</li>
                <li>• Leia todas as questões com atenção</li>
              </>
            ) : (
              <>
                <li>• Leia as instruções com atenção</li>
                <li>• Organize seu tempo para fazer a tarefa</li>
                <li>• Pesquise fontes confiáveis se necessário</li>
                <li>• Revise antes de entregar</li>
                <li>• Entregue dentro do prazo</li>
              </>
            )}
          </ul>
        </div>
      </>
    );
  };

  const renderRecadoContent = () => {
    const recado = item as Recado;
    
    return (
      <>
        {/* Header do Recado - Melhorado */}
        <div className="mb-8">
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
            <div className="flex items-center justify-center space-x-4">
              <div className="p-4 bg-purple-100 rounded-full">
                <MessageSquare className="h-10 w-10 text-purple-600" />
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-bold text-purple-800">📢 Recado Importante</h4>
                <p className="text-purple-600">Comunicação da escola para você</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Recado - Melhoradas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h5 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Informações do Remetente</h5>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Enviado por</label>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {autorName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{autorName}</p>
                  <p className="text-sm text-gray-500">Professor/Administrador</p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data de Envio</label>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(recado.data_envio).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    às {new Date(recado.data_envio).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Destinatário</h5>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Enviado para</label>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  recado.destinatario_tipo === 'geral' ? 'bg-blue-100' :
                  recado.destinatario_tipo === 'turma' ? 'bg-green-100' :
                  'bg-purple-100'
                }`}>
                  {recado.destinatario_tipo === 'geral' ? (
                    <Users className="h-5 w-5 text-blue-600" />
                  ) : recado.destinatario_tipo === 'turma' ? (
                    <Users className="h-5 w-5 text-green-600" />
                  ) : (
                    <User className="h-5 w-5 text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {recado.destinatario_tipo === 'geral' ? '🌍 Todos os pais' :
                     recado.destinatario_tipo === 'turma' ? `👥 Turma: ${turmaName}` :
                     '👤 Aluno específico'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {recado.destinatario_tipo === 'geral' ? 'Comunicação geral' :
                     recado.destinatario_tipo === 'turma' ? 'Comunicação da turma' :
                     'Comunicação individual'}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Prioridade</label>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <span className="px-4 py-2 bg-yellow-100 text-yellow-800 text-lg font-bold rounded-xl">
                  📌 Normal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo do Recado - Melhorado */}
        <div className="mb-8">
          <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
            Mensagem Completa
          </h5>
          <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg font-medium">
                {recado.conteudo}
              </p>
            </div>
          </div>
        </div>

        {user?.tipo_usuario === 'pai' && (
          <>
            {/* Ações Recomendadas */}
            {helpConfig?.showHelpSections && helpConfig.helpSteps && (
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                  ✅ O que fazer agora?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {helpConfig.helpSteps.map((step: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-green-700 font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informações de Contato */}
            {helpConfig?.showHelpSections && helpConfig.contactInfo && (
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
                      {helpConfig.contactInfo.secretaria?.nome || 'Secretaria'}
                    </p>
                    <p className="text-xs text-blue-600">
                      {helpConfig.contactInfo.secretaria?.telefone || '(11) 1234-5678'}
                    </p>
                    {helpConfig.contactInfo.secretaria?.email && (
                      <p className="text-xs text-blue-600 mt-1">
                        {helpConfig.contactInfo.secretaria.email}
                      </p>
                    )}
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-2">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-green-800">
                      {helpConfig.contactInfo.coordenacao?.nome || 'Coordenação'}
                    </p>
                    <p className="text-xs text-green-600">
                      {helpConfig.contactInfo.coordenacao?.email || 'coord@escola.com'}
                    </p>
                    {helpConfig.contactInfo.coordenacao?.telefone && (
                      <p className="text-xs text-green-600 mt-1">
                        {helpConfig.contactInfo.coordenacao.telefone}
                      </p>
                    )}
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-2">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-purple-800">Horário</p>
                    <p className="text-xs text-purple-600">
                      {helpConfig.contactInfo.horario?.funcionamento || '7h às 17h'}
                    </p>
                    {helpConfig.contactInfo.horario?.atendimento && (
                      <p className="text-xs text-purple-600 mt-1">
                        Atendimento: {helpConfig.contactInfo.horario.atendimento}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Seções Personalizadas */}
            {helpConfig?.showHelpSections && helpConfig.customSections && helpConfig.customSections.length > 0 && (
              <>
                {helpConfig.customSections.map((section: any) => {
                  const colorClasses = {
                    blue: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200',
                    green: 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200',
                    purple: 'bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200',
                    yellow: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200',
                    red: 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200',
                    gray: 'bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200'
                  };
                  
                  const textColors = {
                    blue: 'text-blue-800',
                    green: 'text-green-800',
                    purple: 'text-purple-800',
                    yellow: 'text-yellow-800',
                    red: 'text-red-800',
                    gray: 'text-gray-800'
                  };
                  
                  return (
                    <div key={section.id} className={`p-6 rounded-xl ${colorClasses[section.color as keyof typeof colorClasses] || colorClasses.gray}`}>
                      <h4 className={`text-lg font-bold mb-4 flex items-center ${textColors[section.color as keyof typeof textColors] || textColors.gray}`}>
                        <span className="text-xl mr-2">{section.icon}</span>
                        {section.title}
                      </h4>
                      <p className={`text-sm opacity-90 ${textColors[section.color as keyof typeof textColors] || textColors.gray}`}>
                        {section.content}
                      </p>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </>
    );
  };

  const renderMaterialContent = () => {
    const material = item as Material;
    
    return (
      <>
        {/* Informações do Material */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Material</label>
              <div className="flex items-center space-x-2">
                {material.tipo === 'pdf' && <FileText className="h-4 w-4 text-red-600" />}
                {material.tipo === 'video' && <Video className="h-4 w-4 text-purple-600" />}
                {material.tipo === 'link' && <Link className="h-4 w-4 text-blue-600" />}
                <span className={`px-3 py-1 text-sm rounded-full ${
                  material.tipo === 'pdf' ? 'bg-red-100 text-red-800' :
                  material.tipo === 'video' ? 'bg-purple-100 text-purple-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {material.tipo === 'pdf' ? 'PDF' :
                   material.tipo === 'video' ? 'Vídeo' : 'Link'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Disciplina</label>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">{disciplinaName}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Turma</label>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">{turmaName}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Adicionado em</label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">
                  {new Date(material.criado_em).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição */}
        {material.descricao && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Descrição</label>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{material.descricao}</p>
            </div>
          </div>
        )}

        {/* Botão de Acesso */}
        {material.arquivo_url && (
          <div className="mb-6">
            <button
              onClick={() => window.open(material.arquivo_url, '_blank')}
              className={`w-full flex items-center justify-center space-x-3 p-4 rounded-lg text-white font-medium transition-colors ${
                material.tipo === 'pdf' ? 'bg-red-600 hover:bg-red-700' :
                material.tipo === 'video' ? 'bg-purple-600 hover:bg-purple-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {material.tipo === 'pdf' && <FileText className="h-5 w-5" />}
              {material.tipo === 'video' && <Video className="h-5 w-5" />}
              {material.tipo === 'link' && <Link className="h-5 w-5" />}
              <span>
                {material.tipo === 'pdf' ? 'Abrir PDF' :
                 material.tipo === 'video' ? 'Assistir Vídeo' :
                 'Acessar Link'}
              </span>
            </button>
          </div>
        )}

        {/* Dicas de Uso */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">
            {material.tipo === 'pdf' ? '📄 Como usar este PDF:' :
             material.tipo === 'video' ? '🎥 Como assistir este vídeo:' :
             '🔗 Como usar este link:'}
          </h4>
          <ul className="text-sm text-green-700 space-y-1">
            {material.tipo === 'pdf' ? (
              <>
                <li>• Baixe o arquivo para seu dispositivo</li>
                <li>• Use um leitor de PDF para visualizar</li>
                <li>• Faça anotações importantes</li>
                <li>• Imprima se necessário para estudar</li>
              </>
            ) : material.tipo === 'video' ? (
              <>
                <li>• Assista em um ambiente tranquilo</li>
                <li>• Faça pausas para anotar pontos importantes</li>
                <li>• Assista quantas vezes precisar</li>
                <li>• Ative legendas se disponível</li>
              </>
            ) : (
              <>
                <li>• Explore o conteúdo do site educativo</li>
                <li>• Faça anotações dos pontos principais</li>
                <li>• Teste atividades interativas se houver</li>
                <li>• Compartilhe dúvidas com o professor</li>
              </>
            )}
          </ul>
        </div>
      </>
    );
  };

  const renderNotaContent = () => {
    const nota = item as Nota;
    const notaValor = nota.nota || 0;
    
    // Determinar status da nota usando configuração centralizada
    const getStatusNota = () => {
      const situacao = getSituacaoAcademica(notaValor);
      return {
        status: situacao.status,
        color: situacao.status === 'Aprovado' ? 'green' : situacao.status === 'Recuperação' ? 'yellow' : 'red',
        icon: situacao.icon
      };
    };

    const statusInfo = getStatusNota();

    return (
      <>
        {/* Status da Nota */}
        <div className="mb-6">
          <div className={`flex items-center justify-center space-x-4 p-4 rounded-lg ${
            statusInfo.color === 'green' ? 'bg-green-50 border border-green-200' :
            statusInfo.color === 'yellow' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <div className={`flex items-center space-x-2 ${
              statusInfo.color === 'green' ? 'text-green-600' :
              statusInfo.color === 'yellow' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              <span className="text-2xl">{statusInfo.icon}</span>
              <span className="font-bold text-lg">{statusInfo.status}</span>
            </div>
          </div>
        </div>

        {/* Informações da Nota */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Aluno</label>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">{nota.aluno?.nome || autorName}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Disciplina</label>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">{disciplinaName}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Trimestre</label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">{nota.trimestre}º Trimestre</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data de Lançamento</label>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">
                  {new Date(nota.criado_em).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nota Destacada */}
        <div className="mb-6">
          <div className={`text-center p-6 rounded-xl ${
            statusInfo.color === 'green' ? 'bg-green-100 border-2 border-green-300' :
            statusInfo.color === 'yellow' ? 'bg-yellow-100 border-2 border-yellow-300' :
            'bg-red-100 border-2 border-red-300'
          }`}>
            <h4 className={`text-sm font-medium mb-2 ${
              statusInfo.color === 'green' ? 'text-green-700' :
              statusInfo.color === 'yellow' ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              Nota Final
            </h4>
            <div className={`text-6xl font-bold ${
              statusInfo.color === 'green' ? 'text-green-600' :
              statusInfo.color === 'yellow' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {notaValor.toFixed(1)}
            </div>
            <p className={`text-sm mt-2 ${
              statusInfo.color === 'green' ? 'text-green-600' :
              statusInfo.color === 'yellow' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              de 10,0 pontos
            </p>
          </div>
        </div>

        {/* Comentário do Professor */}
        {nota.comentario && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Comentário do Professor</label>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 italic">"{nota.comentario}"</p>
            </div>
          </div>
        )}

        {/* Análise e Dicas */}
        <div className={`p-4 rounded-lg border ${
          statusInfo.color === 'green' ? 'bg-green-50 border-green-200' :
          statusInfo.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        }`}>
          <h4 className={`font-medium mb-2 ${
            statusInfo.color === 'green' ? 'text-green-800' :
            statusInfo.color === 'yellow' ? 'text-yellow-800' :
            'text-red-800'
          }`}>
            {statusInfo.color === 'green' ? '🎉 Parabéns pelo desempenho!' :
             statusInfo.color === 'yellow' ? '📚 Dicas para melhorar:' :
             '🚨 Atenção - Ações necessárias:'}
          </h4>
          <ul className={`text-sm space-y-1 ${
            statusInfo.color === 'green' ? 'text-green-700' :
            statusInfo.color === 'yellow' ? 'text-yellow-700' :
            'text-red-700'
          }`}>
            {statusInfo.color === 'green' ? (
              <>
                <li>• Continue com o excelente trabalho!</li>
                <li>• Mantenha a rotina de estudos</li>
                <li>• Ajude colegas com dificuldades</li>
                <li>• Explore conteúdos complementares</li>
              </>
            ) : statusInfo.color === 'yellow' ? (
              <>
                <li>• Revise os conteúdos com mais atenção</li>
                <li>• Participe mais das aulas</li>
                <li>• Tire dúvidas com o professor</li>
                <li>• Organize melhor o tempo de estudos</li>
              </>
            ) : (
              <>
                <li>• Procure ajuda do professor imediatamente</li>
                <li>• Participe das aulas de recuperação</li>
                <li>• Dedique mais tempo aos estudos</li>
                <li>• Considere aulas de reforço</li>
              </>
            )}
          </ul>
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-4 sm:p-6 border-b ${getHeaderColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-white rounded-full shadow-sm">
                {getIcon()}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-2">{getTitle()}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {type === 'prova_tarefa' && `Data: ${new Date((item as ProvaTarefa).data).toLocaleDateString('pt-BR')}`}
                  {type === 'recado' && `Enviado em: ${new Date((item as Recado).data_envio).toLocaleDateString('pt-BR')}`}
                  {type === 'material' && `Adicionado em: ${new Date((item as Material).criado_em).toLocaleDateString('pt-BR')}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {type === 'prova_tarefa' && renderProvaTarefaContent()}
          {type === 'recado' && renderRecadoContent()}
          {type === 'material' && renderMaterialContent()}
          {type === 'nota' && renderNotaContent()}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}