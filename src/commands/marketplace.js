import { api } from "../lib/api.js";
import { formatTable, truncate, formatMoney, formatId, timeAgo, chalk } from "../lib/format.js";
import ora from "ora";

export async function marketplaceCommand(options) {
  const spinner = ora("Fetching marketplace...").start();

  try {
    const params = new URLSearchParams({ status: "OPEN" });
    if (options.popular) params.set("sort", "popular");
    if (options.search) params.set("search", options.search);
    if (options.space) params.set("space", options.space);
    if (options.limit) params.set("limit", options.limit);

    const result = await api(`/requests?${params.toString()}`);
    const items = Array.isArray(result) ? result : result?.data || [];

    spinner.stop();

    if (items.length === 0) {
      console.log(chalk.dim("No open requests found."));
      return;
    }

    const rows = items.map((r) => [
      formatId(r.id),
      truncate(r.title, 45),
      formatBudget(r),
      String(r.bidCount ?? r._count?.bids ?? 0),
      timeAgo(r.createdAt),
    ]);

    console.log();
    console.log(formatTable(["ID", "Title", "Budget", "Bids", "Posted"], rows));
    console.log(chalk.dim(`\n${items.length} request${items.length === 1 ? "" : "s"} shown`));
    console.log();
  } catch (err) {
    spinner.fail(err.message);
  }
}

function formatBudget(request) {
  const type = request.budgetType;
  const amount = request.budgetAmount ?? request.budget;
  if (type === "HOURLY" && amount) return `${formatMoney(amount)}/hr`;
  if (type === "FIXED" && amount) return `${formatMoney(amount)} fixed`;
  if (type === "OPEN" || !amount) return "Open";
  return formatMoney(amount);
}
