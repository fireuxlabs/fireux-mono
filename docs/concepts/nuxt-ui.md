# Nuxt UI baseline and FireUX library map

Updated: 2026-10-21
Ref: add6006b3
Role: map, not canon

## Purpose and authority

Map FireUX as a native extension of the current stable Nuxt UI, Core's additions
and the boundary with domain libraries. Inherit [AGENTS.md](../../AGENTS.md) and
[global context](../ai/gpt-context.md). This covers Core's UI integration and
component families; it is not an audit of every Core server, data or security
contract.

Installed package source, registration and real consumers establish current
behaviour. The current stable upstream release establishes the direction;
an older local installation is work to modernise, not another API to preserve.
The human retains product and visual-design authority.

Related maps: [components](components.md), [repository ownership](fireux-mono.md),
[runtime packages](runtime-package.md), [layering](lasagne.md),
[colour mode](color-mode.md), [brand and template theming](theming.md), and
[Misebox context](../../packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md).

## Native extension contract

FireUX moves with Nuxt UI. It adds proved interaction, lifecycle and product
composition to upstream components, theme slots, variants, semantic tokens and
accessibility behaviour. Ordinary Nuxt UI usage should work directly in a
FireUX App without a FireUX replacement API or translation layer.

- Support one current stable Nuxt UI API. Verify the upstream release before
  working on this boundary, then update dependencies, changed consumers and
  relevant checks together. Prereleases require an explicit adoption decision.
- Prefer the current upstream responsibility when it exists. Retire duplicated
  FireUX controls, style engines and lifecycle machinery only after comparing
  their real semantics and consumers; retain domain authority and necessary
  command-intent protections.
- Remove replaced APIs and old paths in the same bounded migration. Compatibility
  wrappers, dual versions and deprecated props are migration debt, not extension
  points or a long-term support strategy.
- Pin tested releases for reproducible builds. A pin does not excuse falling
  behind upstream or extending an obsolete API. An upstream publication defect
  may justify a temporary supported-range constraint with evidence and a clear
  removal condition; it does not justify a second FireUX UI contract.
- Keep domain meaning above the shared library. Nuxt UI → FireUX → domain
  composition describes added responsibility, not three competing UI systems.

## Version baseline

Workspace baseline on 2026-10-21:

| Dependency | Declared / resolved baseline | Contract |
| --- | --- | --- |
| `@nuxt/ui` | `4.12.0` in root, Core and Apps; Core/Blogs/Kitchen/Products peer `^4.12.0` | Workspace override and exact consumer declarations select one stable UI baseline. |
| Nuxt, `@nuxt/kit`, `@nuxt/schema` | `4.6.1` | Workspace overrides align the framework and integration packages. Core's peer minimum is 4.6.1. |
| Vue / Vue Router | `3.5.43` / `5.4.0` | Match Nuxt 4.6.1 requirements and retain shared runtime instances. |
| Tailwind / build adapters | `4.3.3` | Core, UI and Tailwind Vite/PostCSS adapters use the same baseline. |
| PostCSS / Reka UI | `8.5.31` / `2.11.0` | PostCSS satisfies the current Nuxt/cssnano build chain; UI supplies Reka interactions. |
| Icon / Fonts | `2.5.1` / `0.14.0` | Align direct App declarations with Nuxt UI's integration requirements. |
| Internationalized Date | `3.12.4` | Kitchen, Jobs and UI share the same date class identity. |
| Node | Workspace `22.23.1`, engine `>=22.23 <23` | Satisfies Nuxt and UI engine requirements without a Node change. |

Authorities: [root manifest](../../package.json),
[workspace configuration](../../pnpm-workspace.yaml),
[lockfile](../../pnpm-lock.yaml),
[Core manifest](../../packages/core/fireux-core/package.json), App manifests
such as [Misebox](../../projects/misebox/misebox-app/package.json), and resolved
local package metadata. Keep these declarations consistent when changing the
baseline; a caret or peer range alone is not proof of the installed version.

### Current integration decisions

Nuxt UI's [4.12.0 release](https://ui.nuxt.com/docs/releases) and
[package source](https://github.com/nuxt/ui/blob/v4.12.0/package.json) require
Kit/Schema `^4.6.1` and Tailwind build adapters `^4.3.3`. Nuxt 4.6.1 in turn
requires Vue `^3.5.43` and Router `^5.4.0`. Upgrade this dependency slice together;
do not force an older Kit/Schema, Vue or Router through an incompatible override.

Other bounded integration decisions are:

- DevTools 3.4.4 has a published matching DevTools Kit. The old 3.3.1 override
  would violate Nuxt's current dependency range.
- Motion Vue 2.6.0 satisfies UI's range and has a published dependency chain.
  The 2.8.0 release requests unpublished Motion DOM 14.3 packages; the workspace
  override records that concrete publication problem. Remove it when the newest
  release within UI's supported range has a fully published dependency chain
  and passes the affected interaction/build checks.
- PWA Nuxt 1.1.1 and Vite PWA 1.3.0 support the current Vite 8 build. PostCSS
  8.5.31 replaces the old incompatible cssnano/PostCSS override combination.
- The package builder still requires CLI 3; root declares CLI 3.37.0 for that
  build tool. Nuxt Apps use their Nuxt-owned CLI 4. These are different consumers,
  not two Nuxt UI contracts. Remove the separate tool dependency when the current
  package builder supports the App CLI or its owning build path is replaced.
- Blog creation consumes native `UEditor` and `UEditorToolbar` with HTML drafts.
  Nuxt UI owns editor lifecycle, formatting actions and the current Tiptap family;
  the old direct Tiptap 2 dependencies and local toolbar/lifecycle were removed.
  Blogs retains draft metadata, featured/social media and protected authoring
  commands. Inline images and mentions remain disabled until Blogs owns their
  authoring contracts. See [Blog ownership](blog.md).
- UI's unused collaboration extensions still report missing `yjs` and
  `@tiptap/y-tiptap` peers with automatic peer installation disabled. Install and
  verify those only when enabling that collaboration feature; do not suppress
  the warning or describe the entire optional peer graph as clean.

`UTheme`, `UInputDate` and `UInputTime` now exist in the installed baseline.
Availability does not make them FireUX public contracts or prove current use.
Use their installed APIs when a real composition needs them.

### Verified boundary

The baseline is verified by all reusable-package typechecks, the Core package
build, generated Nuxt App typechecks for Blank, FireUX App and Misebox App, and
production builds of Blank and Misebox. Focused native-layer, page-transition,
editing-lifetime, action-surface, account-transport, Project intent and Menu
command-scope tests cover the affected contracts.

An isolated browser fixture using the real Core components/styles and Nuxt UI
verified action/disabled state, disclosure and keyboard interaction, selection,
Accordion content, dialog dismissal, copy feedback, light/dark rendering and
Tailwind output with a deliberate local spacing override. It connected to no
application data. This does not certify every App flow, a narrow viewport or an
external packed-package installation.

The native Blog creation editor is separately verified by the Blog package and
generated Blank App typechecks, the Blank production build and the 12 existing
authoring/editorial tests. An isolated browser fixture with the real creation
component verified HTML loading/editing, title-derived slug, reading time,
all seven toolbar actions and external draft replacement/clearing. Empty editor
content uses native HTML serialization (`<p></p>`); existing authoring validation
continues to reject empty prose. The fixture used local draft state and media
stubs, with no App data or publishing commands.

Nuxt reports supported Jiti fallback for the repository's extensionless authored
module/config imports; native TypeScript loading remains a separate performance
migration. The optional collaboration peer warnings above remain visible.

## What Nuxt UI supplies directly

Static Core runtime template inspection finds these direct-use groups. This is
an inventory of authored tags, not certification of every supplied prop, slot,
dynamic component or behaviour.

| Responsibility | Observed direct Nuxt UI components |
| --- | --- |
| Actions and navigation | `UButton`, `ULink`, `UIcon`, `UBreadcrumb`, `UDropdownMenu`, `UNavigationMenu`, `UTabs`, `UTooltip` |
| Input and selection | `UInput`, `UTextarea`, `USelect`, `UCheckbox`, `UCheckboxGroup`, `URadioGroup`, `USwitch`, `UFormField`, `UAuthForm` |
| Surfaces, disclosure and feedback | `UCard`, `UAlert`, `USkeleton`, `UProgress`, `USeparator`, `UAccordion`, `UCollapsible`, `UModal`, `USlideover` |
| Identity and collections | `UAvatar`, `UAvatarGroup`, `UBadge`, `UChip`, `UUser`, `UTree` |
| App and page structure | `UApp`, `UContainer`, `UHeader`, `UMain`, `UFooter`, `UPage`, `UPageBody`, `UPageHeader`, `UPageGrid`, `UPageCard`, `UPageFeature`, `UPageHero`, `UPageSection`, `UPageCTA`, `UPricingPlans` |
| Dashboard structure | `UDashboardGroup`, `UDashboardNavbar`, `UDashboardPanel`, `UDashboardSidebar`, `UDashboardSidebarCollapse` |
| Chat presentation | `UChatMessages`, `UChatPrompt`, `UChatPromptSubmit` |

Use these public controls, semantics and state props directly. FireUX should
not publish a renamed wrapper for every button, card, field, page or grid.
Nuxt UI's typed props and named slots are the starting contract. Its separate
[Card implementation](https://github.com/nuxt/ui/blob/v4.12.0/src/runtime/components/Card.vue)
and [Card theme](https://github.com/nuxt/ui/blob/v4.12.0/src/theme/card.ts)
illustrate the library pattern: component behaviour and slot contracts compose
central theme slots, variants and defaults.

The official [templates](https://ui.nuxt.com/templates) and
[showcase](https://ui.nuxt.com/showcase) demonstrate page/workflow composition
and product usage. They do not establish FireUX ownership or justify copying a
new local component system into each feature.

## What FireUX adds

FireUX natively extends the current stable Nuxt UI. Atoms, molecules and organisms
describe composition responsibilities; they do not require a duplicate Vue
directory tree or transfer domain ownership into Core.

| Contract class | Existing FireUX addition | Admission boundary |
| --- | --- | --- |
| Shared visual and interaction contracts | `ActionSurface`, `DisclosurePanel`, `StateCard`, `CopyError`, Collection Row/Cell, focused selection and editing controls | Missing semantics, repeated interaction or a proved shared layout; ordinary Nuxt UI chrome remains direct. |
| Stateful editing | Editable fields, local draft/image handling, save/cancel/error presentation and stale-completion protection | Keep Auth/App/membership intent invalidation where required. Domain validation and protected commands remain with the domain. |
| Workflow and region composition | Create Write/Preview shell, Onboarding shell, Workspace capability/group/read-state compositions, shared landing preview framing | Callers retain domain stages, meaning, readers, commands and product copy. |
| Connected Core platform UI | Auth, Dashboard, Core layout chrome, connected Context/Workspace/Team/AI surfaces and provider transport | Valid Core ownership does not make these pure visual primitives. Document App/session/module prerequisites. |
| Internal helpers and specimens | Forms Top, Auth helpers, Diagnostics, Library and Workspace test harnesses | Registration and wildcard exports do not make every helper a supported public visual API. A specimen is not production reuse. |

The complete family classification is maintained in
[components.md](components.md#core-shared-component-families). Broad component
registration in
[components-config.ts](../../packages/core/fireux-core/src/config/module/components-config.ts)
currently mixes these classes. A supported library surface needs named inputs,
slots/events, runtime prerequisites and consumer evidence; automatic registration
alone does not supply that contract.

### Integration and styling path

[nuxt-baseline.ts](../../packages/core/fireux-core/src/config/app/nuxt-baseline.ts)
installs Nuxt UI through the full FireUX App configuration, supplies one narrow
Dashboard body default and registers Core CSS. The native
[Core layer](../../packages/core/fireux-core/src/runtime/nuxt.config.ts) alone is
not equivalent to that full setup. Core's
[main.css](../../packages/core/fireux-core/src/runtime/assets/styles/main.css)
imports Tailwind and Nuxt UI; [main.scss](../../packages/core/fireux-core/src/runtime/assets/styles/main.scss)
collects the existing shared atomic CSS families.

Use this extension path:

1. Nuxt UI controls, semantic variables and supported theme APIs establish the
   visual foundation. Universal component defaults belong in `app.config.ui`;
   ordinary colour, size, variant, loading and disabled behaviour use props.
2. FireUX shared atoms/molecules/organisms own proved recurring layout,
   typography, surface and interaction recipes. Reuse the current owner before
   adding a new recipe. Nuxt UI owns the ordinary `--ui-radius` default.
3. Domain libraries compose these contracts for named user jobs. App and tenant
   presentation stays with its owner; stored Kitchen palettes and App brands
   are not automatically a global Nuxt UI theme.
4. Inline utilities and per-instance `ui` overrides supply specific final
   adjustments. Moving a utility string into a private stylesheet does not
   establish composition. Local CSS needs an owned visual contract, such as
   domain media, responsive output, print or a narrow optical adjustment.

There is currently no Core-wide Button/Card/Input presentation preset. A new
global skin is a design decision requiring representative consumers, not an
automatic consequence of calling FireUX a library. Preserve honest identity:
missing stored media or branding must not be replaced with fake canonical data.

## What belongs in the Misebox library

The Misebox library can curate a coherent domain catalogue while lower packages
retain implementation authority. Ecosystem curation is not a reason to move
Kitchen, Dish or Menu code upward or make Core import those domains.

| Library area | Implementation owner | What the domain library demonstrates |
| --- | --- | --- |
| Items | Kitchen `FoodAndDrink/Items`; Dish-owned food facts/media where already defined | Catalogue, editing, pricing presentation and honest missing-media states. Shared controls come from Nuxt UI/Core. |
| Menus | Kitchen/Menu package spines and Kitchen `FoodAndDrink/Menus` | Selection, menu composition, publication, QR and customer/basket presentation. |
| Promotions | Kitchen `FoodAndDrink/Promotions` and its domain models/commands | Dish offers, meal deals and their effects on menu presentation. |
| Services | Kitchen `FoodAndDrink/Services` | Collection, delivery, kiosk, eligibility and hours. Core selection controls do not own those rules. |
| Orders | Kitchen `Orders` and its customer/operator compositions | Ticket states and sample workflows. Specimens must remain distinct from live operational orders. |
| Food and Drink overview | Kitchen `FoodAndDrink/Index` | Domain organism composed within Core Workspace framing. |
| Restaurant templates | `fireux-misebox` TemplateOne and its Kitchen projections | Misebox-owned template anatomy and brand injection. Apps own their route adapters and promotional demonstrations. |

Current source entrypoints:
[Kitchen FoodAndDrink](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/FoodAndDrink),
[Kitchen Orders](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Orders),
[Kitchen registration](../../packages/extensions/fireux-kitchens/src/config/module/components-config.ts),
[Misebox module](../../packages/ecosystem/fireux-misebox/src/module.ts), and
[Misebox runtime](../../packages/ecosystem/fireux-misebox/src/runtime).
Catalogue prices, eligibility and Order persistence remain domain-owned;
catalogue examples do not establish mutation authority.

## Classified audit findings

The version/API reconciliation above is implemented. The remaining rows classify
independent architecture debt; a framework upgrade does not resolve it:

| Finding | Evidence and direction |
| --- | --- |
| Reconciled UI API use | Core App [OnboardingVariables](../../packages/core/fireux-core/src/runtime/app/components/Create/OnboardingVariables.vue) uses native Accordion items/body slots. Core Tooltips use `content.side` and `kbds`; the obsolete Modal `prevent-close` attribute is removed. Explicit model generics preserve existing string/number drafts under the current UI types. Keep these supported contracts when extending callers. |
| Mixed CSS precedence | Several shared card/page/Workspace SCSS families are unlayered while Nuxt UI/Tailwind styles are layered. Normal unlayered declarations can defeat final utility adjustments regardless of low selector specificity. Some typography/profile families already use layers. Compare computed styles before changing cascade ownership. |
| Overlapping surface recipes | [Collection Cell](../../packages/core/fireux-core/src/runtime/components/Collection/Cell.vue) has local surface styling alongside shared card anatomy and Nuxt UI cards. [Workspace Hero](../../packages/core/fireux-core/src/runtime/components/Workspace/Hero.vue) combines UPageHero configuration, a replaced header and important global container overrides. Converge each shared owner's slots and styling before migrating consumers. |
| Duplicate colour-mode authority | [Core useColorMode](../../packages/core/fireux-core/src/runtime/composables/theme/useColorMode.ts) and Nuxt UI's native colour-mode integration both manipulate preference storage/root classes. Follow the existing [colour-mode migration map](color-mode.md); do not promote the duplicate helper as a new public API. |
| Domain policy in Core chrome | [NotificationsSlideover](../../packages/core/fireux-core/src/runtime/components/layouts/shared/NotificationsSlideover.vue) recognises Kitchen's customer-profile route and labels it My orders. Keep the feed in Core; the domain/App owns that destination and copy. |
| Product identity/copy in Core | [Auth System](../../packages/core/fireux-core/src/runtime/components/Auth/System.vue) special-cases Misebox; [Solutions](../../packages/core/fireux-core/src/runtime/components/landing/Solutions.vue) supplies fixed FireUX/Misebox/Werkbox promotional copy. Use declared display identity and owner-supplied copy. |
| Domain colour aliases | [public-profile-surfaces.scss](../../packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/public-profile-surfaces.scss) maps Chef/Driver names to tones. Domains should supply semantic tones through the shared contract. |
| Mixed interaction and protocol | [Team Roles](../../packages/core/fireux-core/src/runtime/components/Workspace/Team/Roles.vue) combines interaction, endpoint protocol and reserved-role policy. Keep platform prerequisites explicit and narrow the command/policy boundary before wider reuse. |
| Forwarding and uncertain reuse | Collection Pagination and Landing ProductPricingStrip add little beyond forwarding. CardGrid duplicates input shapes and baseline grid/card chrome. Several Workspace helpers lack observed authored callers. Confirm dynamic consumers before removal; simplify through current owners rather than adding another engine. |
| Installed-package portability unproved | Core CSS has explicit source discovery paths, but registration alone does not prove utility discovery for every packaged User/Ecosystem component in an external consumer. Verify a real installed-package App before promising that distribution contract. |

Shared card, typography and Workspace systems have real consumers. Similar
values or overlapping names are not sufficient evidence for deletion or global
consolidation. Compare meaning, cascade and affected consumers first.

## Verification and refresh

Refresh this map when the supported Nuxt UI version, integration, public
component boundary or domain ownership changes. Refresh the component map for
family/consumer changes and global context only for repo-wide conventions.
Keep source links current; do not add a second generated component registry.

Before accepting an upgrade or a changed library contract:

- Resolve peer/dependency ranges and workspace overrides against published and
  locally resolved package metadata; verify generated Nuxt imports/types and CSS.
- Compare actual props/slots, disclosure and keyboard behaviour, dialogs,
  notifications, loading/errors and disabled actions in representative Core,
  non-Kitchen App and Kitchen compositions.
- Run focused tests for changed editing lifetimes, stale commands, provider
  cleanup or other affected behaviour, then the relevant package/App checks.
- Verify light/dark mode, responsive composition and intended theme/utility
  overrides in the browser. Include installed-package source discovery when
  making distribution claims.

The family review covers source, registration and immediate authored consumers.
It does not certify every leaf, browser/accessibility flow, async race or
external installed-package build. Documentation maintenance alone does not
establish that every architecture finding or product flow is fixed.
