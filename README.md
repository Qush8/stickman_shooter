# My Shooter Game

A [Bordiko](https://bordiko.com) board game, built with `@bordiko/sdk`.

## Develop

```bash
npm install
npm run dev            # play locally: every seat, bots, hot-reload, custom-UI preview
npm test               # run your tests (plain Node, no build)
npm run build          # compile to WebAssembly → dist/my-shooter-game.wasm
npm run publish:game   # ship to the marketplace
```

Publishing needs a registry + admin token:

```bash
REGISTRY=https://api.bordiko.com/api ADMIN_TOKEN=<token> npm run publish:game
```

Your whole game is in `src/game.ts`. It's a deterministic reducer — see the
docs for the full API: https://bordiko.com/developers
