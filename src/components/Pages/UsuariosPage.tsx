import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, Filter, Eye, UserCheck, UserX, MessageCircle, Key } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { useDataService } from '../../lib/dataService';
import type { Usuario } from '../../lib/supabase.types';
import { UserModal } from '../Modals/UserModal';
import { useDataRefresh } from '../../hooks/useDataRefresh';
import { ResetPasswordModal } from '../Modals/ResetPasswordModal';
import { UserDetailModal } from '../Modals/UserDetailModal';

export function UsuariosPage() {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const { refreshKey, triggerRefresh } = useDataRefresh();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    tipo: '',
    status: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [userForPasswordReset, setUserForPasswordReset] = useState<Usuario | null>(null);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [userForDetails, setUserForDetails] = useState<Usuario | null>(null);

  useEffect(() => {
    fetchUsuarios();
  }, [refreshKey]);

  const fetchUsuarios = async () => {
    try {
      const usuariosData = await dataService.getUsuarios();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };
  // Helper: montar link para abrir WhatsApp com mensagem
  const buildWhatsappLink = (phone?: string, message?: string) => {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    const withCC = digits.startsWith('55') ? digits : `55${digits}`;
    const text = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${withCC}${text}`;
  };
  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchBusca = !filtros.busca || 
      usuario.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      usuario.email.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchTipo = !filtros.tipo || usuario.tipo_usuario === filtros.tipo;
    const matchStatus = !filtros.status || 
      (filtros.status === 'ativo' && usuario.ativo) ||
      (filtros.status === 'inativo' && !usuario.ativo);
    
    return matchBusca && matchTipo && matchStatus;
  });

  const handleEdit = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setShowModal(true);
  };

  const handleDelete = (usuario: Usuario) => {
    if (confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) {
      deleteUsuario(usuario.id);
    }
  };

  const deleteUsuario = async (id: string) => {
    try {
      await dataService.deleteUsuario(id);
      triggerRefresh();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      if (error instanceof Error && error.message.includes('Supabase')) {
        alert('❌ Erro: Sistema requer conexão com Supabase para excluir usuários. Verifique sua conexão.');
      } else {
        alert('Erro ao excluir usuário');
      }
    }
  };

  const toggleStatus = async (usuario: Usuario) => {
    try {
      await dataService.updateUsuario(usuario.id, { ativo: !usuario.ativo });
      triggerRefresh();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      if (error instanceof Error && error.message.includes('Supabase')) {
        alert('❌ Erro: Sistema requer conexão com Supabase para alterar status. Verifique sua conexão.');
      } else {
        alert('Erro ao alterar status do usuário');
      }
    }
  };

  const handleModalSave = async () => {
    try {
        triggerRefresh();
      handleModalClose();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      if (error instanceof Error && error.message.includes('Supabase')) {
        alert('❌ Erro: Sistema requer conexão com Supabase para salvar usuários. Verifique sua conexão.');
      } else {
        alert('Erro ao excluir usuário');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleResetPassword = (usuario: Usuario) => {
    setUserForPasswordReset(usuario);
    setShowResetPasswordModal(true);
  };

  const handleResetPasswordClose = () => {
    setShowResetPasswordModal(false);
    setUserForPasswordReset(null);
  };

  const handleResetPasswordSave = () => {
    triggerRefresh();
    handleResetPasswordClose();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-gray-700">Carregando usuários...</p>
          <p className="text-lg text-gray-500 mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-green-200 p-6 sm:p-8 lg:p-12 animate-slide-in-up hover:shadow-2xl transition-all duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-6 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl shadow-2xl mx-auto sm:mx-0 animate-float">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent animate-glow">
                👥 Gestão de Usuários
              </h1>
              <p className="text-gray-700 mt-2 sm:mt-4 text-lg sm:text-xl lg:text-2xl font-bold">
                🎯 Gerencie professores, alunos e administradores
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-end">
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 font-black text-lg"
            >
              <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Novo Usuário</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            <option value="admin">Administrador</option>
            <option value="professor">Professor</option>
            <option value="pai">Pai/Responsável</option>
          </select>
          <select
            value={filtros.status}
            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-purple-600">
                {usuarios.filter(u => u.tipo_usuario === 'admin').length}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-full">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Professores</p>
              <p className="text-2xl font-bold text-green-600">
                {usuarios.filter(u => u.tipo_usuario === 'professor').length}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-full">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pais</p>
              <p className="text-2xl font-bold text-blue-600">
                {usuarios.filter(u => u.tipo_usuario === 'pai').length}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de usuários */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Usuários ({usuariosFiltrados.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum usuário encontrado com os filtros aplicados
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-blue-50 hover:shadow-md transition-all cursor-pointer group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {usuario.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">{usuario.nome}</div>
                          {usuario.telefone && (
                            <div className="text-sm text-gray-500">{usuario.telefone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        getTipoUsuarioColor(usuario.tipo_usuario)
                      }`}>
                        {getTipoUsuarioLabel(usuario.tipo_usuario)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {usuario.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(usuario);
                        }}
                        className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${
                          usuario.ativo 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition-colors`}
                      >
                        {usuario.ativo ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                        <span>{usuario.ativo ? 'Ativo' : 'Inativo'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(usuario.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {usuario.telefone && (
                          <a
                            href={buildWhatsappLink(usuario.telefone, `Olá ${usuario.nome}!`) }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Abrir WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetPassword(usuario);
                          }}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                          title="Redefinir senha"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(usuario);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserForDetails(usuario);
                            setShowUserDetailModal(true);
                          }}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(usuario);
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de criação/edição (placeholder) */}
      <UserModal
        isOpen={showModal}
        onClose={handleModalClose}
        user={selectedUser}
        onSave={handleModalSave}
      />

      {/* Modal de redefinição de senha */}
      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={handleResetPasswordClose}
        user={userForPasswordReset}
        onSave={handleResetPasswordSave}
      />

      {/* Modal de detalhes do usuário */}
      <UserDetailModal
        isOpen={showUserDetailModal}
        onClose={() => {
          setShowUserDetailModal(false);
          setUserForDetails(null);
        }}
        user={userForDetails}
      />
    </div>
  );
}