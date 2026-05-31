# Ecosystems Map
Authority: Tier2 (Operational index)
Updated: 2026-03-05

One reusable map replaces per-ecosystem product docs in this folder.

## Active Ecosystems
| Ecosystem | Module package | Global app | Product source pages |
| --- | --- | --- | --- |
| fireux | `packages/ecosystem/fireux-fireux` | `projects/fireux/fireux-app` | `/`, `/about`, `/road-map` (when present) |
| cleanbox | `packages/ecosystem/fireux-cleanbox` | `projects/cleanbox/cleanbox-app` | `/`, `/about`, `/road-map` (when present) |
| misebox | `packages/ecosystem/fireux-misebox` | `projects/misebox/misebox-app` | `/`, `/about`, `/road-map` (when present) |
| bringli | `packages/ecosystem/fireux-bringli` | `projects/bringli/bringli-app` | `/`, `/about`, `/road-map` (when present) |
| granite | `packages/ecosystem/fireux-granite` | `projects/granite/granite-app` | `/`, `/about`, `/road-map` (when present) |
| slap | `packages/ecosystem/fireux-slap` | `projects/slap/slap-app` | `/`, `/about`, `/get-started` |

## Rule
- Do not add app-specific product narratives in `docs/**`.
- Keep shared docs operational and app-agnostic.
- Put ecosystem-specific product narrative in app pages (`/about`, `/road-map`).

## Firestore Rule
- During development, ecosystem Firestore rules may stay temporarily open so console and model work can move quickly.
- Before shipping any ecosystem, replace dev-open rules with shippable rules and deploy them to the actual database that ecosystem uses, not just `(default)`.
- For named databases, use `firebase deploy --only firestore:<databaseId> --project <firebase-project-id>` so the rules release is bound to the intended database.
- Always verify the ecosystem runtime config points at the intended Firestore `databaseId` before debugging permissions.

## Auth Rule
- New ecosystem apps should enable Firebase Auth with Email/Password, Google, and Anonymous first.
- Treat additional providers as app-specific product decisions, not default launch blockers.
- Before shipping, verify Firebase Auth authorized domains include `localhost`, the Firebase Hosting domains, and every custom domain the app can actually serve from.
- Authorized domains are Firebase project state; keep them aligned with Hosting and deployment config.

## Firestore Shipping Checklist
- Treat Firestore rules as part of ecosystem launch, not post-launch cleanup.
- For every ecosystem and every named database, verify the shipped rules target the real database id (`fireux`, `cleanbox`, `misebox`, etc.), not only `(default)`.
- Never ship or leave production on temporary `allow read, write: if true` rules.
- Verify public tenant landings do not depend on protected client reads such as `apps/{appId}` or `apps/{appId}/users` before auth is ready.
- Add a preflight check for each app that confirms rules, indexes, and runtime `databaseId` are aligned before deployment.
