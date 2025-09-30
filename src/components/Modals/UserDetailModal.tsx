import { FC } from 'react';
import { X, User, Mail, Phone, Calendar, Shield, UserCheck, UserX, Clock, MessageCircle } from 'lucide-react';
import type { Usuario } from '../../lib/supabase.types';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Usuario | null;
}

export const UserDetailModal: FC<UserDetailModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

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

  const getTipoUsuarioIcon = (tipo: string) => {
    switch (tipo) {
      case 'admin':
        return '👑';
      case 'professor':
        return '🎓';
      case 'pai':
        return '👨‍👩‍👧‍👦';
      default:
        return '👤';
    }
  };

  const getPermissions = (tipo: string) => {
    switch (tipo) {
      case 'admin':
        return [
          'Acesso total ao sistema',
          'Gerenciar usuários e permissões',
          'Configurações do sistema',
          'Relatórios e estatísticas',
          'Backup e manutenção'
        ];
      case 'professor':
        return [
          'Painel do professor',
          'Gerenciar turmas e disciplinas',
          'Lançar notas e presença',
          'Criar materiais didáticos',
          'Enviar recados aos pais'
        ];
      case 'pai':
        return [
          'Visualizar notas dos filhos',
          'Acompanhar frequência',
          'Receber comunicados',
          'Agenda de provas e tarefas',
          'Baixar materiais didáticos'
        ];
      default:
        return ['Permissões não definidas'];
    }
  };

  const buildWhatsappLink = (phone?: string, message?: string) => {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    const withCC = digits.startsWith('55') ? digits : `55${digits}`;
    const text = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${withCC}${text}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-300"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="pr-16">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
                {user.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black">{user.nome}</h2>
                <p className="text-blue-100 flex items-center mt-1">
                  <span className="mr-2">{getTipoUsuarioIcon(user.tipo_usuario)}</span>
                  {getTipoUsuarioLabel(user.tipo_usuario)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* Status e Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Pessoais */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Informações Pessoais
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                    <p className="text-gray-800 font-medium">{user.nome}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">E-mail</label>
                    <p className="text-gray-800 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {user.email}
                    </p>
                  </div>
                  {user.telefone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Telefone</label>
                      <div className="flex items-center gap-2 text-gray-800">
                        <p className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          {user.telefone}
                        </p>
                        <a
                          href={buildWhatsappLink(user.telefone, `Olá ${user.nome}!`) }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 text-xs rounded bg-green-100 text-green-800 hover:bg-green-200"
                          title="Abrir WhatsApp"
                        >
                          <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status e Tipo */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-purple-600" />
                  Status e Tipo
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tipo de Usuário</label>
                    <div className="mt-2">
                      <span className={`px-3 py-2 text-sm rounded-full font-medium ${getTipoUsuarioColor(user.tipo_usuario)}`}>
                        {getTipoUsuarioIcon(user.tipo_usuario)} {getTipoUsuarioLabel(user.tipo_usuario)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-2">
                      <span className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-full font-medium ${
                        user.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.ativo ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                        <span>{user.ativo ? 'Ativo' : 'Inativo'}</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cadastrado em</label>
                    <p className="text-gray-800 flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {new Date(user.criado_em).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissões do Usuário */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Permissões e Acessos
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {getPermissions(user.tipo_usuario).map((permission, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-xl">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">{permission}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Informações Técnicas */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-600" />
                Informações Técnicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID do Usuário</label>
                  <p className="text-gray-800 font-mono text-sm bg-gray-200 px-2 py-1 rounded mt-1">
                    {user.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Criação</label>
                  <p className="text-gray-800 text-sm mt-1">
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

            {/* Ações Rápidas */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Ações Disponíveis</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Para editar este usuário, feche este modal e clique no botão de edição (✏️)</p>
                <p>• Para redefinir a senha, use o botão de chave (🔑)</p>
                <p>• Para enviar mensagem WhatsApp, use o botão de mensagem (💬)</p>
                <p>• O status pode ser alterado clicando no badge de status na tabela</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}