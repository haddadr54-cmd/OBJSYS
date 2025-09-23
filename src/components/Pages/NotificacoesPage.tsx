import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  Check, 
  CheckCircle, 
  X, 
  MessageSquare, 
  Calendar, 
  FileText, 
  User, 
  Clock, 
  Eye,
  Trash2,
  Archive,
  Star,
  AlertTriangle,
  Info,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDataService } from '../../lib/dataService';
import { ItemDetailModal } from '../Modals/ItemDetailModal';
import type { Recado, ProvaTarefa, Material } from '../../lib/supabase';

interface Notification {
  id: string;
  type: 'recado' | 'prova_tarefa' | 'material' | 'sistema';
  title: string;
  message: string;
  data: any; // Dados do item original
  timestamp: string;
  read: boolean;
  priority: 'baixa' | 'normal' | 'alta' | 'urgente';
  category: string;
  icon: any;
  color: string;
  actionUrl?: string;
}

export function NotificacoesPage() {
  const { user, isSupabaseConnected } = useAuth();
  const dataService = useDataService(user, isSupabaseConnected);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    tipo: '',
    status: '',
    prioridade: '',
    periodo: 'todos'
  });
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bulkSelection, setBulkSelection] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const [recados, provasTarefas, materiais] = await Promise.all([
        dataService.getRecados(),
        dataService.getProvasTarefas(),
        dataService.getMateriais()
      ]);

      const notificationsData: Notification[] = [];

      // Converter recados em notificações
      recados.forEach(recado => {
        notificationsData.push({
          id: `recado-${recado.id}`,
          type: 'recado',
          title: recado.titulo,
          message: recado.conteudo,
          data: recado,
          timestamp: recado.data_envio,
          read: Math.random() > 0.3, // Simular status de leitura
          priority: 'normal',
          category: 'Comunicação',
          icon: MessageSquare,
          color: 'text-purple-600'
        });
      });

      // Converter provas/tarefas em notificações
      provasTarefas.forEach(prova => {
        const hoje = new Date().toISOString().split('T')[0];
        const dataProva = prova.data;
        const diffTime = new Date(dataProva).getTime() - new Date(hoje).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let priority: 'baixa' | 'normal' | 'alta' | 'urgente' = 'normal';
        if (diffDays <= 1) priority = 'urgente';
        else if (diffDays <= 3) priority = 'alta';
        else if (diffDays <= 7) priority = 'normal';
        else priority = 'baixa';

        notificationsData.push({
          id: `prova-${prova.id}`,
          type: 'prova_tarefa',
          title: `${prova.tipo === 'prova' ? 'Prova' : 'Tarefa'}: ${prova.titulo}`,
          message: `Data: ${new Date(dataProva).toLocaleDateString('pt-BR')} - ${prova.disciplina?.nome}`,
          data: prova,
          timestamp: prova.criado_em,
          read: Math.random() > 0.4,
          priority,
          category: 'Agenda',
          icon: Calendar,
          color: prova.tipo === 'prova' ? 'text-red-600' : 'text-blue-600'
        });
      });

      // Converter materiais em notificações
      materiais.forEach(material => {
        notificationsData.push({
          id: `material-${material.id}`,
          type: 'material',
          title: `Novo Material: ${material.titulo}`,
          message: `${material.tipo.toUpperCase()} - ${material.disciplina?.nome}`,
          data: material,
          timestamp: material.criado_em,
          read: Math.random() > 0.5,
          priority: 'normal',
          category: 'Materiais',
          icon: FileText,
          color: 'text-green-600'
        });
      });

      // Adicionar notificações do sistema
      if (user.tipo_usuario === 'admin') {
        notificationsData.push({
          id: 'sistema-1',
          type: 'sistema',
          title: 'Backup Automático Realizado',
          message: 'Backup diário executado com sucesso às 02:00',
          data: null,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'baixa',
          category: 'Sistema',
          icon: Settings,
          color: 'text-gray-600'
        });
      }

      // Ordenar por timestamp (mais recentes primeiro)
      notificationsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setNotifications(notificationsData);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const notificationsFiltradas = notifications.filter(notification => {
    const matchBusca = !filtros.busca || 
      notification.title.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      notification.message.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchTipo = !filtros.tipo || notification.type === filtros.tipo;
    const matchStatus = !filtros.status || 
      (filtros.status === 'lida' && notification.read) ||
      (filtros.status === 'nao_lida' && !notification.read);
    const matchPrioridade = !filtros.prioridade || notification.priority === filtros.prioridade;
    
    let matchPeriodo = true;
    if (filtros.periodo !== 'todos') {
      const notificationDate = new Date(notification.timestamp);
      const hoje = new Date();
      
      if (filtros.periodo === 'hoje') {
        matchPeriodo = notificationDate.toDateString() === hoje.toDateString();
      } else if (filtros.periodo === 'semana') {
        const semanaAtras = new Date();
        semanaAtras.setDate(hoje.getDate() - 7);
        matchPeriodo = notificationDate >= semanaAtras;
      } else if (filtros.periodo === 'mes') {
        const mesAtras = new Date();
        mesAtras.setMonth(hoje.getMonth() - 1);
        matchPeriodo = notificationDate >= mesAtras;
      }
    }
    
    return matchBusca && matchTipo && matchStatus && matchPrioridade && matchPeriodo;
  });

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAsUnread = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: false } : n
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    if (confirm('Tem certeza que deseja excluir esta notificação?')) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteAllRead = () => {
    if (confirm('Tem certeza que deseja excluir todas as notificações lidas?')) {
      setNotifications(prev => prev.filter(n => !n.read));
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como lida
    markAsRead(notification.id);
    
    // Abrir modal de detalhes se for um item específico
    if (notification.type !== 'sistema') {
      setSelectedNotification(notification);
      setShowDetailModal(true);
    }
  };

  const toggleBulkSelection = (notificationId: string) => {
    setBulkSelection(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAll = () => {
    setBulkSelection(notificationsFiltradas.map(n => n.id));
  };

  const clearSelection = () => {
    setBulkSelection([]);
  };

  const bulkMarkAsRead = () => {
    setNotifications(prev => 
      prev.map(n => 
        bulkSelection.includes(n.id) ? { ...n, read: true } : n
      )
    );
    setBulkSelection([]);
  };

  const bulkDelete = () => {
    if (confirm(`Tem certeza que deseja excluir ${bulkSelection.length} notificação(ões)?`)) {
      setNotifications(prev => prev.filter(n => !bulkSelection.includes(n.id)));
      setBulkSelection([]);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'baixa':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return <AlertTriangle className="h-3 w-3" />;
      case 'alta':
        return <Star className="h-3 w-3" />;
      case 'normal':
        return <Info className="h-3 w-3" />;
      case 'baixa':
        return <Clock className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Bell className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🔔 Central de Notificações
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Todas as suas notificações em um só lugar
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowBulkActions(!showBulkActions)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showBulkActions 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showBulkActions ? 'Cancelar Seleção' : 'Seleção em Massa'}
          </button>
          <button
            onClick={fetchNotifications}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-blue-600 uppercase tracking-wide">📬 Total</p>
              <p className="text-3xl font-black text-blue-700">{totalCount}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg">
              <Bell className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-xl border-2 border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-red-600 uppercase tracking-wide">🔴 Não Lidas</p>
              <p className="text-3xl font-black text-red-700">{unreadCount}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-lg">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-green-600 uppercase tracking-wide">✅ Lidas</p>
              <p className="text-3xl font-black text-green-700">{totalCount - unreadCount}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl border-2 border-orange-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-orange-600 uppercase tracking-wide">⚠️ Urgentes</p>
              <p className="text-3xl font-black text-orange-700">
                {notifications.filter(n => n.priority === 'urgente').length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-lg">
              <Star className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar notificações..."
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
            <option value="recado">Recados</option>
            <option value="prova_tarefa">Provas/Tarefas</option>
            <option value="material">Materiais</option>
            <option value="sistema">Sistema</option>
          </select>
          
          <select
            value={filtros.status}
            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="nao_lida">Não lidas</option>
            <option value="lida">Lidas</option>
          </select>
          
          <select
            value={filtros.prioridade}
            onChange={(e) => setFiltros({ ...filtros, prioridade: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="normal">Normal</option>
            <option value="baixa">Baixa</option>
          </select>
          
          <select
            value={filtros.periodo}
            onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos os períodos</option>
            <option value="hoje">Hoje</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mês</option>
          </select>
        </div>
      </div>

      {/* Ações em Massa */}
      {showBulkActions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={bulkSelection.length === notificationsFiltradas.length && notificationsFiltradas.length > 0}
                  onChange={(e) => e.target.checked ? selectAll() : clearSelection()}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {bulkSelection.length > 0 
                    ? `${bulkSelection.length} selecionada(s)` 
                    : 'Selecionar todas'
                  }
                </span>
              </div>
            </div>
            
            {bulkSelection.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={bulkMarkAsRead}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  <span>Marcar como Lidas</span>
                </button>
                <button
                  onClick={bulkDelete}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Excluir</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ações Rápidas */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            {unreadCount} não lidas de {totalCount} total
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Marcar Todas como Lidas</span>
          </button>
          <button
            onClick={deleteAllRead}
            disabled={totalCount - unreadCount === 0}
            className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Archive className="h-4 w-4" />
            <span>Excluir Lidas</span>
          </button>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-4">
        {notificationsFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação encontrada</h3>
            <p className="text-gray-500">
              Ajuste os filtros ou aguarde novas notificações chegarem.
            </p>
          </div>
        ) : (
          notificationsFiltradas.map((notification) => {
            const Icon = notification.icon;
            const isSelected = bulkSelection.includes(notification.id);
            
            return (
              <div 
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] ${
                  !notification.read 
                    ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                onClick={() => !showBulkActions && handleNotificationClick(notification)}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Checkbox para seleção em massa */}
                    {showBulkActions && (
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleBulkSelection(notification.id);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {/* Ícone da notificação */}
                    <div className={`flex-shrink-0 p-3 rounded-xl ${
                      notification.type === 'recado' ? 'bg-purple-100' :
                      notification.type === 'prova_tarefa' ? 'bg-blue-100' :
                      notification.type === 'material' ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      <Icon className={`h-6 w-6 ${notification.color}`} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className={`text-lg font-bold ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        
                        {/* Status e prioridade */}
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(notification.priority)}`}>
                            <div className="flex items-center space-x-1">
                              {getPriorityIcon(notification.priority)}
                              <span className="font-medium capitalize">{notification.priority}</span>
                            </div>
                          </span>
                          {!notification.read && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </div>

                      {/* Metadados */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-500">
                              {new Date(notification.timestamp).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            notification.type === 'recado' ? 'bg-purple-100 text-purple-800' :
                            notification.type === 'prova_tarefa' ? 'bg-blue-100 text-blue-800' :
                            notification.type === 'material' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.category}
                          </span>
                        </div>

                        {/* Ações */}
                        {!showBulkActions && (
                          <div className="flex items-center space-x-2">
                            {!notification.read ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                title="Marcar como lida"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsUnread(notification.id);
                                }}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                title="Marcar como não lida"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Excluir notificação"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Indicador de clique */}
                      {!showBulkActions && notification.type !== 'sistema' && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            👆 Clique para ver detalhes completos
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Detalhes */}
      <ItemDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedNotification(null);
        }}
        item={selectedNotification?.data}
        type={selectedNotification?.type as any}
        turmaName={
          selectedNotification?.type === 'prova_tarefa' 
            ? selectedNotification.data?.disciplina?.turma?.nome
            : undefined
        }
        disciplinaName={
          selectedNotification?.type === 'prova_tarefa' || selectedNotification?.type === 'material'
            ? selectedNotification.data?.disciplina?.nome
            : undefined
        }
        autorName={
          selectedNotification?.type === 'recado'
            ? selectedNotification.data?.autor?.nome
            : undefined
        }
      />
    </div>
  );
}