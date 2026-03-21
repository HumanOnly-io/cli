import { api } from "../lib/api.js";
import { getActiveContext, readConfig } from "../lib/config.js";
import { chalk } from "../lib/format.js";
import { input } from "@inquirer/prompts";
import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from "fs";
import { tmpdir } from "os";
import { join, basename, resolve } from "path";
import { createWriteStream } from "fs";
import ignore from "ignore";
import archiver from "archiver";
import ora from "ora";

export async function pushCommand(file, options) {
  const ctx = getActiveContext();
  if (!ctx || ctx.type !== "engagement") {
    console.log("Pushing deliverables requires an active engagement. Run " + chalk.cyan("`ho checkout <id>`") + " first.");
    return;
  }

  let filePath;
  let fileName;

  if (file) {
    // Upload single file
    filePath = resolve(file);
    if (!existsSync(filePath)) {
      console.log(chalk.red("✗") + ` File not found: ${file}`);
      return;
    }
    fileName = basename(filePath);
  } else {
    // Zip current directory
    const spinner = ora("Packaging directory...").start();
    try {
      const result = await zipDirectory(process.cwd());
      filePath = result.path;
      fileName = result.name;
      spinner.succeed(`Packaged ${result.fileCount} files (${formatSize(result.size)})`);
    } catch (err) {
      spinner.fail(`Failed to package: ${err.message}`);
      return;
    }
  }

  // Prompt for metadata
  const title = await input({
    message: "Deliverable title:",
    default: file ? basename(file) : basename(process.cwd()),
  });

  const description = await input({
    message: "Description (optional):",
  });

  // Upload
  const uploadSpinner = ora("Uploading...").start();

  try {
    const config = readConfig();
    const baseUrl = config.apiUrl || "https://humanonly.io/api/v1";

    const formData = new FormData();
    const fileBuffer = readFileSync(filePath);
    const blob = new Blob([fileBuffer]);
    formData.append("file", blob, fileName);
    formData.append("title", title);
    if (description) formData.append("description", description);
    if (options.final) formData.append("isFinal", "true");

    const res = await fetch(`${baseUrl}/engagements/${ctx.id}/deliverables`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error?.message || `Upload failed (${res.status})`);
    }

    uploadSpinner.succeed(`Deliverable uploaded: ${chalk.bold(title)}` + (options.final ? chalk.yellow(" [FINAL]") : ""));
  } catch (err) {
    uploadSpinner.fail(err.message);
  }
}

async function zipDirectory(dir) {
  const ig = ignore();

  // Load ignore patterns
  const hoignorePath = join(dir, ".hoignore");
  const gitignorePath = join(dir, ".gitignore");

  if (existsSync(hoignorePath)) {
    ig.add(readFileSync(hoignorePath, "utf8"));
  } else if (existsSync(gitignorePath)) {
    ig.add(readFileSync(gitignorePath, "utf8"));
  }

  // Always exclude these
  ig.add(["node_modules", ".git", ".env*", "*.log", ".DS_Store", "__pycache__", ".hoignore"]);

  const zipName = basename(dir) + ".zip";
  const zipPath = join(tmpdir(), `ho-${Date.now()}-${zipName}`);

  return new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    let fileCount = 0;

    output.on("close", () => {
      resolve({
        path: zipPath,
        name: zipName,
        fileCount,
        size: archive.pointer(),
      });
    });

    archive.on("error", reject);
    archive.pipe(output);

    // Walk directory and add files
    function walk(currentDir, rel) {
      const entries = readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const relPath = rel ? `${rel}/${entry.name}` : entry.name;
        if (ig.ignores(relPath)) continue;

        const fullPath = join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath, relPath);
        } else if (entry.isFile()) {
          archive.file(fullPath, { name: relPath });
          fileCount++;
        }
      }
    }

    walk(dir, "");
    archive.finalize();
  });
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
