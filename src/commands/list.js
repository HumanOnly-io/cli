import { api } from "../lib/api.js";
import { formatTable, truncate, formatMoney, timeAgo, formatId, chalk } from "../lib/format.js";
import ora from "ora";

export async function listCommand() {
  const spinner = ora("Loading...").start();

  try {
    const data = await api("/requests?mine=true&limit=50");
    const requests = Array.isArray(data) ? data : data?.data || [];

    spinner.stop();

    if (requests.length === 0) {
      console.log(chalk.dim("No requests or engagements found."));
      return;
    }

    const rows = requests.map((r) => {
      const eng = r.engagement;
      const budget = r.budgetType === "HOURLY"
        ? `${formatMoney(r.budgetHourlyRateCents)}/hr`
        : r.budgetType === "FIXED"
          ? `${formatMoney(r.budgetFixedPriceCents)} fixed`
          : "Open";

      return [
        chalk.dim(formatId(r.id)),
        eng ? chalk.dim(formatId(eng.id)) : chalk.dim("—"),
        truncate(r.title, 35),
        budget,
        r.status === "OPEN" ? chalk.green(r.status)
          : r.status === "IN_PROGRESS" ? chalk.blue(r.status)
          : r.status === "COMPLETED" ? chalk.dim(r.status)
          : chalk.yellow(r.status),
        eng ? (
          eng.status === "ACTIVE" ? chalk.green(eng.status)
            : eng.status === "COMPLETED" ? chalk.blue(eng.status)
            : eng.status === "DISPUTED" ? chalk.red(eng.status)
            : chalk.dim(eng.status)
        ) : chalk.dim("—"),
        timeAgo(r.createdAt),
      ];
    });

    console.log();
    console.log(formatTable(
      ["Request ID", "Engagement ID", "Title", "Budget", "Req Status", "Eng Status", "Created"],
      rows,
    ));
    console.log();
    console.log(chalk.dim(`${requests.length} item(s). Use ${chalk.cyan("ho checkout <id>")} to set active context.`));
    console.log();
  } catch (err) {
    spinner.fail(err.message);
  }
}
