Real-time games : 
Real-time games
Most Bordiko games are turn-based — the world only changes when someone moves. A real-timegame keeps moving on its own: platforms slide, projectiles fly, and both players act at once. You opt in with one manifest flag and one extra reducer function; everything else — sandbox, matchmaking, chat, reconnection — is identical.

How it works
When your game is real-time, the host runs a fixed-rate clock: while a match is being watched, it calls your tick(G, dt) that many times per second to advance the world. Players don't take turns — everyone can send input at any moment, and the clock integrates it. The clock stops when the room empties or the match ends.

1. The tick handler
Add tick to your definition. dt is the fixed timestep in milliseconds (from your declared rate) — never a wall-clock delta, so replays stay byte-identical.

interface TickContext {
  dt: number;                                 // fixed timestep (ms) = 1000 / tickRate
  random: RandomAPI;                          // seeded — shared with moves
  emit: (type: string, data?: Json) => void;  // UI/animation events
  endGame: (result: GameResult) => void;      // e.g. a player was pushed out
}

tick: (G, dt, ctx) => {
  const step = dt / 1000;                     // seconds
  for (const b of G.bodies) {                 // step your physics by the FIXED step
    b.x += b.vx * step;
    b.y += b.vy * step;
  }
}
2. Buffer input, integrate it in tick
The real-time convention: a move only records a player's intent into the state; tickreads it and advances the sim. This keeps input and simulation cleanly separated and fully deterministic. Seed initialActive with every seat so all players can act at once.

initialActive: (G) => G.bodies.map((b) => b.id),   // everyone active — no turns

moves: {
  // Records the held thrust direction; does NOT move anything itself.
  input: (G, payload, ctx) => {
    const b = G.bodies.find((x) => x.id === ctx.playerId);
    if (!b) return INVALID_MOVE;
    b.ax = clampUnit((payload as any).ax);
    b.ay = clampUnit((payload as any).ay);
  },
},
3. Declare it in the manifest
"bordiko": {
  "gameId": "sumo",
  "displayName": "Sumo",
  "minPlayers": 2, "maxPlayers": 2,
  "board": "custom",
  "realtime": { "tick": true, "tickRate": 15 }   // ticks per second, max 30
}
4. A UI that interpolates
Snapshots arrive from the tick clock; your UI runs at monitor rate and smooths between them. Subscribe with the same bridge from Rendering, send input moves, and ease toward the latest snapshot inside your frame loop, not inside the state handler — so how fast you converge depends on your frame time, not on when packets happen to land:

import { connectBordiko } from "@bordiko/sdk/ui";   // >= 0.4.0
const host = connectBordiko();

let latest = null;
host.onState((s) => { latest = s; });   // just record it — never animate in here

// hold a key -> send the thrust vector once, on change
function onInput(ax, ay) { host.move("input", { ax, ay }); }

const expLerp = (rate, dt) => 1 - Math.exp(-rate * dt);   // frame-rate independent
const render = {};                                        // id -> drawn position

let prev = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - prev) / 1000, 0.1);   // clamp: tab wake-ups are huge
  prev = now;
  if (!latest) return;
  const k = expLerp(12, dt);                       // 12 /s ~ catch up in a tenth of a second
  for (const b of latest.G.bodies) {
    const r = (render[b.id] ??= { x: b.x, y: b.y });
    r.x += (b.x - r.x) * k;
    r.y += (b.y - r.y) * k;
    draw(r);
  }
}
requestAnimationFrame(frame);
Heads up
Never ease by a fixed fraction per frame (x += (target - x) * 0.2). It converges twice as fast on a 120 Hz display as on a 60 Hz one and crawls in a throttled background tab — your game literally feels different per monitor. The exponential form above is the fix. Easing per snapshot has the same bug against the network instead of the display.
Fullscreen is one line — a sandboxed UI can't call the Fullscreen API itself, so ask the host: connectBordiko().fullscreen() (or post { t: "bordiko:fullscreen" }).

5. Prediction — drawing ahead of the server
The snapshot you're rendering is always at least one network trip old, so a UI that draws exactly what the server last said feels late on every input. Prediction closes that gap: draw what you believe is true now, then correct continuously toward what the server says. The platform hands you the signals to do it without guessing (SDK ≥ 0.4.0):

state.moveCount — monotonic counter of everything applied, moves and ticks.
state.serverTs — the server's wall clock (unix ms) when the snapshot was built.
state.tick — ticks the clock has actually delivered (real-time games only).
host.move(...) returns an id; host.onAck(cb) delivers the server's verdict for it.
host.onEvent(cb) — one-shot ctx.emit(...) signals, precise for confirming a predicted action.
Has the server seen my input yet?
Ask, don't guess. Every accepted move gets a verdict carrying the moveCount it landed at — so every snapshot at or past that number already includes its effect:

const id = host.move("input", { jumping: true });
let jumpAppliedAt = null;

host.onAck((ack) => {
  if (ack.id !== id) return;
  if (!ack.ok) rollBackJump();            // rejected — undo the prediction NOW
  else jumpAppliedAt = ack.moveCount;     // accepted, applied at this counter
});

host.onState((s) => {
  // From here the server's own `grounded` is trustworthy: the jump is in it.
  if (jumpAppliedAt && s.moveCount >= jumpAppliedAt) jumpAppliedAt = null;
});
That replaces the pattern of "ignore the server for ~120 ms and hope". Use it for anything you predict that the server can reject — jumps, dashes, firing, anything gated on a condition it checks.

Measure the real rate — it is not the one you declared
The host clock drops ticks rather than queueing them when a tick costs more than its interval, so a game that declared tickRate: 30 may be delivering 22. tick and serverTs let you see that instead of blaming the network:

let last = null, rate = 0;
host.onState((s) => {
  if (last && s.tick > last.tick) rate = ((s.tick - last.tick) * 1000) / (s.serverTs - last.serverTs);
  last = { tick: s.tick, serverTs: s.serverTs };
});
// `rate` is your REAL simulation rate. Well under your declared tickRate means your
// reducer is too slow per tick — no amount of client tuning fixes that.
Note
Your snapshot rate is not your tick rate, and snapshots do not arrive evenly. Sending input more often does not earn you more of them either — a real-time input move no longer forces a broadcast of its own; the tick clock fans state out on its own schedule, which is what keeps a busy room cheap. (A move that ends the match still broadcasts at once, and emitted events are always relayed immediately.) Size a prediction lead against measured round-trip time via serverTs, never against a hard-coded number of ticks.
The rules that hold up in shipped games
Predict only what is deterministic from local input. Movement from held keys: yes. Gravity, collisions, knockback, anything a physics solver resolves: no — delegate it and interpolate the result.
Reconcile every frame, continuously — one combined step, renderX += velocity * dt + (serverX - renderX) * expLerp(rate, dt).
Judge each axis on its own error. A 2D Math.hypot(dx, dy) > SNAP test lets error on the axis you delegated to the server teleport the axis you predicted — players read it as a sideways yank while running.
Snap only on teleports. Put the hard-snap threshold at respawn/round-reset distances. If it fires in ordinary play, raise the reconcile rate rather than lowering the threshold.
Handle input before deriving flags from it. Capturing "am I on the ground?" before the jump input makes the jump frame run the grounded branch and cancel its own takeoff.
Never write predicted state back to the server. Prediction is display-only; the reducer stays the single source of truth.
Don't mirror constants. Duplicating speed/gravity/scale in reducer and UI means a WASM update without a matching ui.html drifts silently, and it looks exactly like a netcode bug. Ship shared constants in the state.
Tip
The prediction pipeline is pure arithmetic — (dt, serverPose, renderPose) -> renderPose. Pull it out of your draw code and unit-test it headlessly: an error converges to ~0, 16 ms and 8 ms frame steps converge equally over the same elapsed time, error on one axis leaves the other untouched, a teleport snaps but drift doesn't. Reducer tests catch none of this — none of it runs on the server.
Heads up
Determinism still rules. In tick, use only the fixed dt and ctx.random — never Date or Math.random(). In particular an input move must record intent, not mutate the world: a handler that sets a body's velocity directly makes the result depend on when the packet landed, so the server stops being reproducible and no client-side tuning can compensate. And because the UI runs under a no-network sandbox, it can't open its own socket: all sync flows through the host clock. PixiJS works, but import @pixi/unsafe-eval (the CSP forbids eval); plain canvas 2D needs nothing.
Tip
Two references to copy from: games/sumo — a 2-player physics duel, the smallest complete real-time game (reducer, tests, self-contained canvas UI) — and games/arena-shooter, which implements the full prediction layer above: axis-separated reconciliation, expLerp in the frame loop, and emitted events for hits and explosions.




Rendering your game
Pick the level of UI effort that fits. All three paths use the same authoritative match — you can start with buttons and upgrade later without touching your game logic.

1. Nothing — legal-move buttons
Implement enumerate and you are done. The platform turns each legal move into a typed button. Perfect for prototyping and abstract games. This is the default for any published game that ships no board schema and no custom UI.

2. A declarative board
Return a board projection from playerView and the platform draws it — seats around a table, zones of cards, progress tracks, and a prompt for the acting player. No UI code, and it is automatically per-player redacted because it comes out of playerView.

playerView: (G, playerId) => ({
  // ...your redacted state...
  board: {
    kind: "tableau",
    seats: G.players.map((p) => ({ id: p, name: p, active: p === current })),
    zones: [{ id: "discard", label: "Discard", cards: [{ face: top }] }],
    prompt: playerId === current
      ? { text: "Your turn", moves: legalMovesFor(playerId) }
      : undefined,
  },
})
You can also ship image assets (PNG/JPEG/GIF/WebP) in an assets/ folder and reference them from the schema.

3. Your own UI
Ship a single self-contained ui.html next to your game. It runs in a locked-down iframe: an opaque origin (no access to the host page, cookies, or session), a strict Content-Security-Policy with no network access at all, and no form actions. Its only channel to the world is a message bridge to the match.

The bridge (from @bordiko/sdk/ui, or inline — it is tiny):

<!-- ui.html (next to package.json) -->
<div id="app"></div>
<script type="module">
  // Receive redacted state; the host pushes it on every change.
  window.addEventListener("message", (e) => {
    if (e.data?.t !== "bordiko:state") return;
    const s = e.data.state;   // { G, legalMoves, yourTurn, names, playerId, ... }
    render(s);
  });
  // Tell the host we're ready (it replies with the first state).
  window.parent.postMessage({ t: "bordiko:ready" }, "*");

  // Propose a move — the server still validates it against your reducer.
  function play(cell) {
    window.parent.postMessage({ t: "bordiko:move", type: "place", payload: { cell } }, "*");
  }
</script>
Note
A custom UI can only propose moves. Every move goes through the same server-side reducer that validates it, so an untrusted or buggy UI can never make an illegal move stick — and the no-network sandbox means it can never exfiltrate anything.
Once your published game includes a ui.html, the catalog detects it and players get your custom UI automatically.

Chat, fullscreen & host actions
The bridge gives your UI a few more things the platform normally provides:

import { connectBordiko } from "@bordiko/sdk/ui";
const host = connectBordiko();

host.fullscreen();               // ask the host to fullscreen the game stage
host.debug("spawned", { x, y }); // send a line to the developer debug panel

// Events: react to what the reducer emitted with ctx.emit(...) — effects & sound.
host.onEvent(e => { if (e.type === "hit") spark(e.data); }); // fire-and-forget

// Moves: move() returns an id, and onAck delivers the server's verdict for it.
const id = host.move("place", { cell: 4 });
host.onAck(a => { if (a.id === id && !a.ok) undoLocally(a.reason); });

// Chat: render it INSIDE your game instead of the platform's sidebar.
host.chat("gg");                 // send a message to the table
host.onChat(m => addLine(m.name + ": " + m.text)); // receive messages
Most games ignore what move returns — the server validates every move either way. It matters when your UI draws something before the server has confirmed it: onAcktells you whether that move landed, and at which moveCount, instead of leaving you to guess with a timer. See Real-time games.

Rendering chat inside your game is own-chat mode: the platform hides its default chat sidebar (your board goes full-width) and relays table messages into your UI via onChatinstead. It's currently switched on per game on the platform side for immersive titles like arena-shooter; by default a custom UI keeps Bordiko's own chat sidebar. The fullscreen, debug and onEvent bridges above work in any custom UI.

Events — trigger effects & sound from the reducer
Your reducer can emit a UI event from any move or tick. The host relays it to your UI, where host.onEvent receives it. This is the clean way to fire a hit-spark, a sound, a screen shake, or a floating damage number — without diffing state to guess what changed.

// reducer (runs server-side, in the WASM sandbox):
hurt(target, dmg, ctx.emit);
function hurt(p, dmg, emit) { p.hp -= dmg; emit("hit", { x: p.x, z: p.z, dmg }); }
// on a rocket:  emit("blast", { x, z, r });

// your UI:
host.onEvent(e => {
  if (e.type === "hit")   floatDamage(e.data.x, e.data.z, e.data.dmg);
  if (e.type === "blast") spawnExplosion(e.data.x, e.data.z, e.data.r);
});
Tip
Events are non-authoritative. They are fire-and-forget presentation only: a UI that misses one just skips that effect, and replays and reconnection ignore them. Never drive game logic from an event — keep anything that must be true in the authoritative state G. Because they're not state, they don't bloat what every client downloads each tick. games/arena-shooter uses this exact pattern: its damage numbers and explosions are emitted, not stored.
Tip
Fullscreen is truly immersive. When a player goes fullscreen the platform hides its own chat and rating chrome, so your UI fills the screen. Anything you draw yourself — HUD, your own chat — goes with it. games/arena-shooter is a full example (3D WebGL UI, in-game chat, four weapons with area-damage rockets, HP potions, floating damage numbers, and over-head HP bars).

You build a game with defineGame from @bordiko/sdk, which validates a GameDefinition<S> (where S is your state type) and attaches display metadata. Only name, minPlayers, maxPlayers, setup, and moves are required.

import { defineGame, INVALID_MOVE } from "@bordiko/sdk";
Definition
interface GameDefinition<S> {
  name: string;              // kebab-case id
  version?: string;
  minPlayers: number;
  maxPlayers: number;

  setup: (ctx: SetupContext) => S;
  moves: Record<string, MoveHandler<S>>;

  playerView?: (G: S, playerId: string, flow: FlowState) => Json;
  endIf?:      (G: S, flow: FlowState) => GameResult | void;
  enumerate?:  (G: S, playerId: string, flow: FlowState) => MoveDescriptor[];
  bot?:        (G: S, playerId: string, flow: FlowState, random: RandomAPI) => MoveDescriptor | undefined;
  initialActive?: (G: S) => string[] | undefined;   // simultaneous opening

  tick?: (G: S, dt: number, ctx: TickContext) => void;  // real-time — see "Real-time games"
}
setup(ctx)
Builds the initial state, deterministically. The context gives you the players and seeded randomness:

interface SetupContext {
  players: string[];
  numPlayers: number;
  random: RandomAPI;     // seeded — safe for shuffles/deals
  config?: Json;         // table options chosen in the lobby (e.g. teams)
}
moves
Each move is a handler. It receives the (cloned) state, the client payload, and a context. Mutate G; return INVALID_MOVE to reject.

type MoveHandler<S> = (G: S, payload: Json, ctx: MoveContext) => void | typeof INVALID_MOVE;

interface MoveContext {
  playerId: string;                       // who is acting
  random: RandomAPI;                       // seeded randomness
  flow: FlowAPI;                           // turn / phase control
  emit: (type: string, data?: Json) => void;  // UI/animation events
  log: (msg: string) => void;
}
Randomness — the only source allowed
Use ctx.random (and SetupContext.random) for everything random. It is seeded from the match seed, so replays are exact.

interface RandomAPI {
  float(): number;                 // [0, 1)
  int(minInclusive: number, maxInclusive: number): number;
  bool(p?: number): boolean;
  die(sides: number): number;
  dice(count: number, sides: number): number[];
  pick<T>(items: T[]): T;
  shuffle<T>(items: T[]): T[];     // returns a new shuffled array
}
Turn & phase control — flow
interface FlowAPI {
  endTurn(): void;                        // pass to the next player
  setPhase(phase: string): void;
  currentPlayer(): string;
  playOrder(): string[];
  setActive(playerId: string): void;      // hand priority out of turn (reactions)
  setActiveSet(playerIds: string[]): void;// simultaneous stage (all act at once)
  turnOwner(): string;
  endGame(result: GameResult): void;
}
playerView — hidden information
By default players see the whole state. Implement playerView to redact secrets: return only what playerId is allowed to see. This runs on the server, so a client can never receive data it shouldn't — the anti-cheat guarantee.

playerView: (G, playerId) => ({
  ...G,
  hands: undefined,                          // never ship everyone's hands
  yourHand: G.hands[playerId],               // just yours
  handCounts: mapValues(G.hands, (h) => h.length),
}),
endIf & results
Runs after every accepted move. Return a result to end the match (or nothing to continue):

interface GameResult {
  winner?: string;                   // single winner
  winners?: string[];                // team / co-op winners
  draw?: boolean;                    // ended with no winner
  scores?: Record<string, number>;   // final scores, when the game is scored
  reason?: string;                   // shown in the game-over card
}
enumerate — legal moves
Return every legal move for playerId right now. Powers the built-in bots, the default button UI, and move highlighting.

interface MoveDescriptor { type: string; payload?: Json; }
Tip
Even if you ship a custom UI, implementing enumerate is worth it: it gives you free bots to fill empty seats and to fuzz-test your rules to completion.
bot — your own AI (optional)
Ship a bot and your game plays vs the computer — it fills empty seats and stands in for absent players. Return the move this seat should play, or nothing to let the platform fall back to a random legal move. If you skip bot entirely but have enumerate, seats are still filled with random-legal play.

bot?: (G, playerId, flow, random) => MoveDescriptor | undefined

// tic-tac-toe: win, else block, else centre, else a corner
bot: (G, playerId, flow, random) => {
  const me = flow.playOrder.indexOf(playerId);
  const cell = winningCell(G, me)         // take the win
    ?? winningCell(G, 1 - me)             // else block theirs
    ?? (G.board[4] === null ? 4 : undefined)  // else centre
    ?? random.pick(openCorners(G));       // else a corner
  return { type: "place", payload: { cell } };
}
Note
Two guarantees keep it safe: random is a private stream separate from the match RNG — your bot's dice never disturb the game's own randomness, and its choices aren't replayed — and the returned move is validated against enumerate before it's applied, so a buggy bot degrades to a random legal move rather than making an illegal play. The bot runs in the same sandbox as your reducer and sees the full state G.


Quickstart
Scaffold a game, play it against bots, compile it to WebAssembly, and publish it — all from your own project, with just Node installed.

1. Scaffold a game
You need Node 22.6+ — and nothing else (the build step fetches its own compiler; no Docker).

npm create @bordiko/game my-game
cd my-game
npm install
You get a ready-to-run project. Your whole game is src/game.ts:

my-game/
├── package.json      # your game's manifest (the "bordiko" block)
├── src/game.ts        # the whole game — a starter Tic-Tac-Toe
└── test/game.test.ts
2. Write the game
A game is a deterministic reducer, built with defineGame from @bordiko/sdk:

// src/game.ts
import { defineGame, INVALID_MOVE } from "@bordiko/sdk";

interface State { board: (string | null)[]; }

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export default defineGame<State>({
  name: "my-game",
  minPlayers: 2,
  maxPlayers: 2,
  meta: { displayName: "My Game" },

  setup: () => ({ board: Array(9).fill(null) }),

  moves: {
    // Claim an empty cell, then pass the turn.
    place: (G, payload, ctx) => {
      const cell = (payload as { cell?: number }).cell;
      if (typeof cell !== "number" || cell < 0 || cell > 8 || G.board[cell]) return INVALID_MOVE;
      G.board[cell] = ctx.playerId;
      ctx.flow.endTurn();
    },
  },

  // Runs after every accepted move; return a result to end the game.
  endIf: (G) => {
    for (const [a, b, c] of LINES)
      if (G.board[a] && G.board[a] === G.board[b] && G.board[a] === G.board[c])
        return { winner: G.board[a]! };
    if (G.board.every(Boolean)) return { draw: true };
  },

  // The legal moves right now — powers bots and the default UI.
  enumerate: (G) => G.board.flatMap((v, i) => (v ? [] : [{ type: "place", payload: { cell: i } }])),
});
Heads up
Mutate G in place — the engine gives your move a fresh clone and commits it only if accepted; a rejected move (return INVALID_MOVE) is a pure no-op. Never touch Date or Math.random() — use ctx.random for anything random.
3. Test it — instant, no build
Your game runs as plain TypeScript, so the tests are sub-second:

npm test
4. Play it in the sandbox
Open a local table — play every seat, fill seats with bots, hot-reload on save, and preview a custom UI:

npm run dev
More in Testing & the sandbox.

5. Compile to WebAssembly
When the logic is solid, build the sandboxed module. The first build downloads its compiler (Javy) — no Docker:

npm run build   # → dist/my-game.wasm
6. Publish
Generate a publish token on your Profile → Publish from the CLI, then:

REGISTRY=https://api.bordiko.com/api BORDIKO_TOKEN=<token> npx @bordiko/cli publish
The registry validates your module and stores it; it enters the review queue and, once an admin approves it, the game host fetches it on demand — no redeploy. Full details in Publishing.


Build a game for Bordiko
Bordiko is an open board-game marketplace. You write a game in TypeScript, it compiles to WebAssembly and runs sandboxed on our servers, and players around the world play it online — in real time, ranked, with chat, bots, and reconnection handled for you.

The one rule: a game is a deterministic reducer
Everything on the platform rests on a single invariant:

same seed + same ordered moves  ⇒  byte-identical game state
You never read the clock or call Math.random(). Every source of randomness comes from a context object we pass in. Because your game is a pure function of its inputs, we get server authority (the server re-runs every move and rejects illegal ones), instant replays, reconnection, and bots — all for free, from the same code.

What you actually write
setup — build the initial state from the player list (deals, shuffles, boards).
moves — one function per action; validate, then mutate the state.
playerView (optional) — hide secret information (hands, roles) per player.
endIf (optional) — decide when someone has won.
enumerate (optional) — list the legal moves; this powers bots and a zero-effort default UI.
bot (optional) — your own AI, so the game plays vs the computer and fills empty seats.
That is a turn-based game. To build a real-time action game — where the world keeps moving on its own, with both players acting at once — you add one more function, tick, and the host drives a fixed-rate clock. See Real-time games.

Three ways to show it
You choose how much UI to write — from none at all to a fully bespoke board:

Nothing — implement enumerate and players get typed buttons for every legal move. Great for prototyping.
A declarative board — return a board schema (seats, zones, tracks, a prompt) and the platform renders it. No UI code.
Your own UI — ship a self-contained ui.html that runs in a locked-down iframe and talks to the match over a tiny message bridge.




Publishing
Publishing uploads your compiled game to the registry, which validates it and serves it to the game host on demand.

The manifest
The bordiko block in your game's package.json is the manifest source. The publisher reads it, hashes your .wasm, bundles any assets and ui.html, and posts the package:

"bordiko": {
  "gameId": "my-game",        // lowercase kebab-case, unique
  "displayName": "My Game",
  "minPlayers": 2,
  "maxPlayers": 4,
  "categories": ["strategy"],
  "board": "grid"             // grid | hex | network | tableau | custom
}
A real-time game adds a realtime block so the host drives its clock (see Real-time games):

"realtime": { "tick": true, "tickRate": 15 }   // ticks per second, max 30
A turn-based game can add an optional timers block for a turn clock. Because a reducer is time-blind, the gateway enforces the clock — on expiry it either auto-plays a safe move or ends the match. Declare either a per-turn limit or a chess clock:

"timers": { "perTurnSeconds": 45, "onExpire": "autoMove" }  // resets each turn; autoMove | forfeit
"timers": { "totalSeconds": 300 }                          // chess clock: 5 min per player, flag-fall = loss
Omit it to inherit the platform default (a per-turn limit that auto-plays the first legal move). perTurnSeconds: 0 disables the turn timer entirely.

Two ways to publish
From the web (simplest): sign in and use Developers → Publish a game to upload your .wasm, optional ui.html, and source. From the CLI, generate a publish token on your Profile → Publish from the CLI (a revocable, 1-year credential — not your login), then after npm run build:

BORDIKO_TOKEN=<token> REGISTRY=https://api.bordiko.com/api npx @bordiko/cli publish
Either way, your submission is tagged to your account and enters the review queue — an admin reviews the code and approves it before it goes live. It sends the manifest, the base64 .wasm, your source bundle (required), any assets/* images, and an optional ui.html. Manage your submissions and toggle your live games under My games on the Publish page.

What the registry checks
Three gates run before anything is stored — this is what keeps an open marketplace safe:

Manifest & integrity — the manifest is well-formed and the declared sha256 matches the uploaded module.
Imports allow-list — the WebAssembly module may import only wasi_snapshot_preview1. Any other host import is rejected, so the module can't reach the network, filesystem, or clock.
Sandboxed setup scenario — the registry actually runs your module in a memory-capped, time-limited sandbox with a setup command and requires it to produce valid state. A game that crashes on setup never publishes.
Uploaded assets are size-limited and content-type sniffed (only real raster images pass). A custom ui.html is size-capped and served under the no-network CSP described in Rendering.

Going live
Your submission enters the review queue; once an admin approves it, the game host fetches your module the first time a match starts — no redeploy, no downtime — and it shows in the catalog.

Note
Publishing is self-service and open: sign in, generate a publish token on your Profile, and submit — every submission goes through the same review queue before it appears in the catalog.


esting & the sandbox
The fastest feedback loop lives entirely in Node — no Docker, no services, no browser. Reach for the heavier tools only when you want to see the real thing.

The dev sandbox
The main tool — a local table for your game, in the browser, no login or services:

npm run dev
It drives the same reducer the WASM host runs, so what you see is what players get. You can:

Play every seat — click a seat to sit in it; each seat sees only its own redacted view, so you can test hidden information from every angle.
Fill seats with bots — flip any seat to a bot, then Step one move or auto-play. They play your bot when you ship one (otherwise a random legal move from enumerate) — the same chooser the live platform uses, so you preview the real opponent. Set every seat to a bot to watch a whole game.
Hot-reload on save — edit your game and the match restarts with the new rules instantly.
Preview your custom UI — a ui.html loads in the same locked-down sandbox iframe players get, over the real message bridge.
Inspect everything — a live panel shows the phase and turn, the current seat's redacted state, its legal moves, and the move log.
Unit tests (sub-second)
Your game runs as plain TypeScript, so tests are instant — no build, no Docker:

npm test
Drive the match with createMatch, applyMove, and getPlayerView, and assert on setup, legal/illegal moves, redaction (that a player's view never leaks a secret), and end conditions.

Bot self-play & replay
If you implement enumerate, the engine's seeded bots can play your game to completion. Play a random game, then replay the move log and assert the final state is byte-identical — the determinism check that guarantees your game behaves the same in the WASM sandbox as in Node.

To exercise your own bot, call chooseBotMove(game, state, seat) — it returns your bot's pick (or a random legal move if you ship none), so you can unit-test that it wins the positions it should. It uses an isolated RNG, so it never disturbs the match state.

import { createMatch, applyMove, randomBotMove, replay, movesFromLog, Rng, seedFromString } from "@bordiko/sdk";
import game from "./src/game.ts";

let s = createMatch(game, { players: ["a", "b"], seed: "fuzz" });
while (!s.ended) {
  const mv = randomBotMove(game, s, new Rng(seedFromString("bot:" + s.log.length)));
  if (!mv) break;
  s = applyMove(game, s, mv).state;
}
const replayed = replay(game, s.seed, ["a", "b"], movesFromLog(s));
// assert.deepEqual(replayed.G, s.G)
The in-game debug panel
Your custom UI runs in a locked-down iframe, so its console is invisible from the outside — which makes a broken board hard to diagnose. Open any game with ?debug in the URL (or press Ctrl+Shift+D) to reveal a developer panel with two things you otherwise can't see:

Console — uncaught errors, console.error/console.warn, and anything you send with host.debug(...), forwarded out of the sandbox.
State — the live redacted state, legal moves, and turn info the reducer produced, so you can see exactly what your UI was handed.
import { connectBordiko } from "@bordiko/sdk/ui";
const host = connectBordiko();

// This line shows up in the debug panel (errors/warnings appear automatically):
host.debug("bullet spawned", { x, y, vel });
Tip
The sandbox runs the real engine, so it's all you need to build and tune your game. Publishing is what puts it in front of other players.

