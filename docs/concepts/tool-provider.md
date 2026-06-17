Tool provider map
Updated: 2026-06-17
Ref: 37fb262f0
Role: map, not canon

Purpose:
Map provider/consumer boundaries for Go QR and future tool providers.

Vertical links:
- Parent: server-api.md
- Child: family-menu.md

Horizontal links:
- app-config.md
- family-tenant-global.md

Provider principle:
- A provider owns the reusable tool behavior.
- A consumer owns its consumer data.
- A provider may store data only when it uses its own tool as a consumer.

Go QR example:
- Go QR provides upload/QR tooling.
- Misebox or a tenant app stores menu upload meaning when consuming the tool.
- Dogfood use inside Go QR can store Go QR-owned examples.

Consumer integration:
- Consumers should pass a clear payload/config.
- Consumers should not import provider internals.
- Provider preview URLs and consumer final URLs are different concepts.

Open questions:
- Tool configuration should stay compact and avoid many prop-by-prop component calls.
