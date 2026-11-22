# User

Firebase Auth supplies the signed-in UID. The [User model](models/user.model.ts)
owns canonical person identity. The [private account](models/user-account.model.ts)
and consent retain their own access boundary. Profiles remain User-owned
record types. Domain resources still have their own membership and grant checks.

[`useUserSetup`](composables/account/useUserSetup.ts) establishes identity and
consent. Show creation only after a confirmed missing record. A failed read
needs retry. Client continuations must stay scoped to the initiating account.
Explicit App Join belongs to the [App membership owner](../app/README.md).
