export type NotificationType = 'recado' | 'prova_tarefa' | 'material' | 'sistema';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any;
  timestamp: string;
  read: boolean;
  priority: 'baixa' | 'normal' | 'alta' | 'urgente';
  category: string;
  iconName: 'message' | 'calendar' | 'file' | 'settings';
  color: string;
}

export interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAsUnread: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeById: (notificationId: string) => void;
  deleteById: (notificationId: string) => Promise<boolean>;
  deleteRead: () => Promise<void>;
  bulkDelete: (notificationIds: string[]) => Promise<{ successIds: string[]; failedIds: string[] }>;
  // Métricas & estado
  meta: {
    lastRefresh?: number;
    totalRefreshes: number;
    suppressedUpdates: number; // diffs ignorados
    adaptiveDelay?: number;
  };
  flags: {
    enabled: boolean;
    sync: boolean;
  };
  resetMetrics: () => void; // zera contadores internos
  resetAll: () => void; // limpa notificações, leituras e métricas (soft reset)
}