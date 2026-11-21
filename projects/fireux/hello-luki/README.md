# Hello Luki — FireUX smoke demo

An intentionally tiny FireUX App. The only demo content at `/` is **Hello Luki!**

This is an **App source proposal**, not a deployed release, and not proof that Ignite has autonomously built an app. The repo already has the FireUX App bundle and Nuxt project template.

## Acceptance

1. Build this App from the monorepo using `pnpm --filter hello-luki run generate`.
2. Serve its generated output and confirm the homepage visibly says **Hello Luki!**.
3. Configure Firebase Web App/runtime values using the existing FireUX release contract and provision the standalone App's named database `hello-luki`, with authorization/identity intact.
4. Provision and verify an unused Firebase Hosting site matching the explicit `firebase.json` target, or adjust that target to the confirmed site. Never replace an existing site.
5. Perform explicit release preflight, get operator approval for production changes and deploy this App to that Hosting site.
6. Open the real HTTPS URL and verify the greeting, status code and absence of sign-in or setup blockers. Record actual start/finish timestamps for the demo.

Do not claim the app is live until deployment and the URL are verified. Do not auto-arm the Walking Bridge, mutate Firestore or release other Apps. No voice assistant, AI integration, database records or onboarding are part of this demo.
