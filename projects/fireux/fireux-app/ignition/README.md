# Ecosystem Ignition preparation

The FireUX App `/ignite-preview` and Codex `ignition:prepare` use the same
`shared/ignition-preview.ts` preparation function. Input is an Ecosystem `id`,
`name` and reviewed `outcome`. Output includes:

- `packages/ecosystem/fireux-<id>` using Core ecosystem wiring and Firebase binding.
- `projects/<id>/<id>-app` with global role, Core AppShell and shared plan presentation.
- An empty `.env.example` for the business Firebase and Stripe configuration.

```sh
pnpm --filter fireux-platform-app ignition:prepare /path/to/brief.json
pnpm --filter fireux-platform-app ignition:prepare /path/to/brief.json --write
```

The CLI verifies downloaded artifacts, checks both owners before writing, resumes
identical outputs and never overwrites operator development. Failed writes remove
only newly created outputs. Both paths remain inside the repository workspace.
No provider credentials are copied from FireUX.

## Provider setup boundary

Create or select the selling business Firebase project and web App using native
Firebase tooling. Configure its named Firestore database, Authentication and
Storage, then populate the generated environment locally. Use existing credential
management for Admin access; never commit private keys. Install dependencies and
start the App through native Nuxt commands. No deployment command is generated.

Connect the selling business Stripe account through the existing Product/Checkout
owners. Separate Apps sold by the same business may share that account. Independent
businesses must not silently inherit FireUX live credentials. Provider verification,
commercial prices and a signed subscription webhook must be ready before paid
plans are enabled. The Firebase Stripe extension is not a generated dependency.

**Current limits:** source preparation and paired materialization are implemented.
Provider project/account creation, canonical Ecosystem bootstrap and shared paid
subscription-to-entitlement reconciliation are not executed by this command.
Core Initialize App requires an existing canonical Ecosystem. Shared plan display
is not paid billing readiness. This path does not claim arbitrary industry software
creation, operational domain acceptance or a deployed SaaS.

Checks: `app/tests/ignition-preview.test.mjs` and the FireUX App typecheck.
