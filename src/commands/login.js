import http from "http";
import open from "open";
import ora from "ora";
import { writeConfig } from "../lib/config.js";
import { api } from "../lib/api.js";
import { chalk } from "../lib/format.js";

export async function loginCommand(options) {
  if (options.token) {
    // Token-based login
    writeConfig({ token: options.token });
    const spinner = ora("Validating token...").start();
    try {
      const user = await api("/auth/me");
      writeConfig({ token: options.token, user: { id: user.id, name: user.name, email: user.email } });
      spinner.succeed(`Logged in as ${chalk.bold(user.name)} (${user.email})`);
    } catch (err) {
      spinner.fail(err.message);
      process.exit(1);
    }
    return;
  }

  // Browser-based login
  return new Promise((resolve) => {
    let spinner = ora("Starting...").start();
    const server = http.createServer((req, res) => {
      if (req.method === "POST" && req.url === "/callback") {
        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", () => {
          res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
          res.end(JSON.stringify({ ok: true }));

          try {
            const data = JSON.parse(body);
            writeConfig({ token: data.token, user: data.user });
            spinner.succeed(`Logged in as ${chalk.bold(data.user?.name || "unknown")} (${data.user?.email || ""})`);
          } catch {
            spinner.fail("Failed to process authentication response.");
          }

          server.close();
          resolve();
        });
        return;
      }

      // Handle CORS preflight
      if (req.method === "OPTIONS") {
        res.writeHead(200, {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        });
        res.end();
        return;
      }

      res.writeHead(404);
      res.end();
    });

    server.listen(0, async () => {
      const port = server.address().port;
      spinner.text = "Opening browser...";

      try {
        await open(`https://humanonly.io/cli-auth?port=${port}`);
        spinner.text = "Waiting for authentication in browser...";
      } catch {
        spinner.fail("Failed to open browser. Use `ho login --token <key>` instead.");
        server.close();
        resolve();
      }

      // Timeout after 5 minutes
      setTimeout(() => {
        if (server.listening) {
          spinner.fail("Authentication timed out.");
          server.close();
          resolve();
        }
      }, 5 * 60 * 1000);
    });
  });
}
