import { fetchAllWork } from "./list.js";
import { formatTable, truncate, formatMoney, timeAgo, formatId, chalk } from "../lib/format.js";
import ora from "ora";

export async function engagementsCommand(options) {
  const spinner = ora("Loading engagements...").start();

  try {
    const items = await fetchAllWork();
    let withEngagements = items.filter((i) => i.engagement);

    if (options.status) {
      withEngagements = withEngagements.filter(
        (i) => i.engagement.status === options.status.toUpperCase(),
      );
    }

    spinner.stop();

    if (withEngagements.length === 0) {
      console.log(chalk.dim("No engagements found."));
      return;
    }

    const rows = withEngagements.map(({ request: r, engagement: eng, role }) => {
      const pricing = eng.pricingType === "HOURLY"
        ? `${formatMoney(eng.hourlyRateCents)}/hr`
        : eng.pricingType === "FIXED"
          ? `${formatMoney(eng.fixedPriceCents)} fixed`
          : "Open";

      return [
        chalk.dim(formatId(eng.id)),
        truncate(r.title, 35),
        role === "client" ? chalk.cyan("Client") : chalk.green("Pro"),
        pricing,
        eng.status === "ACTIVE" ? chalk.green(eng.status)
          : eng.status === "COMPLETED" ? chalk.blue(eng.status)
          : eng.status === "DISPUTED" ? chalk.red(eng.status)
          : chalk.dim(eng.status),
        timeAgo(eng.createdAt || r.createdAt),
      ];
    });

    console.log();
    console.log(formatTable(["Engagement ID", "Request", "Role", "Pricing", "Status", "Started"], rows));
    console.log();
    console.log(chalk.dim(`${withEngagements.length} engagement(s). Use ${chalk.cyan("ho checkout <id>")} to set active context.`));
    console.log();
  } catch (err) {
    spinner.fail(err.message);
  }
}
