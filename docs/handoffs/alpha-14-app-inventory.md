# FireUX App configuration inventory — Alpha 14

Audit of the tracked tree at `80dd76dba70cbd85c55817d5df03036dd9330ec2`. Read [Alpha 14](alpha-14.md) for shared wiring, execution rules, ownership, buildability and migration order. File paths listed per entry are relative to that entry except the explicitly prefixed group paths. Historical metadata keys shown are source declarations. Their live values and any present-day production divergence were outside the audit.

### projects/bringli/bringli-app — legacy principal App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/bringli/.firebaserc`.
- **Firebase deploy configuration** hosting `site=bringli, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=bringli-ssr`.
- **Assembly** `defineFireuxEcosystem`. Imports `fireux-ecosystem/config`. Explicit modules `'fireux-places'`, `'fireux-businesses'`. Explicit layers `'fireux-core/layer'`, `'fireux-bringli/supplier-layer'`, `'fireux-places/layer'`, `'fireux-businesses/layer'`.
- **Identity and legacy settings** `id: 'bringli-app'`, `role: 'global'`, `ecosystem: 'bringli'`, `ecosystemId: 'bringli'`, `projectId: 'bringli'`. Implicit Ecosystem module `fireux-bringli`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `domains: ['suppliers']`, `subscriptionCapacity: { supplier: { free: 1, pro: 1, business: null }, 'supplier.team': { free: 3, pro: 7, business: null }, }`, `homePath: '/home'`, `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`, `fireux-suppliers/runtime/supplier/models/capabilities`, `./content/meta/source`.
- **App manifest FireUX packages** `fireux-bringli`, `fireux-businesses`, `fireux-core`, `fireux-workspace`, `fireux-ecosystem`, `fireux-places`, `fireux-suppliers`, `fireux-app`.
- **Direct retired Core literal references** `fireux-core/runtime/app/components/ErrorPage`, `fireux-core/runtime/app/literature/define-meta`, `fireux-core/runtime/composables/fireux/seo/useSeo`.
- **Migration priority and preservation** Supplier storefront, places/businesses, partner team and tier policy. Build status: common legacy blocker, not built in this audit.

### projects/buenohost/ausfinn-apartments — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`.
- **Firebase deploy configuration** hosting `site=ausfinn-apartments, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=ausfinn-apartments-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules none declared. Explicit layers `'fireux-core/layer'`, `'fireux-buenohost/property-layer'`.
- **Identity and legacy settings** `id: 'ausfinn-apartments'`, `role: 'tenant'`, `ecosystem: 'buenohost'`, `ecosystemId: 'buenohost'`, `projectId: 'fireux'`. Implicit Ecosystem module `fireux-buenohost`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `domains: ['properties']`, `workspaceConfig: { property: { canCreate: false, }, }`, `subscriptionCapacity: { property: { free: 1, pro: 1, business: null }, 'property.team': { free: 3, pro: 7, business: null }, }`, `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports `#imports`; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-workspace`, `fireux-buenohost`, `fireux-properties`, `fireux-reservations`.
- **Direct retired Core literal references** `fireux-core/runtime/app/literature/define-meta`.
- **Migration priority and preservation** Guest routes, Property/Reservation composition and property creation disabled. Build status: common legacy blocker, not built in this audit.

### projects/buenohost/book-with-nats — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`.
- **Firebase deploy configuration** hosting `site=book-with-nats-buenohost, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=book-with-nats-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules none declared. Explicit layers `'fireux-core/layer'`, `'fireux-buenohost/property-layer'`.
- **Identity and legacy settings** `id: 'book-with-nats'`, `role: 'tenant'`, `ecosystem: 'buenohost'`, `ecosystemId: 'buenohost'`, `projectId: 'fireux'`. Implicit Ecosystem module `fireux-buenohost`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `domains: ['properties']`, `workspaceConfig: { property: { canCreate: false, }, }`, `subscriptionCapacity: { property: { free: 1, pro: 1, business: null }, 'property.team': { free: 3, pro: 7, business: null }, }`, `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports `#imports`; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-workspace`, `fireux-buenohost`, `fireux-properties`, `fireux-reservations`.
- **Direct retired Core literal references** `fireux-core/runtime/app/literature/define-meta`.
- **Migration priority and preservation** Guest routes, reservation boundaries and property creation disabled. Build status: common legacy blocker, not built in this audit.

### projects/buenohost/buenohost-app — legacy principal App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`.
- **Firebase deploy configuration** hosting `site=buenohost-app, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=buenohost-ssr`.
- **Assembly** `defineFireuxEcosystem`. Imports `fireux-ecosystem/config`. Explicit modules none declared. Explicit layers `'fireux-core/layer'`, `'fireux-buenohost/property-layer'`.
- **Identity and legacy settings** `id: 'buenohost'`, `role: 'global'`, `ecosystem: 'buenohost'`, `ecosystemId: 'buenohost'`, `projectId: 'fireux'`. Implicit Ecosystem module `fireux-buenohost`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `domains: ['properties']`, `subscriptionCapacity: { property: { free: 1, pro: 1, business: null }, 'property.team': { free: 3, pro: 7, business: null }, }`, `homePath: '/home'`, `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports `#imports`; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`, `fireux-properties/runtime/property/models/capabilities`.
- **App manifest FireUX packages** `fireux-core`, `fireux-workspace`, `fireux-ai`, `fireux-buenohost`, `fireux-ecosystem`, `fireux-properties`, `fireux-reservations`, `fireux-app`.
- **Direct retired Core literal references** `fireux-core/runtime/app/literature/define-meta`, `fireux-core/runtime/composables/fireux/seo/useSeo`.
- **Migration priority and preservation** Shared Property/Reservation composition and subscription limits. Build status: common legacy blocker, not built in this audit.

### projects/fireux/find-my-seo-app — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/fireux/.firebaserc`.
- **Firebase deploy configuration** hosting `site=find-my-seo, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=find-my-seo-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules `'fireux-jobs'`. Explicit layers `'fireux-core/layer'`, `'fireux-jobs/layer'`.
- **Identity and legacy settings** `id: 'find-my-seo-app'`, `role: 'standalone'`, `ecosystem: 'fireux'`, `ecosystemId: 'fireux'`, `projectId: 'fireux'`, `databaseId: 'find-my-seo'`. Implicit Ecosystem module `fireux-fireux`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `domains: ['professionals']`, `profiles: ['professional']`.
- **Adjacent config imports** `app/app.config.ts` imports `#imports`; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-fireux`, `fireux-jobs`.
- **Direct retired Core literal references** `fireux-core/runtime/app/components/ErrorPage`, `fireux-core/runtime/app/literature/define-meta`.
- **Migration priority and preservation** Jobs/Professional capability, profile registration and named database. Build status: common legacy blocker, not built in this audit.

### projects/fireux/fireux-app — legacy principal App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `identity-connections/firebase.json`, `identity-connections/firestore.indexes.json`, `identity-connections/firestore.rules`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/fireux/.firebaserc`.
- **Firebase deploy configuration** hosting `site=fireux, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=fireux-ssr`.
- **Assembly** `defineFireuxEcosystem`. Imports `fireux-ecosystem/config`. Explicit modules `[ 'fireux-products', { productKinds: [ 'saas_app', 'industry_app', 'white_label_app', 'ecosystem_white_label', 'template', 'modules_pass', 'service', ], }, ]`. Explicit layers `'fireux-docs/layer'`, `'fireux-fireux/project-layer'`.
- **Identity and legacy settings** `id: 'fireux-app'`, `role: 'global'`, `ecosystem: 'fireux'`, `ecosystemId: 'fireux'`, `projectId: 'fireux'`. Implicit Ecosystem module `fireux-fireux`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `subscriptionCapacity: { project: { free: 1, pro: 1, business: null }, 'project.team': { free: 3, pro: 7, business: null }, }`, `homePath: '/'`, `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`, `./content/meta/source`, `./content/meta/solutions`.
- **App manifest FireUX packages** `fireux-ai`, `fireux-blogs`, `fireux-core`, `fireux-workspace`, `fireux-docs`, `fireux-ecosystem`, `fireux-fireux`, `fireux-ignite`, `fireux-products`, `fireux-projects`, `fireux-app`.
- **Direct retired Core literal references** `fireux-core/runtime/composables/fireux/seo/useSeo`, `fireux-core/runtime/ecosystem/composables/useEcosystemDetail`, `fireux-core/runtime/user/composables/session/useUserSession`, `fireux-core/runtime/composables/fireux/commands/useCommandScope`, `fireux-core/runtime/composables/fireux/firebase/useAuth`, `fireux-core/runtime/app/composables/config/FireUXConfig`, `fireux-core/runtime/composables/ui/useToastify`, `fireux-core/runtime/app/composables/featured/useAppFeaturedContent`, `fireux-core/runtime/ecosystem/models/ecosystem.model`, `fireux-core/runtime/ecosystem/composables/useEcosystemApps`, `fireux-core/runtime/utils/read-outcome`, `fireux-core/runtime/composables/navigation/useNav`, `fireux-core/runtime/composables/shared/useCollectionPage`, `fireux-core/runtime/app/composables/useAppCollectionPage`, `fireux-core/runtime/ecosystem/models/ecosystem-directory`, `fireux-core/runtime/app/literature/types`, `fireux-core/runtime/app/components/ErrorPage`, `fireux-core/runtime/app/literature/define-meta`, `fireux-core/runtime/app/components/Detail/Page.vue`, `fireux-core/runtime/composables/shared/useRouteParam`, `fireux-core/runtime/app/components/Packages.vue`, `fireux-core`, `fireux-core/runtime/server/utils/firestore-mutations/server-transaction`, `fireux-core/runtime/app/server/mutation-targets`, `fireux-core/runtime/user/server/mutation-targets`, `fireux-core/runtime/server/utils/getRuntimeFirestore`, `fireux-core/runtime/app/server/chat/storage`, `fireux-core/runtime/server/utils/ids/path`, `fireux-core/runtime/server/utils/live-projection`, `fireux-core/runtime/types/directory`, `fireux-core/runtime/server/utils/seo-sitemaps`, `fireux-core/runtime/ecosystem/server/directory/projection`, `fireux-core/runtime/ecosystem/server/identity/read`, `fireux-core/runtime/server/utils/getAdmin`, `fireux-core/runtime/server/utils/auth/bearer`, `fireux-core/config/module/ecosystem-wiring`, `fireux-core/types/ecosystem`.
- **Migration priority and preservation** Directory, Docs, Ignite, Projects, Products and separate identity connections. Build status: common legacy blocker, not built in this audit.

### projects/fireux/fireux-blank — verified native reference
- **Files** `env.defaults`, `nuxt.config.ts`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`, plus group `projects/fireux/.firebaserc`.
- **Assembly** `defineNuxtConfig`. Imports none. Explicit modules `'@nuxt/ui'`. Explicit layers `'fireux-core/layer'`.
- **Identity** `fireux-blank; private fireux scope`. The App-local defaults supply environment values, including Misebox-only Web Auth. No builder metadata.
- **App manifest FireUX packages** `fireux-core`.
- **Migration** Keep as baseline. Type check, production build and disposable emulator smoke passed; see the verified installation distinction above.

### projects/fireux/go-qr — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/fireux/.firebaserc`.
- **Firebase deploy configuration** hosting `site=go-qr, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=go-qr-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules `'fireux-go-qr'`. Explicit layers none declared.
- **Identity and legacy settings** `id: 'go-qr'`, `role: 'standalone'`, `ecosystem: 'fireux'`, `ecosystemId: 'fireux'`, `projectId: 'fireux'`, `databaseId: 'go-qr'`. Implicit Ecosystem module `fireux-fireux`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports `#imports`; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`, `fireux-core/runtime/app/literature/types`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-fireux`, `fireux-go-qr`.
- **Direct retired Core literal references** `fireux-core/runtime/composables/fireux/tool-provider/useToolProviderTool`, `fireux-core/runtime/app/literature/define-meta`, `fireux-core/runtime/app/literature/types`, `fireux-core/runtime/composables/shared/useRouteParam`, `fireux-core/runtime/composables/fireux/tool-provider/useToolProviderHeight`, `fireux-core/runtime/server/utils/tool-provider`, `fireux-core/runtime/server/utils/slug/checkPublicSlugAvailability`, `fireux-core/runtime/server/utils/uploads/multipart`, `fireux-core/runtime/server/utils/uploads/storage`, `fireux-core/runtime/server/utils/records/stamps`, `fireux-core/runtime/server/utils/getRuntimeFirestore`, `fireux-core/runtime/utils/slug/normalize-slug`, `fireux-core/runtime/utils/slug/validate-public-slug`, `fireux-core/runtime/types/tool-provider.types`.
- **Migration priority and preservation** Embeds, public slugs, uploads, QR and tool-provider boundaries. Build status: common legacy blocker, not built in this audit.

### projects/fireux/holzworm — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/fireux/.firebaserc`.
- **Firebase deploy configuration** hosting `site=holzworm-fireux-2005, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=holzworm-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules none declared. Explicit layers none declared.
- **Identity and legacy settings** `id: 'holzworm'`, `role: 'standalone'`, `ecosystem: 'fireux'`, `ecosystemId: 'fireux'`, `projectId: 'fireux'`, `databaseId: 'holzworm'`. Implicit Ecosystem module `fireux-fireux`. Builder metadata `name`, `shortName`, `context`, `role`.
- **Adjacent config imports** `app/app.config.ts` imports `#imports`; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-fireux`.
- **Direct retired Core literal references** `fireux-core/runtime/app/components/ErrorPage`, `fireux-core/runtime/app/literature/define-meta`.
- **Migration priority and preservation** Catalogue, landing layout and enquiries. Replace the retired root/error and literature dependencies in the pilot. Build status: common legacy blocker, not built in this audit.

### projects/fireux/ignition-menu-demo — demo
- **Files** `app/meta.ts`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/fireux/.firebaserc`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules `'fireux-kitchens'`. Explicit layers `'fireux-fireux/layer'`, `'fireux-kitchens/layer'`.
- **Identity and legacy settings** `id: 'ignition-menu-demo'`, `role: 'tenant'`, `ecosystem: 'fireux'`, `ecosystemId: 'fireux'`, `projectId: 'fireux'`. Implicit Ecosystem module `fireux-fireux`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `seo` declared.
- **Adjacent config imports** `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-fireux`, `fireux-kitchens`, `fireux-ignite`.
- **Direct retired Core literal references** `fireux-core/runtime/app/literature/define-meta`, `fireux-core/runtime/composables/fireux/seo/useSeo`.
- **Migration priority and preservation** Kitchens preview/menu behavior and publication policy if demo is retained. Build status: common legacy blocker, not built in this audit.

### projects/fireux/lifeguard-community — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/fireux/.firebaserc`.
- **Firebase deploy configuration** hosting `site=lifeguard-community-fireux-2005, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=lifeguard-community-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules none declared. Explicit layers none declared.
- **Identity and legacy settings** `id: 'lifeguard-community'`, `role: 'standalone'`, `ecosystem: 'fireux'`, `ecosystemId: 'fireux'`, `projectId: 'fireux'`, `databaseId: 'lifeguard-community'`. Implicit Ecosystem module `fireux-fireux`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports `#imports`; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-fireux`.
- **Direct retired Core literal references** `fireux-core/runtime/app/components/ErrorPage`, `fireux-core/runtime/composables/fireux/firebase/useAuth`, `fireux-core/runtime/app/literature/define-meta`, `fireux-core/runtime/composables/fireux/firebase/useAuthRedirect`.
- **Migration priority and preservation** Explicit Auth, redirect and session flows. Build status: common legacy blocker, not built in this audit.

### projects/fireux/no-fireux-embed-test — static harness
- **Files** `firebase.json`, plus group `projects/fireux/.firebaserc`.
- **Firebase deploy configuration** hosting `site=no-fireux-embed-test, public=public`.
- **Migration** Retain the static Hosting fixture for embed regression. No Nuxt build to run.

### projects/fireux/sproochli — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/fireux/.firebaserc`.
- **Firebase deploy configuration** hosting `site=sproochli, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=sproochli-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules `'fireux-sproochli'`. Explicit layers none declared.
- **Identity and legacy settings** `id: 'sproochli'`, `role: 'standalone'`, `ecosystem: 'fireux'`, `ecosystemId: 'fireux'`, `projectId: 'fireux'`, `databaseId: 'sproochli'`. Implicit Ecosystem module `fireux-fireux`. Builder metadata `name`, `shortName`, `context`, `role`.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-ai`, `fireux-app`, `fireux-core`, `fireux-fireux`, `fireux-sproochli`.
- **Direct retired Core literal references** `fireux-core/runtime/app/literature/define-meta`, `fireux-core/runtime/composables/fireux/tool-provider/useToolProviderHeight`, `fireux-core/runtime/server/utils/getRuntimeFirestore`, `fireux-core/runtime/server/utils/auth/bearer`, `fireux-core/runtime/server/utils/auth/service-account-oidc`, `fireux-core/runtime/server/utils/tool-provider`, `fireux-core/runtime/types/tool-provider.types`.
- **Migration priority and preservation** Translation, share/embed and bearer/OIDC trust. Build status: common legacy blocker, not built in this audit.

### projects/fireux/tenant — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/fireux/.firebaserc`.
- **Firebase deploy configuration** hosting `site=metalbar, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=fireux-tenant-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules none declared. Explicit layers none declared.
- **Identity and legacy settings** `id: 'fireux-tenant'`, `role: 'tenant'`, `ecosystem: 'fireux'`, `ecosystemId: 'fireux'`, `projectId: 'fireux'`. Implicit Ecosystem module `fireux-fireux`. Builder metadata `name`, `shortName`, `contactEmail`, `context`, `role`.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-fireux`.
- **Direct retired Core literal references** `fireux-core/runtime/app/components/ErrorPage`, `fireux-core/runtime/app/literature/define-meta`.
- **Migration priority and preservation** Business page and contact routing, with the stable fireux-tenant ID. Build status: common legacy blocker, not built in this audit.

### projects/granite/granite-app — legacy principal App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/granite/.firebaserc`.
- **Firebase deploy configuration** hosting `site=granite-os, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=granite-ssr`.
- **Assembly** `defineFireuxEcosystem`. Imports `fireux-ecosystem/config`. Explicit modules none declared. Explicit layers `'fireux-core/layer'`, `'fireux-granite/portfolio-layer'`.
- **Identity and legacy settings** `id: 'granite-app'`, `role: 'global'`, `ecosystem: 'granite'`, `ecosystemId: 'granite'`, `projectId: 'granite'`. Implicit Ecosystem module `fireux-granite`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `domains: ['properties', 'portfolios']`, `subscriptionCapacity: { portfolio: { free: 1, pro: 1, business: null }, 'portfolio.team': { free: 3, pro: 7, business: null }, }`, `homePath: '/home'`, `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`, `fireux-properties/runtime/portfolio/models/capabilities`, `./content/meta/source`.
- **App manifest FireUX packages** `fireux-core`, `fireux-workspace`, `fireux-ai`, `fireux-ecosystem`, `fireux-granite`, `fireux-properties`, `fireux-compliance`, `fireux-documents`, `fireux-tasks`, `fireux-app`.
- **Direct retired Core literal references** `fireux-core/runtime/app/components/ErrorPage`, `fireux-core/runtime/app/literature/define-meta`, `fireux-core/runtime/composables/fireux/seo/useSeo`.
- **Migration priority and preservation** Portfolio, Property, Compliance, Documents, Tasks, and team/entitlement policy. Build status: common legacy blocker, not built in this audit.

### projects/misebox/baeren-ringgenberg — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/misebox/.firebaserc`.
- **Firebase deploy configuration** hosting `site=baeren-ringgenberg, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=baeren-ringgenberg-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules `[ 'fireux-kitchens', { ordering: { channels: ['pos', 'kiosk', 'website'] } }, ]`, `'fireux-places'`, `'fireux-businesses'`, `'fireux-go-qr'`, `'fireux-sproochli'`, `[ 'fireux-jobs', { categories: ['hospitality'], }, ]`. Explicit layers `'fireux-misebox/kitchen-layer'`, `'fireux-core/layer'`, `'fireux-places/layer'`, `'fireux-businesses/layer'`, `'fireux-jobs/layer'`.
- **Identity and legacy settings** `id: 'baeren-ringgenberg'`, `role: 'tenant'`, `ecosystem: 'misebox'`, `ecosystemId: 'misebox'`, `projectId: 'misebox'`. Implicit Ecosystem module `fireux-misebox`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `domains: ['jobs']`, `profiles: ['agent', 'professional']`, `workspaceConfig: { kitchen: { canCreate: false, }, }`, `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-businesses`, `fireux-core`, `fireux-workspace`, `fireux-go-qr`, `fireux-jobs`, `fireux-kitchens`, `fireux-misebox`, `fireux-places`, `fireux-sproochli`.
- **Direct retired Core literal references** `fireux-core/runtime/app/components/ErrorPage`, `fireux-core/runtime/app/literature/define-meta`.
- **Migration priority and preservation** Kitchen, ordering channel policy, Jobs categories/profiles and kitchen creation disabled. Build status: common legacy blocker, not built in this audit.

### projects/misebox/bangin-coffee — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/misebox/.firebaserc`.
- **Firebase deploy configuration** hosting `site=bangin-coffee, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=bangin-coffee-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules `'fireux-go-qr'`. Explicit layers none declared.
- **Identity and legacy settings** `id: 'bangin-coffee'`, `role: 'tenant'`, `ecosystem: 'misebox'`, `ecosystemId: 'misebox'`, `projectId: 'misebox'`. Implicit Ecosystem module `fireux-misebox`. Builder metadata `name`, `shortName`, `context`, `role`.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-go-qr`, `fireux-misebox`.
- **Direct retired Core literal references** `fireux-core/runtime/app/literature/define-meta`.
- **Migration priority and preservation** Venue content and explicit Go QR capability. Build status: common legacy blocker, not built in this audit.

### projects/misebox/friiites — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/misebox/.firebaserc`.
- **Firebase deploy configuration** hosting `site=friiites, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=friiites-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules `'fireux-places'`, `'fireux-go-qr'`, `'fireux-sproochli'`. Explicit layers `'fireux-misebox/kitchen-layer'`, `'fireux-core/layer'`, `'fireux-places/layer'`.
- **Identity and legacy settings** `id: 'friiites'`, `role: 'tenant'`, `ecosystem: 'misebox'`, `ecosystemId: 'misebox'`, `projectId: 'misebox'`. Implicit Ecosystem module `fireux-misebox`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `workspaceConfig: { kitchen: { canCreate: false, }, }`, `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-workspace`, `fireux-go-qr`, `fireux-kitchens`, `fireux-misebox`, `fireux-places`, `fireux-sproochli`.
- **Direct retired Core literal references** `fireux-core/runtime/app/literature/define-meta`, `fireux-core/runtime/server/utils/getRuntimeFirestore`.
- **Migration priority and preservation** Restaurant content, Kitchen/Places/QR/translation and the kitchen creation restriction. Build status: common legacy blocker, not built in this audit.

### projects/misebox/interlaken-essen — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/misebox/.firebaserc`.
- **Firebase deploy configuration** hosting `site=interlaken-essen, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=interlaken-essen-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules `[ 'fireux-blogs', { languages: ['gsw', 'de', 'en'], defaultLanguage: 'gsw', selectionCookie: 'interlaken-essen.sproochli', queryParameter: 'sproochli', }, ]`, `'fireux-sproochli'`, `'fireux-marketplace'`, `['fireux-suppliers', { mode: 'consumer' }]`, `'fireux-places'`, `'fireux-businesses'`, `[ 'fireux-jobs', { categories: ['hospitality'], }, ]`. Explicit layers `'fireux-core/layer'`, `'fireux-places/layer'`, `'fireux-businesses/layer'`, `'fireux-jobs/layer'`.
- **Identity and legacy settings** `id: 'interlaken-essen'`, `role: 'tenant'`, `ecosystem: 'misebox'`, `ecosystemId: 'misebox'`, `projectId: 'misebox'`. Implicit Ecosystem module `fireux-misebox`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `domains: ['jobs']`, `profiles: ['agent', 'professional']`, `subscriptionCapacity: { 'marketplace-store.team': { free: 3, pro: 7, business: null }, }`, `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`, `./content/sproochli-copy-public.ts`.
- **App manifest FireUX packages** `fireux-app`, `fireux-blogs`, `fireux-businesses`, `fireux-core`, `fireux-jobs`, `fireux-marketplace`, `fireux-misebox`, `fireux-places`, `fireux-sproochli`, `fireux-suppliers`.
- **Direct retired Core literal references** `fireux-core/runtime/composables/fireux/firebase/useAuth`, `fireux-core/runtime/composables/fireux/firebase/useAuthPhase`, `fireux-core/runtime/composables/media/useAvatarProxy`, `fireux-core/runtime/user/composables/session/useUserSession`, `fireux-core/runtime/composables/shared/useRouteParam`, `fireux-core/runtime/app/literature/define-meta`, `fireux-core/runtime/composables/fireux/seo/useSeo`, `fireux-core/runtime/server/utils/auth/bearer`, `fireux-core/runtime/server/utils/getRuntimeFirestore`, `fireux-core/runtime/server/utils/records/stamps`.
- **Migration priority and preservation** Localized Blogs, Marketplace, supplier consumer mode, Jobs gating and team policy. Build status: common legacy blocker, not built in this audit.

### projects/misebox/la-tap-berne — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/misebox/.firebaserc`.
- **Firebase deploy configuration** hosting `site=tapberne, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=la-tap-berne-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules `'fireux-places'`, `'fireux-go-qr'`. Explicit layers `'fireux-misebox/kitchen-layer'`, `'fireux-core/layer'`, `'fireux-places/layer'`.
- **Identity and legacy settings** `id: 'la-tap-berne'`, `role: 'tenant'`, `ecosystem: 'misebox'`, `ecosystemId: 'misebox'`, `projectId: 'misebox'`. Implicit Ecosystem module `fireux-misebox`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `workspaceConfig: { kitchen: { canCreate: false, }, }`, `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-workspace`, `fireux-go-qr`, `fireux-kitchens`, `fireux-misebox`, `fireux-places`.
- **Direct retired Core literal references** `fireux-core/runtime/app/components/ErrorPage`, `fireux-core/runtime/app/literature/define-meta`.
- **Migration priority and preservation** Menu/Kitchen, Places/QR and kitchen creation disabled. Build status: common legacy blocker, not built in this audit.

### projects/misebox/misebox-app — verified native reference
- **Files** `env.defaults`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, plus group `projects/misebox/.firebaserc`.
- **Assembly** `defineNuxtConfig`. Imports none. Explicit modules `'@nuxt/ui'`. Explicit layers `'fireux-core/layer'`.
- **Identity** `misebox-app; private misebox scope`. The App-local defaults supply environment values, including Misebox-only Web Auth. No builder metadata.
- **App manifest FireUX packages** `fireux-core`.
- **Migration** Keep as baseline. Type check, production build and disposable emulator smoke passed; see the verified installation distinction above.

### projects/sharer/kjordi — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`.
- **Firebase deploy configuration** hosting `site=kjordi, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=kjordi-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules `'fireux-go-qr'`. Explicit layers `'fireux-core/layer'`, `'fireux-sharer/layer'`.
- **Identity and legacy settings** `id: 'kjordi'`, `role: 'tenant'`, `ecosystem: 'sharer'`, `ecosystemId: 'sharer'`, `projectId: 'sharer-ecosystem'`. Implicit Ecosystem module `fireux-sharer`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `authEnabled: true`, `firebaseSecrets: ['NUXT_SHARER_YOUTUBE_API_KEY']`.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-go-qr`, `fireux-sharer`.
- **Direct retired Core literal references** `fireux-core/runtime/app/components/ErrorPage`, `fireux-core/runtime/app/literature/define-meta`.
- **Migration priority and preservation** Recipient-facing profile, QR, Auth and app-specific deployment secrets declaration. Build status: common legacy blocker, not built in this audit.

### projects/sharer/sharer-app — legacy principal App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`.
- **Firebase deploy configuration** hosting `site=sharify, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=sharer-ssr`.
- **Assembly** `defineFireuxEcosystem`. Imports `fireux-ecosystem/config`. Explicit modules none declared. Explicit layers `'fireux-core/layer'`, `'fireux-sharer/layer'`.
- **Identity and legacy settings** `id: 'sharer-app'`, `role: 'global'`, `ecosystem: 'sharer'`, `ecosystemId: 'sharer'`, `projectId: 'sharer-ecosystem'`. Implicit Ecosystem module `fireux-sharer`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `authEnabled: true`.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-core`, `fireux-ecosystem`, `fireux-sharer`.
- **Direct retired Core literal references** `fireux-core/runtime/app/components/ErrorPage`, `fireux-core/runtime/app/literature/define-meta`.
- **Migration priority and preservation** Shared profile/link presentation and explicit Auth. Build status: common legacy blocker, not built in this audit.

### projects/slap/interlaken-bike-tours — prototype
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`.
- **Firebase deploy configuration** hosting `site=interlaken-bike-tours-prototype, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=interlaken-bike-tours-ssr`.
- **Assembly** `defineFireuxApp`, `defineNuxtConfig`. Imports `nuxt/config`, `@nuxt/schema`, `@nuxt/icon`, `@nuxt/ui`, `fireux-app/config`. Explicit modules `'fireux-businesses'`, `['fireux-bookings', { businessWorkspace: true }]`. Explicit layers `'fireux-core/layer'`, `'fireux-slap/layer'`, `'fireux-businesses/layer'`, `'fireux-bookings/layer'`.
- **Identity and legacy settings** `id: 'interlaken-bike-tours'`, `role: 'tenant'`, `ecosystem: 'slap'`, `ecosystemId: 'slap'`, `projectId: 'slap'`. Implicit Ecosystem module `fireux-slap`. Builder metadata `name`, `shortName`, `contactEmail`, `context`, `role`. Feature/route/deployment declarations `workspaceConfig: { business: { canCreate: true } }`, `subscriptionCapacity: { business: { free: 1, pro: 1, business: null }, 'business.team': { free: 1, pro: 5, business: 50 }, }`, `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-workspace`, `fireux-slap`, `fireux-bookings`, `fireux-businesses`, `fireux-notifications`.
- **Direct retired Core literal references** `fireux-core/runtime/app/literature/define-meta`, `fireux-core/runtime/composables/fireux/seo/useSeo`, `fireux-core/runtime/composables/shared/useRouteParam`, `fireux-core/runtime/server/utils/ids/path`.
- **Adapter** The local native call receives the spread historical result plus UI fonts, bundled icons and head links.
- **Migration priority and preservation** Prototype booking, business workspace, notifications, noindex and native UI/icon/head overrides. Build status: common legacy blocker, not built in this audit.

### projects/slap/slap-app — legacy principal App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`.
- **Firebase deploy configuration** hosting `site=slapme, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=slap-ssr`.
- **Assembly** `defineFireuxEcosystem`. Imports `fireux-ecosystem/config`. Explicit modules none declared. Explicit layers `'fireux-core/layer'`, `'fireux-slap/layer'`.
- **Identity and legacy settings** `id: 'slap-app'`, `role: 'global'`, `ecosystem: 'slap'`, `ecosystemId: 'slap'`, `projectId: 'slap'`. Implicit Ecosystem module `fireux-slap`. Builder metadata `name`, `shortName`, `context`, `role`.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-core`, `fireux-ecosystem`, `fireux-slap`, `fireux-app`.
- **Direct retired Core literal references** `fireux-core/runtime/app/literature/define-meta`.
- **Migration priority and preservation** Shared Slap presentation and public marketing. Build status: common legacy blocker, not built in this audit.

### projects/slap/swiss-alpine-guides — prototype
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`.
- **Firebase deploy configuration** hosting `site=prototype-swiss-alpine-guides, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=swiss-alpine-guides-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`, `./app/content/tour-pages`, `./app/content/activities`, `./app/content/site-information`. Explicit modules none declared. Explicit layers `'fireux-slap/layer'`.
- **Identity and legacy settings** `id: 'swiss-alpine-guides'`, `role: 'tenant'`, `ecosystem: 'slap'`, `ecosystemId: 'slap'`, `projectId: 'slap'`. Implicit Ecosystem module `fireux-slap`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `./content/tour-pages`, `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-slap`.
- **Direct retired Core literal references** `fireux-core/runtime/app/literature/define-meta`, `fireux-core/runtime/composables/fireux/seo/useSeo`, `fireux-core/runtime/composables/shared/useRouteParam`.
- **Migration priority and preservation** Prototype routes, activities/site inputs, Slap presentation and index policy. Build status: common legacy blocker, not built in this audit.

### projects/slap/yellow-velo — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`.
- **Firebase deploy configuration** hosting `site=yellowvelo, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=yellow-velo-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules none declared. Explicit layers `'fireux-core/layer'`, `'fireux-slap/layer'`.
- **Identity and legacy settings** `id: 'yellow-velo'`, `role: 'tenant'`, `ecosystem: 'slap'`, `ecosystemId: 'slap'`, `projectId: 'slap'`. Implicit Ecosystem module `fireux-slap`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports `#imports`; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-slap`, `fireux-products`.
- **Direct retired Core literal references** `fireux-core/runtime/app/components/ErrorPage`, `fireux-core/runtime/app/literature/define-meta`, `fireux-core/runtime/composables/fireux/seo/useSeo`.
- **Migration priority and preservation** Slap presentation and Products, which is declared in the manifest and supplied by builder defaults. Build status: common legacy blocker, not built in this audit.

### projects/templates/fireux-template — starter
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules none declared. Explicit layers none declared.
- **Identity and legacy settings** `id: 'fireux-template'`, `role: 'tenant'`, `ecosystem: 'fireux'`, `ecosystemId: 'fireux'`, `projectId: 'fireux'`. Implicit Ecosystem module `fireux-fireux`. Builder metadata `name`, `shortName`, `context`, `role`.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-fireux`.
- **Direct retired Core literal references** `fireux-core/runtime/app/components/ErrorPage`, `fireux-core/runtime/app/literature/define-meta`.
- **Migration priority and preservation** Starter assets and placeholders after the pilot pattern is accepted. Build status: common legacy blocker, not built in this audit.

### projects/werkbox/richies-reinigung — legacy concrete App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`.
- **Firebase deploy configuration** hosting `site=richies-reinigung, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=richies-reinigung-ssr`.
- **Assembly** `defineFireuxApp`. Imports `fireux-app/config`. Explicit modules none declared. Explicit layers `'fireux-werkbox/layer'`.
- **Identity and legacy settings** `id: 'richies-reinigung'`, `role: 'tenant'`, `ecosystem: 'werkbox'`, `ecosystemId: 'cleanbox'`, `projectId: 'werkbox'`. Implicit Ecosystem module `fireux-werkbox`. Builder metadata `name`, `shortName`, `context`, `role`.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`.
- **App manifest FireUX packages** `fireux-app`, `fireux-core`, `fireux-werkbox`.
- **Direct retired Core literal references** `fireux-core/runtime/app/components/ErrorPage`, `fireux-core/runtime/app/literature/define-meta`.
- **Migration priority and preservation** Service-site content and verified Werkbox/cleanbox scope mapping. Build status: common legacy blocker, not built in this audit.

### projects/werkbox/werkbox-app — legacy principal App
- **Files** `app/app.config.ts`, `app/meta.ts`, `firebase.json`, `nuxt.config.ts`, `package.json`, `tsconfig.json`.
- **Firebase deploy configuration** hosting `site=cleanbox, public=.output/public, 1 rewrites`; functions `source=.output/server, codebase=cleanbox-ssr`.
- **Assembly** `defineFireuxEcosystem`. Imports `fireux-ecosystem/config`. Explicit modules `'fireux-places'`, `'fireux-businesses'`, `[ 'fireux-jobs', { categories: 'all', }, ]`. Explicit layers `'fireux-werkbox/layer'`, `'fireux-places/layer'`, `'fireux-businesses/layer'`, `'fireux-jobs/layer'`.
- **Identity and legacy settings** `id: 'cleanbox-app'`, `role: 'global'`, `ecosystem: 'werkbox'`, `ecosystemId: 'cleanbox'`, `projectId: 'werkbox'`. Implicit Ecosystem module `fireux-werkbox`. Builder metadata `name`, `shortName`, `context`, `role`. Feature/route/deployment declarations `domains: ['jobs']`, `profiles: ['agent', 'professional']`, `seo` declared.
- **Adjacent config imports** `app/app.config.ts` imports none; `app/meta.ts` imports `fireux-core/runtime/app/literature/define-meta`, `fireux-jobs/runtime/content/swiss-legal-review`.
- **App manifest FireUX packages** `fireux-businesses`, `fireux-core`, `fireux-ecosystem`, `fireux-jobs`, `fireux-places`, `fireux-werkbox`, `fireux-app`.
- **Direct retired Core literal references** `fireux-core/runtime/app/composables/useAppCollection`, `fireux-core/runtime/app/components/ErrorPage`, `fireux-core/runtime/app/literature/define-meta`.
- **Migration priority and preservation** Preserve stable cleanbox-app ID and resolve cleanbox membership separately from werkbox package; explicit Jobs, Places and Business. Build status: common legacy blocker, not built in this audit.
