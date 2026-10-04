# Optional account connections

This deployment profile targets only `fireux-2005/identity-connections`.
It is separate from every ordinary development database and its open Rules.
No existing User, AppUser, membership, profile or workspace record is migrated.

## Activation

Keep both Apps disabled until the separate database and its live policy have been
reviewed. Provisioning, Rules deployment, runtime secrets and publishing Apps are
separate cloud actions; this source profile does not perform them.

Recommended new target: Enterprise Native edition in `eur3`, colocated with the
current FireUX database. The current `fireux` database is Standard; never point
this service at it. Transactions and document subscriptions are used for atomic
one-use proof and live connection status; analytical pipelines have no role here.

After explicit target/location approval, create `identity-connections` with delete
protection and deploy only this profile's Rules and TTL indexes. Verify the live
Rules deny reads and writes to unauthenticated and authenticated browser clients,
including every nested path. Admin access uses IAM and bypasses Rules; give the
FireUX runtime only the required database access. Review service-account signing
permission for the existing Misebox runtime before testing custom sign-in.

The profile deliberately omits a database location: an ordinary Rules deployment
must not silently create a differently configured database.

Runtime settings (secret values never belong in public config or source):

- Both Apps: `NUXT_ACCOUNT_CONNECTIONS_PEER_SECRET`, the same random secret of
  at least 32 bytes, over the server-to-server HTTPS channel.
- FireUX: `NUXT_ACCOUNT_CONNECTIONS_DATABASE_ID=identity-connections`.
- FireUX: `NUXT_ACCOUNT_CONNECTIONS_ORIGIN` and
  `NUXT_ACCOUNT_CONNECTIONS_MISEBOX_ORIGIN` must be their exact approved origins.
- Misebox: `NUXT_ACCOUNT_CONNECTIONS_ORIGIN` and
  `NUXT_ACCOUNT_CONNECTIONS_HUB_ORIGIN` must be their exact approved origins.
- Misebox: enable `NUXT_PUBLIC_SHARED_SIGN_IN_ENABLED=true` only after the hub is ready.

Defaults use ports 3000/3001 in development and `fireux.app`/`misebox.app` in
production. No arbitrary callback host is accepted. Named-database Auth tenants
are not supported by this first participant; Firebase Auth tenancy is distinct
from FireUX's tenant App role.

## Acceptance

Start with the human's existing FireUX and Misebox accounts. From FireUX Connected ecosystems, connect Misebox, freshly confirm each account, and
finish back in FireUX. Check the shown local account, reload, and verify status
changes in a second tab. From Misebox Auth, use Continue with FireUX; preserve an
internal destination and explicitly accept switching if another account is open.
Disconnect, then verify that a fresh shared sign-in and an unredeemed code fail.
Normal Google/password sign-in and all existing local data must still work.

Disconnection prevents new code exchanges. It does not revoke existing Misebox
sessions or roll back a sign-in already authorized by an exchange. Each ecosystem
retains its own session expiry/revocation, subscription and access checks.
There is no email matching, account creation, profile synchronization, bulk
migration or automatic App join in this protocol.

Controlled protocol, client-scope and participant-handler tests live in FireUX ecosystem
`src/test/connection-protocol.test.mjs` and Misebox App
`test/account-connections.test.mjs`. They do not replace signed-in browser or live
policy verification. Expiry is enforced by the service; TTL is cleanup only.
