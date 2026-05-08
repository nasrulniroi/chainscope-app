import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    ...opts,
  }).format(value);
}

export function formatCurrency(value: number | null | undefined, currency = "USD") {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  const fractionDigits = abs >= 100 ? 2 : abs >= 1 ? 4 : abs >= 0.01 ? 5 : 8;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatCompact(value: number | null | undefined, currency?: string) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
    ...(currency
      ? { style: "currency", currency }
      : {}),
  });
  return formatter.format(value);
}

export function formatPct(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function changeColor(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "text-muted-foreground";
  if (value > 0) return "ticker-up";
  if (value < 0) return "ticker-down";
  return "text-muted-foreground";
}

export function shortAddress(address: string | null | undefined) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function timeAgo(input: number | string | Date | null | undefined) {
  if (input === null || input === undefined) return "";
  const date = input instanceof Date ? input : new Date(typeof input === "number" ? input : input);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Math.max(0, Date.now() - date.getTime());
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function safeNumber(input: unknown): number | null {
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input === "string" && input.length > 0) {
    const parsed = Number(input);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  let text: string;
  if (typeof window !== "undefined" && typeof window.DOMParser !== "undefined") {
    const doc = new window.DOMParser().parseFromString(input, "text/html");
    text = doc.body?.textContent ?? "";
  } else {
    text = input.replace(/<[^>]*>/g, " ");
  }
  return text.replace(/\s+/g, " ").trim();
}
