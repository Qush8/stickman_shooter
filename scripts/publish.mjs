// Publish wrapper: bordiko/cli omits `realtime` from the manifest, so production
// hosts never arm the tick loop even when package.json declares it.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, extname } from "node:path";

const IMG = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

const projectDir = resolve(import.meta.dirname, "..");
const REGISTRY = process.env.REGISTRY || "https://api.bordiko.com/api";
const TOKEN = process.env.ADMIN_TOKEN || "";

const pkg = JSON.parse(readFileSync(resolve(projectDir, "package.json"), "utf8"));
const meta = pkg.bordiko;
if (!meta?.gameId) throw new Error(`package.json has no "bordiko.gameId"`);

const wasmPath = resolve(projectDir, "dist", `${meta.gameId}.wasm`);
if (!existsSync(wasmPath)) throw new Error(`missing ${wasmPath} — run \`npm run build\` first`);
const wasm = readFileSync(wasmPath);

const assets = {};
const assetsDir = resolve(projectDir, "assets");
if (existsSync(assetsDir)) {
  for (const f of readdirSync(assetsDir)) {
    if (IMG.has(extname(f).toLowerCase())) {
      assets[f] = readFileSync(resolve(assetsDir, f)).toString("base64");
    }
  }
}
const assetCount = Object.keys(assets).length;

const uiPath = resolve(projectDir, "ui.html");
const ui = existsSync(uiPath) ? readFileSync(uiPath, "utf8") : "";

const sha = createHash("sha256").update(wasm).digest("hex");
const manifest = {
  schema: 1,
  gameId: meta.gameId,
  version: pkg.version || "0.0.1",
  displayName: meta.displayName || meta.gameId,
  players: { min: meta.minPlayers ?? 2, max: meta.maxPlayers ?? 2 },
  board: meta.board || "custom",
  artifacts: { wasm: sha, ui: ui ? "ui.html" : "" },
};

if (meta.realtime?.tick) {
  manifest.realtime = {
    tick: true,
    tickRate: meta.realtime.tickRate ?? 30,
  };
}

process.stderr.write(
  `▸ publishing ${manifest.gameId}@${manifest.version} (${wasm.length} bytes` +
    `${assetCount ? `, ${assetCount} assets` : ""}${ui ? ", +ui" : ""}` +
    `${manifest.realtime ? `, realtime@${manifest.realtime.tickRate}Hz` : ""}) → ${REGISTRY}\n`,
);

const res = await fetch(`${REGISTRY}/publish`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    ...(TOKEN ? { "x-admin-token": TOKEN } : {}),
  },
  body: JSON.stringify({
    manifest,
    wasm: wasm.toString("base64"),
    ...(assetCount ? { assets } : {}),
    ...(ui ? { ui } : {}),
  }),
});

const body = await res.json().catch(() => ({}));
if (!res.ok) {
  throw new Error(`publish failed (${res.status}): ${body.error ?? ""} ${body.message ?? ""}`.trim());
}

process.stderr.write(`✓ ${body.gameId}@${body.version} is ${body.status}\n`);
