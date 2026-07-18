export function formatPayWayRequestTime(date: Date = new Date()): string {
  return date.toISOString().replace(/\D/g, '').slice(0, 14);
}
