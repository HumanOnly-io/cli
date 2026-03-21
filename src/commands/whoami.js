import { readConfig } from "../lib/config.js";
import { api } from "../lib/api.js";
import { chalk } from "../lib/format.js";
import ora from "ora";

export async function whoamiCommand() {
  const config = readConfig();
  if (!config.token) {
    console.log("Not logged in. Run " + chalk.cyan("`ho login`") + " to authenticate.");
    return;
  }

  const spinner = ora("Fetching profile...").start();
  try {
    const user = await api("/auth/me");
    spinner.stop();
    console.log();
    console.log(chalk.bold(user.name || "Unknown"));
    console.log(chalk.dim(user.email));
    console.log(chalk.dim(`Roles: ${(user.roles || []).join(", ")}`));
    if (user.proProfileId) console.log(chalk.green("✓") + " Pro profile active");
    console.log();
  } catch (err) {
    spinner.fail(err.message);
  }
}
