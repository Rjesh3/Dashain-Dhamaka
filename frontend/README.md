# Tihar Dhamaka

Tihar Dhamaka is a frontend-only React and Vite game. Spins, points, and a
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

## Deploy to Firebase Hosting

The Firebase web app and Analytics SDK are initialized in `src/firebase.ts`.
The Firebase web configuration is public client configuration, not a server
secret.

Page views are sent for each in-app route, including client-side navigation.
To review daily users, open the `dashain1` project in Firebase Console and go to
Analytics, or open the linked Google Analytics property and view the Users or
Active users metric by day. New Analytics data can take up to 24 hours to appear
in standard reports.

From the repository root, deploy the Vite production build to the configured
Firebase project:

```sh
npx -y firebase-tools@latest deploy --only hosting --project dashain1
```

The Firebase Hosting predeploy hook runs the frontend production build and
serves `frontend/dist`, with SPA routes rewritten to `index.html`.
