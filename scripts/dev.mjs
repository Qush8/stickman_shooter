// `bordiko dev` — the local sandbox. Loads the game straight from TypeScript (no
// build, no services) and serves a browser harness: play every seat, fill seats
// with bots (step/auto), hot-reload on save, preview a custom ui.html, and
// inspect the redacted per-seat state.
//
// The engine API is resolved from the USER's @bordiko/sdk so the game and the
// server share ONE module instance (INVALID_MOVE is a Symbol — a second copy
// would break move rejection).

import { createServer } from "node:http";
import { readFileSync, existsSync, watch as fsWatch } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const bordikoCliDir = fileURLToPath(new URL("../node_modules/@bordiko/cli/src/", import.meta.url));

export async function startDev(projectDir, { port = 5178 } = {}) {
  // Resolve @bordiko/sdk from the project (same instance the game imports).
  const require = createRequire(pathToFileURL(join(projectDir, "package.json")));
  let sdkPath;
  try {
    sdkPath = require.resolve("@bordiko/sdk");
  } catch {
    throw new Error("@bordiko/sdk is not installed here — run `npm install` first");
  }
  const sdk = await import(pathToFileURL(sdkPath).href);
  const { createMatch, applyMove, getPlayerView, enumerateMovesFor, Rng, seedFromString } = sdk;

  const pkg = JSON.parse(readFileSync(join(projectDir, "package.json"), "utf8"));
  const meta = pkg.bordiko ?? {};
  const entryPath = join(projectDir, "src", "game.ts");
  if (!existsSync(entryPath)) throw new Error(`no src/game.ts in ${projectDir}`);
  const uiPath = join(projectDir, "ui.html");
  const hasUI = existsSync(uiPath);

  const pickDef = (mod) => {
    for (const c of [mod.default, ...Object.values(mod)]) {
      if (c && typeof c === "object" && typeof c.setup === "function" && c.moves) return c;
    }
    return null;
  };
  const loadDef = async () => {
    const mod = await import(pathToFileURL(entryPath).href + "?t=" + Date.now());
    const d = pickDef(mod);
    if (!d) throw new Error("no game found — src/game.ts must default-export a defineGame(...) result");
    return d;
  };

  let def = await loadDef();
  let SEED = "sandbox";
  const clampSeats = (n) => Math.min(Math.max(n, def.minPlayers ?? 2), def.maxPlayers ?? Math.max(def.minPlayers ?? 2, n));
  let seatCount = clampSeats(meta.minPlayers || def.minPlayers || 2);
  let gameMode = "ffa";
  let seats = [];
  let state = null;
  let history = [];
  let auto = false;
  let botTimer = null;

  const makeSeats = (n, prev) =>
    Array.from({ length: n }, (_, i) => {
      const id = "p" + (i + 1);
      const was = prev?.find((s) => s.id === id);
      return { id, name: "Player " + (i + 1), bot: was ? was.bot : i !== 0 };
    });
  let tickTimer = null;
  const startTick = () => {
    if (tickTimer) clearInterval(tickTimer);
    if (meta.realtime?.tick && def.tick) {
      const rate = meta.realtime.tickRate || 30;
      const ms = 1000 / rate;
      let tickCount = 0;
      tickTimer = setInterval(() => {
        if (!state || state.ended) return;
        tickCount++;
        const rng = new Rng(seedFromString(`${SEED}:tick:${tickCount}`));
        const ctx = {
          playerId: state.flow.currentPlayer,
          random: {
            float: () => rng.next(),
            int: (min, max) => Math.floor(rng.next() * (max - min + 1)) + min,
            bool: (p = 0.5) => rng.next() < p,
            pick: (arr) => arr[Math.floor(rng.next() * arr.length)],
            shuffle: (arr) => arr.slice().sort(() => rng.next() - 0.5),
          },
          events: {
            endGame: (result) => { state.ended = true; state.result = result; },
          },
        };
        def.tick(state.G, ms, ctx);
        if (def.endIf) {
          const res = def.endIf(state.G, state.flow);
          if (res) { state.ended = true; state.result = res; }
        }
        broadcast();
      }, ms);
    }
  };

  const newMatch = ({ reseed } = {}) => {
    if (gameMode === "teams2v2") seatCount = 4;
    seatCount = clampSeats(seatCount);
    seats = makeSeats(seatCount, seats);
    if (reseed) SEED = "sandbox-" + Math.abs(history.length * 2654435761 % 1e6).toString(36);
    state = createMatch(def, {
      players: seats.map((s) => s.id),
      seed: SEED,
      config: { mode: gameMode },
    });
    history = [];
    startTick();
  };
  const actorSet = () => (state.flow.active?.length ? state.flow.active.slice() : [state.flow.currentPlayer]);

  const botMoveFor = (seat) => {
    const opts = enumerateMovesFor(def, state, seat);
    if (!opts.length) return null;
    const rng = new Rng(seedFromString(`${SEED}:bot:${seat}:${state.log.length}`));
    const c = opts[Math.floor(rng.next() * opts.length)];
    return { type: c.type, payload: c.payload, playerId: seat };
  };
  const botSeatToAct = () => (state.ended ? null : actorSet().find((s) => seats.find((x) => x.id === s)?.bot) ?? null);
  const applyAndLog = (mv) => {
    const res = applyMove(def, state, mv);
    if (!res.ok) return res;
    state = res.state;
    history.push({ n: history.length + 1, seat: mv.playerId, type: mv.type, payload: mv.payload, events: res.events ?? [] });
    if (history.length > 120) history = history.slice(-120);
    broadcast();
    return res;
  };
  const stepBot = () => {
    const seat = botSeatToAct();
    if (!seat) return false;
    const mv = botMoveFor(seat);
    return mv ? !!applyAndLog(mv).ok : false;
  };
  const scheduleBots = () => {
    if (botTimer || !auto || !botSeatToAct()) return;
    botTimer = setTimeout(() => { botTimer = null; stepBot(); if (auto) scheduleBots(); }, 650);
  };

  // ---- transport (SSE per-seat + POST actions) ----
  const clients = new Set();
  const seatView = (seat) => {
    const v = getPlayerView(def, state, seat);
    const canAct = actorSet().includes(seat) && !state.ended;
    return { seat, yourTurn: canAct, legalMoves: canAct ? enumerateMovesFor(def, state, seat) : [], view: v };
  };
  const envelope = (seat) => ({
    type: "state",
    meta: { gameId: meta.gameId ?? def.name, displayName: meta.displayName ?? def.name, minPlayers: def.minPlayers, maxPlayers: def.maxPlayers, hasUI },
    gameMode,
    seats: seats.map((s) => ({ id: s.id, name: s.name, bot: s.bot })),
    names: Object.fromEntries(seats.map((s) => [s.id, s.name])),
    seed: SEED, auto, actor: actorSet(), history, ...seatView(seat),
  });
  const writeState = (c) => { try { c.res.write(`event: state\ndata: ${JSON.stringify(envelope(c.seat))}\n\n`); } catch { /* gone */ } };
  const broadcast = () => { for (const c of clients) writeState(c); };
  const notice = (msg, kind = "info") => { for (const c of clients) { try { c.res.write(`event: notice\ndata: ${JSON.stringify({ kind, msg })}\n\n`); } catch { /* gone */ } } };

  const handleAction = (body, seatQ) => {
    const seat = body.seat || seatQ;
    switch (body.kind) {
      case "move": { const r = applyAndLog({ type: body.type, payload: body.payload, playerId: seat }); if (auto) scheduleBots(); return r.ok ? { ok: true } : { ok: false, error: r.error }; }
      case "setBot": { const s = seats.find((x) => x.id === body.seat); if (s) s.bot = !!body.bot; broadcast(); if (auto) scheduleBots(); return { ok: true }; }
      case "auto": { auto = !!body.on; if (auto) scheduleBots(); broadcast(); return { ok: true }; }
      case "step": return { ok: true, stepped: stepBot() };
      case "reset": { newMatch({ reseed: !!body.reseed }); notice("Match reset.", "info"); broadcast(); if (auto) scheduleBots(); return { ok: true }; }
      case "seats": {
        if (gameMode === "teams2v2") return { ok: false, error: "2v2 requires exactly 4 seats" };
        seatCount = clampSeats(Number(body.count) || seatCount);
        newMatch({});
        notice(`Table set to ${seatCount} seats.`);
        broadcast();
        return { ok: true };
      }
      case "mode": {
        const next = body.mode === "teams2v2" ? "teams2v2" : "ffa";
        gameMode = next;
        if (gameMode === "teams2v2") seatCount = 4;
        newMatch({});
        notice(`Mode: ${gameMode === "teams2v2" ? "2v2" : "FFA"}`);
        broadcast();
        return { ok: true };
      }
      default: return { ok: false, error: "unknown action" };
    }
  };

  // ---- hot reload ----
  let reloadTimer = null;
  const reload = async () => {
    try { 
      if (tickTimer) clearInterval(tickTimer);
      def = await loadDef(); 
      newMatch({}); 
      notice("Reloaded — match restarted.", "reload"); 
      broadcast(); 
      if (auto) scheduleBots(); 
    }
    catch (e) { notice("Reload failed: " + (e?.message ?? e), "error"); }
  };
  try { const w = fsWatch(join(projectDir, "src"), { recursive: true }, () => { clearTimeout(reloadTimer); reloadTimer = setTimeout(reload, 160); }); w.on("error", () => {}); }
  catch { const w2 = fsWatch(entryPath, () => { clearTimeout(reloadTimer); reloadTimer = setTimeout(reload, 160); }); w2.on("error", () => {}); }

  // ---- http ----
  const localHarness = join(projectDir, "dev-harness.html");
  const HARNESS = existsSync(localHarness)
    ? readFileSync(localHarness, "utf8")
    : readFileSync(join(bordikoCliDir, "harness.html"), "utf8");
  const SANDBOX_CSP = "default-src 'none'; script-src 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'unsafe-inline'; img-src https: data:; font-src data: https:; connect-src 'none'; base-uri 'none'; form-action 'none'";
  const send = (res, code, type, body, headers = {}) => { res.writeHead(code, { "content-type": type, "cache-control": "no-store", ...headers }); res.end(body); };

  newMatch({});
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/" || url.pathname === "/index.html") return send(res, 200, "text/html; charset=utf-8", HARNESS);
    if (url.pathname === "/ui") {
      if (!hasUI) return send(res, 404, "text/plain", "no ui.html");
      return send(res, 200, "text/html; charset=utf-8", readFileSync(uiPath, "utf8"), { "content-security-policy": SANDBOX_CSP });
    }
    if (url.pathname === "/events") {
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" });
      const client = { res, seat: url.searchParams.get("seat") || seats[0]?.id || "p1" };
      clients.add(client);
      writeState(client);
      const ping = setInterval(() => { try { res.write(": ping\n\n"); } catch { /* gone */ } }, 25000);
      req.on("close", () => { clearInterval(ping); clients.delete(client); });
      return;
    }
    if (url.pathname === "/action" && req.method === "POST") {
      let raw = "";
      req.on("data", (c) => { raw += c; if (raw.length > 1e6) req.destroy(); });
      req.on("end", () => { let b; try { b = raw ? JSON.parse(raw) : {}; } catch { return send(res, 400, "application/json", '{"ok":false}'); } send(res, 200, "application/json", JSON.stringify(handleAction(b, url.searchParams.get("seat")))); });
      return;
    }
    send(res, 404, "text/plain", "not found");
  });

  await new Promise((resolve) => server.listen(port, resolve));
  process.stdout.write(`\n  Bordiko sandbox — ${meta.displayName ?? def.name}\n  mode: ${gameMode}   seats: ${seatCount}${hasUI ? "   ui.html: yes" : ""}\n  open:  http://localhost:${port}\n\n`);
}

const portFlag = process.argv.indexOf("--port");
const port = portFlag >= 0 ? Number(process.argv[portFlag + 1]) || 5178 : 5178;
await startDev(process.cwd(), { port });
