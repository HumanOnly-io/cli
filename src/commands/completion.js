import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { chalk } from "../lib/format.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function completionCommand(options) {
  if (options.bash) {
    const script = readFileSync(join(__dirname, "../../completions/ho.bash"), "utf8");
    console.log(script);
    return;
  }

  if (options.zsh) {
    const script = readFileSync(join(__dirname, "../../completions/ho.zsh"), "utf8");
    console.log(script);
    return;
  }

  // Show install instructions
  console.log();
  console.log(chalk.bold("Shell Completions for HumanOnly CLI"));
  console.log();
  console.log(chalk.cyan("Bash:"));
  console.log(`  Add to your ${chalk.dim("~/.bashrc")} or ${chalk.dim("~/.bash_profile")}:`);
  console.log();
  console.log(chalk.dim('  eval "$(ho completion --bash)"'));
  console.log();
  console.log(chalk.cyan("Zsh:"));
  console.log(`  Add to your ${chalk.dim("~/.zshrc")}:`);
  console.log();
  console.log(chalk.dim('  eval "$(ho completion --zsh)"'));
  console.log();
  console.log(`  Or copy the completion file to your fpath:`);
  console.log();
  console.log(chalk.dim("  ho completion --zsh > ~/.zsh/completions/_ho"));
  console.log();
}
