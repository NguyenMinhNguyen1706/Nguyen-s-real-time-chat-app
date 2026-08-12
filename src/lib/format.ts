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

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  let hours = date.getUTCHours();
  const minutes = pad2(date.getUTCMinutes());
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function formatDateSeparator(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const startOfGiven = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

  const diffTime = startOfToday.getTime() - startOfGiven.getTime();
  const diffDays = Math.round(diffTime / DAY_MS);

  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
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
