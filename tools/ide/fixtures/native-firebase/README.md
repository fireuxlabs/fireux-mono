# Native Firebase foundation experiment

This disposable Nuxt fixture uses Firebase App, Auth, Firestore, Vue, and Nuxt
directly. Core and production configuration are outside the fixture. All
credentials and records are synthetic under `demo-native-foundation`. The
server and seed script require the fixture's exact emulator destinations.

## What to inspect

- [Client plugin](app/plugins/firebase.client.ts) initializes Firebase, chooses
  the configured named database, connects emulators, and observes Auth once.
- [Browser probe](app/components/NativeProbe.vue) uses one-time SDK reads and
  explicitly manages the two live subscriptions needed for this test. It
  clears the previous Kitchen synchronously and disposes the listener on a
  source change. The polling in this component is test orchestration.
- [Admin setup](server/utils/admin.ts) and the [rename command](server/api/rename.post.ts)
  use native Admin APIs. The command reads membership and grant in its write
  transaction. [Fixture Rules](firestore.rules) protect the browser path.
- [Public page](app/pages/index.vue) uses Nuxt SSR with a deliberately narrow
  [projection](server/api/public.get.ts).
- [Session page](app/pages/session.vue) resolves the incoming cookie through
  a [server endpoint](server/api/session.get.ts) and marks its response private
  and non-cacheable.
- [Parity checks](parity.mjs) cover the emulator Google credential, two named
  databases, membership lifetime, and absent, invalid and valid SSR sessions.

## Run

From the repository root, copy this fixture to a disposable directory and link
the repository's installed dependencies. This keeps generated files out of Git.

```sh
fixture=$(mktemp -d /tmp/fireux-native-firebase.XXXXXX)
cp -R tools/ide/fixtures/native-firebase/. "$fixture/"
ln -s "$PWD/node_modules" "$fixture/node_modules"
cd "$fixture"
```

Start the Firebase CLI with `firebase emulators:start --only auth,firestore --project demo-native-foundation`.
In another terminal in the disposable directory, export
`FIRESTORE_EMULATOR_HOST=127.0.0.1:18744` and
`FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:19099`, then run:

```sh
node seed.mjs
node node_modules/nuxt/bin/nuxt.mjs dev --host 127.0.0.1 --port 18745
```

Run `node parity.mjs` with the same environment. For the browser scenario, open
`http://127.0.0.1:18745`, click **Run native checks**, then execute
`node seed.mjs revoke` when the probe asks for revocation. Use a fresh emulator
session for another full browser run.

The tested CLI accepts one Rules file in the emulator config. The fixture uses
a single ruleset and selects the identity document policy using the database
name. This establishes local split routing and rule enforcement for the tested
paths. It does not simulate independently deployed production rule revisions.

## Proposed Core foundation

1. **Client Firebase plugin.** Initialize once from existing runtime contracts.
   Keep the Ecosystem Firebase project and client options, including the
   App-specific Firebase App ID and configured auth domain. Resolve the
   Ecosystem and identity database IDs independently, with the existing
   identity fallback. Connect emulators only when explicitly configured.
2. **Core Auth state.** Expose one reactive Firebase observer and readiness.
   Keep sign-in actions separate. Verify real Google popup and redirect behavior
   on an approved hosted non-production App.
3. **Server Firebase initialization.** Keep ownership of Admin initialization,
   credentials, named routing and trusted bearer verification. Choose an SSR
   session mechanism based on the actual hosting contract. The fixture proves
   cookie consumption and verification. It mints its cookie in the test driver.
4. **Membership and domain operations.** Establish App membership before
   acquiring private records. Keep membership lifetime and Entity authority in
   the current owners. Start with native one-time SDK reads. Add a scoped
   listener only where the product needs live updates.
5. **Replace by verified App slice.** Prove the App root, auth and membership
   before moving document and collection consumers. Then verify domain grants,
   live screens, public SSR and trusted commands. Remove legacy dependency
   wiring once the affected App paths work natively.

Before cutover, validate hosted OAuth domains, environment variable injection,
ADC/IAM, response caching and cookie transport on the actual non-production
deployment. The fixture exercises Firebase's emulated Google credential flow
and a local Nuxt server. It cannot establish those hosting contracts.
