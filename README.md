# ⚾ Seat Swap

Replace section, row, and seat info on MLB ticket screenshots. Works with Apple Wallet and Ballpark app layouts.

## How It Works

1. **Upload** a ticket screenshot (Apple Wallet or MLB Ballpark app)
2. **Detection** automatically finds the red ticket card and identifies the layout
3. **Edit** section, row, and seat — gate/level text auto-updates
4. **Download** the edited image

## Project Structure

```
src/
├── index.html       # App shell (markup only)
├── main.js          # Entry point
├── styles.css       # All styles
├── constants.js     # Layout detection constants (fractions/ratios)
├── detection.js     # Image analysis — pure functions, no DOM
├── rendering.js     # Canvas drawing — pure functions
└── ui.js            # DOM wiring, events, step navigation
assets/
└── SFPro.woff2      # Font file
```

**Key design decision:** `detection.js` and `rendering.js` are pure — they take data in and return results, never touching the DOM. This means they can be unit-tested, run in Web Workers, or reused in other contexts.

## Development

```bash
npm install
npm run dev       # starts Vite dev server with hot reload
```

## Build & Deploy

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

Pushing to `main` auto-deploys to GitHub Pages via the included workflow.

## Roadmap

- [ ] More team/stadium support (color palettes, logo detection)
- [ ] Manual card-corner selection for unsupported layouts
- [ ] Web Worker for detection (avoid UI jank on large images)
- [ ] Mobile editing workflow (Claude Code SSH, Codespaces)
- [ ] Seat history / favorites (localStorage)
- [ ] Web Share API for direct sending
