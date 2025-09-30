import React from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  Check, 
  CheckCircle, 
  MessageSquare,
  Calendar,
  FileText,
  Clock, 
  Eye,
  Trash2,
  Archive,
  Star,
  AlertTriangle,
  Info,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { useNotifications, type NotificationItem } from '../../contexts/notification';
import NotificationMetricsPanel from '../Notifications/NotificationMetricsPanel';
// import type { ListChildComponentProps } from 'react-window';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePersistedBoolean } from '../../hooks/usePersistedState';
import { ItemDetailModal } from '../Modals/ItemDetailModal';
import { useGlobalConfig } from '../../contexts/globalConfig/useGlobalConfig';
import { useAuth } from '../../contexts/auth';

// Consumirá NotificationItem do NotificationContext

export function NotificacoesPage() {
  // Carrega react-window dinamicamente e usa fallback não-virtualizado caso falhe
  const [VirtualList, setVirtualList] = React.useState<React.ComponentType<any> | null>(null);
  React.useEffect(() => {
    let mounted = true;
    import('react-window')
      .then(mod => {
        const Cmp = (mod as any)?.FixedSizeList as React.ComponentType<any> | undefined;
        if (mounted) setVirtualList(typeof Cmp === 'function' ? Cmp : null);
      })
      .catch(() => { if (mounted) setVirtualList(null); });
    return () => { mounted = false; };
  }, []);
  const hasVirtualList = !!VirtualList;
  const { notifications, unreadCount, markAsRead, markAsUnread, markAllAsRead, deleteById, deleteRead, bulkDelete, refresh, meta, flags } = useNotifications();
  const { configs } = useGlobalConfig();
  const { user } = useAuth();
  const isRestrictedUser = user?.tipo_usuario === 'pai' || user?.tipo_usuario === 'professor';
  const [filtros, setFiltros] = React.useState({
    busca: '',
    tipo: '',
    status: '',
    prioridade: '',
    periodo: 'todos'
  });
  const [selectedNotification, setSelectedNotification] = React.useState<NotificationItem | null>(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [bulkSelection, setBulkSelection] = React.useState<string[]>([]);
  // Preferência persistida
  const [showBulkActions, setShowBulkActions] = usePersistedBoolean('notif_showBulk', false);
  const showBulkActionsEffective = !isRestrictedUser && showBulkActions;
  const [visibleCount, setVisibleCount] = React.useState(50); // carregamento progressivo
  const [showMetrics, setShowMetrics] = usePersistedBoolean('notif_showMetrics', true);
  const [avgFilterTime, setAvgFilterTime] = React.useState<number>(0);
  const filterPerfRef = React.useRef<{ runs: number; total: number }>({ runs: 0, total: 0 });
  const filterCacheRef = React.useRef<{ key: string; list: NotificationItem[] } | null>(null);
  // refresh fica disponível via contexto se precisar, loading local só para ações massivas.

  // Debounce da busca para evitar recalcular a cada tecla
  const debouncedBusca = useDebouncedValue(filtros.busca, 300);

  // Debounce de filtros pesados (tipo/status/prioridade/periodo) – combinamos chave
  const heavyKey = `${filtros.tipo}|${filtros.status}|${filtros.prioridade}|${filtros.periodo}`;
  const debouncedHeavyKey = useDebouncedValue(heavyKey, 250);

  const notificationsFiltradas = React.useMemo(() => {
    const normKey = `${debouncedHeavyKey}|${debouncedBusca}`;
    // Cache simples: se chave igual retorna lista memorizada
    if (filterCacheRef.current && filterCacheRef.current.key === normKey) {
      return filterCacheRef.current.list;
    }
    const t0 = performance.now();
    const result = notifications.filter(notification => {
    const matchBusca = !filtros.busca || 
      notification.title.toLowerCase().includes(debouncedBusca.toLowerCase()) ||
      notification.message.toLowerCase().includes(debouncedBusca.toLowerCase());
    
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
    const t1 = performance.now();
    const dt = t1 - t0;
    filterPerfRef.current.runs += 1;
    filterPerfRef.current.total += dt;
    setAvgFilterTime(filterPerfRef.current.total / filterPerfRef.current.runs);
    filterCacheRef.current = { key: normKey, list: result };
    return result;
  }, [notifications, filtros, debouncedBusca, debouncedHeavyKey]);
  // Persistência de preferências UI
  // (Persistência já tratada pelo hook usePersistedBoolean)

  // Lista visível (progressiva) — reseta ao mudar filtros
  React.useEffect(() => { setVisibleCount(50); }, [filtros, notificationsFiltradas.length]);
  const visibleNotifications = React.useMemo(() => notificationsFiltradas.slice(0, visibleCount), [notificationsFiltradas, visibleCount]);

  // Virtualização (config básica e cálculo de altura dinâmica)
  const ITEM_ESTIMATED = 160;
  const listContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [listHeight, setListHeight] = React.useState(600);
  React.useEffect(() => {
    const resize = () => {
      const el = listContainerRef.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      const available = window.innerHeight - rect.top - 40;
      setListHeight(Math.max(320, available));
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);


  const exportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      total: notifications.length,
      unread: unreadCount,
      meta,
      notifications
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'notificacoes.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['id','tipo','titulo','mensagem','timestamp','lida','prioridade','categoria'];
    const rows = notifications.map(n => [n.id, n.type, n.title.replace(/"/g,'""'), n.message.replace(/"/g,'""'), n.timestamp, n.read, n.priority, n.category]);
    const csv = [headers.join(';'), ...rows.map(r => r.map(v => typeof v === 'string' ? `"${v}"` : v).join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'notificacoes.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const deleteNotification = async (notificationId: string) => {
    if (confirm('Tem certeza que deseja excluir esta notificação?')) {
      setLoading(true);
      try {
        const ok = await deleteById(notificationId);
        if (!ok) alert('Não foi possível excluir a notificação. Verifique suas permissões ou tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteAllRead = async () => {
    if (confirm('Tem certeza que deseja excluir todas as notificações lidas?')) {
      setLoading(true);
      try {
        await deleteRead();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
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
    bulkSelection.forEach(id => markAsRead(id));
    setBulkSelection([]);
  };

  const bulkDeleteAction = async () => {
    if (confirm(`Tem certeza que deseja excluir ${bulkSelection.length} notificação(ões)?`)) {
      setLoading(true);
      try {
        const res = await bulkDelete(bulkSelection);
        if (res.failedIds.length > 0) {
          alert(`Algumas notificações não puderam ser excluídas: ${res.failedIds.length}`);
        }
        setBulkSelection([]);
      } finally {
        setLoading(false);
      }
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

  const totalCount = notifications.length;

  // Row renderer (definido após helpers para evitar forward usage warnings)
  const Row = React.useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const notification = visibleNotifications[index];
    if (!notification) return null;
    const Icon = notification.type === 'recado' ? MessageSquare : notification.type === 'prova_tarefa' ? Calendar : notification.type === 'material' ? FileText : Settings;
    const isSelected = bulkSelection.includes(notification.id);
    return (
      <div style={style} className="pr-2">
        <div
          className={`bg-white rounded-xl shadow-sm border-2 mb-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.01] ${!notification.read ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50' : 'border-gray-200 hover:border-gray-300'} ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
          onClick={() => !showBulkActionsEffective && handleNotificationClick(notification)}
        >
          <div className="p-5">
            <div className="flex items-start space-x-4">
              {showBulkActionsEffective && (
                <div className="flex-shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => { e.stopPropagation(); toggleBulkSelection(notification.id); }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              )}
              <div className={`flex-shrink-0 p-3 rounded-xl ${notification.type === 'recado' ? 'bg-purple-100' : notification.type === 'prova_tarefa' ? 'bg-blue-100' : notification.type === 'material' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Icon className={`h-6 w-6 ${notification.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className={`text-base font-bold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(notification.priority)}`}>
                      <div className="flex items-center space-x-1">
                        {getPriorityIcon(notification.priority)}
                        <span className="font-medium capitalize">{notification.priority}</span>
                      </div>
                    </span>
                    {!notification.read && <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">{new Date(notification.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className={`px-2 py-1 text-[10px] sm:text-xs rounded-full ${notification.type === 'recado' ? 'bg-purple-100 text-purple-800' : notification.type === 'prova_tarefa' ? 'bg-blue-100 text-blue-800' : notification.type === 'material' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{notification.category}</span>
                  </div>
                  {!showBulkActionsEffective && (
                    <div className="flex items-center space-x-2">
                      {!notification.read ? (
                        <button onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }} className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded" aria-label="Marcar como lida"><Check className="h-4 w-4" /></button>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); markAsUnread(notification.id); }} className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded" aria-label="Marcar como não lida"><Eye className="h-4 w-4" /></button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }} className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded" aria-label="Excluir notificação"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [visibleNotifications, bulkSelection, showBulkActionsEffective, markAsRead, markAsUnread, deleteNotification]);

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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">🔔 Central de Notificações</h1>
            <p className="text-gray-600 text-lg font-medium">Todas as suas notificações em um só lugar</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {configs.notifications_metrics_enabled !== false && !isRestrictedUser && (
            <>
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className={`px-4 py-2 rounded-lg transition-colors ${showBulkActions ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                aria-pressed={showBulkActions}
              >{showBulkActions ? 'Cancelar Seleção' : 'Seleção em Massa'}</button>
              <button
                onClick={async () => { setLoading(true); await refresh(); setLoading(false); }}
                disabled={!flags.enabled || !flags.sync}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${flags.enabled && flags.sync ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-600'}`}
                aria-label="Forçar sincronização de notificações"
              ><RefreshCw className="h-4 w-4" /><span>Forçar Sync</span></button>
              <button onClick={exportJSON} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm" aria-label="Exportar JSON">JSON</button>
              <button onClick={exportCSV} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm" aria-label="Exportar CSV">CSV</button>
              <button onClick={() => setShowMetrics((s: boolean) => !s)} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm" aria-pressed={showMetrics}>{showMetrics ? 'Ocultar Métricas' : 'Ver Métricas'}</button>
            </>
          )}
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
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg"><Bell className="h-8 w-8 text-white" /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-xl border-2 border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-red-600 uppercase tracking-wide">🔴 Não Lidas</p>
              <p className="text-3xl font-black text-red-700">{unreadCount}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-lg"><AlertTriangle className="h-8 w-8 text-white" /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-green-600 uppercase tracking-wide">✅ Lidas</p>
              <p className="text-3xl font-black text-green-700">{totalCount - unreadCount}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg"><CheckCircle className="h-8 w-8 text-white" /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl border-2 border-orange-200 p-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-orange-600 uppercase tracking-wide">⚠️ Urgentes</p>
              <p className="text-3xl font-black text-orange-700">{notifications.filter(n => n.priority === 'urgente').length}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-lg"><Star className="h-8 w-8 text-white" /></div>
          </div>
          <div className="mt-4 text-[11px] text-orange-700 font-medium bg-orange-100/60 rounded px-2 py-1" aria-label="Tempo médio de filtragem">
            Filtro médio: {avgFilterTime.toFixed(2)}ms
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
            <input type="text" placeholder="Buscar notificações..." value={filtros.busca} onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Buscar notificações" />
          </div>
          <select value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todos os tipos</option>
            <option value="recado">Recados</option>
            <option value="prova_tarefa">Provas/Tarefas</option>
            <option value="material">Materiais</option>
            <option value="sistema">Sistema</option>
          </select>
          <select value={filtros.status} onChange={(e) => setFiltros({ ...filtros, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todos os status</option>
            <option value="nao_lida">Não lidas</option>
            <option value="lida">Lidas</option>
          </select>
          <select value={filtros.prioridade} onChange={(e) => setFiltros({ ...filtros, prioridade: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todas as prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="normal">Normal</option>
            <option value="baixa">Baixa</option>
          </select>
          <select value={filtros.periodo} onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="todos">Todos os períodos</option>
            <option value="hoje">Hoje</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mês</option>
          </select>
        </div>
      </div>

      {configs.notifications_metrics_enabled !== false && showMetrics && !isRestrictedUser && (
        <NotificationMetricsPanel onForceSync={async () => { setLoading(true); await refresh(); setLoading(false); }} />
      )}

      {/* Ações em Massa */}
      {!isRestrictedUser && showBulkActions && (
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
                  onClick={bulkDeleteAction}
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

      {/* Lista Virtualizada */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2" ref={listContainerRef}>
        {notificationsFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação encontrada</h3>
            <p className="text-gray-500">Ajuste os filtros ou aguarde novas notificações chegarem.</p>
          </div>
        ) : (
          <>
            {hasVirtualList ? (
              <VirtualList height={listHeight} itemCount={visibleNotifications.length} itemSize={ITEM_ESTIMATED} width="100%" className="focus:outline-none">
                {Row}
              </VirtualList>
            ) : (
              <div className="divide-y divide-gray-100">
                {visibleNotifications.map((_, idx) => (
                  <div key={visibleNotifications[idx].id}>
                    {Row({ index: idx, style: {} as React.CSSProperties })}
                  </div>
                ))}
              </div>
            )}
            {visibleCount < notificationsFiltradas.length && (
              <div className="flex justify-center pt-4 pb-2">
                <button onClick={() => setVisibleCount(c => Math.min(c + 100, notificationsFiltradas.length))} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow">Mostrar mais ({notificationsFiltradas.length - visibleCount} restantes)</button>
              </div>
            )}
          </>
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