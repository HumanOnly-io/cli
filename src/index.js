import { Command } from "commander";
import { loginCommand } from "./commands/login.js";
import { logoutCommand } from "./commands/logout.js";
import { whoamiCommand } from "./commands/whoami.js";
import { marketplaceCommand } from "./commands/marketplace.js";
import { viewCommand } from "./commands/view.js";
import { checkoutCommand } from "./commands/checkout.js";
import { statusCommand } from "./commands/status.js";
import { timerStartCommand, timerStopCommand, timerStatusCommand } from "./commands/timer-cmd.js";
import { logCommand } from "./commands/log.js";
import { pushCommand } from "./commands/push.js";
import { meetingsCommand } from "./commands/meetings.js";
import { statsCommand } from "./commands/stats.js";
import { configShowCommand, configSetCommand } from "./commands/config-cmd.js";
import { engagementsCommand } from "./commands/engagements.js";
import { requestsCommand } from "./commands/requests.js";
import { listCommand } from "./commands/list.js";

const program = new Command();

program
  .name("ho")
  .description("HumanOnly CLI — manage your pro workflow from the terminal")
  .version("0.1.0");

// Auth
program
  .command("login")
  .description("Authenticate with HumanOnly")
  .option("--token <key>", "Login with an API token")
  .action(loginCommand);

program
  .command("logout")
  .description("Log out and clear credentials")
  .action(logoutCommand);

program
  .command("whoami")
  .description("Show current logged-in user")
  .action(whoamiCommand);

// Marketplace
program
  .command("marketplace")
  .description("Browse open requests")
  .option("--popular", "Sort by popularity")
  .option("--search <query>", "Search by keyword")
  .option("--space <slug>", "Filter by space")
  .option("--limit <n>", "Limit results", "20")
  .action(marketplaceCommand);

program
  .command("view <id>")
  .description("View request details")
  .option("--verbose", "Show full description")
  .action(viewCommand);

// Context
program
  .command("checkout <id>")
  .description("Set active context (request or engagement)")
  .action(checkoutCommand);

program
  .command("use <id>")
  .description("Set active context (alias for checkout)")
  .action(checkoutCommand);

program
  .command("list")
  .description("List your engagements and requests")
  .action(listCommand);

program
  .command("engagements")
  .description("List your active engagements")
  .option("--status <status>", "Filter by status (ACTIVE, COMPLETED, CANCELLED, DISPUTED)")
  .action(engagementsCommand);

program
  .command("requests")
  .description("List your requests")
  .action(requestsCommand);

program
  .command("status")
  .description("Show current context status")
  .action(statusCommand);

// Timer
const timerCmd = program.command("timer").description("Time tracking");

timerCmd
  .command("start [description...]")
  .description("Start timer")
  .action((desc) => timerStartCommand(desc?.join(" ")));

timerCmd
  .command("stop")
  .description("Stop timer")
  .action(timerStopCommand);

timerCmd
  .command("status")
  .description("Show timer status")
  .action(timerStatusCommand);

// Time logging
program
  .command("log <duration> [description...]")
  .description("Log time manually")
  .action((dur, desc) => logCommand(dur, desc?.join(" ")));

// Deliverables
program
  .command("push [file]")
  .description("Push deliverable")
  .option("--final", "Mark as final deliverable")
  .action(pushCommand);

// Meetings
program
  .command("meetings")
  .description("View upcoming meetings")
  .action(meetingsCommand);

// Stats
program
  .command("stats")
  .description("View your stats")
  .option("--earnings", "Show earnings detail")
  .option("--month", "Show this month")
  .action(statsCommand);

// Config
const configCmd = program
  .command("config")
  .description("Manage CLI config")
  .action(configShowCommand);

configCmd
  .command("set <key> <value>")
  .description("Set a config value")
  .action(configSetCommand);

program.parse();
