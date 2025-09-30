export function useReadStoreKey(userId?: string) {
  return userId ? `notif_read_${userId}` : undefined;
}

export function getPriorityFromProvaDate(dateISO: string): 'baixa' | 'normal' | 'alta' | 'urgente' {
  const hoje = new Date();
  const data = new Date(dateISO);
  const diffDays = Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return 'urgente';
  if (diffDays <= 3) return 'alta';
  if (diffDays <= 7) return 'normal';
  return 'baixa';
}