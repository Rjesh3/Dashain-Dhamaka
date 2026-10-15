# Dashain Dhamaka

Dashain Dhamaka is a frontend-only React and Vite game. Spins, points, and a
share code are generated and stored in the browser's local storage. Clearing
browser site data resets the game.

## Run locally

```sh
npm install
npm run dev
```

## Verify

```sh
npm test
npm run lint
npm run build
```

The repository-level `vercel.json` builds this app from `frontend/` and rewrites
app routes to the Vite entry page.
