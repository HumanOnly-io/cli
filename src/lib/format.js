import chalk from "chalk";
import Table from "cli-table3";

export function formatTable(headers, rows) {
  const table = new Table({
    head: headers.map((h) => chalk.cyan(h)),
    style: { head: [], border: [] },
    chars: { mid: "", "left-mid": "", "mid-mid": "", "right-mid": "" },
  });
  rows.forEach((r) => table.push(r));
  return table.toString();
}

export function truncate(str, len = 50) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len - 1) + "…" : str;
}

export function formatMoney(cents) {
  if (!cents && cents !== 0) return "N/A";
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatDuration(minutes) {
  if (!minutes) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function timeAgo(dateStr) {
  if (!dateStr) return "";
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatId(id) {
  return id || "";
}

export { chalk };
