import { clearConfig } from "../lib/config.js";
import { chalk } from "../lib/format.js";

export function logoutCommand() {
  clearConfig();
  console.log(chalk.green("✓") + " Logged out.");
}
