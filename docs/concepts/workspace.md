# Workspace

[Workspace](../../packages/extensions/fireux-workspace/README.md) is an optional
package for composing an Entity management experience. Core provides Dashboard
for account, Profiles, App membership and App settings.

The App owns its route and supplies the domain label. Misebox currently composes
a shared greeting at `/workspace`. Domain packages own Entity models, readers,
capabilities, access policy and trusted commands. Shared team and onboarding
utilities continue to serve domain commands independently of the page.

Route grouping does not define data ownership or grant authority. Domain readers
and commands verify the current App, actor and exact target under their own
policies. See [Firestore ownership](firestore-entity.md).
