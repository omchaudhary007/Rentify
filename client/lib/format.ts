import { format, isValid, parseISO } from "date-fns";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) return "₹0";
  return inrFormatter.format(Math.round(amount));
}

function toDate(value: string | Date | undefined | null): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : parseISO(value);
  return isValid(date) ? date : null;
}

export function formatDate(value: string | Date | undefined | null): string {
  const date = toDate(value);
  return date ? format(date, "dd MMM yyyy") : "—";
}

export function formatDateTime(value: string | Date | undefined | null): string {
  const date = toDate(value);
  return date ? format(date, "dd MMM yyyy, h:mm a") : "—";
}

export function formatDuration(months: number | undefined): string {
  if (!months || !Number.isFinite(months)) return "—";
  if (months === 12) return "12 months (1 year)";
  if (months === 24) return "24 months (2 years)";
  return `${months} month${months === 1 ? "" : "s"}`;
}

export function truncateId(id: string | undefined | null, length = 8): string {
  if (!id) return "—";
  return id.length <= length ? id : `${id.slice(0, length)}…`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function initials(name: string | undefined | null): string {
  if (!name) return "R";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "R";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
