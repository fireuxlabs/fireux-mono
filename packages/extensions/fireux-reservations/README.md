# FireUX Reservations

Property-scoped reservation, availability, and channel-provenance operations
for FireUX hospitality apps.

The package composes with `fireux-properties`. Property remains the Workspace
target and access authority; Reservation is a canonical private child of that
Property. BuenoHost global and tenant apps therefore share stay truth instead
of maintaining per-app reservation copies.

Start with `AGENTS.md`, `docs/ai/gpt-context.md`,
`docs/ai/buenohost-context.md`, and `docs/concepts/workspace.md`.
