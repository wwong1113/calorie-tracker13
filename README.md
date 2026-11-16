# FitTrack

A calorie and macro tracker built with React and Vite. Log food by day, save meals, set goals, and look up nutrition for ingredients. Accounts and sync use Firebase.

## Run it

```bash
npm install
npm run dev
```

Without any setup the app runs in guest mode: everything is saved in the browser, and accounts are switched off.

## Setup

Copy `.env.example` to `.env` and fill it in.

**Food search** needs a [Spoonacular](https://spoonacular.com/food-api) key in `VITE_FOOD_API_KEY`.

**Accounts and sync** need a Firebase project:

1. Create a project at <https://console.firebase.google.com>.
2. Build > Authentication > Sign-in method: turn on **Email/Password**.
3. Build > Firestore Database: create a database.
4. In the Firestore **Rules** tab, paste the contents of `firestore.rules` and publish.
5. Project settings > Your apps: add a **Web** app, then copy `apiKey`, `authDomain`, `projectId` and `appId` into the four `VITE_FIREBASE_*` lines in `.env`.
6. Restart `npm run dev`.

## Try accounts without a Firebase project

This uses the local Firebase emulators (needs Java). Nothing leaves your machine, and the data is wiped when the emulators stop.

```bash
npm run emulators
```

```bash
npm run dev:emulator
```

## Where data lives

- Signed out: this browser's localStorage. It moves into your account when you create one.
- Signed in: Firestore, in `users/{uid}` (goals and meals) and `users/{uid}/days/{date}` (that day's food log).
