import { api } from "../lib/api.js";
import { formatTable, truncate, formatMoney, timeAgo, formatId, chalk } from "../lib/format.js";
import ora from "ora";

async function fetchAllWork() {
  // Fetch as client (requests I created)
  const myRequestsRaw = await api("/requests?mine=true&limit=50").catch(() => []);
  const myRequests = Array.isArray(myRequestsRaw) ? myRequestsRaw : myRequestsRaw?.data || [];

  // Fetch as pro (bids I submitted, which link to requests)
  const myBidsRaw = await api("/bids/mine?limit=50").catch(() => []);
  const myBids = Array.isArray(myBidsRaw) ? myBidsRaw : myBidsRaw?.data || [];

  // Combine: requests I own + requests I bid on
  const seen = new Set();
  const items = [];

  for (const r of myRequests) {
    seen.add(r.id);
    items.push({ request: r, engagement: r.engagement || null, role: "client" });
  }

  for (const bid of myBids) {
    const r = bid.request;
    if (r && !seen.has(r.id)) {
      seen.add(r.id);
      // Fetch full request to get engagement data
      try {
        const full = await api(`/requests/${r.id}`);
        items.push({ request: full, engagement: full.engagement || null, role: "pro" });
      } catch {
        items.push({ request: r, engagement: null, role: "pro" });
      }
    }
  }

  return items;
}

export async function listCommand() {
  const spinner = ora("Loading...").start();

  try {
    const items = await fetchAllWork();
    spinner.stop();

    if (items.length === 0) {
      console.log(chalk.dim("No requests or engagements found."));
      return;
    }

    const rows = items.map(({ request: r, engagement: eng, role }) => {
      const budget = r.budgetType === "HOURLY"
        ? `${formatMoney(r.budgetHourlyRateCents)}/hr`
        : r.budgetType === "FIXED"
          ? `${formatMoney(r.budgetFixedPriceCents)} fixed`
          : "Open";

      return [
        chalk.dim(formatId(r.id)),
        eng ? chalk.dim(formatId(eng.id)) : chalk.dim("—"),
        truncate(r.title, 30),
        role === "client" ? chalk.cyan("Client") : chalk.green("Pro"),
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
      ["Request ID", "Engagement ID", "Title", "Role", "Budget", "Req Status", "Eng Status", "Created"],
      rows,
    ));
    console.log();
    console.log(chalk.dim(`${items.length} item(s). Use ${chalk.cyan("ho checkout <id>")} to set active context.`));
    console.log();
  } catch (err) {
    spinner.fail(err.message);
  }
}

export { fetchAllWork };
