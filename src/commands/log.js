import { api } from "../lib/api.js";
import { getActiveContext } from "../lib/config.js";
import { formatDuration, chalk } from "../lib/format.js";
import ora from "ora";

export async function logCommand(duration, description) {
  const ctx = getActiveContext();
  if (!ctx || ctx.type !== "engagement") {
    console.log("Logging time requires an active engagement. Run " + chalk.cyan("`ho checkout <id>`") + " first.");
    return;
  }

  const minutes = parseDuration(duration);
  if (minutes === null) {
    console.log(chalk.red("✗") + ` Invalid duration: ${duration}`);
    console.log(chalk.dim("  Examples: 1h, 30m, 1h30m, 90m, 1.5h"));
    return;
  }

  const spinner = ora("Logging time...").start();

  try {
    await api(`/engagements/${ctx.id}/time-entries`, {
      method: "POST",
      body: {
        durationMinutes: minutes,
        description: description || undefined,
      },
    });

    spinner.succeed(`Logged ${formatDuration(minutes)}` + (description ? chalk.dim(` — ${description}`) : ""));
  } catch (err) {
    spinner.fail(err.message);
  }
}

function parseDuration(str) {
  if (!str) return null;

  // Match combined format like 1h30m
  const combined = str.match(/^(\d+)h\s*(\d+)m$/i);
  if (combined) return parseInt(combined[1]) * 60 + parseInt(combined[2]);

  // Match hours with decimal like 1.5h
  const decHours = str.match(/^(\d+\.?\d*)h$/i);
  if (decHours) return Math.round(parseFloat(decHours[1]) * 60);

  // Match minutes like 30m
  const mins = str.match(/^(\d+)m$/i);
  if (mins) return parseInt(mins[1]);

  return null;
}
