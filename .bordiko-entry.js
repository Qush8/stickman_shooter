
import { createGuest } from "@bordiko/sdk";
import GAME from "./src/game.ts";
const guest = createGuest(GAME);
function readAllStdin() {
  const chunks = []; const buf = new Uint8Array(65536);
  for (;;) { const n = Javy.IO.readSync(0, buf); if (n === 0) break; chunks.push(buf.slice(0, n)); }
  let total = 0; for (const c of chunks) total += c.length;
  const all = new Uint8Array(total); let off = 0;
  for (const c of chunks) { all.set(c, off); off += c.length; }
  return new TextDecoder().decode(all);
}
Javy.IO.writeSync(1, new TextEncoder().encode(guest.dispatch(readAllStdin().trim())));
