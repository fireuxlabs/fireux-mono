# Core pages

Core supplies shared [Dashboard routes](dashboard/) and the [sign-in page](auth.vue).
Apps own their product routes. Named components or straightforward inline
markup are valid inside a Nuxt page. Keep the source, access and lifecycle
visible in the route or its actual owner.

## Route availability and sign-in

Core's [auth middleware](../middleware/fireux-auth.global.ts) delegates to
[route auth](../composables/navigation/route-auth.ts), which waits for settled
authentication and discards obsolete decisions. Dashboard keeps its
[sign-out redirect](../composables/fireux/firebase/useAuthRedirect.ts).
[Diagnostics middleware](../middleware/fireux-diagnostics.global.ts) owns
the production restriction for developer diagnostics. Workspace checks family
availability before Core authentication through its own middleware.
Navigation and visibility checks grant no server permission. Trusted commands
and Firestore Rules retain their separate authority.
