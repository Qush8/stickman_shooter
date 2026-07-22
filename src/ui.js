import '@pixi/unsafe-eval';
import { Application } from '@pixi/app';
import { Container } from '@pixi/display';
import { Graphics, LINE_CAP } from '@pixi/graphics';
import { Text } from '@pixi/text';
import { BLEND_MODES } from '@pixi/constants';
import { connectBordiko } from '@bordiko/sdk/ui';

import { GUN_PISTOL_B64, GUN_SHOTGUN_B64, GUN_RIFLE_B64 } from './sfx-buffers.js';
import { MAPS } from './maps.ts';

const ARENA_W = 912;
const ARENA_H = 500;
const FLOOR_Y = ARENA_H;
const SCALE = 30;
const FEET_OFF = 32; // matches game.ts PLAYER_HALF_H * SCALE
const FIT_PADDING = 0.9;

let viewScale = 1;
let viewOffsetX = 0;
let viewOffsetY = 0;

const PLATFORM_BORDER = 2;

const STICK = {
  headR: 16,
  lineW: 7,
  outlineW: 12,
  limbFillW: 11,
  bodyLen: 44,
  hipSpread: 4,
  footW: 16,
  footSpread: 5,
  armLen: 28,
  stride: 11,
  lift: 6,
  crouchDrop: 46,
  kneeBend: 10,
};

const GUN = {
  barrel: 23,
  slideHalfH: 3.2,
  gripLen: 10,
  gripHalfW: 4,
  tipR: 2.4,
};

const WEAPON_ORDER = [
  "auto",
  "katana",
  "bazooka",
  "grenade",
  "winchester",
  "winchester_shotgun",
  "sniper",
];

const WEAPON_LABELS = {
  auto: "ავტომატი",
  katana: "სამურაის ხმალი",
  bazooka: "ბაზუკა",
  grenade: "ლიმონკა",
  winchester: "ვინჩესტერი",
  winchester_shotgun: "ვინჩესტერი საფანტი",
  sniper: "სნაიპერი",
};

const WEAPON_BARREL = {
  auto: 36,
  katana: 42,
  bazooka: 52,
  grenade: 14,
  winchester: 30,
  winchester_shotgun: 24,
  sniper: 48,
};

const WEAPON_MUZZLE = {
  auto: 0.45,
  katana: 0.15,
  bazooka: 0.9,
  grenade: 0.45,
  winchester: 0.45,
  winchester_shotgun: 0.65,
  sniper: 0.55,
};

const WEAPON_RECOIL_SHAKE = {
  auto: 0.6,
  katana: 0.3,
  bazooka: 4,
  grenade: 0.9,
  winchester: 0.75,
  winchester_shotgun: 1.5,
  sniper: 2,
};

const WEAPON_VISUAL_RECOIL = {
  auto: { arm: 6, torso: 2, aim: 0.035 },
  katana: { arm: 4, torso: 2, aim: 0.02 },
  bazooka: { arm: 28, torso: 14, aim: 0.08 },
  grenade: { arm: 10, torso: 4, aim: 0.04 },
  winchester: { arm: 8, torso: 3, aim: 0.05 },
  winchester_shotgun: { arm: 16, torso: 7, aim: 0.065 },
  sniper: { arm: 18, torso: 8, aim: 0.07 },
};

const KATANA_SWING_MS = 200;
const KATANA_EQUIP_MS = 300;

let recoilShake = 0;
let recoilShakeX = 0;
let recoilShakeY = 0;

const SHOOT_FACE_MS = 2000;
const CORPSE_FALL_MS = 260;

// PixiJS Setup — renderer fills container; gameContainer scales the fixed arena
const gameContainerEl = document.getElementById('game-container');
const app = new Application({
    backgroundColor: 0x2c2c2c,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
});
app.view.style.display = 'block';
app.view.style.width = '100%';
app.view.style.height = '100%';
app.view.tabIndex = 0;
app.view.style.outline = 'none';
gameContainerEl.tabIndex = 0;
gameContainerEl.style.outline = 'none';
gameContainerEl.appendChild(app.view);

const gameContainer = new Container();
app.stage.addChild(gameContainer);

// Background Grid
const gridGraphics = new Graphics();
gridGraphics.beginFill(0x242424);
gridGraphics.drawRect(0, 0, ARENA_W, ARENA_H);
gridGraphics.endFill();
gridGraphics.lineStyle(2, 0x555555, 1);
gridGraphics.drawRect(0, 0, ARENA_W, ARENA_H);
gridGraphics.lineStyle(1, 0x3a3a3a, 1);
for (let i = 0; i < ARENA_W; i += 50) {
    gridGraphics.moveTo(i, 0);
    gridGraphics.lineTo(i, ARENA_H);
}
for (let i = 0; i < ARENA_H; i += 50) {
    gridGraphics.moveTo(0, i);
    gridGraphics.lineTo(ARENA_W, i);
}
gameContainer.addChild(gridGraphics);

// Floor — solid fill only (no path line)
const floorGraphics = new Graphics();
floorGraphics.beginFill(0x3d4654);
floorGraphics.drawRect(0, FLOOR_Y - 10, ARENA_W, 10);
floorGraphics.endFill();
gameContainer.addChild(floorGraphics);

let activeMapThemeId = null;

const applyMapTheme = (mapId) => {
    const theme = MAPS[mapId]?.theme ?? MAPS.default.theme;
    if (mapId === activeMapThemeId) return;
    activeMapThemeId = mapId;

    gridGraphics.clear();
    gridGraphics.beginFill(theme.background);
    gridGraphics.drawRect(0, 0, ARENA_W, ARENA_H);
    gridGraphics.endFill();
    gridGraphics.lineStyle(2, theme.gridBorder, 1);
    gridGraphics.drawRect(0, 0, ARENA_W, ARENA_H);
    gridGraphics.lineStyle(1, theme.gridLine, 1);
    for (let i = 0; i < ARENA_W; i += 50) {
        gridGraphics.moveTo(i, 0);
        gridGraphics.lineTo(i, ARENA_H);
    }
    for (let i = 0; i < ARENA_H; i += 50) {
        gridGraphics.moveTo(0, i);
        gridGraphics.lineTo(ARENA_W, i);
    }

    floorGraphics.clear();
    floorGraphics.beginFill(theme.floor);
    floorGraphics.drawRect(0, FLOOR_Y - 10, ARENA_W, 10);
    floorGraphics.endFill();
};

applyMapTheme('default');
const platformsContainer = new Container();
const pickupsContainer = new Container();
const bulletsContainer = new Container();
const particlesContainer = new Container();
const playersContainer = new Container();
const laserContainer = new Container();

gameContainer.addChild(platformsContainer);
gameContainer.addChild(pickupsContainer);
gameContainer.addChild(playersContainer);
gameContainer.addChild(bulletsContainer);
gameContainer.addChild(laserContainer);
gameContainer.addChild(particlesContainer);

const overlayContainer = new Container();
app.stage.addChild(overlayContainer);

const START_COUNTDOWN_MS = 3000;
const START_GO_HOLD_MS = 450;

let countdownText = null;
let localCountdownStartAt = null;
let countdownAnim = { label: "", progress: 1 };

const focusGameInput = () => {
    try {
        gameContainerEl.focus({ preventScroll: true });
    } catch {
        gameContainerEl.focus();
    }
    try {
        app.view.focus({ preventScroll: true });
    } catch {
        app.view.focus();
    }
};

const beginStartCountdown = () => {
    if (localCountdownStartAt != null) return;
    localCountdownStartAt = Date.now();
    Sfx.init();
    focusGameInput();
};

const isStartCountdownComplete = () =>
    localCountdownStartAt != null &&
    Date.now() - localCountdownStartAt >= START_COUNTDOWN_MS;

const isPreMatchCountdown = () =>
    localCountdownStartAt != null && !isStartCountdownComplete();

const isStartCountdownVisible = () => {
    if (localCountdownStartAt == null) return false;
    return Date.now() - localCountdownStartAt < START_COUNTDOWN_MS + START_GO_HOLD_MS;
};

const ensureOverlayTexts = () => {
    if (!countdownText) {
        countdownText = new Text("", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: 96,
            fill: 0xffee55,
            align: "center",
            stroke: 0x000000,
            strokeThickness: 8,
        });
        countdownText.anchor.set(0.5);
        countdownText.visible = false;
        overlayContainer.addChild(countdownText);
    }
};

const updateOverlayLayout = () => {
    ensureOverlayTexts();
    const res = app.renderer.resolution || 1;
    const w = app.renderer.width / res;
    const h = app.renderer.height / res;
    overlayContainer.position.set(w / 2, h / 2);
};

const isGameplayInputEnabled = (G) =>
    isStartCountdownComplete() && G?.roundPhase === "playing";

const isIdleTickPhase = (G) => G?.roundPhase === "intermission";

/** Production host may omit yourTurn; treat legal moves as permission to act. */
const updateStartOverlay = () => {
    ensureOverlayTexts();
    updateOverlayLayout();

    if (!isStartCountdownVisible()) {
        countdownText.visible = false;
        gameContainer.alpha = 1;
        return;
    }

    countdownText.visible = true;
    gameContainer.alpha = 0.9;
};

const tickCountdownOverlay = (_G, dt) => {
    if (!countdownText || !isStartCountdownVisible()) return;

    const elapsed = Date.now() - localCountdownStartAt;
    const remaining = START_COUNTDOWN_MS - elapsed;
    const label = remaining > 0 ? String(Math.ceil(remaining / 1000)) : "GO!";

    if (label !== countdownAnim.label) {
        countdownAnim.label = label;
        countdownAnim.progress = 0;
        if (label === "GO!") {
            Sfx.playRoundWin();
            focusGameInput();
        }
    }

    countdownAnim.progress = Math.min(1, countdownAnim.progress + 0.045 * dt);
    const t = countdownAnim.progress;
    const scale = 1.35 - t * 0.75;
    countdownText.text = label;
    countdownText.scale.set(scale);
    countdownText.alpha = Math.max(0, 1 - t * 0.85);
    countdownText.rotation = (1 - t) * 0.08 * (label === "GO!" ? 1 : -1);
};

// Platforms drawn each frame from game state (HP fill + border)

const getPlatformsForRender = (G) => {
    if (G?.platforms?.length) return G.platforms;
    return [];
};

const drawPlatforms = (platforms) => {
    platformsContainer.removeChildren();
    if (!platforms?.length) return;

    for (const plat of platforms) {
        if (plat.broken) continue;

        const g = new Graphics();
        const inset = PLATFORM_BORDER;
        const hpRatio = Math.max(0, Math.min(1, plat.health / (plat.maxHealth || 500)));
        const innerW = Math.max(0, plat.w - inset * 2);
        const innerH = Math.max(1, plat.h - inset * 2);
        const fillW = innerW * hpRatio;
        const isElevator = plat.kind === "elevator";

        g.beginFill(isElevator ? 0x1a3355 : 0x24384f, 0.95);
        g.drawRect(plat.x, plat.y, plat.w, plat.h);
        g.endFill();

        const hpColor =
            hpRatio > 0.55 ? (isElevator ? 0x44aaff : 0x3ecf6e) : hpRatio > 0.28 ? 0xe6b422 : 0xe04545;
        if (fillW > 0) {
            g.beginFill(hpColor, 1);
            g.drawRect(plat.x + inset, plat.y + inset, fillW, innerH);
            g.endFill();
        }

        g.lineStyle(2, isElevator ? 0x88ccff : 0xf0f6ff, 1, 0.5, true);
        g.drawRect(plat.x, plat.y, plat.w, plat.h);

        platformsContainer.addChild(g);
    }
};

drawPlatforms(getPlatformsForRender(null));

const localPickupMeta = {};
const FLOOR_PICKUP_Y = 480;
const PICKUP_FALL_PX_SEC = 420;

const pickupSupportedAt = (x, y, platforms) => {
    if (y >= FLOOR_PICKUP_Y - 1) return true;
    for (const plat of platforms) {
        if (plat.broken) continue;
        if (x < plat.x - 12 || x > plat.x + plat.w + 12) continue;
        const surfaceY = plat.y - 20;
        if (y >= surfaceY - 1 && y <= surfaceY + 4) return true;
    }
    return false;
};

const pickupFallGoal = (pickup, platforms) => {
    if (pickup.fallToFloor) return FLOOR_PICKUP_Y;
    if (pickup.targetY != null) return pickup.targetY;
    let bestPlatY = 500;
    for (const plat of platforms) {
        if (plat.broken) continue;
        if (pickup.x < plat.x - 12 || pickup.x > plat.x + plat.w + 12) continue;
        const surfaceY = plat.y - 20;
        if (surfaceY <= pickup.y + 0.5) continue;
        if (plat.y < bestPlatY) bestPlatY = plat.y;
    }
    return bestPlatY - 20;
};

const WEAPON_PICKUP_COLORS = {
  auto: { glow: 0x88aaff, accent: 0x5566cc, core: 0x334466 },
  katana: { glow: 0xaaddff, accent: 0x66aacc, core: 0xddeeff },
  bazooka: { glow: 0x88cc66, accent: 0x446633, core: 0x3d5c32 },
  grenade: { glow: 0xaacc44, accent: 0x556b2f, core: 0x778844 },
  winchester: { glow: 0xffcc66, accent: 0x886644, core: 0x555555 },
  winchester_shotgun: { glow: 0xffaa55, accent: 0x5a4028, core: 0x6b4a2a },
  sniper: { glow: 0xccccff, accent: 0x444466, core: 0x333344 },
};

const drawWeaponPickupIcon = (g, weaponId, cx, cy, s = 1) => {
    const cols = WEAPON_PICKUP_COLORS[weaponId] ?? WEAPON_PICKUP_COLORS.winchester;
    const outline = 0x111111;
    g.lineStyle(1.4, outline, 0.85);

    switch (weaponId) {
        case "auto":
            g.beginFill(cols.core);
            g.drawRoundedRect(cx - 15 * s, cy - 3.5 * s, 22 * s, 7 * s, 1.5 * s);
            g.endFill();
            g.beginFill(cols.accent);
            g.drawRect(cx + 4 * s, cy - 2 * s, 10 * s, 4 * s);
            g.endFill();
            g.beginFill(0x1a1a1a);
            g.drawRoundedRect(cx - 3 * s, cy + 2 * s, 6 * s, 8 * s, 1 * s);
            g.endFill();
            g.beginFill(0xff4422, 0.9);
            g.drawCircle(cx + 12 * s, cy, 1.8 * s);
            g.endFill();
            break;
        case "katana":
            g.beginFill(cols.core);
            g.drawPolygon([
                cx - 12 * s, cy - 1 * s,
                cx + 14 * s, cy - 2 * s,
                cx + 16 * s, cy,
                cx + 14 * s, cy + 2 * s,
                cx - 12 * s, cy + 1 * s,
            ]);
            g.endFill();
            g.beginFill(0x3a2818);
            g.drawRoundedRect(cx - 17 * s, cy - 3 * s, 7 * s, 6 * s, 1 * s);
            g.endFill();
            g.lineStyle(1.5, 0xffffff, 0.5);
            g.moveTo(cx - 8 * s, cy - 0.5 * s);
            g.lineTo(cx + 12 * s, cy - 1.5 * s);
            break;
        case "bazooka":
            g.beginFill(cols.core);
            g.drawRoundedRect(cx - 16 * s, cy - 5.5 * s, 26 * s, 11 * s, 2 * s);
            g.endFill();
            g.beginFill(cols.accent);
            g.drawRoundedRect(cx - 20 * s, cy - 6.5 * s, 7 * s, 13 * s, 1.5 * s);
            g.endFill();
            g.beginFill(0x111111);
            g.drawCircle(cx + 12 * s, cy, 3.5 * s);
            g.endFill();
            g.beginFill(0xff6622, 0.85);
            g.drawCircle(cx + 12 * s, cy, 2 * s);
            g.endFill();
            break;
        case "grenade":
            g.beginFill(cols.core);
            g.drawCircle(cx, cy + 1 * s, 7 * s);
            g.endFill();
            g.beginFill(cols.accent, 0.7);
            g.drawCircle(cx - 2 * s, cy - 1 * s, 2.5 * s);
            g.endFill();
            g.lineStyle(2, 0xcccc66, 1);
            g.moveTo(cx, cy - 6 * s);
            g.lineTo(cx - 2 * s, cy - 11 * s);
            g.lineTo(cx + 2 * s, cy - 11 * s);
            g.lineTo(cx, cy - 6 * s);
            break;
        case "winchester_shotgun":
            g.beginFill(cols.core);
            g.drawRoundedRect(cx - 14 * s, cy - 4.5 * s, 18 * s, 9 * s, 1.5 * s);
            g.endFill();
            g.beginFill(cols.accent);
            g.drawRect(cx - 16 * s, cy - 2 * s, 6 * s, 5 * s);
            g.endFill();
            g.lineStyle(2.5, 0x2a2018, 0.9);
            g.moveTo(cx - 5 * s, cy - 4.5 * s);
            g.lineTo(cx + 5 * s, cy - 4.5 * s);
            break;
        case "sniper":
            g.beginFill(cols.core);
            g.drawRoundedRect(cx - 16 * s, cy - 2.5 * s, 28 * s, 5 * s, 1 * s);
            g.endFill();
            g.beginFill(0x111111);
            g.drawRoundedRect(cx - 4 * s, cy - 6.5 * s, 9 * s, 4 * s, 1 * s);
            g.endFill();
            g.beginFill(cols.accent, 0.8);
            g.drawRect(cx + 8 * s, cy - 1.5 * s, 8 * s, 3 * s);
            g.endFill();
            break;
        default:
            g.beginFill(cols.core);
            g.drawRoundedRect(cx - 13 * s, cy - 3.5 * s, 20 * s, 7 * s, 1.5 * s);
            g.endFill();
            g.beginFill(cols.accent);
            g.drawRect(cx - 4 * s, cy + 2 * s, 5 * s, 7 * s);
            g.endFill();
            g.lineStyle(2, cols.glow, 0.7);
            g.moveTo(cx - 2 * s, cy + 2 * s);
            g.lineTo(cx + 1 * s, cy + 9 * s);
            break;
    }
};

const drawWeaponDrop = (container, pickup, drawX, drawY, falling, fallRot) => {
    const wId = pickup.weaponId || "winchester";

    const shadow = new Graphics();
    shadow.beginFill(0x000000, 0.16);
    shadow.drawEllipse(0, 13, falling ? 11 : 13, 3);
    shadow.endFill();
    container.addChild(shadow);

    const icon = new Graphics();
    icon.rotation = falling ? fallRot : Math.sin(Date.now() / 900 + pickup.id) * 0.05;
    drawWeaponPickupIcon(icon, wId, 0, 0, 1.08);
    container.addChild(icon);

    container.position.set(drawX, drawY);
};

const drawPickups = (pickups, platforms) => {
    pickupsContainer.removeChildren();
    if (!pickups?.length) return;

    const plats = platforms?.length ? platforms : STATIC_PLATFORMS;
    const liveIds = new Set(pickups.map((p) => p.id));
    for (const id of Object.keys(localPickupMeta)) {
        if (!liveIds.has(Number(id))) delete localPickupMeta[id];
    }

    const dtSec = Math.min(0.05, (app.ticker.deltaMS || 16) / 1000);

    for (const pickup of pickups) {
        const goal = pickupFallGoal(pickup, plats);

        if (!localPickupMeta[pickup.id]) {
            localPickupMeta[pickup.id] = {
                simY: pickup.y,
                goalY: goal,
                wasFalling: pickup.y < goal - 0.5,
                landFx: false,
                fallRot: (pickup.id % 7) * 0.4,
            };
        }

        const meta = localPickupMeta[pickup.id];
        meta.goalY = goal;

        // Server moved pickup upward (fresh spawn above platform) — restart from spawn height.
        if (pickup.y < meta.simY - 2) {
            meta.simY = pickup.y;
            meta.landFx = false;
            meta.fallRot = (pickup.id % 7) * 0.4;
        }

        const falling = meta.simY < meta.goalY - 0.5;
        if (falling) {
            meta.simY = Math.min(meta.goalY, meta.simY + PICKUP_FALL_PX_SEC * dtSec);
            meta.fallRot += dtSec * 5.5;
        } else {
            meta.simY += (meta.goalY - meta.simY) * Math.min(1, dtSec * 12);
            meta.fallRot *= 0.92;
        }

        const landed = meta.wasFalling && !falling && meta.simY >= meta.goalY - 0.5;
        if (landed && !meta.landFx) {
            meta.landFx = true;
            createSparkHit(pickup.x, meta.simY, 0.5);
            if (pickup.kind === "weapon") Sfx.playPickupLand();
        }
        meta.wasFalling = falling;

        const onFloor = meta.simY >= FLOOR_PICKUP_Y - 1;
        const bob = falling || onFloor ? 0 : Math.sin(Date.now() / 280 + pickup.id) * 1.5;
        const drawY = meta.simY + bob;

        if (pickup.kind === "health") {
            const g = new Graphics();
            const pulse = 0.9 + Math.sin(Date.now() / 350 + pickup.id) * 0.1;
            g.beginFill(0x000000, 0.18);
            g.drawEllipse(pickup.x, drawY + 16, 10, 3);
            g.endFill();
            g.lineStyle(2, 0x66ff99, 0.5 * pulse);
            g.drawCircle(pickup.x, drawY, 14 * pulse);
            g.beginFill(0x22cc55, 0.95);
            g.drawCircle(pickup.x, drawY, 11);
            g.endFill();
            g.beginFill(0x44ff88, 0.45);
            g.drawCircle(pickup.x - 3, drawY - 3, 4);
            g.endFill();
            g.lineStyle(2.5, 0xffffff, 0.95);
            g.moveTo(pickup.x - 5, drawY);
            g.lineTo(pickup.x + 5, drawY);
            g.moveTo(pickup.x, drawY - 5);
            g.lineTo(pickup.x, drawY + 5);
            pickupsContainer.addChild(g);
        } else {
            const drop = new Container();
            drawWeaponDrop(drop, pickup, pickup.x, drawY, falling, meta.fallRot);
            pickupsContainer.addChild(drop);
        }
    }
};

// Fit arena inside #game-container (responsive in Bordiko iframe)
const getContainerRect = () => gameContainerEl.getBoundingClientRect();

const clientToArena = (clientX, clientY) => {
    const rect = getContainerRect();
    return {
        x: (clientX - rect.left - viewOffsetX) / viewScale,
        y: (clientY - rect.top - viewOffsetY) / viewScale,
    };
};

const arenaPointToClient = (arenaX, arenaY) => {
    const rect = getContainerRect();
    return {
        x: rect.left + viewOffsetX + arenaX * viewScale,
        y: rect.top + viewOffsetY + arenaY * viewScale,
    };
};

const fitCanvas = () => {
    const rect = gameContainerEl.getBoundingClientRect();
    const cw = rect.width || gameContainerEl.clientWidth || window.innerWidth;
    const ch = rect.height || gameContainerEl.clientHeight || window.innerHeight;
    if (cw <= 0 || ch <= 0) return;

    app.renderer.resize(Math.round(cw), Math.round(ch));

    viewScale = Math.min(cw / ARENA_W, ch / ARENA_H) * FIT_PADDING;
    const displayW = ARENA_W * viewScale;
    const displayH = ARENA_H * viewScale;
    viewOffsetX = (cw - displayW) / 2;
    viewOffsetY = (ch - displayH) / 2;

    gameContainer.scale.set(viewScale);
    gameContainer.position.set(viewOffsetX, viewOffsetY);
    updateOverlayLayout();
};

if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(fitCanvas).observe(gameContainerEl);
}
window.addEventListener('resize', fitCanvas);
window.addEventListener('load', fitCanvas);

let fitFrames = 0;
const fitUntilStable = () => {
    fitCanvas();
    if (fitFrames++ < 8) requestAnimationFrame(fitUntilStable);
};
fitUntilStable();

// --- Procedural SFX (Web Audio API, no external files) ---
const Sfx = (() => {
    let ctx = null;
    let master = null;
    let lastFootstepAt = 0;
    let gunSamples = null;
    let gunSamplesLoading = null;

    const ensure = () => {
        if (!ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            ctx = new AC();
            master = ctx.createGain();
            master.gain.value = 0.42;
            master.connect(ctx.destination);
        }
        if (ctx.state === "suspended") ctx.resume();
        return ctx;
    };

    const init = () => {
        ensure();
        loadGunSamples();
    };

    const decodeB64Wav = (b64) => {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes.buffer;
    };

    const loadGunSamples = () => {
        const ac = ensure();
        if (!ac) return Promise.resolve(null);
        if (gunSamples) return Promise.resolve(gunSamples);
        if (gunSamplesLoading) return gunSamplesLoading;
        gunSamplesLoading = Promise.all([
            ac.decodeAudioData(decodeB64Wav(GUN_PISTOL_B64)),
            ac.decodeAudioData(decodeB64Wav(GUN_SHOTGUN_B64)),
            ac.decodeAudioData(decodeB64Wav(GUN_RIFLE_B64)),
        ])
            .then(([pistol, shotgun, rifle]) => {
                gunSamples = { pistol, shotgun, rifle };
                return gunSamples;
            })
            .catch(() => null);
        return gunSamplesLoading;
    };

    const playSample = (buffer, { rate = 1, vol = 0.7 } = {}) => {
        const ac = ensure();
        if (!ac || !buffer) return;
        const t = ac.currentTime;
        const src = ac.createBufferSource();
        src.buffer = buffer;
        src.playbackRate.value = rate;
        const g = ac.createGain();
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + buffer.duration / Math.max(rate, 0.01) + 0.02);
        src.connect(g);
        g.connect(master);
        src.start(t);
    };

    const tone = (freq, type, dur, vol, freqEnd = null) => {
        const ac = ensure();
        if (!ac) return;
        const t = ac.currentTime;
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (freqEnd != null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t + dur);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g);
        g.connect(master);
        osc.start(t);
        osc.stop(t + dur + 0.02);
    };

    const noise = (dur, vol, filterFreq = 800) => {
        const ac = ensure();
        if (!ac) return;
        const t = ac.currentTime;
        const bufferSize = Math.floor(ac.sampleRate * dur);
        const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const src = ac.createBufferSource();
        src.buffer = buffer;
        const filter = ac.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = filterFreq;
        filter.Q.value = 0.6;
        const g = ac.createGain();
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        src.connect(filter);
        filter.connect(g);
        g.connect(master);
        src.start(t);
        src.stop(t + dur + 0.02);
    };

    const playGunshotFallback = ({
        duration = 0.24,
        crackDecay = 0.045,
        tailDecay = 0.11,
        thumpHz = 62,
        thumpVol = 0.55,
        crackVol = 0.95,
        tailVol = 0.28,
        vol = 0.52,
        highpass = 420,
        lowpass = 5200,
    } = {}) => {
        const ac = ensure();
        if (!ac) return;
        const t = ac.currentTime;
        const sr = ac.sampleRate;
        const len = Math.floor(sr * duration);
        const buffer = ac.createBuffer(1, len, sr);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < len; i++) {
            const sec = i / sr;
            const click = sec < 0.004 ? 1.35 : 0;
            const crackEnv = Math.exp(-sec / crackDecay);
            const tailEnv = Math.exp(-sec / tailDecay);
            const thumpEnv = Math.exp(-sec / 0.038);
            const n = Math.random() * 2 - 1;
            const thump = Math.sin(2 * Math.PI * thumpHz * sec * (1 - sec * 1.8)) * thumpEnv;
            data[i] =
                vol *
                (click * 0.9 +
                    n * crackVol * crackEnv +
                    thump * thumpVol +
                    n * tailVol * tailEnv);
        }

        const src = ac.createBufferSource();
        src.buffer = buffer;
        const hp = ac.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = highpass;
        const lp = ac.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = lowpass;
        lp.Q.value = 0.65;
        const g = ac.createGain();
        g.gain.setValueAtTime(1, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + duration + 0.04);
        src.connect(hp);
        hp.connect(lp);
        lp.connect(g);
        g.connect(master);
        src.start(t);
        src.stop(t + duration + 0.05);
    };

    const playShoot = (weaponId = "winchester") => {
        if (weaponId === "katana") {
            noise(0.07, 0.12, 2400);
            tone(520, "sine", 0.08, 0.1, 820);
            return;
        }

        loadGunSamples().then((samples) => {
            if (!samples) {
                playGunshotFallback({ vol: 0.5 });
                return;
            }

            switch (weaponId) {
                case "auto":
                    playSample(samples.pistol, { rate: 1.12, vol: 0.58 });
                    break;
                case "bazooka":
                    playSample(samples.shotgun, { rate: 0.52, vol: 0.82 });
                    playGunshotFallback({
                        duration: 0.35,
                        crackDecay: 0.08,
                        tailDecay: 0.22,
                        thumpHz: 36,
                        thumpVol: 0.9,
                        crackVol: 0.5,
                        tailVol: 0.45,
                        vol: 0.35,
                        highpass: 90,
                        lowpass: 1800,
                    });
                    break;
                case "grenade":
                    playSample(samples.pistol, { rate: 0.95, vol: 0.28 });
                    break;
                case "winchester_shotgun":
                    playSample(samples.shotgun, { rate: 1, vol: 0.78 });
                    break;
                case "sniper":
                    playSample(samples.rifle, { rate: 1, vol: 0.74 });
                    break;
                default:
                    playSample(samples.pistol, { rate: 1, vol: 0.68 });
                    break;
            }
        });
    };

    const playBulletHit = (isPlayer = false) => {
        if (isPlayer) {
            noise(0.05, 0.18, 400);
            tone(220, "sine", 0.08, 0.14, 120);
        } else {
            noise(0.04, 0.14, 1800);
            tone(890, "triangle", 0.03, 0.09, 420);
        }
    };

    const playHeadshot = () => {
        const ac = ensure();
        if (!ac) return;
        const t = ac.currentTime;
        const dur = 0.13;
        const sr = ac.sampleRate;
        const len = Math.floor(sr * dur);
        const buf = ac.createBuffer(1, len, sr);
        const d = buf.getChannelData(0);

        for (let i = 0; i < len; i++) {
            const sec = i / sr;
            const env = Math.exp(-sec / 0.048);
            const crack = sec < 0.0035 ? (Math.random() * 2 - 1) * 2.4 : 0;
            const punchHz = 55 + 420 * Math.exp(-sec * 16);
            const punch = Math.sin(2 * Math.PI * punchHz * sec);
            const wet = (Math.random() * 2 - 1) * Math.exp(-sec / 0.012) * 0.22;
            d[i] = Math.tanh(env * (crack * 0.55 + punch * 0.82 + wet));
        }

        const src = ac.createBufferSource();
        src.buffer = buf;
        const bp = ac.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 420;
        bp.Q.value = 0.55;
        const g = ac.createGain();
        g.gain.setValueAtTime(0.68, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        src.connect(bp);
        bp.connect(g);
        g.connect(master);
        src.start(t);
        src.stop(t + dur + 0.01);
    };

    const playDeath = () => {
        tone(180, "sawtooth", 0.25, 0.22, 55);
        tone(120, "sine", 0.4, 0.2, 40);
        noise(0.15, 0.12, 300);
    };

    const playFootstep = () => {
        const now = Date.now();
        if (now - lastFootstepAt < 220) return;
        lastFootstepAt = now;
        noise(0.03, 0.07, 350);
        tone(90 + Math.random() * 30, "sine", 0.025, 0.05, 60);
    };

    const playJump = () => {
        noise(0.035, 0.1, 500);
        tone(140, "sine", 0.07, 0.12, 320);
        tone(220, "triangle", 0.05, 0.06, 380);
    };

    const playPickupLand = () => {
        tone(660, "sine", 0.06, 0.08, 880);
        tone(440, "triangle", 0.08, 0.06, 550);
    };

    const playRoundWin = () => {
        const ac = ensure();
        if (!ac) return;
        const t = ac.currentTime;
        const melody = [
            { freq: 523.25, at: 0, dur: 0.13, type: "square", vol: 0.09, end: 659.25 },
            { freq: 659.25, at: 0.11, dur: 0.13, type: "square", vol: 0.1, end: 783.99 },
            { freq: 783.99, at: 0.23, dur: 0.16, type: "sine", vol: 0.14, end: 987.77 },
            { freq: 1046.5, at: 0.4, dur: 0.55, type: "triangle", vol: 0.17, end: 1318.5 },
        ];
        for (const n of melody) {
            const osc = ac.createOscillator();
            const g = ac.createGain();
            osc.type = n.type;
            osc.frequency.setValueAtTime(n.freq, t + n.at);
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, n.end), t + n.at + n.dur);
            g.gain.setValueAtTime(n.vol, t + n.at);
            g.gain.exponentialRampToValueAtTime(0.001, t + n.at + n.dur);
            osc.connect(g);
            g.connect(master);
            osc.start(t + n.at);
            osc.stop(t + n.at + n.dur + 0.02);
        }
        const bass = ac.createOscillator();
        const bassGain = ac.createGain();
        bass.type = "sine";
        bass.frequency.setValueAtTime(130.81, t);
        bass.frequency.exponentialRampToValueAtTime(65, t + 0.55);
        bassGain.gain.setValueAtTime(0.14, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        bass.connect(bassGain);
        bassGain.connect(master);
        bass.start(t);
        bass.stop(t + 0.58);
        noise(0.1, 0.06, 3200);
    };

    const playMatchWin = () => {
        const ac = ensure();
        if (!ac) return;
        const t = ac.currentTime;
        const fanfare = [
            { freq: 392, at: 0, dur: 0.12, type: "square", vol: 0.1, end: 523 },
            { freq: 523, at: 0.1, dur: 0.12, type: "square", vol: 0.11, end: 659 },
            { freq: 659, at: 0.2, dur: 0.14, type: "sine", vol: 0.13, end: 784 },
            { freq: 784, at: 0.34, dur: 0.16, type: "sine", vol: 0.15, end: 988 },
            { freq: 988, at: 0.5, dur: 0.75, type: "triangle", vol: 0.18, end: 1175 },
        ];
        for (const n of fanfare) {
            const osc = ac.createOscillator();
            const g = ac.createGain();
            osc.type = n.type;
            osc.frequency.setValueAtTime(n.freq, t + n.at);
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, n.end), t + n.at + n.dur);
            g.gain.setValueAtTime(n.vol, t + n.at);
            g.gain.exponentialRampToValueAtTime(0.001, t + n.at + n.dur);
            osc.connect(g);
            g.connect(master);
            osc.start(t + n.at);
            osc.stop(t + n.at + n.dur + 0.02);
        }
        noise(0.14, 0.07, 2800);
    };

    return { init, playShoot, playBulletHit, playHeadshot, playDeath, playFootstep, playJump, playPickupLand, playRoundWin, playMatchWin };
})();

document.addEventListener("pointerdown", () => {
    Sfx.init();
    focusGameInput();
}, { once: true, capture: true });
window.addEventListener("keydown", () => {
    Sfx.init();
    focusGameInput();
}, { once: true, capture: true });
gameContainerEl.addEventListener("pointerenter", focusGameInput);
gameContainerEl.addEventListener("pointerdown", focusGameInput, { capture: true });

// State
let latestState = null;
let localPlayers = {};
let localBullets = new Map();
let particles = [];
let prevPlatformBroken = {};
let prevRoundPhase = null;
let prevLastRoundWinner = null;
let prevMatchEnded = false;

const bordikoHost = connectBordiko();
const hostMove = bordikoHost.move.bind(bordikoHost);
bordikoHost.move = (type, payload) => {
    console.log("[stickman-shooter] -> host move", type, payload);
    hostMove(type, payload);
};

let hostStateCount = 0;
let hostReadyPulse = null;

const signalHostReady = () => {
    try {
        window.parent.postMessage({ t: "bordiko:ready" }, "*");
    } catch (err) {
        console.warn("[stickman-shooter] bordiko:ready postMessage failed", err);
    }
};

const startHostReadyPulse = () => {
    signalHostReady();
    if (hostReadyPulse) return;
    hostReadyPulse = setInterval(() => {
        if (hostStateCount > 0) {
            clearInterval(hostReadyPulse);
            hostReadyPulse = null;
            return;
        }
        signalHostReady();
    }, 750);
};

window.addEventListener(
    "message",
    (event) => {
        const msg = event.data;
        if (msg && msg.t === "bordiko:state" && msg.state) {
            console.log("[stickman-shooter] <- host raw state", {
                moveCount: msg.state.moveCount,
                playerId: msg.state.playerId,
            });
        }
    },
    true,
);

const proposeMove = (type, payload) => {
    if (!latestState || latestState.ended) return;
    const G = latestState.G;

    if (!isGameplayInputEnabled(G) && !isIdleTickPhase(G) && !isPreMatchCountdown()) {
        return;
    }

    bordikoHost.move(type, payload ?? {});
};

// Input
const activeKeys = new Set();
let mouseX = 0;
let mouseY = 0;
let jumpQueued = false;
let pointerHeld = false;

const isJumpKey = (code) =>
  code === "Space" || code === "KeyW" || code === "ArrowUp";

const isCrouchKey = (code, key) =>
  code === "KeyS" || code === "ArrowDown" || key === "s";

window.addEventListener("mousemove", (e) => {
    const pt = clientToArena(e.clientX, e.clientY);
    mouseX = pt.x;
    mouseY = pt.y;
});

document.addEventListener("pointerdown", (e) => {
    if (!latestState) return;
    if (!isGameplayInputEnabled(latestState.G)) return;
    pointerHeld = true;
});

document.addEventListener("pointerup", () => {
    pointerHeld = false;
});

const sendSwitchWeapon = (weaponId) => {
    const me = latestState ? localPlayers[latestState.playerId] : null;
    const owned = me?.ownedWeapons ?? ["winchester"];
    if (!owned.includes(weaponId)) return;
    proposeMove("switchWeapon", { weaponId });
};

const sendCycleWeapon = () => {
    const me = latestState ? localPlayers[latestState.playerId] : null;
    const owned = me?.ownedWeapons ?? ["winchester"];
    if (owned.length <= 1) return;
    proposeMove("switchWeapon", { cycle: true });
};

const getOrderedOwnedWeapons = (playerId) => {
    const owned = latestState?.G?.players?.[playerId]?.ownedWeapons;
    const list = owned?.length ? owned : ["winchester"];
    return WEAPON_ORDER.filter((id) => list.includes(id));
};

window.addEventListener("keydown", (e) => {
    activeKeys.add(e.code);
    if (e.key) activeKeys.add(e.key.toLowerCase());
    if (isJumpKey(e.code) && !e.repeat) {
        jumpQueued = true;
    }
    if (e.code === "Space" || e.code === "KeyW" || e.code === "KeyS") {
        e.preventDefault();
    }

    const digitIdx = {
        Digit1: 0,
        Digit2: 1,
        Digit3: 2,
        Digit4: 3,
        Digit5: 4,
        Digit6: 5,
        Digit7: 6,
    };
    if (digitIdx[e.code] != null && !e.repeat && latestState && isGameplayInputEnabled(latestState.G)) {
        const owned = getOrderedOwnedWeapons(latestState.playerId);
        const weaponId = owned[digitIdx[e.code]];
        if (weaponId) sendSwitchWeapon(weaponId);
    }
    if (e.code === "KeyQ" && !e.repeat) {
        sendCycleWeapon();
    }
});

window.addEventListener("keyup", (e) => {
    activeKeys.delete(e.code);
    if (e.key) activeKeys.delete(e.key.toLowerCase());
});

function isKeyPressed(...k) {
    return k.some(key => activeKeys.has(key));
}

let prevPickupIds = new Set();

// Network Sync
const handleGameState = (state) => {
        hostStateCount += 1;
        console.log("[stickman-shooter] onGameState", {
            n: hostStateCount,
            moveCount: state?.moveCount,
            playerId: state?.playerId,
            yourTurn: state?.yourTurn,
            legalMoves: state?.legalMoves?.length ?? 0,
            ended: state?.ended,
            roundPhase: state?.G?.roundPhase,
            players: state?.G?.players ? Object.keys(state.G.players).length : 0,
        });

        latestState = state;
        fitCanvas();
        const G = latestState.G;

        if (G && localCountdownStartAt == null) {
            beginStartCountdown();
        }

        updateStartOverlay();

        drawPlatforms(getPlatformsForRender(G));
        drawPickups(G?.pickups ?? [], getPlatformsForRender(G));

        if (latestState.ended && !prevMatchEnded) {
            Sfx.playMatchWin();
        }
        prevMatchEnded = !!latestState.ended;

        const curPickupIds = new Set((G?.pickups ?? []).map((p) => p.id));
        const pickupCollected = [...prevPickupIds].some((id) => !curPickupIds.has(id));
        prevPickupIds = curPickupIds;

        if (G && G.players) {
            if (
                G.roundPhase === "intermission" &&
                G.lastRoundWinner &&
                G.lastRoundWinner !== prevLastRoundWinner
            ) {
                Sfx.playRoundWin();
            }
            if (G.roundPhase === "intermission" && prevRoundPhase === "playing") {
                finalizeAllDeathCorpses();
            }
            if (
                G.roundPhase === "playing" &&
                latestState.playerId &&
                countAliveOpponents(G, latestState.playerId) === 0 &&
                Object.values(G.players).some((pl) => pl.health <= 0)
            ) {
                finalizeAllDeathCorpses();
            }
            if (G.roundPhase === "playing") {
                prevLastRoundWinner = null;
            } else if (G.lastRoundWinner) {
                prevLastRoundWinner = G.lastRoundWinner;
            }
            prevRoundPhase = G.roundPhase ?? "playing";

            const liveIds = new Set(Object.keys(G.players));
            for (const id of Object.keys(localPlayers)) {
                if (!liveIds.has(id)) delete localPlayers[id];
            }

            for (const [id, p] of Object.entries(G.players)) {
                if (!localPlayers[id]) {
                    localPlayers[id] = {
                        ...p,
                        displayTorso: { ...p.torso },
                        displayHead: { ...p.head },
                        prevHealth: p.health,
                        walkPhase: 0,
                        facing: 1,
                        walkDir: 1,
                        vx: 0,
                        vy: 0,
                        grounded: true,
                        walking: false,
                        airborne: false,
                        crouching: !!p.crouching,
                        currentWeapon: p.currentWeapon || "winchester",
                        ownedWeapons: p.ownedWeapons?.length ? [...p.ownedWeapons] : ["winchester"],
                        faceExpr: "serious",
                        faceTimer: 0,
                        moodSeed: moodSeedFromId(id),
                        weaponRecoil: { arm: 0, torso: 0, aimKick: 0 },
                        katanaSwing: 0,
                        katanaEquip: 1,
                        lastFireTick: p.lastFireTick ?? 0,
                    };
                } else {
                    const lp = localPlayers[id];
                    const prevX = lp.torso?.x ?? p.torso.x;
                    const prevY = lp.torso?.y ?? p.torso.y;
                    const prevWeapon = lp.currentWeapon;
                    const prevFireTick = lp.lastFireTick ?? 0;

                    if (p.health < lp.prevHealth) {
                        lp.faceTimer = Math.max(lp.faceTimer ?? 0, 0.35);
                    }
                    if (p.health <= 0 && lp.prevHealth > 0) {
                        startDeathCorpse(lp);
                        Sfx.playDeath();
                    }
                    if (p.health > 0) {
                        lp.deathCorpse = null;
                    }
                    lp.prevHealth = p.health;

                    lp.vx = p.torso.x - prevX;
                    lp.vy = p.torso.y - prevY;
                    lp.health = p.health;
                    lp.crouching = !!p.crouching;
                    lp.currentWeapon = p.currentWeapon || "winchester";
                    lp.ownedWeapons = p.ownedWeapons?.length ? [...p.ownedWeapons] : ["winchester"];
                    lp.torso = p.torso;
                    lp.head = p.head;
                    lp.lastFireTick = p.lastFireTick ?? 0;

                    if (p.currentWeapon === "katana" && prevWeapon !== "katana" && pickupCollected) {
                        startKatanaEquip(lp);
                    }
                    if (p.currentWeapon === "katana" && lp.lastFireTick > prevFireTick) {
                        if (id !== latestState.playerId) {
                            startKatanaSwing(lp);
                        }
                    }

                    if (id !== latestState.playerId) {
                        lp.aimAngle = p.aimAngle;
                    }
                }
            }
        }

        if (G && G.platforms) {
            for (const plat of G.platforms) {
                const wasBroken = prevPlatformBroken[plat.id];
                if (wasBroken === false && plat.broken) {
                    createSparkHit(plat.x + plat.w / 2, plat.y + plat.h / 2, 0.35);
                }
                prevPlatformBroken[plat.id] = plat.broken;
            }
        }

        if (G && G.hitEvents) {
            for (const hit of G.hitEvents) {
                if (hit.damage > 0) {
                    const targetPlayer = localPlayers[hit.targetId];
                    const hitX = hit.isHeadshot && targetPlayer?.displayHead
                        ? targetPlayer.displayHead.x
                        : hit.x;
                    const hitY = hit.isHeadshot && targetPlayer?.displayHead
                        ? targetPlayer.displayHead.y
                        : hit.y;
                    createPlayerHitEffect(hitX, hitY, hit.isHeadshot);
                    if (targetPlayer) {
                        markBulletHitFace(targetPlayer, hit.isHeadshot);
                    }
                    if (hit.isHeadshot) {
                        createHeadshotMarker(hitX, hitY);
                        Sfx.playHeadshot();
                    } else {
                        Sfx.playBulletHit(true);
                    }
                } else if (!pickupCollected) {
                    createWallHit(hit.x, hit.y);
                    Sfx.playBulletHit(false);
                }
            }
        }

        const hadHitEvents = !!(G && G.hitEvents && G.hitEvents.length);

        if (G && G.bullets) {
            const serverBulletIds = new Set(G.bullets.map(b => b.id));
            for (const [id, lb] of localBullets.entries()) {
                if (!serverBulletIds.has(id)) {
                    if (!hadHitEvents && lb.body) {
                        let dx = 0;
                        let dy = -1;
                        if (lb.prevBody) {
                            dx = lb.body.x - lb.prevBody.x;
                            dy = lb.body.y - lb.prevBody.y;
                        }
                        createWallHit(lb.body.x, lb.body.y, -dx, -dy);
                        Sfx.playBulletHit(false);
                    }
                    if (lb.g) {
                        bulletsContainer.removeChild(lb.g);
                        lb.g.destroy();
                    }
                    localBullets.delete(id);
                }
            }
            for (const b of G.bullets) {
                if (!localBullets.has(b.id)) {
                    const g = new Graphics();
                    bulletsContainer.addChild(g);
                    localBullets.set(b.id, { ...b, prevBody: { ...b.body }, displayBody: { ...b.body }, g });
                    const wId = b.weaponId || localPlayers[b.owner]?.currentWeapon || "winchester";
                    createMuzzleFlash(b.body.x, b.body.y, wId);
                    Sfx.playShoot(wId);
                    const shooter = localPlayers[b.owner];
                    if (shooter) {
                        markShootFace(shooter);
                        triggerWeaponRecoil(shooter, wId);
                        if (b.owner === latestState?.playerId) {
                            triggerRecoilShake(wId);
                        }
                    }
                } else {
                    const lb = localBullets.get(b.id);
                    if (lb.body) {
                        lb.vx = b.body.x - lb.body.x;
                        lb.vy = b.body.y - lb.body.y;
                    }
                    lb.prevBody = lb.body ? { ...lb.body } : null;
                    lb.body = b.body;
                    lb.kind = b.kind;
                }
            }
        }
};


// Particles & hit effects
function spawnParticle(x, y, vx, vy, color, size, lifeDecay, gravityMul = 0.5, isBlood = false, additive = true) {
    const g = new Graphics();
    g.beginFill(color);
    g.drawCircle(0, 0, size);
    g.endFill();
    g.position.set(x, y);
    if (!isBlood && additive) g.blendMode = BLEND_MODES.ADD;
    particlesContainer.addChild(g);
    particles.push({
        mesh: g,
        vx,
        vy,
        life: 1,
        lifeDecay,
        gravityMul,
        isBlood,
    });
}

function createMuzzleFlash(x, y, weaponId = "winchester") {
    const scale = WEAPON_MUZZLE[weaponId] ?? 0.45;
    const count = Math.min(5, Math.floor(2 + scale * 2));
    const coreColor = weaponId === "bazooka" ? 0xff6622 : weaponId === "sniper" ? 0xffeeaa : 0xffdd66;
    for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = (2 + Math.random() * 3) * scale;
        spawnParticle(x, y, Math.cos(a) * s, Math.sin(a) * s, coreColor, 1.2 + scale * 0.8, 0.05, 0.2);
    }
    if (scale >= 0.7) {
        spawnParticle(x, y, 0, 0, 0xff4422, 3 + scale * 1.5, 0.04, 0.08);
    }
}

const triggerRecoilShake = (weaponId) => {
    const power = WEAPON_RECOIL_SHAKE[weaponId] ?? 0.75;
    recoilShake = power;
    recoilShakeX = (Math.random() - 0.5) * power;
    recoilShakeY = (Math.random() - 0.5) * power * 0.6;
};

const initWeaponRecoil = (p) => {
    if (!p.weaponRecoil) p.weaponRecoil = { arm: 0, torso: 0, aimKick: 0 };
};

const triggerWeaponRecoil = (p, weaponId) => {
    if (!p || weaponId === "katana") return;
    initWeaponRecoil(p);
    const prof = WEAPON_VISUAL_RECOIL[weaponId] ?? WEAPON_VISUAL_RECOIL.winchester;
    p.weaponRecoil.arm = Math.max(p.weaponRecoil.arm, prof.arm);
    p.weaponRecoil.aimKick = prof.aim;
};

const tickWeaponRecoil = (p, dt) => {
    if (!p.weaponRecoil) {
        p.recoilTorsoOffX = 0;
        p.recoilTorsoOffY = 0;
        return;
    }
    const r = p.weaponRecoil;
    const decay = Math.pow(0.72, dt);
    r.arm *= decay;
    r.aimKick *= decay;
    r.torso += (r.arm * 0.45 - r.torso) * 0.18 * dt;
    if (r.arm < 0.05) r.arm = 0;
    if (Math.abs(r.torso) < 0.05) r.torso = 0;
    if (Math.abs(r.aimKick) < 0.002) r.aimKick = 0;
    const aim = p.aimAngle || 0;
    p.recoilTorsoOffX = -Math.cos(aim) * r.torso * 0.35;
    p.recoilTorsoOffY = -Math.sin(aim) * r.torso * 0.35;
};

const getKatanaSwingOffsets = (p) => {
    const t = p.katanaSwing ?? 0;
    if (t <= 0) return { aimOffset: 0, armReach: 0, trailAlpha: 0 };
    if (t < 0.25) {
        const w = t / 0.25;
        return { aimOffset: -0.75 * w, armReach: -6 * w, trailAlpha: 0 };
    }
    if (t < 0.7) {
        const s = (t - 0.25) / 0.45;
        return {
            aimOffset: -0.75 + 1.35 * s,
            armReach: -6 + 14 * s,
            trailAlpha: 0.85 * (1 - s * 0.45),
        };
    }
    const r = (t - 0.7) / 0.3;
    return {
        aimOffset: 0.6 * (1 - r),
        armReach: 8 * (1 - r),
        trailAlpha: 0.25 * (1 - r),
    };
};

const startKatanaSwing = (p) => {
    if (!p) return;
    p.katanaSwing = 0.001;
    p.katanaSwingStartedAt = Date.now();
    p.katanaSwingDir = p.facing || 1;
};

const tickKatanaSwing = (p) => {
    if (!p.katanaSwing || p.katanaSwing <= 0) return;
    const elapsed = Date.now() - (p.katanaSwingStartedAt || 0);
    p.katanaSwing = Math.min(1, elapsed / KATANA_SWING_MS);
    if (p.katanaSwing >= 1) {
        p.katanaSwing = 0;
        p.katanaSwingStartedAt = 0;
    }
};

const startKatanaEquip = (p) => {
    if (!p) return;
    p.katanaEquip = 0.001;
    p.katanaEquipStartedAt = Date.now();
};

const tickKatanaEquip = (p) => {
    if (p.katanaEquip == null || p.katanaEquip >= 1) {
        p.katanaEquip = 1;
        return;
    }
    const elapsed = Date.now() - (p.katanaEquipStartedAt || 0);
    p.katanaEquip = Math.min(1, elapsed / KATANA_EQUIP_MS);
};

const getEffectiveAim = (p) => {
    let aim = p.aimAngle || 0;
    if (p.weaponRecoil?.aimKick) aim += p.weaponRecoil.aimKick;
    if (p.currentWeapon === "katana" && (p.katanaSwing ?? 0) > 0) {
        aim += getKatanaSwingOffsets(p).aimOffset * (p.katanaSwingDir || p.facing || 1);
    }
    return aim;
};

const applyVisualRecoilToGun = (gun, p) => {
    const r = p.weaponRecoil;
    if (!r || (r.arm < 0.01 && r.torso < 0.01)) return gun;
    const cos = Math.cos(gun.aim);
    const sin = Math.sin(gun.aim);
    gun.handX -= cos * r.arm;
    gun.handY -= sin * r.arm;
    gun.muzzleX -= cos * r.arm;
    gun.muzzleY -= sin * r.arm;
    gun.shoulderX -= cos * r.torso * 0.55;
    gun.shoulderY -= sin * r.torso * 0.55;
    if (gun.backHandX != null) {
        gun.backHandX -= cos * r.torso * 0.35;
        gun.backHandY -= sin * r.torso * 0.35;
    }
    if (gun.gripX != null) {
        gun.gripX -= cos * r.torso * 0.4;
        gun.gripY -= sin * r.torso * 0.4;
    }
    return gun;
};

// Hit FX rate limiting
let hitFxBudget = 0;
let hitFxResetAt = 0;
let surfaceHitFxBudget = 0;
let surfaceHitFxResetAt = 0;

function createWallHit(x, y, dirX = 0, dirY = -1) {
    const now = performance.now();
    if (now > surfaceHitFxResetAt) {
        surfaceHitFxBudget = 0;
        surfaceHitFxResetAt = now + 48;
    }
    if (surfaceHitFxBudget >= 8) return;
    surfaceHitFxBudget += 1;

    const len = Math.hypot(dirX, dirY) || 1;
    const nx = dirX / len;
    const ny = dirY / len;
    const tx = -ny;
    const ty = nx;

    const ring = new Graphics();
    ring.position.set(x, y);
    particlesContainer.addChild(ring);
    hitRings.push({ g: ring, life: 1, maxR: 13, color: 0xffbb66 });

    spawnParticle(x, y, 0, 0, 0xffeebb, 1.65, 0.13, 0.045, false, true);

    for (let i = 0; i < 5; i++) {
        const spread = (i - 2) * 0.42;
        const px = nx + tx * spread;
        const py = ny + ty * spread;
        const plen = Math.hypot(px, py) || 1;
        const speed = 1.6 + Math.random() * 2.4;
        spawnParticle(
            x,
            y,
            (px / plen) * speed,
            (py / plen) * speed,
            i % 2 === 0 ? 0xffcc77 : 0xffaa55,
            0.95 + Math.random() * 0.4,
            0.1,
            0.24,
            false,
            i === 0,
        );
    }

    for (let i = 0; i < 4; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 0.5 + Math.random() * 1.2;
        spawnParticle(x, y, Math.cos(a) * s, Math.sin(a) * s, 0x888899, 0.5, 0.1, 0.18, false, false);
    }
}

function createSurfaceHit(x, y, dirX = 0, dirY = -1) {
    createWallHit(x, y, dirX, dirY);
}

function createSparkHit(x, y, intensity = 1) {
    const now = performance.now();
    if (now > hitFxResetAt) {
        hitFxBudget = 0;
        hitFxResetAt = now + 48;
    }
    if (hitFxBudget >= 3) return;
    hitFxBudget += 1;

    const count = intensity >= 0.5 ? Math.max(1, Math.round(intensity)) : 1;
    for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = (0.6 + Math.random() * 1.4) * intensity;
        spawnParticle(x, y, Math.cos(a) * s, Math.sin(a) * s, 0xffaa44, 0.65 * intensity, 0.09, 0.2, false, false);
    }
}

function createBloodSpray(x, y, isHeadshot = false) {
    const count = isHeadshot ? 28 : 2;
    for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * (isHeadshot ? 1.8 : 0.5);
        const s = (isHeadshot ? 2.2 : 0.8) + Math.random() * (isHeadshot ? 4.5 : 1.8);
        spawnParticle(
            x + (Math.random() - 0.5) * (isHeadshot ? 6 : 0),
            y + (Math.random() - 0.5) * (isHeadshot ? 4 : 0),
            Math.cos(a) * s,
            Math.sin(a) * s - (isHeadshot ? 1.1 : 0.35),
            Math.random() > 0.35 ? 0xcc2222 : 0x880808,
            (isHeadshot ? 1.1 : 0.55) + Math.random() * (isHeadshot ? 1.4 : 0.5),
            isHeadshot ? 0.018 : 0.035,
            isHeadshot ? 0.32 : 0.16,
            true,
        );
    }
}

function createHeadshotBloodBurst(x, y) {
    createBloodSpray(x, y, true);

    for (let i = 0; i < 14; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
        const s = 1.8 + Math.random() * 3.2;
        spawnParticle(
            x + (Math.random() - 0.5) * 10,
            y - 2,
            Math.cos(a) * s * 0.55,
            Math.sin(a) * s - 1.4,
            Math.random() > 0.4 ? 0xdd1111 : 0x661010,
            0.9 + Math.random() * 1.1,
            0.02,
            0.38,
            true,
        );
    }

    for (const eyeOffset of [-5, 5]) {
        for (let i = 0; i < 6; i++) {
            const a = (Math.random() - 0.5) * Math.PI * 0.9;
            const s = 1.2 + Math.random() * 2.4;
            spawnParticle(
                x + eyeOffset,
                y - 1,
                Math.cos(a) * s,
                Math.sin(a) * s - 0.6,
                0xaa0a0a,
                0.55 + Math.random() * 0.75,
                0.025,
                0.28,
                true,
            );
        }
    }

    spawnParticle(x, y, 0, 0, 0xff4444, 5, 0.06, 0.05, true, false);
}

function createPlayerHitEffect(x, y, isHeadshot = false) {
    if (isHeadshot) {
        createHeadshotBloodBurst(x, y);
        return;
    }
    createBloodSpray(x, y, false);
}

function createHeadshotMarker(x, y) {
    const txt = new Text('HS', {
        fontFamily: 'Arial Black, Impact, sans-serif',
        fontSize: 9,
        fontWeight: '900',
        fill: 0xffeedd,
        stroke: 0x660011,
        strokeThickness: 2,
    });
    txt.anchor.set(0.5, 0.5);
    txt.position.set(x, y - 12);

    particlesContainer.addChild(txt);
    particles.push({
        mesh: txt,
        vx: 0,
        vy: -0.55,
        life: 1,
        lifeDecay: 0.028,
        gravityMul: 0,
        isBlood: true,
        isText: false,
    });
}

function createHitFlash(x, y) {
    spawnParticle(x, y, 0, 0, 0xff4422, 2.5, 0.05, 0.08);
    for (let i = 0; i < 3; i++) {
        spawnParticle(x, y, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0xffffff, 1.2, 0.07, 0.08);
    }
}

const hitRings = [];

function createHitBurst(x, y) {
    const ring = new Graphics();
    ring.position.set(x, y);
    particlesContainer.addChild(ring);
    hitRings.push({ g: ring, life: 1, maxR: 14 });
    createHitFlash(x, y);
}

// Stickman drawing + animation helpers
const VISUAL_STAND_LIFT = 5;

const getStickPose = (p) => {
    const tx = p.displayTorso.x + (p.recoilTorsoOffX ?? 0);
    const ty = p.displayTorso.y + (p.recoilTorsoOffY ?? 0);
    const crouch = !!p.crouching && p.grounded;
    const drop = crouch ? STICK.crouchDrop : 0;
    const standLift = p.grounded && !p.airborne ? VISUAL_STAND_LIFT : 0;
    const footY = ty + FEET_OFF - standLift;
    const hipY = ty + FEET_OFF * 0.18 + drop * 0.28 - standLift * 0.4;
    const neckTop = ty - STICK.bodyLen * 0.48 + drop * 0.38;
    const hx = p.displayHead.x;
    const hy = crouch ? p.displayHead.y + drop * 0.58 : p.displayHead.y;
    return { tx, ty, hx, hy, neckTop, hipY, footY, crouch, drop };
};

const getGunPose = (p) => {
    const pose = getStickPose(p);
    const aim = getEffectiveAim(p);
    const f = p.facing || 1;
    const weaponId = p.currentWeapon || "winchester";
    const barrel = WEAPON_BARREL[weaponId] ?? GUN.barrel;
    const cos = Math.cos(aim);
    const sin = Math.sin(aim);
    const px = -sin;
    const py = cos;

    const shoulderX = pose.tx + f * 2.5;
    const shoulderY = pose.neckTop + 2;

    if (weaponId === "bazooka") {
        const mountX = pose.tx + f * 3;
        const mountY = pose.neckTop + 6;
        const tubeLen = barrel;
        const muzzleX = mountX + cos * tubeLen;
        const muzzleY = mountY + sin * tubeLen;
        const frontHandX = mountX + cos * (tubeLen * 0.52) + px * f * 2;
        const frontHandY = mountY + sin * (tubeLen * 0.52) + py * f * 2;
        const gripX = mountX + cos * 10;
        const gripY = mountY + sin * 10;
        const backHandX = mountX - f * 5;
        const backHandY = mountY + 5;
        return applyVisualRecoilToGun({
            ...pose,
            aim,
            f,
            shoulderX: mountX,
            shoulderY: mountY,
            handX: frontHandX,
            handY: frontHandY,
            gripX,
            gripY,
            muzzleX,
            muzzleY,
            backHandX,
            backHandY,
            weaponId,
            barrel,
            carryStyle: "shoulder",
            tubeLen,
        }, p);
    }

    if (weaponId === "katana") {
        const equip = p.katanaEquip ?? 1;
        const swing = getKatanaSwingOffsets(p);
        const readyReach = STICK.armLen + 4 + swing.armReach;
        const idleReach = STICK.armLen * 0.35 + (1 - equip) * 10;
        const reach = idleReach + (readyReach - idleReach) * equip;
        const handX = shoulderX + cos * reach;
        const handY = shoulderY + sin * reach;
        const backReach = STICK.armLen * (0.35 + 0.2 * equip) - swing.armReach * 0.25;
        const backHandX = shoulderX + cos * backReach - px * f * (6 * equip);
        const backHandY = shoulderY + sin * backReach - py * f * (6 * equip);
        const muzzleX = handX + cos * barrel;
        const muzzleY = handY + sin * barrel;
        return applyVisualRecoilToGun({
            ...pose,
            aim,
            f,
            shoulderX,
            shoulderY,
            handX,
            handY,
            muzzleX,
            muzzleY,
            backHandX,
            backHandY,
            weaponId,
            barrel,
            carryStyle: "twoHand",
            katanaTrailAlpha: swing.trailAlpha,
        }, p);
    }

    const armLen =
        weaponId === "grenade"
            ? STICK.armLen * 0.75
            : weaponId === "sniper"
              ? STICK.armLen + 2
              : STICK.armLen;
    const handX = shoulderX + cos * armLen;
    const handY = shoulderY + sin * armLen;
    const muzzleDist = barrel + GUN.tipR * 0.4;
    const muzzleX = handX + cos * muzzleDist;
    const muzzleY = handY + sin * muzzleDist;
    const backHandX = pose.tx - f * (weaponId === "auto" ? 7 : STICK.footSpread);
    const backHandY = pose.neckTop + (weaponId === "auto" ? 16 : 13);
    return applyVisualRecoilToGun({
        ...pose,
        aim,
        f,
        shoulderX,
        shoulderY,
        handX,
        handY,
        muzzleX,
        muzzleY,
        backHandX,
        backHandY,
        weaponId,
        barrel,
        carryStyle: "handheld",
    }, p);
};

const drawGunInHand = (g, gun, isMe) => {
    drawWeaponInHand(g, gun, isMe);
};

const drawWeaponInHand = (g, gun, isMe) => {
    const { handX, handY, aim, muzzleX, muzzleY, weaponId, barrel, shoulderX, shoulderY, tubeLen, f } = gun;
    const cos = Math.cos(aim);
    const sin = Math.sin(aim);
    const px = -sin;
    const py = cos;

    const at = (ox, oy, along, across) => ({
        x: ox + cos * along + px * across,
        y: oy + sin * along + py * across,
    });

    const atHand = (along, across) => at(handX, handY, along - (gun.carryStyle === "handheld" ? 0 : 0), across);

    const slideCol = isMe ? 0x3d3d3d : 0x4a4a4a;
    const frameCol = 0x2a2a2a;
    const gripCol = 0x1c1410;
    const accentCol = weaponId === "bazooka" ? 0xff8844 : 0xffe135;
    const outlineCol = 0x111111;

    const poly = (points) => {
        if (!points.length) return;
        g.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) g.lineTo(points[i].x, points[i].y);
        g.closePath();
    };

    g.lineStyle(1.5, outlineCol, 1, 0.5, true);

    if (weaponId === "katana") {
        const trailAlpha = gun.katanaTrailAlpha ?? 0;
        if (trailAlpha > 0.05) {
            g.lineStyle(5, 0xc8e8ff, trailAlpha * 0.55, 0.5, true, LINE_CAP.ROUND);
            g.moveTo(handX - cos * 8, handY - sin * 8);
            g.lineTo(muzzleX + cos * 12, muzzleY + sin * 12);
            g.lineStyle(2.5, 0xffffff, trailAlpha * 0.35, 0.5, true, LINE_CAP.ROUND);
            g.moveTo(handX, handY);
            g.lineTo(muzzleX + cos * 6, muzzleY + sin * 6);
        }
        g.lineStyle(1.5, outlineCol, 1, 0.5, true);
        g.beginFill(0xe8f4ff);
        poly([
            { x: handX + cos * 4 - px * 2, y: handY + sin * 4 - py * 2 },
            { x: handX + cos * barrel - px * 1.2, y: handY + sin * barrel - py * 1.2 },
            { x: handX + cos * (barrel + 10), y: handY + sin * (barrel + 10) },
            { x: handX + cos * 4 + px * 2, y: handY + sin * 4 + py * 2 },
        ]);
        g.endFill();
        g.beginFill(0x2a1810);
        poly([
            { x: handX - cos * 6 - px * 2.5, y: handY - sin * 6 - py * 2.5 },
            { x: handX + cos * 5 - px * 2.5, y: handY + sin * 5 - py * 2.5 },
            { x: handX + cos * 5 + px * 2.5, y: handY + sin * 5 + py * 2.5 },
            { x: handX - cos * 6 + px * 2.5, y: handY - sin * 6 + py * 2.5 },
        ]);
        g.endFill();
        g.lineStyle(2, 0x99bbcc, 0.8);
        g.moveTo(muzzleX - cos * 8, muzzleY - sin * 8);
        g.lineTo(muzzleX + cos * 4, muzzleY + sin * 4);
        return;
    }

    if (weaponId === "bazooka") {
        const len = tubeLen ?? barrel;
        const mountX = shoulderX;
        const mountY = shoulderY;
        const tubeHalf = 7;

        g.beginFill(0x3d5c32);
        poly([
            at(mountX, mountY, -4, -tubeHalf),
            at(mountX, mountY, len, -tubeHalf + 1),
            at(mountX, mountY, len + 6, -4),
            at(mountX, mountY, len + 6, 4),
            at(mountX, mountY, len, tubeHalf - 1),
            at(mountX, mountY, -4, tubeHalf),
        ]);
        g.endFill();

        g.beginFill(0x556b44);
        poly([
            at(mountX, mountY, -12, -tubeHalf - 2),
            at(mountX, mountY, -2, -tubeHalf - 1),
            at(mountX, mountY, -2, tubeHalf + 1),
            at(mountX, mountY, -12, tubeHalf + 2),
        ]);
        g.endFill();

        g.beginFill(0x222222);
        const mouth = at(mountX, mountY, len + 4, 0);
        g.drawCircle(mouth.x, mouth.y, 5);
        g.endFill();

        g.lineStyle(2, 0x1a1a1a, 0.9);
        g.moveTo(mountX - px * f * 3, mountY - py * f * 3);
        g.lineTo(mountX + cos * 8, mountY + sin * 8);

        g.lineStyle(3, accentCol, 0.9, 0.5, true, LINE_CAP.ROUND);
        g.moveTo(at(mountX, mountY, len - 2, 0).x, at(mountX, mountY, len - 2, 0).y);
        g.lineTo(muzzleX, muzzleY);
        g.beginFill(accentCol, 0.9);
        g.drawCircle(muzzleX, muzzleY, 4.5);
        g.endFill();
        return;
    }

    if (weaponId === "grenade") {
        const gx = handX + cos * 8;
        const gy = handY + sin * 8;
        g.beginFill(0x556b2f);
        g.drawCircle(gx, gy, 8);
        g.endFill();
        g.beginFill(0x778844);
        g.drawCircle(gx - px * 2, gy - py * 2, 3);
        g.endFill();
        g.lineStyle(2, 0xcccc66, 1);
        g.moveTo(gx - cos * 3, gy - sin * 3);
        g.lineTo(gx - cos * 3 - px * 5, gy - sin * 3 - py * 5);
        return;
    }

    const barrelLen = barrel;
    const slideHalf =
        weaponId === "sniper"
            ? 2
            : weaponId === "winchester_shotgun"
              ? 4.5
              : weaponId === "auto"
                ? 2.8
                : GUN.slideHalfH;

    if (weaponId === "auto") {
        g.beginFill(0x2f2f2f);
        poly([
            atHand(-2, -slideHalf),
            atHand(barrelLen, -slideHalf),
            atHand(barrelLen + 4, -2),
            atHand(barrelLen + 4, 2),
            atHand(barrelLen, slideHalf),
            atHand(-2, slideHalf),
        ]);
        g.endFill();
        g.beginFill(0x1a1a1a);
        const mag = atHand(6, slideHalf + 2);
        g.drawRect(mag.x - 3, mag.y, 6, 9);
        g.endFill();
    } else if (weaponId === "winchester_shotgun") {
        g.beginFill(0x4a3a28);
        poly([
            atHand(-2, -slideHalf - 1),
            atHand(barrelLen, -slideHalf - 1),
            atHand(barrelLen + 3, -3.5),
            atHand(barrelLen + 3, 3.5),
            atHand(barrelLen, slideHalf + 1),
            atHand(-2, slideHalf + 1),
        ]);
        g.endFill();
        g.lineStyle(2, 0x2a2018, 1);
        g.moveTo(atHand(barrelLen * 0.3, -slideHalf - 2).x, atHand(barrelLen * 0.3, -slideHalf - 2).y);
        g.lineTo(atHand(barrelLen * 0.7, -slideHalf - 2).x, atHand(barrelLen * 0.7, -slideHalf - 2).y);
    } else {
        g.beginFill(slideCol);
        poly([
            atHand(-1, -slideHalf),
            atHand(barrelLen - 2, -slideHalf),
            atHand(barrelLen + 3, -2.5),
            atHand(barrelLen + 3, 2.5),
            atHand(barrelLen - 2, slideHalf),
            atHand(-1, slideHalf),
        ]);
        g.endFill();
    }

    if (weaponId !== "auto" && weaponId !== "winchester_shotgun") {
        g.beginFill(frameCol);
        poly([
            atHand(-4, 2),
            atHand(10, 2),
            atHand(14, 5),
            atHand(8, 7),
            atHand(-2, 6),
        ]);
        g.endFill();
    }

    g.beginFill(gripCol);
    poly([
        atHand(-2, 5),
        atHand(6, 6),
        atHand(5, 6 + GUN.gripLen * 0.55),
        atHand(-1, 6 + GUN.gripLen),
        atHand(-6, 8),
    ]);
    g.endFill();

    if (weaponId === "winchester") {
        g.lineStyle(2, 0x886644, 0.9);
        g.moveTo(atHand(6, 8).x, atHand(6, 8).y);
        g.lineTo(atHand(10, 14).x, atHand(10, 14).y);
    }

    if (weaponId === "sniper") {
        g.beginFill(0x111111);
        const scope = atHand(barrelLen * 0.38, -slideHalf - 5);
        g.drawRect(scope.x - 5, scope.y - 2.5, 10, 5);
        g.endFill();
        g.beginFill(0x0a0a0a);
        g.drawRect(scope.x - 2, scope.y - 1, 4, 2);
        g.endFill();
    }

    if (weaponId !== "sniper" && weaponId !== "auto") {
        g.beginFill(0x222222);
        const sight = atHand(barrelLen - 4, -slideHalf - 2.5);
        g.drawRect(sight.x - 1.2, sight.y - 1.2, 2.4, 3.2);
        g.endFill();
    }

    const tipSize = weaponId === "sniper" ? 3.2 : weaponId === "auto" ? 2.2 : GUN.tipR * 0.85;
    g.lineStyle(2 + (weaponId === "sniper" ? 1 : 0), accentCol, 1, 0.5, true, LINE_CAP.ROUND);
    g.moveTo(atHand(barrelLen, 0).x, atHand(barrelLen, 0).y);
    g.lineTo(muzzleX, muzzleY);
    g.beginFill(accentCol, 0.85);
    g.drawCircle(muzzleX, muzzleY, tipSize);
    g.endFill();
};

const drawSniperLaser = (g, gun) => {
    g.clear();
    g.lineStyle(1.5, 0xff2233, 0.75, 0.5, true, LINE_CAP.ROUND);
    g.moveTo(gun.muzzleX, gun.muzzleY);
    g.lineTo(mouseX, mouseY);
    g.lineStyle(1, 0xffaaaa, 0.35, 0.5, true, LINE_CAP.ROUND);
    g.moveTo(gun.muzzleX, gun.muzzleY);
    g.lineTo(mouseX, mouseY);
};

const stickPalette = (isMe, team) => {
    if (team === 0) {
        return { limb: isMe ? 0x88bbff : 0x6699ff, outline: isMe ? 0x1a4080 : 0x1a3060 };
    }
    if (team === 1) {
        return { limb: isMe ? 0xffaa88 : 0xff8866, outline: isMe ? 0x602818 : 0x502018 };
    }
    return {
        limb: isMe ? 0x77ccff : 0xffffff,
        outline: isMe ? 0x143050 : 0x111111,
    };
};

const formatRoundWinner = (G, names) => {
    if (!G?.lastRoundWinner) return '';
    if (G.gameMode === 'teams2v2') {
        return G.lastRoundWinner === '0' ? 'Team A' : 'Team B';
    }
    return (names && names[G.lastRoundWinner]) || G.lastRoundWinner;
};

const moodSeedFromId = (id) =>
    String(id).split("").reduce((n, c) => n + c.charCodeAt(0), 0);

const markBulletHitFace = (p, isHeadshot = false) => {
    if (!p) return;
    p.faceExpr = "dazed";
    p.faceTimer = isHeadshot ? 0.95 : 0.6;
};

const markShootFace = (p) => {
    if (!p) return;
    p.shootFaceUntil = Date.now() + SHOOT_FACE_MS;
    p.faceExpr = "angry";
};

const startDeathCorpse = (p) => {
    if (p.deathCorpse || !p.displayTorso || !p.displayHead) return;
    p.deathCorpse = {
        startTorso: { ...p.displayTorso },
        startHead: { ...p.displayHead },
        startedAt: Date.now(),
        bloodSpawned: false,
        finished: false,
        facing: p.facing || 1,
    };
};

const finalizeDeathCorpse = (p) => {
    if (!p.deathCorpse || p.deathCorpse.finished) return;
    p.deathCorpse.finished = true;
    if (!p.deathCorpse.bloodSpawned) {
        spawnDeathBlood(p, p.deathCorpse.startTorso.x);
    }
};

const finalizeAllDeathCorpses = () => {
    for (const p of Object.values(localPlayers)) {
        finalizeDeathCorpse(p);
    }
};

const countAliveOpponents = (G, myId) => {
    if (!G?.players) return 0;
    return Object.entries(G.players).filter(([id, pl]) => id !== myId && pl.health > 0).length;
};

const getCorpsePose = (p) => {
    const c = p.deathCorpse;
    if (!c) return null;
    const t = c.finished
        ? 1
        : Math.min(1, (Date.now() - c.startedAt) / CORPSE_FALL_MS);
    const ease = t * t * t;
    const bloodX = c.startTorso.x;
    const groundHeadY = FLOOR_Y - STICK.headR - 4;
    const hx = c.startHead.x + c.facing * 6 * ease;
    const hy = c.startHead.y + (groundHeadY - c.startHead.y) * ease;
    return { hx, hy, bloodX, ease, facing: c.facing };
};

const drawDeadFace = (g, hx, hy, isMe, alpha = 1) => {
    g.beginFill(isMe ? 0xb8dcff : 0xffffff, alpha);
    g.drawCircle(hx, hy, STICK.headR - 1.5);
    g.endFill();

    const ink = 0x111111;
    const eyeGap = 4.2;
    const eyeY = hy - 1;
    g.lineStyle(2.4, ink, alpha, 0.5, true, LINE_CAP.ROUND);

    g.moveTo(hx - eyeGap - 2.5, eyeY - 2.5);
    g.lineTo(hx - eyeGap + 2.5, eyeY + 2.5);
    g.moveTo(hx - eyeGap + 2.5, eyeY - 2.5);
    g.lineTo(hx - eyeGap - 2.5, eyeY + 2.5);
    g.moveTo(hx + eyeGap - 2.5, eyeY - 2.5);
    g.lineTo(hx + eyeGap + 2.5, eyeY + 2.5);
    g.moveTo(hx + eyeGap + 2.5, eyeY - 2.5);
    g.lineTo(hx + eyeGap - 2.5, eyeY + 2.5);

    g.moveTo(hx - 3.5, hy + 5);
    g.quadraticCurveTo(hx, hy + 9.5, hx + 3.5, hy + 5);

    g.beginFill(0xcc4444, alpha * 0.9);
    g.drawEllipse(hx, hy + 7.8, 2.2, 2.8);
    g.endFill();
};

const spawnDeathBlood = (p, bloodX) => {
    if (!p.deathCorpse || p.deathCorpse.bloodSpawned) return;
    p.deathCorpse.bloodSpawned = true;
    createBloodSpray(bloodX, FLOOR_Y - 8);
    createBloodSpray(bloodX - 14, FLOOR_Y - 5);
    createBloodSpray(bloodX + 12, FLOOR_Y - 6);
    for (let i = 0; i < 6; i++) {
        spawnParticle(
            bloodX + (Math.random() - 0.5) * 28,
            FLOOR_Y - 4,
            (Math.random() - 0.5) * 1.5,
            -Math.random() * 0.8,
            Math.random() > 0.5 ? 0x991818 : 0xcc3333,
            1.2 + Math.random() * 1.8,
            0.012,
            0.08,
            true,
        );
    }
};

const drawCorpse = (lineG, fillG, p, isMe) => {
    const pose = getCorpsePose(p);
    if (!pose) return;

    const { hx, hy, bloodX, ease } = pose;
    const alpha = 1 - ease * 0.08;

    if (ease > 0.2) spawnDeathBlood(p, bloodX);

    lineG.clear();
    fillG.clear();

    if (ease > 0.15) {
        fillG.beginFill(0x991818, 0.5 * Math.min(1, (ease - 0.15) * 2.5));
        fillG.drawEllipse(bloodX, FLOOR_Y - 3, 20 + ease * 10, 4 + ease * 2);
        fillG.endFill();
    }

    drawDeadFace(fillG, hx, hy, isMe, alpha);
};

const tickFaceExpr = (p, dt) => {
    if (p.shootFaceUntil && Date.now() < p.shootFaceUntil) {
        p.faceExpr = "angry";
        return;
    }

    if (p.faceTimer > 0) {
        p.faceTimer -= dt * 0.06;
        if (p.faceTimer <= 0) {
            p.faceTimer = 0;
        }
    }

    if (p.faceTimer > 0) return;

    if (p.airborne) {
        p.faceExpr = "jump";
        return;
    }

    const moodTick = Math.floor(Date.now() / 2800);
    const mood = (p.moodSeed + moodTick) % 5;
    if (mood === 0) p.faceExpr = "angry";
    else if (mood === 1) p.faceExpr = "smile";
    else p.faceExpr = "serious";
};

const drawFace = (g, hx, hy, facing, expr, isMe) => {
    g.beginFill(isMe ? 0xb8dcff : 0xffffff, 1);
    g.drawCircle(hx, hy, STICK.headR - 1.5);
    g.endFill();

    const ink = 0x000000;
    const eyeGap = 4.2;
    const eyeY = hy - 1;
    const lineW = 2.2;

    g.lineStyle(lineW, ink, 1, 0.5, true);

    if (expr === "shoot") {
        g.moveTo(hx - eyeGap - 2.5, eyeY - 2.5);
        g.lineTo(hx - eyeGap + 3.5, eyeY + 1.5);
        g.moveTo(hx + eyeGap - 3.5, eyeY + 1.5);
        g.lineTo(hx + eyeGap + 2.5, eyeY - 2.5);
        g.moveTo(hx - 3.5, hy + 5);
        g.lineTo(hx - 1.2, hy + 7.5);
        g.lineTo(hx + 1.2, hy + 7.5);
        g.lineTo(hx + 3.5, hy + 5);
        return;
    }

    if (expr === "dazed") {
        g.moveTo(hx - eyeGap - 3.2, eyeY + 0.5);
        g.lineTo(hx - eyeGap + 3.2, eyeY - 0.5);
        g.moveTo(hx + eyeGap - 3.2, eyeY - 0.5);
        g.lineTo(hx + eyeGap + 3.2, eyeY + 0.5);
        g.moveTo(hx - 4.2, hy + 5.2);
        g.quadraticCurveTo(hx - 2.2, hy + 7.4, hx, hy + 5.1);
        g.quadraticCurveTo(hx + 2.2, hy + 2.8, hx + 4.2, hy + 5.2);
        return;
    }

    if (expr === "hurt") {
        g.moveTo(hx - eyeGap - 2.5, eyeY - 2.5);
        g.lineTo(hx - eyeGap + 2.5, eyeY + 2.5);
        g.moveTo(hx - eyeGap + 2.5, eyeY - 2.5);
        g.lineTo(hx - eyeGap - 2.5, eyeY + 2.5);
        g.moveTo(hx + eyeGap - 2.5, eyeY - 2.5);
        g.lineTo(hx + eyeGap + 2.5, eyeY + 2.5);
        g.moveTo(hx + eyeGap + 2.5, eyeY - 2.5);
        g.lineTo(hx + eyeGap - 2.5, eyeY + 2.5);
        g.moveTo(hx - 4.5, hy + 6);
        g.quadraticCurveTo(hx, hy + 8.5, hx + 4.5, hy + 6);
        return;
    }

    if (expr === "jump") {
        g.beginFill(ink, 1);
        g.drawCircle(hx - eyeGap, eyeY, 2.4);
        g.drawCircle(hx + eyeGap, eyeY, 2.4);
        g.endFill();
        g.drawCircle(hx, hy + 5.5, 3);
        return;
    }

    if (expr === "angry") {
        g.moveTo(hx - eyeGap - 3, eyeY - 3);
        g.lineTo(hx - eyeGap + 3, eyeY);
        g.moveTo(hx + eyeGap + 3, eyeY - 3);
        g.lineTo(hx + eyeGap - 3, eyeY);
        g.beginFill(ink, 1);
        g.drawCircle(hx - eyeGap, eyeY + 1.5, 1.8);
        g.drawCircle(hx + eyeGap, eyeY + 1.5, 1.8);
        g.endFill();
        g.moveTo(hx - 4, hy + 6);
        g.quadraticCurveTo(hx, hy + 4, hx + 4, hy + 6);
        return;
    }

    if (expr === "smile") {
        g.beginFill(ink, 1);
        g.drawCircle(hx - eyeGap, eyeY, 2);
        g.drawCircle(hx + eyeGap, eyeY, 2);
        g.endFill();
        g.moveTo(hx - 4, hy + 4.5);
        g.quadraticCurveTo(hx, hy + 8.5, hx + 4, hy + 4.5);
        return;
    }

    // serious — flat mouth, no smile
    g.beginFill(ink, 1);
    g.drawCircle(hx - eyeGap, eyeY, 2);
    g.drawCircle(hx + eyeGap, eyeY, 2);
    g.endFill();
    g.moveTo(hx - 3.5, hy + 6.5);
    g.lineTo(hx + 3.5, hy + 6.5);
};

const initPlayerRenderState = (p) => {
    if (!p.displayTorso) p.displayTorso = { ...p.torso };
    if (!p.displayHead) p.displayHead = { ...p.head };
    if (p.walkPhase == null) p.walkPhase = 0;
    if (p.facing == null) p.facing = 1;
    if (p.walkDir == null) p.walkDir = p.facing;
    if (p.vx == null) p.vx = 0;
    if (p.vy == null) p.vy = 0;
    if (p.faceExpr == null) p.faceExpr = "serious";
    if (p.faceTimer == null) p.faceTimer = 0;
    if (p.shootFaceUntil == null) p.shootFaceUntil = 0;
    if (p.deathCorpse == null) p.deathCorpse = null;
    if (p.moodSeed == null) p.moodSeed = Math.floor(Math.random() * 9999);
    initWeaponRecoil(p);
    if (p.katanaSwing == null) p.katanaSwing = 0;
    if (p.katanaEquip == null) p.katanaEquip = 1;
    if (p.lastFireTick == null) p.lastFireTick = 0;
};

const updatePlayerMotionState = (p, action) => {
    p.airborne = Math.abs(p.vy) > 0.85;
    p.grounded = !p.airborne;
    p.walking =
        p.grounded &&
        (Math.abs(p.vx) > 0.4 || action === "left" || action === "right");

    if (action === "left") p.facing = -1;
    else if (action === "right") p.facing = 1;
    else if (Math.abs(p.vx) > 0.2) p.facing = p.vx >= 0 ? 1 : -1;

    p.walkDir = p.facing || 1;

    if (p.walking) {
        const speed = p.crouching ? 0.21 : 0.36;
        p.walkPhase += speed * Math.max(1, Math.abs(p.vx) * 0.12);
    }
};

const lerpBody = (from, to, t) => ({
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    angle: from.angle + (to.angle - from.angle) * t,
});

const computeKnee = (hipX, hipY, footX, footY, facing, bendAmt = 1) => {
    const dx = footX - hipX;
    const dy = footY - hipY;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const t = 0.58;
    return {
        kneeX: hipX + dx * t + nx * STICK.kneeBend * bendAmt * facing,
        kneeY: hipY + dy * t + ny * STICK.kneeBend * bendAmt * 0.12,
    };
};

const computeLegPositions = (p, pose) => {
    const { tx, hipY, footY, crouch, drop } = pose;
    const f = -(p.walkDir ?? p.facing ?? 1);
    const s = STICK.footSpread;
    let lFootX = tx - s;
    let lFootY = footY;
    let rFootX = tx + s;
    let rFootY = footY;
    let lBend = 0.55;
    let rBend = 0.55;

    if (p.airborne) {
        lFootX = tx - s * 0.85 * f;
        lFootY = footY - 8;
        rFootX = tx + s * 1.05 * f;
        rFootY = footY - 14;
        lBend = 1.1;
        rBend = 1.35;
    } else if (crouch) {
        if (p.walking) {
            const swing = Math.sin(p.walkPhase);
            lFootX = tx - s - 1 + swing * STICK.stride * 0.42 * f;
            lFootY = footY - Math.max(0, swing) * STICK.lift * 0.35;
            rFootX = tx + s + 1 - swing * STICK.stride * 0.42 * f;
            rFootY = footY - Math.max(0, -swing) * STICK.lift * 0.35;
            lBend = 0.55 + Math.max(0, swing) * 0.5;
            rBend = 0.55 + Math.max(0, -swing) * 0.5;
        } else {
            lFootX = tx - s - 2;
            rFootX = tx + s + 2;
            lFootY = footY + drop * 0.08;
            rFootY = footY + drop * 0.08;
            lBend = 1.55;
            rBend = 1.55;
        }
    } else if (p.walking) {
        const swing = Math.sin(p.walkPhase);
        lFootX = tx - s + swing * STICK.stride * f;
        lFootY = footY - Math.max(0, swing) * STICK.lift;
        rFootX = tx + s - swing * STICK.stride * f;
        rFootY = footY - Math.max(0, -swing) * STICK.lift;
        lBend = 0.45 + Math.max(0, swing) * 0.9;
        rBend = 0.45 + Math.max(0, -swing) * 0.9;
    }

    const lKnee = computeKnee(tx - STICK.hipSpread, hipY, lFootX, lFootY, f, lBend);
    const rKnee = computeKnee(tx + STICK.hipSpread, hipY, rFootX, rFootY, f, rBend);

    return {
        lFootX,
        lFootY,
        rFootX,
        rFootY,
        lKneeX: lKnee.kneeX,
        lKneeY: lKnee.kneeY,
        rKneeX: rKnee.kneeX,
        rKneeY: rKnee.kneeY,
    };
};

const drawLegWithKnee = (g, hipX, hipY, kneeX, kneeY, footX, footY) => {
    g.moveTo(hipX, hipY);
    g.lineTo(kneeX, kneeY);
    g.lineTo(footX, footY);
};

const drawStickmanLines = (g, p, isMe) => {
    g.clear();
    if (!p || p.health <= 0 || !p.displayTorso || !p.displayHead) return;

    const pal = stickPalette(isMe, p.team);
    const gun = getGunPose(p);
    const { tx, ty, hx, hy, neckTop, hipY } = gun;
    const legs = computeLegPositions(p, gun);

    const drawBody = (lineW, col, alpha) => {
        g.lineStyle(lineW, col, alpha, 0.5, true);
        g.drawCircle(hx, hy, STICK.headR);
        g.moveTo(hx, hy + STICK.headR);
        g.lineTo(hx, neckTop);
        g.lineTo(tx, neckTop);
        g.lineTo(tx, ty);
        g.lineTo(tx, hipY);
        g.moveTo(tx, neckTop + 2);
        if (gun.carryStyle === "shoulder") {
            g.lineTo(gun.backHandX, gun.backHandY);
            g.moveTo(gun.shoulderX, gun.shoulderY);
            g.lineTo(gun.handX, gun.handY);
        } else if (gun.carryStyle === "twoHand") {
            g.lineTo(gun.backHandX, gun.backHandY);
            g.moveTo(gun.shoulderX, gun.shoulderY);
            g.lineTo(gun.handX, gun.handY);
        } else {
            g.lineTo(gun.backHandX, gun.backHandY);
            g.moveTo(gun.shoulderX, gun.shoulderY);
            g.lineTo(gun.handX, gun.handY);
        }
        drawLegWithKnee(g, tx - STICK.hipSpread, hipY, legs.lKneeX, legs.lKneeY, legs.lFootX, legs.lFootY);
        drawLegWithKnee(g, tx + STICK.hipSpread, hipY, legs.rKneeX, legs.rKneeY, legs.rFootX, legs.rFootY);
    };

    drawBody(STICK.outlineW, pal.outline, 0.95);
    drawBody(STICK.lineW, pal.limb, 1);
    drawGunInHand(g, gun, isMe);
};

const drawStickmanFills = (g, p, isMe) => {
    g.clear();
    if (!p || p.health <= 0 || !p.displayTorso || !p.displayHead) return;

    const gun = getGunPose(p);
    drawFace(g, gun.hx, gun.hy, gun.f, p.faceExpr || "serious", isMe);
};

// Main Loop
let lastMoveSent = 0;
let lastSentInput = null;
const SEND_MOVE_MS = 16;
let laserGraphics = null;
let pendingJump = false;

app.ticker.add(() => {
    try {
        const dt = app.ticker.deltaTime;
        if (!latestState) return;

        const G = latestState.G;
        if (G?.currentMapId) applyMapTheme(G.currentMapId);
        drawPlatforms(getPlatformsForRender(G));
        drawPickups(G?.pickups ?? [], getPlatformsForRender(G));

        updateStartOverlay();
        tickCountdownOverlay(G, dt);

        const gameplayActive = isGameplayInputEnabled(G);

        let action = null;
        const crouching =
            isKeyPressed("KeyS", "s", "S", "ArrowDown") ||
            [...activeKeys].some((k) => isCrouchKey(k, k));

        // Process Input
        const me = localPlayers[latestState.playerId];
        if (me && G?.players?.[latestState.playerId]) {
            me.currentWeapon = G.players[latestState.playerId].currentWeapon || "winchester";
        }
        
        if (me && me.health > 0 && me.torso && gameplayActive) {
            if (isKeyPressed("KeyA", "a", "A", "ა", "ArrowLeft")) action = "left";
            else if (isKeyPressed("KeyD", "d", "D", "დ", "ArrowRight")) action = "right";
            else if (crouching) action = "crouch";

            if (jumpQueued) {
                pendingJump = true;
                jumpQueued = false;
                Sfx.playJump();
            }

            const pose = getStickPose(me);
            me.aimAngle = Math.atan2(mouseY - pose.neckTop, mouseX - me.displayTorso.x);

            if (action === "left") me.facing = -1;
            else if (action === "right") me.facing = 1;
        } else {
            jumpQueued = false;
            pendingJump = false;
        }

        const now = Date.now();

        if (me && me.health > 0 && me.currentWeapon === "sniper" && gameplayActive) {
            if (!laserGraphics) {
                laserGraphics = new Graphics();
                laserContainer.addChild(laserGraphics);
            }
            drawSniperLaser(laserGraphics, getGunPose(me));
        } else if (laserGraphics) {
            laserGraphics.clear();
        }

        if (now - lastMoveSent >= SEND_MOVE_MS) {
            if (isPreMatchCountdown() || isIdleTickPhase(G)) {
                const input = {
                    action: null,
                    jumping: false,
                    aimAngle: me?.aimAngle ?? 0,
                    facing: me?.facing ?? 1,
                    crouching: false,
                    shooting: false,
                };
                
                if (!lastSentInput || 
                    lastSentInput.action !== input.action || 
                    lastSentInput.jumping !== input.jumping || 
                    lastSentInput.facing !== input.facing || 
                    lastSentInput.crouching !== input.crouching || 
                    lastSentInput.shooting !== input.shooting || 
                    Math.abs(lastSentInput.aimAngle - input.aimAngle) > 0.05
                ) {
                    proposeMove("input", input);
                    lastSentInput = { ...input };
                }
                
                pendingJump = false;
                lastMoveSent = now;
            } else if (gameplayActive) {
                const input = {
                    action,
                    jumping: pendingJump,
                    aimAngle: me?.aimAngle ?? 0,
                    facing: me?.facing ?? 1,
                    crouching,
                    shooting: pointerHeld,
                };
                
                if (!lastSentInput || 
                    lastSentInput.action !== input.action || 
                    lastSentInput.jumping !== input.jumping || 
                    lastSentInput.facing !== input.facing || 
                    lastSentInput.crouching !== input.crouching || 
                    lastSentInput.shooting !== input.shooting || 
                    Math.abs(lastSentInput.aimAngle - input.aimAngle) > 0.05
                ) {
                    proposeMove("input", input);
                    lastSentInput = { ...input };
                }
                
                pendingJump = false;
                lastMoveSent = now;
            }
        }

        if (recoilShake > 0.05) {
            recoilShake *= 0.82;
            gameContainer.position.set(
                viewOffsetX + recoilShakeX * recoilShake * 0.35,
                viewOffsetY + recoilShakeY * recoilShake * 0.35,
            );
        } else {
            recoilShake = 0;
            gameContainer.position.set(viewOffsetX, viewOffsetY);
        }

        const smooth = Math.min(1, 0.28 * dt);
        const roundIdle = isIdleTickPhase(G);
        for (const [id, p] of Object.entries(localPlayers)) {
            if (p.deathCorpse && (p.health <= 0 || !p.torso)) continue;
            if (!p.torso || !p.head) continue;
            initPlayerRenderState(p);
            if (roundIdle) {
                p.walking = false;
                p.airborne = false;
                p.grounded = true;
                p.vx = 0;
                p.vy = 0;
                continue;
            }
            tickWeaponRecoil(p, dt);
            tickKatanaSwing(p);
            tickKatanaEquip(p);
            p.displayTorso = lerpBody(p.displayTorso, p.torso, smooth);
            p.displayHead = lerpBody(p.displayHead, p.head, smooth);
            updatePlayerMotionState(p, p === me && gameplayActive ? action : null);
            tickFaceExpr(p, dt);
            if (p === me) {
                p.crouching = crouching && p.grounded;
            }
            if (p === me && p.walking && p.grounded && !p.crouching && p.health > 0) {
                Sfx.playFootstep();
            }
            if (G?.players?.[id]?.team != null) {
                p.team = G.players[id].team;
            }
        }

        // Update Bullets
        for (const [, b] of localBullets.entries()) {
            if (!b.body || !b.g) continue;

            if (!b.displayBody) {
                b.displayBody = { ...b.body };
            }

            // Smoothly Lerp towards the authoritative server position
            b.displayBody = lerpBody(b.displayBody, b.body, Math.min(1, 0.45 * dt));

            let angle = b.displayBody.angle || 0;
            if (b.prevBody) {
                angle = Math.atan2(b.displayBody.y - b.prevBody.y, b.displayBody.x - b.prevBody.x);
            }

            const g = b.g;
            g.clear();
            const kind = b.kind || "bullet";
            if (kind === "rocket") {
                g.beginFill(0xff4422, 1);
                g.drawCircle(0, 0, 6);
                g.endFill();
                g.lineStyle(2, 0xffaa88, 0.9);
                g.moveTo(-Math.cos(angle) * 10, -Math.sin(angle) * 10);
                g.lineTo(0, 0);
            } else if (kind === "grenade") {
                g.beginFill(0x66aa33, 1);
                g.drawCircle(0, 0, 5);
                g.endFill();
            } else if (kind === "pellet") {
                g.beginFill(0xffcc66, 1);
                g.drawCircle(0, 0, 2.5);
                g.endFill();
            } else {
                g.lineStyle(1.6, 0xffffff, 0.95);
                g.beginFill(0xffaa00, 1);
                g.drawCircle(0, 0, 3.5);
                g.endFill();
                g.beginFill(0xffff66, 0.85);
                g.drawCircle(Math.cos(angle) * 1.2, Math.sin(angle) * 1.2, 1.5);
                g.endFill();
            }
            g.position.set(b.displayBody.x, b.displayBody.y);

            if (Math.random() < 0.35) {
                spawnParticle(
                    b.displayBody.x - Math.cos(angle) * 8,
                    b.displayBody.y - Math.sin(angle) * 8,
                    -Math.cos(angle) * 2,
                    -Math.sin(angle) * 2,
                    0xffaa55,
                    1.5,
                    0.06,
                    0.1,
                );
            }
        }

        // Update Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const pt = particles[i];
            pt.vy += 0.6 * dt * pt.gravityMul;
            pt.mesh.position.x += pt.vx * dt;
            pt.mesh.position.y += pt.vy * dt;
            pt.life -= pt.lifeDecay * dt;

            if (pt.life <= 0) {
                particlesContainer.removeChild(pt.mesh);
                pt.mesh.destroy();
                particles.splice(i, 1);
            } else {
                pt.mesh.alpha = pt.life;
                if (!pt.isText) {
                    pt.mesh.scale.set(0.6 + pt.life * 0.8);
                } else {
                    // Start large and slightly scale down
                    pt.mesh.scale.set(1.0 + (pt.life * 0.3));
                }
            }
        }

        for (let i = hitRings.length - 1; i >= 0; i--) {
            const ring = hitRings[i];
            ring.life -= 0.06 * dt;
            if (ring.life <= 0) {
                particlesContainer.removeChild(ring.g);
                ring.g.destroy();
                hitRings.splice(i, 1);
                continue;
            }
            const r = ring.maxR * (1 - ring.life);
            ring.g.clear();
            const ringColor = ring.color ?? 0xff7744;
            ring.g.lineStyle(1.6 * ring.life, ringColor, ring.life * 0.75);
            ring.g.drawCircle(0, 0, r);
            ring.g.lineStyle(0.9 * ring.life, 0xffffff, ring.life * 0.5);
            ring.g.drawCircle(0, 0, r * 0.55);
        }

        // Update Players
        for (const [id, p] of Object.entries(localPlayers)) {
            if (!p.lineGraphics) {
                p.lineGraphics = new Graphics();
                p.fillGraphics = new Graphics();
                playersContainer.addChild(p.fillGraphics);
                playersContainer.addChild(p.lineGraphics);
            }
            if (!p.dom) {
                const d = document.createElement('div');
                d.className = 'player-hud';
                d.innerHTML = `
                    <div class="player-label">${(latestState.names && latestState.names[id]) || id}</div>
                    <div class="health-bar-bg"><div class="health-bar-fg"></div></div>
                `;
                document.getElementById('labels-container').appendChild(d);
                p.dom = d;
            }

            const isMe = latestState && id === latestState.playerId;
            
            if (p.health <= 0 || !p.torso) {
                if (p.deathCorpse) {
                    p.lineGraphics.visible = true;
                    p.fillGraphics.visible = true;
                    drawCorpse(p.lineGraphics, p.fillGraphics, p, isMe);
                } else {
                    p.lineGraphics.visible = false;
                    p.fillGraphics.visible = false;
                }
                p.dom.style.display = 'none';
                continue;
            } else {
                p.lineGraphics.visible = true;
                p.fillGraphics.visible = true;
                p.dom.style.display = 'block';
            }

            drawStickmanLines(p.lineGraphics, p, isMe);
            drawStickmanFills(p.fillGraphics, p, isMe);

            // DOM update — HP bar directly above head
            const hud = arenaPointToClient(p.displayHead.x, p.displayHead.y - 12);
            p.dom.style.transform = `translate(${hud.x}px, ${hud.y}px) scale(${viewScale})`;
            p.dom.style.transformOrigin = `0 0`;
            const fg = p.dom.querySelector('.health-bar-fg');
            if (fg) fg.style.width = `${Math.max(0, p.health / 1000 * 100)}%`;
        }

        // Update HUD overall
        if (latestState) {
            const G = latestState.G;
            const playerInfo = document.getElementById('player-info');
            if (playerInfo) playerInfo.innerText = `Player: ${latestState.playerId}`;

            const modeInfo = document.getElementById('mode-info');
            if (modeInfo && G) {
                modeInfo.innerText = G.gameMode === 'teams2v2' ? 'Mode: 2v2' : 'Mode: FFA';
            }

            const roundInfo = document.getElementById('round-info');
            if (roundInfo && G) {
                const mapName = MAPS[G.currentMapId]?.displayName ?? G.currentMapId;
                roundInfo.innerHTML = `Round ${G.currentRound} — Best of 5<br/><span style="font-size:11px;color:#ccc;">${mapName}</span>`;
            }
            
            const turnInfo = document.getElementById('turn-info');
            if (turnInfo) {
                if (G?.roundPhase === 'intermission') {
                    turnInfo.innerText = 'Next round...';
                    turnInfo.style.color = '#ffcc66';
                } else {
                    turnInfo.innerText = latestState.yourTurn ? 'Your Turn' : '';
                    turnInfo.style.color = '#55ff55';
                }
            }

            if (G && G.scores) {
                let scoreHtml = '';
                if (G.gameMode === 'teams2v2') {
                    scoreHtml = `Best of 5 (teams):<br/><span style="color:#6699ff">Team A: ${G.scores['0'] ?? 0}</span> | <span style="color:#ff8866">Team B: ${G.scores['1'] ?? 0}</span>`;
                } else {
                    scoreHtml = 'Best of 5:<br/>';
                    for (const [pid, score] of Object.entries(G.scores)) {
                        const name = (latestState.names && latestState.names[pid]) || pid;
                        const color = pid === latestState.playerId ? '#ffffaa' : '#dddddd';
                        scoreHtml += `<span style="color:${color}">${name}: ${score}</span><br/>`;
                    }
                }
                const scoresInfo = document.getElementById('scores-info');
                if (scoresInfo) scoresInfo.innerHTML = scoreHtml;
            }

            const roundEnd = document.getElementById('hud-round-end');
            if (roundEnd && G) {
                if (G.roundPhase === 'intermission' && G.lastRoundWinner) {
                    roundEnd.style.display = 'block';
                    roundEnd.innerText = `Round ${G.currentRound} — ${formatRoundWinner(G, latestState.names)} wins!`;
                } else {
                    roundEnd.style.display = 'none';
                }
            }

            const weaponInfo = document.getElementById('weapon-info');
            if (weaponInfo && me) {
                const wId = me.currentWeapon || "winchester";
                const label = WEAPON_LABELS[wId] || wId;
                const owned = getOrderedOwnedWeapons(latestState.playerId);
                let weaponList = owned.map((id, i) => {
                    const active = id === wId ? " style=\"color:#ffe135;font-weight:bold;\"" : "";
                    return `<span${active}>${i + 1}. ${WEAPON_LABELS[id]}</span>`;
                }).join("<br/>");
                const cycleHint =
                    owned.length > 1
                        ? `<div style="margin-top:6px;font-size:11px;color:#aaa;">Q — შემდეგი იარაღი</div>`
                        : `<div style="margin-top:6px;font-size:11px;color:#777;">აიღე იარაღი drop-იდან</div>`;
                weaponInfo.innerHTML = `<div style="font-weight:bold;margin-bottom:4px;">${label}</div>${weaponList}${cycleHint}`;
            }

            if (latestState.ended) {
                const go = document.getElementById('hud-game-over');
                if (go) {
                    go.style.display = 'block';
                    let resultText = 'Game Over';
                    if (latestState.result) {
                        if (latestState.result.winner) {
                            resultText = `WINNER: ${(latestState.names && latestState.names[latestState.result.winner]) || latestState.result.winner}`;
                        } else if (latestState.result.winners?.length) {
                            const names = latestState.result.winners
                                .map((id) => (latestState.names && latestState.names[id]) || id)
                                .join(' & ');
                            resultText = `WINNERS: ${names}`;
                        } else if (latestState.result.draw) {
                            resultText = 'Draw';
                        }
                    }
                    go.innerText = resultText;
                }
            } else {
                const go = document.getElementById('hud-game-over');
                if (go) go.style.display = 'none';
            }
        }
    } catch (e) {
        console.error("Error in ticker:", e);
    }
});

/** Explicit global bindings for Bordiko production host (survives esbuild --minify). */
const installBordikoGlobals = () => {
    const root = typeof globalThis !== "undefined" ? globalThis : window;
    root.bordikoHost = bordikoHost;
    root.bordikoProposeMove = proposeMove;
    root.onGameState = handleGameState;
    root.onUpdate = handleGameState;
    root.render = () => {};
    root.bordikoReady = signalHostReady;
    root.__stickmanShooterUI = { version: "0.1.7-bridge" };
};

installBordikoGlobals();
bordikoHost.onState(handleGameState);
startHostReadyPulse();
