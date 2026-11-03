# Firebase release tooling

This repository tool owns portable Nuxt/Firebase SSR artifacts. Apps own their
Firebase project, Hosting site, function codebase, public build origin and release
policy. It is not a backend provisioner, Rules deployer or data migration tool.
Misebox's `release/release.mjs` reuses `output.mjs` while retaining its App-specific
production and development Rules gates.

## App commands

Configured Apps declare `build:release`, `prepare:firebase-output`,
`deploy:preflight`, `deploy` and, where previously offered, `deploy:hosting` in
their own manifests. Native `build` remains Nuxt's build command. The neutral
starter and prototypes do not acquire deployment targets from this tool.

`build:release` compiles Core config, runs a production Nuxt build with the
App-declared HTTPS origin and the region from its Firebase Hosting/function
target, prepares a portable server manifest, creates a
production lockfile, installs it frozen and verifies the resulting artifact.
The Functions Framework version comes from the App's direct dependency.

Each releasable App must provide `server/firebase.runtime-env.json`:

```json
{
  "projectId": "the-apps-existing-firebase-project",
  "environment": { "REVIEWED_SERVER_SETTING": "value" }
}
```

This file contains only reviewed non-secret server settings. Keep credentials in
Functions secrets declared by the App. Development `.env` is not copied into the
function. Missing runtime configuration is an explicit release gap, even when a
native Nuxt build succeeds.

## Policy and upload

The shared CLI defaults to refusing production upload until an App-owned,
reviewed production policy gate exists. Explicit `--rules-policy development`
selects only that App's existing Ecosystem open-development template. Apps with
a separate data database declare `--rules-databases` in their release commands,
including both their identity database and App database; the Ecosystem template
targets cannot be omitted. Local
preflight validates the template and prepared output. An authorized upload also
reads back each declared live Firestore policy and requires an exact match.
This does not install or change Rules. It does not make open development Rules a
shipping policy. Misebox has its own stricter policy implementation.

Uploads use the exact App project, absolute `firebase.json`, function codebase
and Hosting site from a neutral temporary directory. `deploy:hosting` uploads
Hosting only. App-domain configuration, Firebase Auth authorized domains,
secrets, IAM and backend provisioning remain separate reviewed responsibilities;
old flags for those tasks are not silently reproduced. Post-release route and
content verification remain required; this tool does not certify a live App.

Native Nitro metadata must match the declared Gen 2 function, Node version and
region before preparation or preflight. The artifact seal checks that metadata,
target identity, entry output, manifest, reviewed
environment, lockfile and install policy. Local discovery requires the installed
Functions SDK and Framework and their binaries inside the prepared output.
Prepared output is generated and must not be committed.

## Local verification

From the repository root:

```sh
node --test tools/firebase-release/*.test.mjs
node --test projects/misebox/misebox-app/test/release.test.mjs
```

Tests use disposable artifacts, real H3 forwarded-origin parsing and mocked
upload/Rules requests. They do not deploy or change remote resources. Keep the
all-App manifest check current when adding or retiring an App. Refresh this
README when ownership or command contracts change; dated audit evidence belongs
under `docs/reviews`, not in living context.
