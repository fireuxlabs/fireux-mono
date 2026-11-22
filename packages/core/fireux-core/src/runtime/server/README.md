# Core server runtime

Native HTTP entrypoints live under [`api/`](api/). Core owns neutral HTTP,
Firebase Admin and live-read helpers, the
[default App manifest](manifest.webmanifest.get.ts), and the endpoint adapters
for App, User, and Ecosystem commands. Entity commands live in their own
server trees. Follow the [shared API contract](../../../../../../docs/concepts/server-api.md)
for exact authority and response boundaries.

## API reads and refresh

[`defineLiveProjection`](utils/live-projection.ts) accepts an authorized
domain DTO reader. Its exact native document/query sources include the
authority facts that can revoke access. Source validation or budget failure
rejects the response. Its domain owner chooses the database and the allowlist.

The bounded [live feed](utils/live-projection-feed.ts) rechecks ordinary
same-origin route authorization and sends invalidations rather than record
payloads. No bearer token or raw document enters the stream URL or events.
[Source listeners](utils/live-projection-sources.ts) wait for initial readiness,
reconcile changed dependencies, and release when the last subscriber leaves.
After an authority denial, protected data listeners stop. The client uses
[`useApiRead`](../composables/README.md#native-api-read-ownership) and the JSON
route for data and keeps native explicit refresh. Verify scope changes,
revocation, listener cleanup, and read budgets in the real consumer.

[Firebase configuration](../../config/app/README.md#firebase) owns named
routing and emulator setup. Domain commands derive the actor and exact target
independently of client Rules.
