import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useNotifications } from '../../contexts/notification';

interface NotificationMetricsPanelProps {
  onForceSync?: () => Promise<void>;
}

// Painel isolado de métricas e ações de diagnóstico
export const NotificationMetricsPanel: React.FC<NotificationMetricsPanelProps> = ({ onForceSync }) => {
  const { meta, flags, resetMetrics, resetAll } = useNotifications();

  const lastRefreshFormatted = React.useMemo(() => {
    if (!meta.lastRefresh) return 'Nunca';
    const d = new Date(meta.lastRefresh);
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [meta.lastRefresh]);

  const relativeLastRefresh = React.useMemo(() => {
    if (!meta.lastRefresh) return '';
    const diffMs = Date.now() - meta.lastRefresh;
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return `${sec}s atrás`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m atrás`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    const days = Math.floor(hrs / 24);
    return `${days}d atrás`;
  }, [meta.lastRefresh]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" aria-labelledby="notif-metrics-heading">
      <div className="flex items-center justify-between mb-4">
        <h3 id="notif-metrics-heading" className="font-semibold text-gray-800 flex items-center space-x-2">
          <span role="img" aria-label="gráfico">📊</span>
          <span>Métricas & Diagnóstico</span>
          {!flags.enabled && (<span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-700">Sino Oculto</span>)}
          {flags.enabled && !flags.sync && (<span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700">Lista Congelada</span>)}
        </h3>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500" aria-label="Política de retenção">Retenção: 90 dias / máx 500 itens</div>
          <button
            onClick={() => { if (confirm('Zerar contadores de métricas?')) resetMetrics(); }}
            className="text-[11px] px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
            aria-label="Resetar métricas"
          >Reset Métricas</button>
          <button
            onClick={() => { if (confirm('Limpar TODAS as notificações, leituras e métricas? Essa ação não afeta o banco.' )) resetAll(); }}
            className="text-[11px] px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700"
            aria-label="Reset geral de notificações"
          >Reset Geral</button>
          <button
            onClick={onForceSync}
            disabled={!flags.enabled || !flags.sync}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded border ${flags.enabled && flags.sync ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            aria-label={flags.sync ? 'Forçar sincronização de notificações' : 'Sincronização desativada'}
          >
            <RefreshCw className="h-3 w-3" /> Sync
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200" aria-label="Último refresh">
          <p className="text-xs font-medium text-blue-600">Último Refresh</p>
            <p className="font-semibold text-blue-800">{lastRefreshFormatted}</p>
            <p className="text-[11px] text-blue-600 mt-1">{relativeLastRefresh}</p>
        </div>
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-200" aria-label="Total de refreshes">
          <p className="text-xs font-medium text-purple-600">Total Refreshes</p>
          <p className="font-semibold text-purple-800">{meta.totalRefreshes}</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200" aria-label="Diffs suprimidos">
          <p className="text-xs font-medium text-amber-600">Diffs Suprimidos</p>
          <p className="font-semibold text-amber-800">{meta.suppressedUpdates}</p>
          <p className="text-[11px] text-amber-600 mt-1">{meta.totalRefreshes > 0 ? ((meta.suppressedUpdates / meta.totalRefreshes) * 100).toFixed(0) : 0}%</p>
        </div>
        <div className="p-3 rounded-lg bg-green-50 border border-green-200" aria-label="Atraso adaptativo atual">
          <p className="text-xs font-medium text-green-600">Atraso Adaptativo</p>
          <p className="font-semibold text-green-800">{meta.adaptiveDelay ? `${meta.adaptiveDelay}ms` : '-'}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200" aria-label="Status de sincronização">
          <p className="text-xs font-medium text-gray-600">Status</p>
          <p className="font-semibold text-gray-800">{!flags.enabled ? 'Oculto' : (!flags.sync ? 'Congelado' : 'Ativo')}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationMetricsPanel;
