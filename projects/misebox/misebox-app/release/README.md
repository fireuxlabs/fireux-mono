# Misebox App release

This directory owns the Main App's release commands. It does not deploy Firestore
or Storage Rules, migrate records, or release tenant Apps.

From the repository root:

```sh
pnpm --filter misebox-app test:release
pnpm --filter misebox-app build:release
pnpm --filter misebox-app deploy:preflight
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

Only after separate deployment authorization:

```sh
pnpm --filter misebox-app deploy
# Or explicitly Hosting only:
pnpm --filter misebox-app deploy:hosting
```

Both commands run preflight, then use `gcloud auth print-access-token` to read
the existing `cloud.firestore/misebox` Rules release in `misebox-78f9c`. Missing
credentials, failed reads or any source mismatch block upload. A successful
comparison records the release/ruleset names and source digest in ignored
`.output/release/live-rules.json`. Firebase CLI credentials are separately
required for upload. No command here changes Rules or silently repairs a mismatch.

The production policy and its allow/deny tests must cover the supported Apps
sharing this named database before a Rules rollout is authorized. The old
restricted fragments use obsolete authority and are not a fallback. Rules rollout
still follows the backup, exact-target and read-back requirements in
`docs/ai/firestore-mutations-context.md`.
