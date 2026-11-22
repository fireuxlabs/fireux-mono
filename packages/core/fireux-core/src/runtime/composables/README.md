# Core composables

Core owns shared read outcomes, neutral Firebase and HTTP transports, command
scope, and common platform lifecycles. Each Entity still owns acquisition scope,
normalization and access for its records. Workspace selection belongs to
[`fireux-workspace`](../../../../../extensions/fireux-workspace/README.md).

## Shared read outcomes

[`ReadOutcome`](../utils/read-outcome.ts) is the common vocabulary.
Preserve idle, pending, error, empty and ready. Confirmed absence becomes
empty. Pending or failed reads remain distinct. Readers own identity,
epoch checks, and masking of stale data before exposing it to a screen.

[VueFire reads](fireux/firestore/operations/useFirestoreRead.ts) preserve
SSR lifecycle placeholders. [Exact-ID bindings](fireux/firestore/operations/firestore-exact-doc-loader.ts)
use the owning Vue App's injection context and dispose with their effect scope.

## Native API read ownership

[`useApiRead`](http/useApiRead.ts) composes native `useAsyncData` for mutable
API projections. Nuxt owns keyed state, hydration, cancellation, and explicit
refresh. [Core server projections](../server/README.md#api-reads-and-refresh)
own authorized invalidation. Readers preserve exact scope, paging and failures.
[`readPages`](http/readPages.ts) follows the requested cursor chain.

Use the existing shared transport for mutable views. Exact document listeners
remain VueFire-owned. A successful command can still explicitly refresh its
read. Keep request identity and stale completions with the owner that initiated
them. Use [Lasagne](../../../../../../docs/concepts/lasagne.md#controllers-and-context)
for domain controller and presentation boundaries.
