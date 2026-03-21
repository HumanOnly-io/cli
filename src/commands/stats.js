import { api } from "../lib/api.js";
import { formatMoney, chalk } from "../lib/format.js";
import Table from "cli-table3";
import ora from "ora";

export async function statsCommand(options) {
  const spinner = ora("Fetching stats...").start();

  try {
    const user = await api("/auth/me");

    let profile = null;
    if (user.proProfileId) {
      try {
        profile = await api(`/pros/${user.proProfileId}`);
      } catch {
        // Pro profile endpoint may not be available
      }
    }

    spinner.stop();

    const name = user.name || "Unknown";
    const rating = profile?.rating ?? "—";
    const reviewCount = profile?.reviewCount ?? 0;
    const completedCount = profile?.completedEngagements ?? profile?.engagementCount ?? 0;
    const totalEarned = profile?.totalEarned;
    const monthEarned = profile?.monthEarned;
    const badges = profile?.badges || [];

    const ratingDisplay = typeof rating === "number"
      ? `★ ${rating.toFixed(1)} (${reviewCount} review${reviewCount === 1 ? "" : "s"})`
      : "No ratings yet";

    const table = new Table({
      colWidths: [36],
      chars: {
        top: "─", "top-mid": "", "top-left": "╭", "top-right": "╮",
        bottom: "─", "bottom-mid": "", "bottom-left": "╰", "bottom-right": "╯",
        left: "│", "left-mid": "├", mid: "─", "mid-mid": "",
        right: "│", "right-mid": "┤", middle: "",
      },
      style: { "padding-left": 1, "padding-right": 1 },
    });

    table.push(
      [chalk.bold(`${name} — Pro Stats`)],
      [{ hAlign: "left", content: buildStatsContent(ratingDisplay, completedCount, totalEarned, monthEarned, badges) }],
    );

    console.log();
    console.log(table.toString());
    console.log();

    // Additional detail with flags
    if (options.earnings && totalEarned !== undefined) {
      console.log(chalk.dim("  Lifetime earnings: ") + formatMoney(totalEarned));
    }
    if (options.month && monthEarned !== undefined) {
      console.log(chalk.dim("  This month: ") + formatMoney(monthEarned));
    }
    if (options.earnings || options.month) console.log();
  } catch (err) {
    spinner.fail(err.message);
  }
}

function buildStatsContent(ratingDisplay, completedCount, totalEarned, monthEarned, badges) {
  const lines = [];
  lines.push(`${chalk.dim("Rating:".padEnd(14))} ${ratingDisplay}`);
  lines.push(`${chalk.dim("Completed:".padEnd(14))} ${completedCount} engagement${completedCount === 1 ? "" : "s"}`);
  if (totalEarned !== undefined) {
    lines.push(`${chalk.dim("Earned:".padEnd(14))} ${formatMoney(totalEarned)}`);
  }
  if (monthEarned !== undefined) {
    lines.push(`${chalk.dim("This month:".padEnd(14))} ${formatMoney(monthEarned)}`);
  }
  if (badges.length > 0) {
    lines.push(`${chalk.dim("Badges:".padEnd(14))} ${badges.map((b) => b.name || b).join(", ")}`);
  }
  return lines.join("\n");
}
