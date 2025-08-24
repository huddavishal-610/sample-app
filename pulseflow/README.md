
# PulseFlow – Kegel Trainer (PWA)

A clean, mobile-first progressive web app that guides pelvic-floor exercises with hold/relax timers, programs, progress, and personalization.

## Quick start

```bash
npm i
npm run dev
# open http://localhost:5173
```

## Build

```bash
npm run build
npm run preview
```

## Features included
- Onboarding quiz → assigns beginner/intermediate/advanced program
- Timer with phases, audio beeps, optional voice coach, basic haptics
- Programs list, Home, Progress (heatmap + badges), Settings
- Local-first state (localStorage), JSON export
- PWA: manifest + service worker (offline app shell)
- Light/dark mode (system default + manual toggle)

> Note: Web Push requires a server; this MVP uses Notification API for local prompts only.

## License
MIT
