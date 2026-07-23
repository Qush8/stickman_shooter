/**
 * Matter.js physics backend with a Planck/Box2D-shaped API for game.ts.
 * Coordinates are in meter-space (1 unit = SCALE pixels in game state).
 */
import { getWasmInitError, setWasmInitError } from "./wasm-polyfills.ts";
import Matter, { matterInitError } from "./matter-lib.ts";

let physicsBootstrapError: string | null = matterInitError;

let Engine: typeof Matter.Engine;
let MatterWorld: typeof Matter.World;
let Bodies: typeof Matter.Bodies;
let MatterBody: typeof Matter.Body;
let Constraint: typeof Matter.Constraint;
let Events: typeof Matter.Events;
let Query: typeof Matter.Query;
let Composite: typeof Matter.Composite;

try {
  ({ Engine, World: MatterWorld, Bodies, Body: MatterBody, Constraint, Events, Query, Composite } =
    Matter);
  if (!Engine?.create) {
    throw new Error("Matter.js Engine unavailable after bootstrap");
  }
} catch (err) {
  physicsBootstrapError = err instanceof Error ? err.message : String(err);
  setWasmInitError(`matter-physics: ${physicsBootstrapError}`);
}

export const getPhysicsInitError = (): string | null =>
  physicsBootstrapError ?? getWasmInitError();

const assertMatterReady = (): void => {
  const err = getPhysicsInitError();
  if (err) throw new Error(`WASM INIT: ${err}`);
};

export interface Vec2 {
  x: number;
  y: number;
}

export function Vec2(x: number, y: number): Vec2 {
  return { x, y };
}

export class WorldManifold {
  normal = Vec2(0, 1);
  points: Vec2[] = [];
  pointCount = 0;
}

type BodyKind = "static" | "dynamic" | "kinematic";

export type ShapeDef =
  | { kind: "box"; hx: number; hy: number; cx: number; cy: number }
  | { kind: "circle"; radius: number }
  | { kind: "edge"; x1: number; y1: number; x2: number; y2: number };

export interface FixtureOptions {
  density?: number;
  friction?: number;
  restitution?: number;
  isSensor?: boolean;
  userData?: unknown;
}

interface BodyOptions {
  position?: Vec2;
  fixedRotation?: boolean;
  bullet?: boolean;
  gravityScale?: number;
}

interface ContactRecord {
  id: number;
  pair: Matter.Pair;
  bodyA: Body;
  bodyB: Body;
  fixtureA: Fixture;
  fixtureB: Fixture;
  enabled: boolean;
  touching: boolean;
  normal: Vec2;
}

let contactIdSeq = 0;
const activeContacts = new Map<number, ContactRecord>();
const contactsByBody = new Map<Body, Set<number>>();

export class Fixture {
  body: Body;
  shape: ShapeDef;
  userData: unknown;

  constructor(body: Body, shape: ShapeDef, userData: unknown) {
    this.body = body;
    this.shape = shape;
    this.userData = userData;
  }

  getUserData(): unknown {
    return this.userData;
  }

  getBody(): Body {
    return this.body;
  }

  getShape(): ShapeDef {
    return this.shape;
  }

  getNext(): Fixture | null {
    return null;
  }

  getTransform(): { position: Vec2; angle: number } {
    return { position: this.body.getPosition(), angle: this.body.getAngle() };
  }
}

export class Contact {
  private record: ContactRecord;

  constructor(record: ContactRecord) {
    this.record = record;
  }

  getFixtureA(): Fixture {
    return this.record.fixtureA;
  }

  getFixtureB(): Fixture {
    return this.record.fixtureB;
  }

  isTouching(): boolean {
    return this.record.touching && this.record.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.record.enabled = enabled;
    this.record.pair.isActive = enabled;
  }

  getId(): number {
    return this.record.id;
  }

  getWorldManifold(manifold: WorldManifold): void {
    manifold.normal.x = this.record.normal.x;
    manifold.normal.y = this.record.normal.y;
    if (manifold.points.length === 0) {
      manifold.points.push(Vec2(0, 0));
    }
    const fa = this.record.fixtureA.body.getPosition();
    const fb = this.record.fixtureB.body.getPosition();
    manifold.points[0].x = (fa.x + fb.x) * 0.5;
    manifold.points[0].y = (fa.y + fb.y) * 0.5;
    manifold.pointCount = 1;
  }
}

export class ContactEdge {
  contact: Contact;
  next: ContactEdge | null;
  constructor(contact: Contact, next: ContactEdge | null) {
    this.contact = contact;
    this.next = next;
  }
}

function unlinkBodyContact(body: Body, id: number): void {
  const set = contactsByBody.get(body);
  if (!set) return;
  set.delete(id);
  if (set.size === 0) contactsByBody.delete(body);
}

export class Body {
  private matterBody: Matter.Body | null = null;
  private fixture: Fixture | null = null;
  private readonly kind: BodyKind;
  private readonly opts: BodyOptions;
  private readonly world: PhysicsWorld;
  gravityScale = 1;
  private targetVelocity: Vec2 | null = null;

  constructor(world: PhysicsWorld, kind: BodyKind, opts: BodyOptions = {}) {
    this.world = world;
    this.kind = kind;
    this.opts = opts;
    this.gravityScale = opts.gravityScale ?? 1;
  }

  getMatterBody(): Matter.Body | null {
    return this.matterBody;
  }

  createFixture(shape: ShapeDef, options: FixtureOptions = {}): Fixture {
    if (this.matterBody) {
      throw new Error("Body already has a fixture");
    }

    const pos = this.opts.position ?? Vec2(0, 0);
    const isStatic = this.kind === "static";
    const isSensor = options.isSensor ?? false;
    const density = options.density ?? 1;
    const friction = options.friction ?? 0.5;
    const restitution = options.restitution ?? 0;

    let matterShape: Matter.Body;
    if (shape.kind === "box") {
      matterShape = Bodies.rectangle(
        pos.x + shape.cx,
        pos.y + shape.cy,
        shape.hx * 2,
        shape.hy * 2,
        {
          isStatic,
          isSensor,
          friction,
          restitution,
          density,
          inertia: this.opts.fixedRotation ? Infinity : undefined,
          chamfer: { radius: 0 },
        },
      );
    } else if (shape.kind === "circle") {
      matterShape = Bodies.circle(pos.x, pos.y, shape.radius, {
        isStatic,
        isSensor,
        friction,
        restitution,
        density,
        frictionAir: this.opts.bullet ? 0 : 0.01,
        inertia: this.opts.fixedRotation ? Infinity : undefined,
      });
    } else {
      const mx = (shape.x1 + shape.x2) * 0.5;
      const my = (shape.y1 + shape.y2) * 0.5;
      const len = Math.hypot(shape.x2 - shape.x1, shape.y2 - shape.y1);
      const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
      matterShape = Bodies.rectangle(mx, my, len, 1.0, {
        isStatic: true,
        isSensor: false,
        friction,
        restitution,
        angle,
        inertia: Infinity,
      });
    }

    if (this.opts.fixedRotation) {
      MatterBody.setInertia(matterShape, Infinity);
    }
    // Matter skips collisions for infinite-mass kinematic bodies — use static + setTransform instead.
    if (this.kind === "kinematic") {
      matterShape.isStatic = true;
      MatterBody.setStatic(matterShape, true);
    }

    matterShape.plugin = matterShape.plugin ?? {};
    matterShape.plugin.gravityScale = this.gravityScale;
    matterShape.plugin.gameBody = this;

    this.matterBody = matterShape;
    this.fixture = new Fixture(this, shape, options.userData ?? null);
    this.world.addBody(matterShape);
    return this.fixture;
  }

  getFixtureList(): Fixture | null {
    return this.fixture;
  }

  getContactList(): ContactEdge | null {
    const ids = contactsByBody.get(this);
    if (!ids || ids.size === 0) return null;
    let head: ContactEdge | null = null;
    for (const id of ids) {
      const rec = activeContacts.get(id);
      if (!rec) continue;
      head = new ContactEdge(new Contact(rec), head);
    }
    return head;
  }

  getPosition(): Vec2 {
    const b = this.matterBody;
    if (!b) return Vec2(0, 0);
    return Vec2(b.position.x, b.position.y);
  }

  setTransform(position: Vec2, angle: number): void {
    const b = this.matterBody;
    if (!b) return;
    MatterBody.setPosition(b, { x: position.x, y: position.y });
    MatterBody.setAngle(b, angle);
  }

  getLinearVelocity(): Vec2 {
    const b = this.matterBody;
    if (this.targetVelocity) return Vec2(this.targetVelocity.x, this.targetVelocity.y);
    if (!b) return Vec2(0, 0);
    const dt = this.world.getStepSeconds();
    return Vec2(b.velocity.x / dt, b.velocity.y / dt);
  }

  setLinearVelocity(v: Vec2): void {
    this.targetVelocity = Vec2(v.x, v.y);
    this.syncMatterVelocity(v);
  }

  /** Matter.js Verlet velocity is displacement/step — sync positionPrev for impulses/jumps. */
  private syncMatterVelocity(v: Vec2): void {
    const b = this.matterBody;
    if (!b) return;
    const dt = this.world.getStepSeconds();
    const bx = v.x * dt;
    const by = v.y * dt;
    MatterBody.setVelocity(b, { x: bx, y: by });
    MatterBody.set(b, {
      positionPrev: { x: b.position.x - bx, y: b.position.y - by },
    });
  }

  /** Projectiles: set m/s velocity once with correct Verlet state. */
  setBallisticVelocity(v: Vec2): void {
    this.setLinearVelocity(v);
  }

  syncMatterVelocityPublic(v: Vec2): void {
    this.syncMatterVelocity(v);
  }

  applyLinearImpulse(impulse: Vec2, _point: Vec2, _wake: boolean): void {
    const b = this.matterBody;
    if (!b || b.mass <= 0 || !Number.isFinite(b.mass)) return;
    const current = this.getLinearVelocity();
    this.setLinearVelocity(
      Vec2(current.x + impulse.x / b.mass, current.y + impulse.y / b.mass),
    );
  }

  getWorldCenter(): Vec2 {
    return this.getPosition();
  }

  getAngle(): number {
    return this.matterBody?.angle ?? 0;
  }

  setAngle(angle: number): void {
    const b = this.matterBody;
    if (!b) return;
    MatterBody.setAngle(b, angle);
  }

  setAwake(_awake: boolean): void {
    const b = this.matterBody;
    if (!b) return;
    MatterBody.set(b, { sleeping: false });
  }

  getMass(): number {
    return this.matterBody?.mass ?? 1;
  }

  getType(): BodyKind {
    return this.kind;
  }

  getTransform(): { position: Vec2; angle: number } {
    return { position: this.getPosition(), angle: this.getAngle() };
  }

  applyTargetToMatter(): void {
    if (!this.targetVelocity || !this.matterBody) return;
    this.syncMatterVelocity(this.targetVelocity);
  }

  clearTarget(): void {
    this.targetVelocity = null;
  }

  destroy(): void {
    const ids = contactsByBody.get(this);
    if (ids) {
      for (const id of [...ids]) {
        const rec = activeContacts.get(id);
        if (!rec) continue;
        unlinkBodyContact(rec.bodyA, id);
        unlinkBodyContact(rec.bodyB, id);
        activeContacts.delete(id);
      }
    }
    if (this.matterBody) {
      this.world.removeBody(this.matterBody);
      this.matterBody = null;
    }
    contactsByBody.delete(this);
  }
}

type ContactHandler = (contact: Contact) => void;

export class PhysicsWorld {
  readonly engine: Matter.Engine;
  private beginHandlers: ContactHandler[] = [];
  private preSolveHandlers: ContactHandler[] = [];
  private readonly stepMs: number;
  private readonly baseGravity: number;

  constructor(options: { gravity: Vec2; stepMs?: number }) {
    assertMatterReady();
    this.stepMs = options.stepMs ?? 1000 / 60;
    this.baseGravity = options.gravity.y;
    // Matter gravity.scale uses force = mass * y * scale; scale ≈ m/s² * 1e-6 matches Planck GRAVITY.
    const gravityScale = this.baseGravity * 1e-6;
    this.engine = Engine.create({
      gravity: { x: options.gravity.x, y: 1, scale: gravityScale },
      positionIterations: 6,
      velocityIterations: 4,
      enableSleeping: false,
    });

    Events.on(this.engine, "beforeUpdate", () => {
      this.applyTargetVelocities();
      const { y: gravityY, scale: engineScale = gravityScale } = this.engine.gravity;
      for (const body of Composite.allBodies(this.engine.world)) {
        if (body.isStatic) continue;
        const customScale = body.plugin.gravityScale ?? 1;
        if (customScale === 1) continue;
        const extra = (customScale - 1) * gravityY * engineScale * body.mass;
        if (extra !== 0) {
          MatterBody.applyForce(body, body.position, { x: 0, y: extra });
        }
      }
    });

    Events.on(this.engine, "collisionStart", (event: Matter.IEventCollision<Matter.Engine>) => {
      for (const pair of event.pairs) {
        this.registerPair(pair, true);
      }
      this.dispatchContacts("begin");
    });

    Events.on(this.engine, "collisionActive", (event: Matter.IEventCollision<Matter.Engine>) => {
      for (const pair of event.pairs) {
        this.registerPair(pair, true);
      }
      this.dispatchContacts("pre");
    });

    Events.on(this.engine, "collisionEnd", (event: Matter.IEventCollision<Matter.Engine>) => {
      for (const pair of event.pairs) {
        this.unregisterPair(pair);
      }
    });
  }

  private wrapMatterBody(matterBody: Matter.Body): Body | null {
    if (!matterBody?.plugin) return null;
    return (matterBody.plugin.gameBody as Body | undefined) ?? null;
  }

  private fixtureFor(body: Body | null): Fixture | null {
    return body?.getFixtureList() ?? null;
  }

  private registerPair(pair: Matter.Pair, touching: boolean): void {
    const bodyA = this.wrapMatterBody(pair.bodyA);
    const bodyB = this.wrapMatterBody(pair.bodyB);
    if (!bodyA || !bodyB) return;

    let id = (pair as Matter.Pair & { plugin?: { contactId?: number } }).plugin?.contactId;
    if (id == null || !activeContacts.has(id)) {
      id = ++contactIdSeq;
      const pairPlugin = pair as Matter.Pair & { plugin?: { contactId?: number } };
      pairPlugin.plugin = pairPlugin.plugin ?? {};
      pairPlugin.plugin.contactId = id;
    }

    const nx = pair.collision.normal.x;
    const ny = pair.collision.normal.y;
    const fixtureA = this.fixtureFor(bodyA)!;
    const fixtureB = this.fixtureFor(bodyB)!;
    const prev = activeContacts.get(id);
    const record: ContactRecord = {
      id,
      pair,
      bodyA,
      bodyB,
      fixtureA,
      fixtureB,
      enabled: prev?.enabled ?? true,
      touching,
      normal: Vec2(nx, ny),
    };
    activeContacts.set(id, record);
    this.linkBodyContact(bodyA, id);
    this.linkBodyContact(bodyB, id);
  }

  private unregisterPair(pair: Matter.Pair): void {
    const id = (pair as Matter.Pair & { plugin?: { contactId?: number } }).plugin?.contactId;
    if (id == null) return;
    const rec = activeContacts.get(id);
    if (rec) {
      this.unlinkBodyContact(rec.bodyA, id);
      this.unlinkBodyContact(rec.bodyB, id);
    }
    activeContacts.delete(id);
  }

  private linkBodyContact(body: Body, id: number): void {
    let set = contactsByBody.get(body);
    if (!set) {
      set = new Set();
      contactsByBody.set(body, set);
    }
    set.add(id);
  }

  private unlinkBodyContact(body: Body, id: number): void {
    unlinkBodyContact(body, id);
  }

  private dispatchContacts(phase: "begin" | "pre"): void {
    const handlers = phase === "begin" ? this.beginHandlers : this.preSolveHandlers;
    for (const rec of activeContacts.values()) {
      if (!rec.touching) continue;
      const contact = new Contact(rec);
      for (const handler of handlers) {
        handler(contact);
      }
    }
  }

  on(event: "begin-contact" | "pre-solve", handler: ContactHandler): void {
    if (event === "begin-contact") this.beginHandlers.push(handler);
    else this.preSolveHandlers.push(handler);
  }

  createBody(options: { position?: Vec2 } = {}): Body {
    return new Body(this, "static", options);
  }

  createDynamicBody(options: BodyOptions = {}): Body {
    return new Body(this, "dynamic", options);
  }

  createKinematicBody(options: BodyOptions = {}): Body {
    return new Body(this, "kinematic", options);
  }

  destroyBody(body: Body): void {
    body.destroy();
  }

  createJoint(joint: RevoluteJointInstance): void {
    const a = joint.bodyA.getMatterBody();
    const b = joint.bodyB.getMatterBody();
    const anchor = joint.anchor;
    if (!a || !b) return;

    const pointA = { x: anchor.x - a.position.x, y: anchor.y - a.position.y };
    const pointB = { x: anchor.x - b.position.x, y: anchor.y - b.position.y };
    const restLength = Math.hypot(
      a.position.x + pointA.x - (b.position.x + pointB.x),
      a.position.y + pointA.y - (b.position.y + pointB.y),
    );

    const constraint = Constraint.create({
      bodyA: a,
      bodyB: b,
      pointA,
      pointB,
      length: Math.max(0.01, restLength),
      stiffness: 0.85,
      damping: 0.08,
    });
    Composite.add(this.engine.world, constraint);
  }

  getStepSeconds(): number {
    return this.stepMs / 1000;
  }

  applyTargetVelocities(): void {
    for (const mb of Composite.allBodies(this.engine.world)) {
      const gameBody = this.wrapMatterBody(mb);
      gameBody?.applyTargetToMatter();
    }
  }

  clearTargetVelocities(): void {
    for (const mb of Composite.allBodies(this.engine.world)) {
      const gameBody = this.wrapMatterBody(mb);
      gameBody?.clearTarget();
    }
  }

  addBody(body: Matter.Body): void {
    Composite.add(this.engine.world, body);
  }

  removeBody(body: Matter.Body): void {
    Composite.remove(this.engine.world, body);
  }

  step(_dt: number): void {
    this.applyTargetVelocities();
    Engine.update(this.engine, this.stepMs);
    this.clearTargetVelocities();
  }

  rayCast(
    p1: Vec2,
    p2: Vec2,
    callback: (fixture: Fixture, point: Vec2) => number,
  ): void {
    const rayBodies = Query.ray(this.getAllBodies(), p1, p2) as unknown as Matter.Body[];
    let best: { fixture: Fixture; point: Vec2; dist: number } | null = null;

    for (const mb of rayBodies) {
      const gameBody = this.wrapMatterBody(mb);
      const fixture = this.fixtureFor(gameBody);
      if (!fixture) continue;

      const x = p1.x;
      if (x < mb.bounds.min.x || x > mb.bounds.max.x) continue;

      const surfaceY = mb.bounds.min.y;
      if (surfaceY < p1.y - 0.05 || surfaceY > p2.y + 0.05) continue;

      const dist = surfaceY - p1.y;
      if (!best || dist < best.dist) {
        best = { fixture, point: Vec2(x, surfaceY), dist };
      }
    }

    if (!best) return;
    callback(best.fixture, best.point);
  }

  getAllBodies(): Matter.Body[] {
    return Composite.allBodies(this.engine.world);
  }
}

export function Box(hx: number, hy: number, center: Vec2 = Vec2(0, 0)): ShapeDef {
  return { kind: "box", hx, hy, cx: center.x, cy: center.y };
}

export function Circle(radius: number): ShapeDef {
  return { kind: "circle", radius };
}

export function Edge(v1: Vec2, v2: Vec2): ShapeDef {
  return { kind: "edge", x1: v1.x, y1: v1.y, x2: v2.x, y2: v2.y };
}

export interface RevoluteJointDef {
  lowerAngle?: number;
  upperAngle?: number;
  enableLimit?: boolean;
}

export type RevoluteJointInstance = {
  def: RevoluteJointDef;
  bodyA: Body;
  bodyB: Body;
  anchor: Vec2;
};

export function RevoluteJoint(
  def: RevoluteJointDef,
  bodyA: Body,
  bodyB: Body,
  anchor: Vec2,
): RevoluteJointInstance {
  return { def, bodyA, bodyB, anchor };
}

export function testOverlap(
  _shapeA: ShapeDef,
  _radiusA: number,
  _shapeB: ShapeDef,
  _radiusB: number,
  _transformA: { position: Vec2; angle: number },
  _transformB: { position: Vec2; angle: number },
): boolean {
  return false;
}

export function testBodyOverlap(bodyA: Body, bodyB: Body): boolean {
  const a = bodyA.getMatterBody();
  const b = bodyB.getMatterBody();
  if (!a || !b) return false;
  return Query.collides(a, [b]).length > 0;
}

/** Planck-compatible World export */
export class World extends PhysicsWorld {
  constructor(options: { gravity: Vec2 }) {
    super(options);
  }
}

export { MatterWorld };
