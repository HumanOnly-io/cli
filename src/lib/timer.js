import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { getTimerFile, getConfigDir } from "./config.js";
import { mkdirSync } from "fs";

export function startTimer(engagementId, description) {
  if (isTimerRunning()) throw new Error("Timer already running. Stop it first with `ho timer stop`.");
  const dir = getConfigDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const data = { engagementId, startedAt: new Date().toISOString(), description: description || "" };
  writeFileSync(getTimerFile(), JSON.stringify(data, null, 2));
  return data;
}

export function stopTimer() {
  if (!isTimerRunning()) throw new Error("No timer running.");
  const data = JSON.parse(readFileSync(getTimerFile(), "utf8"));
  const endedAt = new Date().toISOString();
  const durationMinutes = Math.max(1, Math.round((new Date(endedAt) - new Date(data.startedAt)) / 60000));
  unlinkSync(getTimerFile());
  return { ...data, endedAt, durationMinutes };
}

export function getTimerStatus() {
  if (!isTimerRunning()) return null;
  const data = JSON.parse(readFileSync(getTimerFile(), "utf8"));
  const elapsed = Math.floor((Date.now() - new Date(data.startedAt).getTime()) / 1000);
  return { ...data, elapsed };
}

export function isTimerRunning() {
  return existsSync(getTimerFile());
}
