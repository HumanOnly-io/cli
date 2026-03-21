import { api } from "../lib/api.js";
import { formatTable, truncate, formatMoney, timeAgo, formatId, chalk } from "../lib/format.js";
import ora from "ora";

export async function requestsCommand(options) {
  const spinner = ora("Loading your requests...").start();

  try {
    const data = await api("/requests?limit=50");
    const requests = Array.isArray(data) ? data : data?.data || [];

    spinner.stop();

    if (requests.length === 0) {
      console.log(chalk.dim("No requests found."));
      return;
    }

    const rows = requests.map((r) => {
      const budget = r.budgetType === "HOURLY"
        ? `${formatMoney(r.budgetHourlyRateCents)}/hr`
        : r.budgetType === "FIXED"
          ? `${formatMoney(r.budgetFixedPriceCents)} fixed`
          : "Open";

      return [
        chalk.dim(formatId(r.id)),
        truncate(r.title, 40),
        budget,
        r.status === "OPEN" ? chalk.green(r.status) :
          r.status === "IN_PROGRESS" ? chalk.blue(r.status) :
          r.status === "COMPLETED" ? chalk.dim(r.status) :
          chalk.yellow(r.status),
        String(r.bids?.length ?? r._count?.bids ?? "—"),
        timeAgo(r.createdAt),
      ];
    });

    console.log();
    console.log(formatTable(["ID", "Title", "Budget", "Status", "Bids", "Created"], rows));
    console.log();
    console.log(chalk.dim(`${requests.length} request(s). Use ${chalk.cyan("ho view <id>")} for details.`));
    console.log();
  } catch (err) {
    spinner.fail(err.message);
  }
}
