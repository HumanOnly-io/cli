import { api } from "../lib/api.js";
import { getActiveContext } from "../lib/config.js";
import { formatMoney, formatDuration, chalk } from "../lib/format.js";
import { getTimerStatus, isTimerRunning } from "../lib/timer.js";
import ora from "ora";

export async function statusCommand() {
  const ctx = getActiveContext();

  if (!ctx) {
    console.log("No active context. Run " + chalk.cyan("`ho checkout <id>`") + " to set one.");
    return;
  }

  const spinner = ora("Fetching status...").start();

  try {
    if (ctx.type === "request") {
      const request = await api(`/requests/${ctx.id}`);
      spinner.stop();

      console.log();
      console.log(chalk.bold(request.title));
      console.log(chalk.dim(`Request · ${ctx.id}`));
      console.log();

      const label = (l, v) => console.log(`  ${chalk.dim(l.padEnd(14))} ${v}`);

      label("Status:", request.status || "N/A");
      label("Budget:", formatBudgetDisplay(request));
      label("Bids:", String(request.bidCount ?? request._count?.bids ?? 0));
      console.log();
    } else if (ctx.type === "engagement") {
      const engagement = await api(`/engagements/${ctx.id}`);
      spinner.stop();

      console.log();
      console.log(chalk.bold(engagement.title || engagement.request?.title || "Engagement"));
      console.log(chalk.dim(`Engagement · ${ctx.id}`));
      console.log();

      const label = (l, v) => console.log(`  ${chalk.dim(l.padEnd(14))} ${v}`);

      label("Status:", engagement.status || "N/A");
      if (engagement.totalMinutes || engagement._count?.timeEntries) {
        label("Time logged:", formatDuration(engagement.totalMinutes || 0));
        label("Time entries:", String(engagement._count?.timeEntries ?? 0));
      }
      if (engagement._count?.deliverables !== undefined) {
        label("Deliverables:", String(engagement._count.deliverables));
      }
      if (engagement.totalEarned) {
        label("Earned:", formatMoney(engagement.totalEarned));
      }
      console.log();
    }

    // Show timer status if running
    if (isTimerRunning()) {
      const timer = getTimerStatus();
      if (timer) {
        const hh = String(Math.floor(timer.elapsed / 3600)).padStart(2, "0");
        const mm = String(Math.floor((timer.elapsed % 3600) / 60)).padStart(2, "0");
        const ss = String(timer.elapsed % 60).padStart(2, "0");
        console.log(chalk.yellow("⏱  Timer running: ") + `${hh}:${mm}:${ss}` + (timer.description ? chalk.dim(` — ${timer.description}`) : ""));
        console.log();
      }
    }
  } catch (err) {
    spinner.fail(err.message);
  }
}

function formatBudgetDisplay(request) {
  const type = request.budgetType;
  const amount = request.budgetAmount ?? request.budget;
  if (type === "HOURLY" && amount) return `${formatMoney(amount)}/hr`;
  if (type === "FIXED" && amount) return `${formatMoney(amount)} fixed`;
  if (type === "OPEN" || !amount) return "Open";
  return formatMoney(amount);
}
