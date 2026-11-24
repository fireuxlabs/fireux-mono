# fireux-workspace

Workspace is an optional FireUX package. Misebox composes its
[Workspace page](../../../projects/misebox/misebox-app/app/pages/workspace/index.vue)
with the [shared greeting](src/runtime/workspace/components/Greeting.vue).
The App supplies the family label and owns the route.

Domain commands also use the package's [team operations](src/runtime/workspace/server/team),
[onboarding authority](src/runtime/workspace/server/entity/onboarding-authority.ts)
and [entity creation identity](src/runtime/workspace/server/entity/creation-identity.ts).
These utilities work independently of the greeting and leave authorization with
the trusted domain commands.

See the [Workspace contract](../../../docs/concepts/workspace.md).
