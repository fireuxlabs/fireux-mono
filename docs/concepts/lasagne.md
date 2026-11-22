# Lasagne architecture

Updated: 2026-11-22
Ref: 0d8d59ce8
Role: map, not canon

Compose a page so its named children explain the work. Dependencies point
downward. Core supplies neutral mechanisms, domains own their facts and
commands, and Apps compose what their product needs. A lower owner stays
independent of its consumers.

## Controllers and context

Give each stateful workflow one owner for acquisition, scope, and disposal.
Use props and events for focused presentation. Use a bounded domain context
when several children share the same workflow and relaying values hides its
lifetime. Mount it once per actual host. Sibling routes can mount separate
hosts, and missing context never creates a second reader.

A reader or command exposes what its actual consumer uses. Keep view
derivations and local actions near the screen that owns them. Clear stale
results at scope changes. Authority remains with the domain's trusted
command and access checks.

### Local component namespaces

A component group may statically re-export nearby Vue children from its local
`index.ts`. The parent imports the namespace and visibly names its children.
See [Kitchen Menu](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Index.vue)
and [FireUX Framework](../../projects/fireux/fireux-app/app/components/Framework/Home.vue).

A useful single-use child or explicitly imported private presentation
composable can earn its own file. Shared library admission is a separate
decision. Keep local re-exports out of global discovery.

## Structural shells

Use native Nuxt entrypoints and Nuxt UI controls. A page can render one named
component, several, or straightforward inline markup. A shared frame or custom
slot needs a real shared structural responsibility and known consumers. Domain
content, state, and actions retain their owners. See
[layout admission](../../packages/core/fireux-core/src/runtime/layouts/README.md#layout-admission).

Repeat small domain-specific compositions deliberately while the differences
matter. Share lower, proven mechanics early. Extract a common contract only
when actual consumers share the same responsibility. Verify the result in
the actual consuming route and mode. See the [spine](spine.md) for family growth.
