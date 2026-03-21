import { api } from "../lib/api.js";
import { setActiveContext } from "../lib/config.js";
import { chalk } from "../lib/format.js";
import { input, select } from "@inquirer/prompts";
import ora from "ora";

export async function checkoutCommand(id) {
  const spinner = ora("Loading...").start();

  let request = null;
  let engagement = null;

  // Try as request ID first
  try {
    request = await api(`/requests/${id}`);
  } catch {
    // Not a request — might be an engagement ID
    // Search user's requests to find one with this engagement ID
    try {
      const myRequests = await api("/requests?mine=true&limit=50");
      const list = Array.isArray(myRequests) ? myRequests : myRequests?.data || [];
      const match = list.find((r) => r.engagement?.id === id);
      if (match) {
        request = match;
      } else {
        spinner.fail("Resource not found.");
        return;
      }
    } catch {
      spinner.fail("Resource not found.");
      return;
    }
  }

  spinner.stop();

  if (engagement) {
    setActiveContext({ id: engagement.id, type: "engagement", title: engagement.title || engagement.request?.title || "Engagement" });
    console.log(chalk.green("✓") + ` Checked out engagement: ${chalk.bold(engagement.title || engagement.request?.title || id)}`);
    return;
  }

  // We have a request
  if (request.engagement) {
    // User has an engagement on this request
    setActiveContext({ id: request.engagement.id, type: "engagement", title: request.title });
    console.log(chalk.green("✓") + ` Checked out engagement on: ${chalk.bold(request.title)}`);
    return;
  }

  // Set context to request
  setActiveContext({ id: request.id, type: "request", title: request.title });
  console.log(chalk.green("✓") + ` Checked out request: ${chalk.bold(request.title)}`);

  // Offer to bid
  console.log();
  const wantBid = await select({
    message: "Would you like to place a bid?",
    choices: [
      { name: "Yes", value: true },
      { name: "No", value: false },
    ],
  });

  if (!wantBid) return;

  const bidType = await select({
    message: "Bid type:",
    choices: [
      { name: "Hourly", value: "HOURLY" },
      { name: "Fixed", value: "FIXED" },
    ],
  });

  const amountStr = await input({
    message: bidType === "HOURLY" ? "Hourly rate (USD):" : "Fixed amount (USD):",
    validate: (v) => (!isNaN(parseFloat(v)) && parseFloat(v) > 0) || "Enter a valid amount",
  });

  const message = await input({
    message: "Message (optional):",
  });

  const bidSpinner = ora("Submitting bid...").start();

  try {
    const bidData = {
      type: bidType,
      amount: Math.round(parseFloat(amountStr) * 100), // Convert to cents
    };
    if (message) bidData.message = message;

    await api(`/requests/${id}/bids`, { method: "POST", body: bidData });
    bidSpinner.succeed("Bid submitted!");
  } catch (err) {
    bidSpinner.fail(err.message);
  }
}
