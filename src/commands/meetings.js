import { api } from "../lib/api.js";
import { getActiveContext } from "../lib/config.js";
import { formatTable, truncate, formatDuration, chalk } from "../lib/format.js";
import ora from "ora";

export async function meetingsCommand() {
  const ctx = getActiveContext();

  if (!ctx || ctx.type !== "engagement") {
    console.log("Run " + chalk.cyan("`ho checkout <id>`") + " on an engagement to view its meetings.");
    return;
  }

  const spinner = ora("Fetching meetings...").start();

  try {
    const meetings = await api(`/meetings?engagementId=${ctx.id}`);
    const items = Array.isArray(meetings) ? meetings : meetings?.data || [];

    // Filter to PROPOSED + CONFIRMED only
    const filtered = items.filter((m) => ["PROPOSED", "CONFIRMED"].includes(m.status));

    spinner.stop();

    if (filtered.length === 0) {
      console.log(chalk.dim("No upcoming meetings."));
      return;
    }

    const rows = filtered.map((m) => [
      formatDateTime(m.scheduledAt || m.startTime),
      truncate(m.subject || m.title || "Meeting", 40),
      m.provider || "—",
      m.status,
      m.estimatedDuration ? formatDuration(m.estimatedDuration) : "—",
    ]);

    console.log();
    console.log(formatTable(["Date/Time", "Subject", "Provider", "Status", "Duration"], rows));
    console.log();
  } catch (err) {
    spinner.fail(err.message);
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
