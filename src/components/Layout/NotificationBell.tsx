import { useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, MessageSquare, Calendar, FileText } from 'lucide-react';
import { useNotifications } from '../../contexts/notification';

interface NotificationBellProps {
  onNavigateToNotifications?: () => void;
  className?: string;
  buttonSize?: 'sm' | 'md';
}

/**
 * NotificationBell
 * Objetivos da reformulação:
 *  - Remover flicker / piscar do badge e do painel
 *  - Tornar acessível (teclado + aria)
 *  - Portal + posicionamento adaptativo (abre para cima se falta espaço)
 *  - Evitar re-renders desnecessários (diff de lista já acontece no provider)
 *  - Badge anima somente quando count aumenta
 */
export function NotificationBell({ onNavigateToNotifications, className = '', buttonSize = 'md' }: NotificationBellProps) {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();

  // -------- STATE --------
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 340, direction: 'down' as 'down' | 'up' });
  const [panelReady, setPanelReady] = useState(false); // evita flash inicial antes da primeira medição

  // Snapshot do unread ao abrir (para não oscilar enquanto interage)
  const frozenUnreadRef = useRef(unreadCount);
  const previousUnreadRef = useRef(unreadCount);

  // Refs DOM
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // ----- Badge animation control -----
  const [animateBadge, setAnimateBadge] = useState(false);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (unreadCount > previousUnreadRef.current) {
      setAnimateBadge(true);
      const t = setTimeout(() => setAnimateBadge(false), 900);
      previousUnreadRef.current = unreadCount;
      return () => clearTimeout(t);
    }
    if (unreadCount < previousUnreadRef.current) {
      previousUnreadRef.current = unreadCount;
      setAnimateBadge(false);
    }
  }, [unreadCount]);

  const effectiveUnread = open ? frozenUnreadRef.current : unreadCount;

  // ----- Positioning logic -----
  const measure = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const baseWidth = Math.min(384, Math.max(300, r.width * 14));
    const viewportH = window.innerHeight;
    const estimatedPanelH = 380; // heurística
    const spaceBelow = viewportH - r.bottom;
    const direction: 'down' | 'up' = spaceBelow < estimatedPanelH + 24 && r.top > estimatedPanelH ? 'up' : 'down';
    const top = direction === 'down' ? (r.bottom + 8) : (r.top - estimatedPanelH - 16);
    let left = r.right - baseWidth; // right align
    if (left < 8) left = 8;
    setCoords({ top: Math.max(8, top), left, width: baseWidth, direction });
  }, []);

  useLayoutEffect(() => {
    if (open) {
      measure();
      // Segundo frame para garantir layout correto em casos de reflow
      requestAnimationFrame(measure);
    }
  }, [open, measure]);

  // Reposicionar em resize/scroll
  useEffect(() => {
    if (!open) return;
    const handler = () => measure();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [open, measure]);

  // Outside click + ESC
  useEffect(() => {
    if (!open) return;
    const clickHandler = (e: MouseEvent) => {
      if (!panelRef.current || !btnRef.current) return;
      if (panelRef.current.contains(e.target as Node)) return;
      if (btnRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    const escHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', clickHandler);
    document.addEventListener('keydown', escHandler);
    return () => {
      document.removeEventListener('mousedown', clickHandler);
      document.removeEventListener('keydown', escHandler);
    };
  }, [open]);

  // Congelar unread ao abrir
  useEffect(() => {
    if (open) {
      frozenUnreadRef.current = unreadCount;
      setPanelReady(true);
    } else {
      setPanelReady(false);
    }
  }, [open, unreadCount]);

  const toggle = () => setOpen(o => !o);

  // Focus trap básico
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      // Tentar focar primeiro botão dentro do painel após render
      setTimeout(() => {
        const first = panelRef.current?.querySelector('button');
        (first as HTMLElement | undefined)?.focus();
      }, 30);
    } else if (previouslyFocused.current) {
      previouslyFocused.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // ---- Derived group display (exemplo simples) ----
  const grouped = useMemo(() => {
    const byDay: Record<string, typeof notifications> = {};
    notifications.forEach(n => {
      const day = new Date(n.timestamp).toLocaleDateString('pt-BR');
      byDay[day] = byDay[day] || [];
      byDay[day].push(n);
    });
    return Object.entries(byDay).sort((a,b) => new Date(b[0].split('/').reverse().join('-')).getTime() - new Date(a[0].split('/').reverse().join('-')).getTime());
  }, [notifications]);

  const unreadTotal = notifications.filter(n => !n.read).length;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={btnRef}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unreadTotal > 0 ? `Notificações: ${unreadTotal} não lidas` : 'Notificações'}
        onClick={toggle}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' && !open) { e.preventDefault(); setOpen(true); } }}
        className={`relative rounded-xl sm:rounded-2xl transition-all duration-300 bg-white/20 border border-white/30 backdrop-blur-sm hover:bg-white/30 hover:border-white/40 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:shadow-lg active:scale-95 ${buttonSize === 'sm' ? 'p-1.5 sm:p-2' : 'p-2 sm:p-3'} group`}
      >
        <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 drop-shadow-lg group-hover:text-purple-600 transition-all duration-300" />
        <span className="sr-only" aria-live="polite">{effectiveUnread} notificações não lidas</span>
        {effectiveUnread > 0 && (
          <span
            aria-hidden="true"
            className={`absolute -top-1 -right-1 min-w-[20px] h-5 sm:h-6 sm:min-w-[24px] px-1.5 flex items-center justify-center bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 rounded-full text-white text-[10px] sm:text-xs font-black shadow-lg shadow-red-500/30 border border-red-400/50 transition-all duration-300 ${animateBadge ? 'scale-110 ring-2 ring-red-300 ring-offset-2 ring-offset-white animate-pulse' : 'scale-100'} hover:shadow-xl hover:shadow-red-500/40`}
          >
            {effectiveUnread > 99 ? '99+' : effectiveUnread}
          </span>
        )}
      </button>

      {/* Overlay */}
      {open && createPortal(
        <div className="fixed inset-0 z-[1400]" aria-hidden="true" />,
        document.body
      )}

      {/* Panel */}
      {open && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notificações"
          className={`fixed z-[1500] glass-card rounded-2xl sm:rounded-3xl border-2 border-blue-200 shadow-2xl backdrop-blur-md flex flex-col ${!panelReady ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'} transition-all duration-150`}
          style={{ top: coords.top, left: coords.left, width: coords.width, maxHeight: '26rem' }}
        >
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl sm:rounded-t-3xl">
            <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md">
                <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </span>
              Notificações
            </h3>
            <div className="flex items-center gap-2">
              {unreadTotal > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] sm:text-xs font-bold text-blue-600 hover:text-blue-800 px-2 py-1 rounded-full hover:bg-blue-100 transition"
                >
                  Marcar todas
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="p-1.5 sm:p-2 rounded-full hover:bg-white hover:bg-opacity-50 transition"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Nenhuma notificação</p>
              </div>
            )}
            {notifications.length > 0 && (
              <div className="divide-y divide-gray-50">
                {grouped.map(([day, list]) => (
                  <div key={day} className="py-2 first:pt-0 last:pb-0">
                    <div className="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wide font-bold text-blue-600/70">{day}</div>
                    {list.map(n => {
                      const Icon = n.type === 'recado' ? MessageSquare : n.type === 'prova_tarefa' ? Calendar : n.type === 'material' ? FileText : Bell;
                      return (
                        <button
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-blue-50 transition group ${!n.read ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500' : ''}`}
                        >
                          <span className={`p-2 rounded-xl shadow-sm flex items-center justify-center bg-white group-hover:scale-110 transition ${n.type === 'recado' ? 'text-purple-600' : n.type === 'prova_tarefa' ? 'text-blue-600' : n.type === 'material' ? 'text-green-600' : 'text-gray-500'}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className={`block text-xs sm:text-sm font-bold leading-snug ${!n.read ? 'text-gray-900' : 'text-gray-700'} line-clamp-2`}>{n.title}</span>
                            <span className="block text-[11px] sm:text-xs text-gray-500 font-medium line-clamp-2 mt-0.5">{n.message}</span>
                            <span className="block text-[10px] text-gray-400 mt-1 font-semibold">{new Date(n.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow animate-pulse mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-2xl sm:rounded-b-3xl">
            <button
              onClick={() => { setOpen(false); onNavigateToNotifications?.(); }}
              className="w-full text-center text-[11px] sm:text-xs text-blue-600 hover:text-blue-800 font-bold py-2 rounded-xl hover:bg-blue-100 transition shadow-sm hover:shadow"
            >
              Ver todas as notificações
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default NotificationBell;
