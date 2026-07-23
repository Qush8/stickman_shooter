/** Must load before matter-js — WASM/QuickJS may lack browser globals Matter expects. */

export let wasmInitError: string | null = null;

export const getWasmInitError = (): string | null => wasmInitError;

export const setWasmInitError = (err: unknown): void => {
  wasmInitError = err instanceof Error ? err.message : String(err);
};

export const installWasmPolyfills = (): void => {
  const g = globalThis as typeof globalThis & {
    Date?: typeof Date & { now?: () => number };
    performance?: { now?: () => number };
    window?: typeof globalThis;
    document?: { createElement?: (tag: string) => Record<string, never> };
  };

  let fakeTime = 0;
  const tick = () => fakeTime++;

  if (!g.Date) g.Date = function Date() {} as typeof Date;
  if (!g.Date.now) g.Date.now = tick;

  if (!g.performance) g.performance = { now: tick };
  else if (!g.performance.now) g.performance.now = tick;

  if (!g.window) g.window = g as typeof globalThis;
  if (!g.document) g.document = { createElement: () => ({}) };
};

installWasmPolyfills();
