import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";
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

  if (options.install) {
    // Auto-install for the detected shell
    const shell = process.env.SHELL || "";

    if (shell.includes("zsh")) {
      const dir = join(homedir(), ".zsh", "completions");
      mkdirSync(dir, { recursive: true });
      const script = readFileSync(join(__dirname, "../../completions/ho.zsh"), "utf8");
      writeFileSync(join(dir, "_ho"), script);
      console.log(chalk.green("✓") + ` Installed zsh completions to ${chalk.dim("~/.zsh/completions/_ho")}`);
      console.log();
      console.log(`  Add this to your ${chalk.dim("~/.zshrc")} if not already present:`);
      console.log();
      console.log(chalk.dim("  fpath=(~/.zsh/completions $fpath)"));
      console.log(chalk.dim("  autoload -Uz compinit && compinit"));
      console.log();
      console.log(`  Then restart your shell or run: ${chalk.cyan("exec zsh")}`);
    } else if (shell.includes("bash")) {
      const dir = join(homedir(), ".local", "share", "bash-completion", "completions");
      mkdirSync(dir, { recursive: true });
      const script = readFileSync(join(__dirname, "../../completions/ho.bash"), "utf8");
      writeFileSync(join(dir, "ho"), script);
      console.log(chalk.green("✓") + ` Installed bash completions to ${chalk.dim("~/.local/share/bash-completion/completions/ho")}`);
      console.log();
      console.log(`  Restart your shell or run: ${chalk.cyan("source ~/.bashrc")}`);
    } else {
      console.log(chalk.yellow("Could not detect shell. Use --bash or --zsh to output the script manually."));
    }
    console.log();
    return;
  }

  // Show install instructions
  console.log();
  console.log(chalk.bold("Shell Completions for HumanOnly CLI"));
  console.log();
  console.log(chalk.cyan("Quick install (auto-detects shell):"));
  console.log();
  console.log(chalk.dim("  ho completion --install"));
  console.log();
  console.log(chalk.cyan("Bash (manual):"));
  console.log(`  Add to your ${chalk.dim("~/.bashrc")}:`);
  console.log();
  console.log(chalk.dim('  eval "$(ho completion --bash)"'));
  console.log();
  console.log(chalk.cyan("Zsh (manual):"));
  console.log(`  Run:`);
  console.log();
  console.log(chalk.dim("  mkdir -p ~/.zsh/completions"));
  console.log(chalk.dim("  ho completion --zsh > ~/.zsh/completions/_ho"));
  console.log();
  console.log(`  Then add to ${chalk.dim("~/.zshrc")}:`);
  console.log();
  console.log(chalk.dim("  fpath=(~/.zsh/completions $fpath)"));
  console.log(chalk.dim("  autoload -Uz compinit && compinit"));
  console.log();
}
