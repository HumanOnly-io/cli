import { api } from "../lib/api.js";
import { formatTable, truncate, formatMoney, timeAgo, formatId, chalk } from "../lib/format.js";
import ora from "ora";

export async function engagementsCommand(options) {
  const spinner = ora("Loading engagements...").start();

  try {
    const params = new URLSearchParams();
    if (options.status) params.set("status", options.status.toUpperCase());

    // Fetch user's requests that have engagements
    const data = await api(`/requests?${params.toString()}&limit=50`);
    const requests = Array.isArray(data) ? data : data?.data || [];

    // Filter to ones with engagements
    const withEngagements = requests.filter((r) => r.engagement);

    spinner.stop();

    if (withEngagements.length === 0) {
      console.log(chalk.dim("No active engagements found."));
      return;
    }

    const rows = withEngagements.map((r) => {
      const eng = r.engagement;
      const pricing = eng.pricingType === "HOURLY"
        ? `${formatMoney(eng.hourlyRateCents)}/hr`
        : eng.pricingType === "FIXED"
          ? `${formatMoney(eng.fixedPriceCents)} fixed`
          : "Open";

      return [
        chalk.dim(formatId(eng.id)),
        truncate(r.title, 40),
        pricing,
        eng.status === "ACTIVE" ? chalk.green(eng.status) :
          eng.status === "COMPLETED" ? chalk.blue(eng.status) :
          eng.status === "DISPUTED" ? chalk.red(eng.status) :
          chalk.dim(eng.status),
        timeAgo(eng.createdAt),
      ];
    });

    console.log();
    console.log(formatTable(["Engagement ID", "Request", "Pricing", "Status", "Started"], rows));
    console.log();
    console.log(chalk.dim(`${withEngagements.length} engagement(s). Use ${chalk.cyan("ho checkout <id>")} to set active context.`));
    console.log();
  } catch (err) {
    spinner.fail(err.message);
  }
}
