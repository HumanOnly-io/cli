import { api } from "../lib/api.js";
import { getActiveContext } from "../lib/config.js";
import { startTimer, stopTimer, getTimerStatus, isTimerRunning } from "../lib/timer.js";
import { formatDuration, chalk } from "../lib/format.js";

export async function timerStartCommand(description) {
  const ctx = getActiveContext();
  if (!ctx || ctx.type !== "engagement") {
    console.log("Timer requires an active engagement. Run " + chalk.cyan("`ho checkout <id>`") + " first.");
    return;
  }

  try {
    const data = startTimer(ctx.id, description);
    console.log(chalk.green("✓") + ` Timer started at ${new Date(data.startedAt).toLocaleTimeString()}`);
    if (description) console.log(chalk.dim(`  ${description}`));
  } catch (err) {
    console.log(chalk.red("✗") + ` ${err.message}`);
  }
}

export async function timerStopCommand() {
  const ctx = getActiveContext();

  try {
    const result = stopTimer();
    console.log(chalk.green("✓") + ` Timer stopped — ${formatDuration(result.durationMinutes)} logged`);

    // Post time entry to API
    if (ctx && ctx.type === "engagement") {
      try {
        await api(`/engagements/${result.engagementId}/time-entries`, {
          method: "POST",
          body: {
            durationMinutes: result.durationMinutes,
            description: result.description || undefined,
            startedAt: result.startedAt,
            endedAt: result.endedAt,
          },
        });
        console.log(chalk.dim("  Time entry saved."));
      } catch (err) {
        console.log(chalk.yellow("⚠") + ` Timer stopped but failed to save: ${err.message}`);
        console.log(chalk.dim(`  You can manually log with: ho log ${result.durationMinutes}m ${result.description || ""}`));
      }
    }
  } catch (err) {
    console.log(chalk.red("✗") + ` ${err.message}`);
  }
}

export async function timerStatusCommand() {
  if (!isTimerRunning()) {
    console.log(chalk.dim("No timer running."));
    return;
  }

  const timer = getTimerStatus();
  const hh = String(Math.floor(timer.elapsed / 3600)).padStart(2, "0");
  const mm = String(Math.floor((timer.elapsed % 3600) / 60)).padStart(2, "0");
  const ss = String(timer.elapsed % 60).padStart(2, "0");

  console.log();
  console.log(`  ${chalk.bold("Timer:")} ${hh}:${mm}:${ss}`);
  if (timer.description) console.log(`  ${chalk.dim(timer.description)}`);
  console.log(`  ${chalk.dim("Started:")} ${new Date(timer.startedAt).toLocaleTimeString()}`);
  console.log();
}
