import '@pixi/unsafe-eval';
import * as PIXI from 'pixi.js';

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
  hipSpread: 10,
  footW: 16,
  footSpread: 11,
  armLen: 28,
  stride: 11,
  lift: 6,
  crouchDrop: 18,
  kneeBend: 10,
};

const GUN = {
  barrel: 23,
  slideHalfH: 3.2,
  gripLen: 10,
  gripHalfW: 4,
  tipR: 2.4,
};

const SHOOT_FACE_MS = 2000;
const CORPSE_FALL_MS = 260;

// PixiJS Setup — renderer fills container; gameContainer scales the fixed arena
const gameContainerEl = document.getElementById('game-container');
const app = new PIXI.Application({
    backgroundColor: 0x2c2c2c,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
});
app.view.style.display = 'block';
app.view.style.width = '100%';
app.view.style.height = '100%';
gameContainerEl.appendChild(app.view);

const gameContainer = new PIXI.Container();
app.stage.addChild(gameContainer);

// Background Grid
const gridGraphics = new PIXI.Graphics();
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
const floorGraphics = new PIXI.Graphics();
floorGraphics.beginFill(0x3d4654);
floorGraphics.drawRect(0, FLOOR_Y - 10, ARENA_W, 10);
floorGraphics.endFill();
gameContainer.addChild(floorGraphics);

// Containers
const platformsContainer = new PIXI.Container();
const bulletsContainer = new PIXI.Container();
const particlesContainer = new PIXI.Container();
const playersContainer = new PIXI.Container();

gameContainer.addChild(platformsContainer);
gameContainer.addChild(playersContainer);
gameContainer.addChild(bulletsContainer);
gameContainer.addChild(particlesContainer);

// Platforms drawn each frame from game state (HP fill + border)

// Mirror game.ts PLATFORMS — fallback if state sync omits platforms briefly
const STATIC_PLATFORMS = [
  { id: 0, x: 63, y: 388, w: 118, h: 12 },
  { id: 1, x: 234, y: 273, w: 118, h: 12 },
  { id: 2, x: 405, y: 388, w: 118, h: 12 },
  { id: 3, x: 576, y: 273, w: 118, h: 12 },
  { id: 4, x: 405, y: 158, w: 118, h: 12 },
  { id: 5, x: 234, y: 43, w: 118, h: 12 },
];

const getPlatformsForRender = (G) => {
    if (G?.platforms?.length) return G.platforms;
    return STATIC_PLATFORMS.map((p) => ({
        ...p,
        health: 500,
        maxHealth: 500,
        broken: false,
    }));
};

const drawPlatforms = (platforms) => {
    platformsContainer.removeChildren();
    if (!platforms?.length) return;

    for (const plat of platforms) {
        if (plat.broken) continue;

        const g = new PIXI.Graphics();
        const inset = PLATFORM_BORDER;
        const hpRatio = Math.max(0, Math.min(1, plat.health / (plat.maxHealth || 500)));
        const innerW = Math.max(0, plat.w - inset * 2);
        const innerH = Math.max(1, plat.h - inset * 2);
        const fillW = innerW * hpRatio;

        g.beginFill(0x24384f, 0.95);
        g.drawRect(plat.x, plat.y, plat.w, plat.h);
        g.endFill();

        const hpColor =
            hpRatio > 0.55 ? 0x3ecf6e : hpRatio > 0.28 ? 0xe6b422 : 0xe04545;
        if (fillW > 0) {
            g.beginFill(hpColor, 1);
            g.drawRect(plat.x + inset, plat.y + inset, fillW, innerH);
            g.endFill();
        }

        g.lineStyle(2, 0xf0f6ff, 1, 0.5, true);
        g.drawRect(plat.x, plat.y, plat.w, plat.h);

        platformsContainer.addChild(g);
    }
};

drawPlatforms(getPlatformsForRender(null));

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

// State
let latestState = null;
let localPlayers = {};
let localBullets = new Map();
let particles = [];
let prevPlatformBroken = {};

// Input
const activeKeys = new Set();
let mouseX = 0;
let mouseY = 0;
let jumpQueued = false;

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
    const me = localPlayers[latestState.playerId];
    if (me && me.health > 0) {
        const gun = getGunPose(me);
        me.aimAngle = Math.atan2(mouseY - gun.neckTop, mouseX - me.displayTorso.x);
        markShootFace(me);
        window.parent.postMessage({ 
            t: "bordiko:move", 
            type: "shoot", 
            payload: { 
                aimAngle: me.aimAngle || 0,
                facing: me.facing || 1,
            } 
        }, "*");
    }
});

window.addEventListener("keydown", (e) => {
    activeKeys.add(e.code);
    if (e.key) activeKeys.add(e.key.toLowerCase());
    if (isJumpKey(e.code) && !e.repeat) {
        jumpQueued = true;
        if (latestState) {
            const me = localPlayers[latestState.playerId];
            if (me && me.health > 0) {
                window.parent.postMessage({
                    t: "bordiko:move",
                    type: "move",
                    payload: {
                        action: "jump",
                        aimAngle: me.aimAngle ?? 0,
                        crouching: false,
                    },
                }, "*");
                jumpQueued = false;
            }
        }
    }
    if (e.code === "Space" || e.code === "KeyW" || e.code === "KeyS") {
        e.preventDefault();
    }
});

window.addEventListener("keyup", (e) => {
    activeKeys.delete(e.code);
    if (e.key) activeKeys.delete(e.key.toLowerCase());
});

function isKeyPressed(...k) {
    return k.some(key => activeKeys.has(key));
}

// Network Sync
window.addEventListener("message", (event) => {
    const msg = event.data;
    if (msg && msg.t === "bordiko:state") {
        latestState = msg.state;
        fitCanvas();
        const G = latestState.G;

        drawPlatforms(getPlatformsForRender(G));

        if (G && G.players) {
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
                        vx: 0,
                        vy: 0,
                        grounded: true,
                        walking: false,
                        airborne: false,
                        crouching: !!p.crouching,
                        faceExpr: "serious",
                        faceTimer: 0,
                        moodSeed: moodSeedFromId(id),
                    };
                } else {
                    const lp = localPlayers[id];
                    const prevX = lp.torso?.x ?? p.torso.x;
                    const prevY = lp.torso?.y ?? p.torso.y;

                    if (p.health < lp.prevHealth) {
                        lp.faceExpr = "hurt";
                        lp.faceTimer = 0.4;
                    }
                    if (p.health <= 0 && lp.prevHealth > 0) {
                        startDeathCorpse(lp);
                    }
                    if (p.health > 0) {
                        lp.deathCorpse = null;
                    }
                    lp.prevHealth = p.health;

                    lp.vx = p.torso.x - prevX;
                    lp.vy = p.torso.y - prevY;
                    lp.health = p.health;
                    lp.crouching = !!p.crouching;
                    lp.torso = p.torso;
                    lp.head = p.head;
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
                    createSparkHit(plat.x + plat.w / 2, plat.y + plat.h / 2);
                }
                prevPlatformBroken[plat.id] = plat.broken;
            }
        }

        if (G && G.hitEvents) {
            for (const hit of G.hitEvents) {
                if (hit.damage > 0) {
                    createPlayerHitEffect(hit.x, hit.y);
                } else {
                    createSparkHit(hit.x, hit.y);
                }
            }
        }

        const hadHitEvents = !!(G && G.hitEvents && G.hitEvents.length);

        if (G && G.bullets) {
            const serverBulletIds = new Set(G.bullets.map(b => b.id));
            for (const [id, lb] of localBullets.entries()) {
                if (!serverBulletIds.has(id)) {
                    if (!hadHitEvents && lb.body) createSparkHit(lb.body.x, lb.body.y);
                    localBullets.delete(id);
                }
            }
            for (const b of G.bullets) {
                if (!localBullets.has(b.id)) {
                    localBullets.set(b.id, { ...b, prevBody: { ...b.body } });
                    createMuzzleFlash(b.body.x, b.body.y);
                    const shooter = localPlayers[b.owner];
                    if (shooter) markShootFace(shooter);
                } else {
                    const lb = localBullets.get(b.id);
                    lb.prevBody = lb.body ? { ...lb.body } : null;
                    lb.body = b.body;
                }
            }
        }
    }
});

window.parent.postMessage({ t: "bordiko:ready" }, "*");

// Particles & hit effects
function spawnParticle(x, y, vx, vy, color, size, lifeDecay, gravityMul = 0.5, isBlood = false) {
    const g = new PIXI.Graphics();
    g.beginFill(color);
    g.drawCircle(0, 0, size);
    g.endFill();
    g.position.set(x, y);
    if (!isBlood) g.blendMode = PIXI.BLEND_MODES.ADD;
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

function createMuzzleFlash(x, y) {
    for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 4 + Math.random() * 6;
        spawnParticle(x, y, Math.cos(a) * s, Math.sin(a) * s, 0xffdd66, 2.5, 0.05, 0.2);
    }
}

function createSparkHit(x, y) {
    for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 3 + Math.random() * 8;
        spawnParticle(x, y, Math.cos(a) * s, Math.sin(a) * s, 0xffaa44, 2, 0.04, 0.35);
    }
}

function createBloodSpray(x, y) {
    for (let i = 0; i < 4; i++) {
        const a = (Math.PI * 2 * i) / 4 + (Math.random() - 0.5) * 0.4;
        const s = 1 + Math.random() * 2.8;
        spawnParticle(
            x,
            y,
            Math.cos(a) * s,
            Math.sin(a) * s - 0.45,
            Math.random() > 0.5 ? 0xcc3333 : 0x991818,
            0.75 + Math.random() * 0.9,
            0.028,
            0.18,
            true,
        );
    }
}

function createPlayerHitEffect(x, y) {
    createBloodSpray(x, y);
    for (let i = 0; i < 2; i++) {
        spawnParticle(
            x,
            y,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            0xffffff,
            1.5,
            0.05,
            0.08,
        );
    }
}

function createHitFlash(x, y) {
    for (let i = 0; i < 8; i++) {
        spawnParticle(x, y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, 0xffffff, 4, 0.06, 0.1);
    }
    spawnParticle(x, y, 0, 0, 0xff4422, 8, 0.035, 0.05);
}

const hitRings = [];

function createHitBurst(x, y) {
    const ring = new PIXI.Graphics();
    ring.position.set(x, y);
    particlesContainer.addChild(ring);
    hitRings.push({ g: ring, life: 1, maxR: 32 });
    createHitFlash(x, y);
    for (let i = 0; i < 14; i++) {
        const a = (Math.PI * 2 * i) / 14;
        spawnParticle(x, y, Math.cos(a) * 12, Math.sin(a) * 12, 0xffffff, 3, 0.035, 0.12);
        spawnParticle(x, y, Math.cos(a) * 8, Math.sin(a) * 8, 0xff5533, 2.5, 0.03, 0.18);
    }
}

// Stickman drawing + animation helpers
const VISUAL_STAND_LIFT = 5;

const getStickPose = (p) => {
    const tx = p.displayTorso.x;
    const ty = p.displayTorso.y;
    const crouch = !!p.crouching && p.grounded;
    const drop = crouch ? STICK.crouchDrop : 0;
    const standLift = p.grounded && !p.airborne ? VISUAL_STAND_LIFT : 0;
    const footY = ty + FEET_OFF - standLift;
    const hipY = ty + FEET_OFF * 0.26 + drop * 0.12 - standLift * 0.4;
    const neckTop = ty - STICK.bodyLen * 0.48 + drop * 0.2;
    const hx = p.displayHead.x;
    const hy = crouch ? p.displayHead.y + drop * 0.4 : p.displayHead.y;
    return { tx, ty, hx, hy, neckTop, hipY, footY, crouch, drop };
};

const getGunPose = (p) => {
    const pose = getStickPose(p);
    const aim = p.aimAngle || 0;
    const f = p.facing || 1;
    const shoulderX = pose.tx + f * 2.5;
    const shoulderY = pose.neckTop + 2;
    const handX = shoulderX + Math.cos(aim) * STICK.armLen;
    const handY = shoulderY + Math.sin(aim) * STICK.armLen;
    const muzzleDist = GUN.barrel + GUN.tipR * 0.4;
    const muzzleX = handX + Math.cos(aim) * muzzleDist;
    const muzzleY = handY + Math.sin(aim) * muzzleDist;
    const backHandX = pose.tx - f * STICK.footSpread;
    const backHandY = pose.neckTop + 13;
    return { ...pose, aim, f, shoulderX, shoulderY, handX, handY, muzzleX, muzzleY, backHandX, backHandY };
};

const drawGunInHand = (g, gun, isMe) => {
    const { handX, handY, aim, muzzleX, muzzleY } = gun;
    const cos = Math.cos(aim);
    const sin = Math.sin(aim);
    const px = -sin;
    const py = cos;

    const at = (along, across) => ({
        x: handX + cos * along + px * across,
        y: handY + sin * along + py * across,
    });

    const slideCol = isMe ? 0x3d3d3d : 0x4a4a4a;
    const frameCol = 0x2a2a2a;
    const gripCol = 0x1c1410;
    const accentCol = 0xffe135;
    const outlineCol = 0x111111;

    const poly = (points) => {
        if (!points.length) return;
        g.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) g.lineTo(points[i].x, points[i].y);
        g.closePath();
    };

    // Slide + barrel (pistol top)
    g.lineStyle(1.5, outlineCol, 1, 0.5, true);
    g.beginFill(slideCol);
    poly([
        at(-1, -GUN.slideHalfH),
        at(GUN.barrel - 2, -GUN.slideHalfH),
        at(GUN.barrel + 3, -2.5),
        at(GUN.barrel + 3, 2.5),
        at(GUN.barrel - 2, GUN.slideHalfH),
        at(-1, GUN.slideHalfH),
    ]);
    g.endFill();

    // Lower frame / receiver
    g.beginFill(frameCol);
    poly([
        at(-4, 2),
        at(10, 2),
        at(14, 5),
        at(8, 7),
        at(-2, 6),
    ]);
    g.endFill();

    // Grip handle
    g.beginFill(gripCol);
    poly([
        at(-2, 5),
        at(6, 6),
        at(5, 6 + GUN.gripLen * 0.55),
        at(-1, 6 + GUN.gripLen),
        at(-6, 8),
    ]);
    g.endFill();

    // Trigger guard
    g.lineStyle(2, outlineCol, 0.9, 0.5, true, PIXI.LINE_CAP.ROUND);
    g.moveTo(at(2, 5).x, at(2, 5).y);
    g.quadraticCurveTo(at(5, 10).x, at(5, 10).y, at(9, 6).x, at(9, 6).y);

    // Front sight
    g.beginFill(0x222222);
    const sight = at(GUN.barrel - 4, -GUN.slideHalfH - 2.5);
    g.drawRect(sight.x - 1.2, sight.y - 1.2, 2.4, 3.2);
    g.endFill();

    // Neon muzzle tip
    g.lineStyle(3, accentCol, 1, 0.5, true, PIXI.LINE_CAP.ROUND);
    g.moveTo(at(GUN.barrel, 0).x, at(GUN.barrel, 0).y);
    g.lineTo(muzzleX, muzzleY);

    g.beginFill(accentCol, 0.85);
    g.drawCircle(muzzleX, muzzleY, GUN.tipR * 0.85);
    g.endFill();
};

const stickPalette = (isMe) => ({
    limb: isMe ? 0x77ccff : 0xffffff,
    outline: isMe ? 0x143050 : 0x111111,
});

const moodSeedFromId = (id) =>
    String(id).split("").reduce((n, c) => n + c.charCodeAt(0), 0);

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
        facing: p.facing || 1,
    };
};

const getCorpsePose = (p) => {
    const c = p.deathCorpse;
    if (!c) return null;
    const t = Math.min(1, (Date.now() - c.startedAt) / CORPSE_FALL_MS);
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
    g.lineStyle(2.4, ink, alpha, 0.5, true, PIXI.LINE_CAP.ROUND);

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
    if (p.vx == null) p.vx = 0;
    if (p.vy == null) p.vy = 0;
    if (p.faceExpr == null) p.faceExpr = "serious";
    if (p.faceTimer == null) p.faceTimer = 0;
    if (p.shootFaceUntil == null) p.shootFaceUntil = 0;
    if (p.deathCorpse == null) p.deathCorpse = null;
    if (p.moodSeed == null) p.moodSeed = Math.floor(Math.random() * 9999);
};

const updatePlayerMotionState = (p, action) => {
    p.airborne = Math.abs(p.vy) > 0.85;
    p.grounded = !p.airborne;
    p.walking =
        p.grounded &&
        (Math.abs(p.vx) > 0.4 || action === "left" || action === "right");

    if (Math.abs(p.vx) > 0.2) {
        p.facing = p.vx >= 0 ? 1 : -1;
    }

    if (p.walking) {
        const speed = p.crouching ? 0.42 : 0.72;
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
    const { tx, hipY, footY, crouch } = pose;
    const f = p.facing || 1;
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
            lFootX = tx - s - 3 + swing * STICK.stride * 0.42 * f;
            lFootY = footY - Math.max(0, swing) * STICK.lift * 0.35;
            rFootX = tx + s + 3 - swing * STICK.stride * 0.42 * f;
            rFootY = footY - Math.max(0, -swing) * STICK.lift * 0.35;
            lBend = 0.55 + Math.max(0, swing) * 0.5;
            rBend = 0.55 + Math.max(0, -swing) * 0.5;
        } else {
            lFootX = tx - s - 3;
            rFootX = tx + s + 3;
            lBend = 1.25;
            rBend = 1.25;
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

    const pal = stickPalette(isMe);
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
        g.lineTo(gun.backHandX, gun.backHandY);
        g.moveTo(gun.shoulderX, gun.shoulderY);
        g.lineTo(gun.handX, gun.handY);
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
const SEND_MOVE_MS = 16;

app.ticker.add((dt) => {
    try {
        if (!latestState) return;

        const G = latestState.G;
        drawPlatforms(getPlatformsForRender(G));

        let action = null;
        const crouching =
            isKeyPressed("KeyS", "s", "S", "ArrowDown") ||
            [...activeKeys].some((k) => isCrouchKey(k, k));

        // Process Input
        const me = localPlayers[latestState.playerId];
        if (me && me.health > 0 && me.torso) {
            if (isKeyPressed("KeyA", "a", "A", "ა", "ArrowLeft")) action = "left";
            else if (isKeyPressed("KeyD", "d", "D", "დ", "ArrowRight")) action = "right";
            else if (crouching) action = "crouch";

            if (jumpQueued) {
                action = "jump";
                jumpQueued = false;
            }

            const pose = getStickPose(me);
            me.aimAngle = Math.atan2(mouseY - pose.neckTop, mouseX - me.displayTorso.x);

            if (action === "left") me.facing = -1;
            else if (action === "right") me.facing = 1;
        } else {
            jumpQueued = false;
        }

        const now = Date.now();
        if (now - lastMoveSent >= SEND_MOVE_MS) {
            window.parent.postMessage({
                t: "bordiko:move",
                type: "move",
                payload: {
                    action,
                    aimAngle: me?.aimAngle ?? 0,
                    facing: me?.facing ?? 1,
                    crouching,
                },
            }, "*");
            lastMoveSent = now;
        }

        const smooth = Math.min(1, 0.35 * dt);
        for (const p of Object.values(localPlayers)) {
            if (p.deathCorpse && (p.health <= 0 || !p.torso)) continue;
            if (!p.torso || !p.head) continue;
            initPlayerRenderState(p);
            p.displayTorso = lerpBody(p.displayTorso, p.torso, smooth);
            p.displayHead = lerpBody(p.displayHead, p.head, smooth);
            updatePlayerMotionState(p, p === me ? action : null);
            tickFaceExpr(p, dt);
            if (p === me) {
                p.crouching = crouching && p.grounded;
            }
        }

        // Update Bullets
        bulletsContainer.removeChildren();
        for (const [, b] of localBullets.entries()) {
            if (!b.body) continue;

            let angle = b.body.angle || 0;
            if (b.prevBody) {
                angle = Math.atan2(b.body.y - b.prevBody.y, b.body.x - b.prevBody.x);
            }

            const g = new PIXI.Graphics();
            g.lineStyle(1.6, 0xffffff, 0.95);
            g.beginFill(0xffaa00, 1);
            g.drawCircle(0, 0, 3.5);
            g.endFill();
            g.beginFill(0xffff66, 0.85);
            g.drawCircle(Math.cos(angle) * 1.2, Math.sin(angle) * 1.2, 1.5);
            g.endFill();
            g.position.set(b.body.x, b.body.y);
            bulletsContainer.addChild(g);

            if (Math.random() < 0.35) {
                spawnParticle(
                    b.body.x - Math.cos(angle) * 8,
                    b.body.y - Math.sin(angle) * 8,
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
                pt.mesh.scale.set(0.6 + pt.life * 0.8);
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
            ring.g.lineStyle(3 * ring.life, 0xff7744, ring.life);
            ring.g.drawCircle(0, 0, r);
            ring.g.lineStyle(1.5 * ring.life, 0xffffff, ring.life * 0.8);
            ring.g.drawCircle(0, 0, r * 0.55);
        }

        // Update Players
        for (const [id, p] of Object.entries(localPlayers)) {
            if (!p.lineGraphics) {
                p.lineGraphics = new PIXI.Graphics();
                p.fillGraphics = new PIXI.Graphics();
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
            const playerInfo = document.getElementById('player-info');
            if (playerInfo) playerInfo.innerText = `Player: ${latestState.playerId}`;
            
            const turnInfo = document.getElementById('turn-info');
            if (turnInfo) turnInfo.innerText = latestState.yourTurn ? "Your Turn" : "";

            if (latestState.G && latestState.G.scores) {
                let scoreHtml = "Wins (First to 5):<br/>";
                for (const [pid, score] of Object.entries(latestState.G.scores)) {
                    const name = (latestState.names && latestState.names[pid]) || pid;
                    const color = pid === latestState.playerId ? "#ffffaa" : "#dddddd";
                    scoreHtml += `<span style="color:${color}">${name}: ${score}</span><br/>`;
                }
                const scoresInfo = document.getElementById('scores-info');
                if (scoresInfo) scoresInfo.innerHTML = scoreHtml;
            }

            if (latestState.ended) {
                const go = document.getElementById('hud-game-over');
                if (go) {
                    go.style.display = 'block';
                    let resultText = "Game Over";
                    if (latestState.result) {
                        if (latestState.result.winner) {
                            resultText = `WINNER: ${(latestState.names && latestState.names[latestState.result.winner]) || latestState.result.winner}`;
                        } else if (latestState.result.draw) {
                            resultText = "Draw";
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
