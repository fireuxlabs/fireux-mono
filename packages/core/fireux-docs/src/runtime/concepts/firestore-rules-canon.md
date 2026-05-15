# Firestore Rules Canon

Authority: Operational
Updated: 2026-05-15
Scope: Firestore rules for FireUX app databases during preflight, demo, and shipping phases.

## Canon

Firestore rules are currently managed manually in Firebase/Firestore for each app database.

Do not wire temporary rules into app-level `firebase.json` files while we are still standardizing app scaffolding.

## Preflight And Demo

During active local development, demo setup, and preflight review, new app databases may use open rules:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

This is only acceptable for dev/preflight/demo databases.

## Shipping

Before any real client, staging, or production ship:

- replace open rules with scoped rules for public, signed-in, admin, and membership surfaces
- confirm the rules are applied to the exact named database used by the app's `databaseId`
- treat open rules as a launch blocker unless the release is explicitly a private demo/preflight

## New App Checklist

When creating a new app database:

- create the named Firestore database that matches the app `databaseId`
- manually set temporary open rules while the app is still in preflight
- add a deploy/release reminder to tighten rules before real shipping
- keep app roots free of local `firestore.rules` files unless the repo canon changes
