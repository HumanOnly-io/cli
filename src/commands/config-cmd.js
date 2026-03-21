import { readConfig, writeConfig, getActiveContext } from "../lib/config.js";
import { chalk } from "../lib/format.js";

export function configShowCommand() {
  const config = readConfig();
  const ctx = getActiveContext();

  console.log();
  console.log(chalk.bold("HumanOnly CLI Config"));
  console.log(chalk.dim("─".repeat(30)));
  console.log();

  const label = (l, v) => console.log(`  ${chalk.dim(l.padEnd(16))} ${v}`);

  label("API URL:", config.apiUrl || "https://humanonly.io/api/v1");
  label("Auth:", config.token ? chalk.green("✓ logged in") + chalk.dim(` (${maskToken(config.token)})`) : chalk.red("not logged in"));
  if (config.user?.name) label("User:", config.user.name);

  if (ctx) {
    label("Context:", `${ctx.type} — ${ctx.title || ctx.id}`);
  } else {
    label("Context:", chalk.dim("none"));
  }

  console.log();
}

export function configSetCommand(key, value) {
  const allowed = ["apiUrl"];

  if (!allowed.includes(key)) {
    console.log(chalk.red("✗") + ` Unknown config key: ${key}`);
    console.log(chalk.dim(`  Allowed keys: ${allowed.join(", ")}`));
    return;
  }

  writeConfig({ [key]: value });
  console.log(chalk.green("✓") + ` Set ${key} = ${value}`);
}

function maskToken(token) {
  if (!token) return "";
  if (token.length <= 8) return "****";
  return token.slice(0, 4) + "…" + token.slice(-4);
}
