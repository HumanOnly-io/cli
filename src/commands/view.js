import { api } from "../lib/api.js";
import { truncate, formatMoney, timeAgo, chalk } from "../lib/format.js";
import ora from "ora";

export async function viewCommand(id, options) {
  const spinner = ora("Fetching details...").start();

  try {
    const request = await api(`/requests/${id}`);
    spinner.stop();

    console.log();
    console.log(chalk.bold(request.title));
    console.log(chalk.dim("─".repeat(Math.min(request.title.length, 60))));
    console.log();

    const description = request.description || "No description.";
    console.log(options.verbose ? description : truncate(description, 200));
    console.log();

    const label = (l, v) => console.log(`  ${chalk.dim(l.padEnd(14))} ${v}`);

    label("Status:", request.status || "N/A");
    label("Budget:", formatBudgetDisplay(request));
    if (request.space?.name) label("Space:", request.space.name);
    if (request.skills?.length) label("Skills:", request.skills.map((s) => s.name || s).join(", "));
    label("Visibility:", request.visibility || "N/A");
    label("Bids:", String(request.bidCount ?? request._count?.bids ?? 0));
    label("Posted:", request.createdAt ? timeAgo(request.createdAt) : "N/A");

    console.log();
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
