# Misebox App release

This directory owns the Main App's release commands. It does not deploy Firestore
or Storage Rules, migrate records, or release tenant Apps.

From the repository root:

```sh
pnpm --filter misebox-app test:release
pnpm --filter misebox-app build:release
FIRESTORE_EMULATOR_HOST=127.0.0.1:8787 pnpm --filter misebox-app deploy:preflight
```

`build:release` builds the Firebase Gen 2 / Node 22 output with the Misebox public
origin, then prepares its production manifest and lockfile. The preparation
removes build-machine-specific Sharp/esbuild binaries from direct dependencies;
their owning packages select the deployment platform's binaries during install.
It copies only `server/firebase.runtime-env.json` into the function environment,
not the development `.env`. Provider secrets must be configured separately.
`prepare:firebase-output` repeats preparation after an existing production build.
`check:env` validates that checked-in runtime environment's target and syntax; it
does not validate live secrets or provider connectivity.

Local preflight validates the exact App targets, prepared output and production
Rules source. It also requires the production allow/deny test suite to pass.
Missing production Rules or their tests are a hard stop: the retained open
development template is never an acceptable release fallback.

Run a local Firestore emulator on that port before preflight. The suite accepts
only localhost/127.0.0.1, compiles the exact ecosystem-owned
`firestore.production.rules`, and clears fixtures only in the emulator's
`demo-misebox-production-rules` project, named database `misebox`. It never falls
back to cloud Firestore. Run the suite alone with
`FIRESTORE_EMULATOR_HOST=127.0.0.1:8787 node --test projects/misebox/misebox-app/test/firestore.production.test.mjs`.

The production candidate uses current App membership and Kitchen-owned grants
stored in `kitchen_access/{uid}.apps[appId]` and bound to that membership's
creation timestamp. Existing operators need those
grants already present; Team labels and obsolete AppUser arrays grant no access.
Offering child records are readable by an associated operator; their mutations
and raw Sellable terms remain server-owned. The candidate enumerates all six
supported Apps. Its required overlapping-stale-grant regression proves current authority
remains reachable within Firestore's document-access and expression-evaluation
budgets for the six supported Apps. The shared index is validated once per
cross-App check; memberships are resolved only for valid matching grants. Deleted
or malformed earlier grants must not hide a valid later App, and non-string IDs
must not grant access. Do not remove those checks or accept ordinary single-App
cases as full cross-App proof.

The offline `tools/misebox-migrations/kitchen-access.py` proposal preserves
existing grants and current membership evidence, with create-only canonical
targets and separately gated retirement. It has no network or apply mode.
Source changes do not migrate live grants or deploy Rules. The accepted development template is
unchanged. Nested authored lists/maps have bounded containers, not full
per-element validation; public Product roots must contain catalogue content only.

Only after separate deployment authorization:

```sh
pnpm --filter misebox-app deploy
# Or explicitly Hosting only:
pnpm --filter misebox-app deploy:hosting
```

Both commands run preflight, then use `gcloud auth print-access-token` to read
the existing `cloud.firestore/misebox` Rules release in `misebox-78f9c`.
The Rules API request uses that same pinned project as `x-goog-user-project`;
it does not inherit another project's quota/billing target.
Missing
credentials, failed reads or any source mismatch block upload. A successful
comparison records the release/ruleset names and source digest in ignored
`.output/release/live-rules.json`. Firebase CLI credentials are separately
required for upload. No command here changes Rules or silently repairs a mismatch.

The production policy and its allow/deny tests must cover the supported Apps
sharing this named database before a Rules rollout is authorized. The old
restricted fragments use obsolete authority and are not a fallback. Rules rollout
still follows the backup, exact-target and read-back requirements in
`docs/ai/firestore-mutations-context.md`.
