const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}`;
}

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const diff = now.getTime() - date.getTime();
  if (diff < 0) {
    return "Just now";
  }
  if (diff < MINUTE_MS) {
    return "Just now";
  }
  const minutes = Math.floor(diff / MINUTE_MS);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(diff / HOUR_MS);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(diff / DAY_MS);
  if (days === 1) {
    return "Yesterday";
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  return date.toISOString().slice(0, 10);
}
