/**
 * The prediction / reconciliation pipeline.
 *
 * Deliberately a separate module with no renderer, DOM or network dependency:
 * it is pure arithmetic — (dt, serverPose, renderPose) -> renderPose — so it can
 * be unit-tested headlessly. None of this runs on the server, so reducer tests
 * cover none of it (docs.md, "Real-time games", section 5).
 *
 * Two rules are baked in here rather than left to each call site:
 *
 *  - Convergence is exponential in *frame* time, never a fixed fraction per
 *    frame and never per snapshot. A fixed fraction converges twice as fast on
 *    a 120 Hz display as on a 60 Hz one and crawls in a throttled tab; doing it
 *    per snapshot has the same bug against the network instead of the display.
 *
 *  - Each axis is judged on its own error. A combined Math.hypot() snap test
 *    lets error on an axis owned by the server teleport an axis we predicted,
 *    which players read as a sideways yank while running.
 */

/** Frame-rate independent smoothing factor. dtSec <= 0 means "do not advance". */
export const expLerpFactor = (rate, dtSec) =>
  1 - Math.exp(-rate * Math.max(0, dtSec));

export const lerpToward = (from, to, t) => from + (to - from) * t;

/**
 * Reconcile a single axis.
 *
 * Snaps only past `snapDist` — size that at respawn / round-reset distances, not
 * at ordinary drift. If it fires in normal play, raise `rate` rather than
 * lowering the threshold.
 */
export const reconcileAxis = (current, target, rate, dtSec, snapDist) => {
  if (!Number.isFinite(current)) return target;
  if (!Number.isFinite(target)) return current;
  if (Number.isFinite(snapDist) && Math.abs(target - current) > snapDist) return target;
  return lerpToward(current, target, expLerpFactor(rate, dtSec));
};

/**
 * Reconcile a 2D pose. Returns a new {x, y}; never mutates its inputs.
 *
 * @param render  Currently drawn pose. Either coordinate may be undefined on the
 *                first frame, in which case that axis adopts the server value.
 * @param server  Authoritative pose from the latest snapshot.
 */
export const reconcilePose = (render, server, { rate, dtSec, snapX, snapY }) => ({
  x: reconcileAxis(render?.x, server.x, rate, dtSec, snapX),
  y: reconcileAxis(render?.y, server.y, rate, dtSec, snapY),
});
