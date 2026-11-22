# App

The [model](models/model.ts) owns App identity, Ecosystem relationship, role,
status, and branding. Public reads project safe fields, and authored literature
lives with its App. [FireuxApp](components/FireuxApp.vue) supplies the shared
Nuxt shell. Core's [App configuration](../../config/app/README.md) explains its
runtime binding.

[Initialization](server/initialization/initialize.ts) requires an existing
Ecosystem, then atomically creates the App and first administrator in the
owning App database. A trusted developer entrypoint can first call the
[Ecosystem provisioner](../ecosystem/server/identity/provision.ts) for the
supported Main App bootstrap. Cross-database locators reconcile separately.
Keep exact relationship validation, retry safety, and developer authority.

[AppUser](records/app-user.ts) is one App-owned membership per App/User pair.
Explicit Join uses the existing [membership commands](server/membership/).
The App-owned document decides role and subscription. User-side locators
support discovery and confer no authorization. Account setup belongs to User.
