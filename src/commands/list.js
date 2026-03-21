import { requestsCommand } from "./requests.js";
import { engagementsCommand } from "./engagements.js";
import { chalk } from "../lib/format.js";

export async function listCommand(options) {
  console.log();
  console.log(chalk.bold("Your Engagements"));
  console.log(chalk.dim("─".repeat(50)));
  await engagementsCommand(options);

  console.log(chalk.bold("Your Requests"));
  console.log(chalk.dim("─".repeat(50)));
  await requestsCommand(options);
}
