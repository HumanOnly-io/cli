import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_DIR = join(homedir(), ".config", "humanonly");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");
const TIMER_FILE = join(CONFIG_DIR, "timer.json");

function ensureDir() {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
}

export function readConfig() {
  try { return JSON.parse(readFileSync(CONFIG_FILE, "utf8")); } catch { return {}; }
}

export function writeConfig(data) {
  ensureDir();
  const existing = readConfig();
  writeFileSync(CONFIG_FILE, JSON.stringify({ ...existing, ...data }, null, 2));
}

export function clearConfig() {
  try { unlinkSync(CONFIG_FILE); } catch {}
}

export function getToken() { return readConfig().token || null; }
export function getActiveContext() { return readConfig().activeContext || null; }

export function setActiveContext(ctx) { writeConfig({ activeContext: ctx }); }

export function getTimerFile() { return TIMER_FILE; }
export function getConfigDir() { return CONFIG_DIR; }
