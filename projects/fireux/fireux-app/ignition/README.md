# Ecosystem Ignition preparation

The FireUX App `/ignite-preview` and Codex `ignition:prepare` use the same
`shared/ignition-preview.ts` preparation function. Input is an Ecosystem `id`,
`name` and reviewed `outcome`. Output includes:

- `packages/ecosystem/fireux-<id>` using Core ecosystem wiring and Firebase binding.
- `projects/<id>/<id>-app` with global role, Core FireuxApp and shared plan presentation.
- An empty `.env.example` for the business Firebase and Stripe configuration.
- A development-task handoff using the generated App's manifest name and source
  owner. The read-only preview/download prepares this handoff only.

```sh
pnpm --filter fireux-platform-app ignition:prepare /path/to/brief.json
pnpm --filter fireux-platform-app ignition:prepare /path/to/brief.json --write --queue-url http://localhost:3000 --token-file /path/to/admin-token
```

## One delivery queue, two entrances

The FireUX App administrator accepts the existing Ignition Conversation, reviews
its project id/name/purpose, and selects **Queue project build**. Codex submits the
same reviewed input through `ignition:prepare --write`. Both enter the existing
App Conversation queue through the authenticated build command. Public enquiries
and read-only previews never start a desktop task.

Each project id has one canonical `ignition-build-<id>` Conversation. An accepted
web request is linked to that entry and hidden as a forwarded queue row; its
original Conversation and message history remain intact. Contact/access details
remain on that original request; the queue can project them while it remains
available, rather than duplicating them into the build record. Repeating the same
reviewed input reuses the build. Conflicting input or a second project id for the
same accepted request is rejected rather than replacing approved work.

Resume a build already queued by the website with:

```sh
pnpm --filter fireux-platform-app ignition:deliver ignition-build-example --queue-url http://localhost:3000 --token-file /path/to/admin-token
```

The queue URL must be HTTPS or loopback HTTP. The token file contains a current
Firebase ID token for a FireUX App admin; keep it private and outside source.
Credentials are never included in the downloaded brief or process arguments.
Each command reuses the App's current admin authority and fixed Conversation
mutation target; the worker does not write Firestore directly.

The local worker claims the build, materializes both source owners, then creates
one persistent Codex task through `codex app-server proxy`. The task uses the
App package name, reviewed handoff and configured Codex defaults. The initial
turn inspects context and waits for operator direction. A ready build means its
source and task handoff are prepared; it does not mean a launched product.

Build states are `queued`, `preparing`, `task-pending`, `blocked` and `ready`.
The private queue exposes progress and the linked task. A task connection failure
preserves source and reports `task-pending`. Retry the same build from the claiming
worker. A completed task link cannot be replaced or cleared.

Ignored `.cache/ignition-delivery` claims serialize local workers and persist the
claim before any external effect. Server transactions reject another claimant,
including on another machine. Claims do not expire automatically: after losing a
worker/receipt or an uncertain external response, reconcile the actual Codex task
before a separately authorised transfer. There is no blind lease takeover.
The `.cache/ignition-codex` receipt persists the thread ID before naming/handoff
and prevents duplicate task creation. The worker saves completion before posting
it, so a lost queue response can replay the same task link without recreating it.

`--codex-bin /path/to/codex` and `--codex-socket /path/to/control.sock` select a
supported existing connection. The worker never starts or shuts down a daemon.
A missing connection stays pending; persistent-thread acceptance and desktop
project/sidebar visibility need separate live verification. See the
[supported protocol](https://learn.chatgpt.com/docs/app-server).

The CLI verifies downloaded artifacts, checks both owners before writing, resumes
identical outputs and never overwrites operator development. Failed writes remove
only newly created outputs. Both paths remain inside the repository workspace.
No provider credentials are copied from FireUX.

Artwork starts as a copy of the starter's exports. Replace it with the App's
approved [eight-file asset family](../../../../docs/assets.md), review `/assets`,
then run `pnpm check:assets projects/<id>/<id>-app` from the repository root.
Passing the file check does not approve the brand or its visual contrast.

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
When the configured generated main App is initialized, Core owns its guarded
canonical Ecosystem bootstrap. Shared plan display
is not paid billing readiness. This path does not claim arbitrary industry software
creation, operational domain acceptance or a deployed SaaS.

Checks: `app/tests/ignition-preview.test.mjs`, `app/tests/ignition/delivery.test.mjs`, `tools/ide/codex-task.test.mjs`, and the FireUX App typecheck. Local fixtures do not establish live database/desktop integration.
