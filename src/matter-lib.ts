/**
 * Loads matter-js only after wasm-polyfills.ts runs.
 * Keep this as a separate module so import order is: polyfills → matter-js.
 */
import "./wasm-polyfills.ts";
import { setWasmInitError } from "./wasm-polyfills.ts";
import Matter from "matter-js/build/matter.js";

export let matterInitError: string | null = null;

try {
  if (!Matter?.Engine?.create) {
    throw new Error("Matter.Engine.create missing after import");
  }
} catch (err) {
  matterInitError = err instanceof Error ? err.message : String(err);
  setWasmInitError(`matter-lib: ${matterInitError}`);
}

export default Matter;
