# HR Analytics Platform

Enterprise-grade HR analytics platform built with **Angular 21**, **NgRx**, **Tailwind CSS**, and real-time WebSocket support. Provides workforce analytics, performance management, and hiring forecasts.

## How to run

The app runs via the **Start application** workflow (or the Run button):

```bash
cd frontend && npm start
```

- Dev server starts on **port 5000** at `http://0.0.0.0:5000`
- Angular CLI (`ng serve`) handles hot-reload automatically

## Project structure

```
frontend/          Angular 21 SPA
  src/
    app/           Components, NgRx store, services, routing
  angular.json     CLI config — host: 0.0.0.0, port: 5000
  tailwind.config.ts
docs/              User guide, admin guide, technical docs, FAQ
```

## Key notes

- **Dependencies**: `frontend/node_modules/` — reinstall with `cd frontend && npm install` if needed
- **WebSocket**: The app expects a WebSocket server at `ws://localhost:8080/` for real-time features. Without a backend running, the UI shows "Disconnected" — this is expected and non-fatal.
- **Port**: Already configured to 5000 in `angular.json` (`serve › options › port`) — no changes needed for Replit.

## User preferences

<!-- Add any remembered user preferences here -->
