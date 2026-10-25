# FireUX Ignite context

Updated: 2026-10-21
Ref: eddc8186c
Role: living context
Scope: reusable FireUX app ignition and reconciliation

## Purpose and inheritance

Inherit [AGENTS.md](../../../../../AGENTS.md) and [global context](../../../../../docs/ai/gpt-context.md). FireUX Ignite owns the reusable process for moving from industry needs to an app assembly and comparing that assembly with an evidenced reference build. Its intended outcome is to help creators assemble industry operating systems with connected Apps and Workspaces. Concrete product-family statements belong to the FireUX App intake context, not a neutral package catalogue.

## Scope, ownership and authority

The package owns the brief/assembly/evidence contracts, structural reconciliation and reusable working method. It exports compiled JavaScript for execution and authored TypeScript contracts for typing and Nuxt development; it has no Nuxt registration hooks because it owns no automatically registered runtime surfaces. Apps own reference cases, concrete industry decisions, credentials, intake, transport, persistence and deployment. Existing domain packages retain models, authority and commands. Research uses the existing FireUX AI method rather than duplicating it.

The FireUX App consumer is `projects/fireux/fireux-app/app/pages/workspace/project/ignition-reconciliation.vue`; its reference case is `app/ignition/misebox-reference.ts`. Existing Ignition requests remain App-owned Conversation intake and delivery tracking. They do not establish a generated product.

A product service is a configured business outcome composed from capabilities and exposed through surfaces. Service-layer execution coordinates the supported operations. Neither owns every domain record it consumes; an ordering channel is not automatically a complete product service.

Misebox is a reference implementation, not proof that Ignition generated it. Keep business briefs independent of reference app names, routes and file structure. Record durable decisions, reasons, owners and source evidence; do not embed raw chat history, credentials or private operator/customer records. A path is a pointer, not proof that its behaviour has been tested.

## Shared structure first, explicit deltas second

The working hypothesis is that industry SaaS products share a strong architectural thread. Use the same words for the same architectural responsibility on both sides of a comparison. Keep domain substitutions in a separate view; do not describe one ecosystem as Apps and the other as salons or venues in the architectural row.

[Comparison dimensions](../../src/runtime/models/industry-comparison.ts) are review lenses, not a mandatory capability catalogue, storage schema or generated folder scaffold. [compareIndustries](../../src/runtime/utils/compare-industries.ts) projects explicitly reviewed cases; it does not infer semantic equivalence. Missing observations remain unverified. Identical contract wording does not assert equal implementation readiness.

Classify a real delta as configuration of a supported mechanism, composition of existing owners, or behaviour the current library cannot fully provide. Record source availability separately as existing source, partial reuse candidate or implementation needed. A different domain name is not evidence for a new framework. Conversely, a shared name must not hide a different invariant, authority boundary or lifecycle. Preserve justified exceptions such as FireUX’s Workspace-first arrival and incomplete adoption such as an absent branded tenant App.

The App-owned first comparison is Misebox versus the proposed dog-grooming ecosystem. Granite, BuenoHost and FireUX Project are additional source-reviewed cases. These are the first four maintained Workspace reference Apps, not an exhaustive implementation audit of all repository Apps. Grooming has no implemented App. BuenoHost’s single-Property night allocation informs resource scheduling, but it does not prove simultaneous groomer/tub reservation. Source paths and declared comparisons are separate from independent generated-sibling acceptance.

## Building decisions and research integration

The ordered working loop is owned by [ignition-method.ts](../../src/runtime/utils/ignition-method.ts); this context explains its boundaries rather than maintaining a second lifecycle. Start with business outcomes and operator roles, investigate demand, then map owned Entities, Workspaces, capabilities, Tools, product services and surfaces. Refine capabilities recursively when the evidence requires it. Do not start with a compulsory page list, storage schema or a copy of the reference app.

Use the [FireUX AI research context](../../../fireux-ai/docs/ai/research-context.md) and its [runtime method](../../../fireux-ai/src/runtime/utils/industry-research-context.ts) for research within Ignition or a selected capability. That research responsibility is reusable outside Ignition and remains FireUX AI-owned. Ignition coordinates its place in the build process; neither a link nor a method instruction proves automated research execution or context injection.

For each domain or capability scope, preserve the greenfield question: what do people need when working in this domain? Keep parent and child observations separate. Use multiple neutral seed families, record provenance and limitations, retain empty results and unsupported demand, and never manufacture search volume, interviews or willingness to pay. AI-generated seed terms and summaries are interpretations until supported by inspected external or operator evidence.

Select capabilities using evidence breadth, operational frequency and consequence, existing workarounds, domain fit, required Tools and canonical records. Several demand families may form one capability; deeper research may split one family into several. Workspace navigation follows operator work rather than a keyword taxonomy. Keep source research, interpretation, product response, published literature and live operational proof distinct.

Sandbox comparisons may evaluate page grouping, meaningful index configuration, substantial child pages and plan affordances against a hypothetical industry. Keep these expectations separate from source readiness, stored schemas and shipped Tools. Applying the method does not require creating the hypothetical App or authorizing its deployment. Shared responsibility does not require identical group counts or domain fields.

A FireUX App assembled through Ignition uses the actual framework: `defineFireuxConfig`, its owning native runtime layers, and Core `AppShell`. Prototype scope limits delivered domain journeys; it does not replace FireUX with standalone Nuxt. A brief, assembly type or unused package dependency alone is not runtime integration. Verify registered owners and the running shell before describing the result as built on FireUX. The baseline includes visible shared platform attribution and legal/account entrances, Core SEO metadata with coherent canonical/robots/sitemap policy, and the Core manifest populated from App identity and assets. A branded layout composes these owners; it does not silently omit them. A noindex preview can still prove the complete technical SEO contract. See Core `layouts/shared/PlatformFooter.vue`, `composables/fireux/seo/useSeo.ts`, and `server/manifest.webmanifest.get.ts` beneath `src/runtime`.

The runtime composition references are the native Apps index routes using
`useAppCollectionPage`, Core `workspace/components/Index.vue` and `Page.vue`,
and Kitchen `components/FoodAndDrink/Index.vue`. Public collections visibly
compose native page structure and shared feedback; Workspace capabilities use
the existing persistent Core frame. Domain contexts own reads and commands.
Do not generate FirePage/FireCollectionPage wrappers or clone a domain's page
shell. These references establish source structure, not automatic generation
or independent generated-App acceptance.

Build and reconcile bounded journeys. The method’s build and verify steps apply the global mandatory composition checks: named responsibilities, readable parent composition, explicit state/lifecycle ownership, reused controls and commands, and no duplicate reads or authority. Composition is required from the first implementation; shorter files alone do not prove it. Record where a reusable mechanism was sufficient, where a domain decision was needed, and which service revealed a missing capability. Put the correction with its lowest owning package. A reference implementation is evidence for a decision, not a universal industry blueprint. Publication and release remain explicit App-owned work with their own accepted authority and checks.

The [FireUX App intake context](../../../../../projects/fireux/fireux-app/docs/ai/ignition-intake-context.md) owns concrete requests and delivery tracking. Request acceptance does not itself create an App, an assembly or a proved product.

## Search strategy and acceptance

The `search-strategy` step in `src/runtime/utils/ignition-method.ts` makes search
planning part of Ignition before assembly. The existing reconciliation page
renders this same method; do not maintain an App-local copy of the steps.
Each concrete App owns its search plan and evidence. Distinguish people finding
the software from customers finding participating businesses or services.
Private-only products record why public discovery is not applicable.

The plan names audiences, geography, languages, sourced intent, useful page
families, public fact owners, intended actions, canonical Main/tenant ownership,
index/sitemap policy, truthful structured data and measurement responsibilities.
The optional `IgnitionBrief.search` carries the App-owned plan. Existing briefs
without a plan report `missing`, never search-ready. `reviewSearchPlan` checks
origin, journey references, route metadata and indexing/sitemap consistency;
`reconcileIgnition` includes that review. A `declared` result validates policy
shape, not deployed behavior, indexation or rankings. Shared metadata and transport remain Core-owned;
domain eligibility, schema facts and sitemap providers remain domain-owned.
External listings and review requests are separate capabilities, not implicit
features of on-site SEO. Follow [search visibility](../../../../../docs/concepts/search-visibility.md).

Verification follows the plan through representative rendered routes and actual
hosting endpoints. Production identity must not point to loopback or preview
origins. Missing measurements, inaccessible endpoints and incomplete language
variants remain explicit gaps. Source review, local checks, deployed verification,
indexation and search results are different evidence. This method does not run
research, crawl sites, generate pages or certify rankings automatically.

## Current source

- `package.json` and `tsconfig.build.json`: prepack compiles the explicitly consumed runtime to `dist`, rewriting relative TypeScript imports to JavaScript; external Node consumers execute JavaScript without a TypeScript loader. This package owns no provider credentials or automatic code-generation executor.

- `src/runtime/models/industry-comparison.ts`, `src/runtime/utils/compare-industries.ts` and `src/test/industry-comparison.test.mjs`: shared language, explicit deltas, missing-evidence and source checks.
- `src/runtime/models/ignition.ts`: brief, search-plan, assembly and evidence contracts.
- `src/runtime/utils/review-search-plan.ts` and `src/test/search-plan.test.mjs`: declared origin, page/journey and indexing-policy review.
- `src/runtime/utils/ignition-method.ts`: reusable evidence-led build/reconciliation loop.
- `src/runtime/utils/reconcile-ignition.ts`: declared coverage and dependency validation.
- `src/test/reconciliation.test.mjs`: absent-proposal, invalid-reference, cycle, evidence and reference-source checks.
- `src/test/package-artifact.test.mjs`: packed root/subpath exports execute under plain Node outside the workspace.
- [App intake context](../../../../../projects/fireux/fireux-app/docs/ai/ignition-intake-context.md): concrete FireUX App request and delivery owner.

## Refresh and verification

Read the source, the consuming App case and its referenced owners before changing a case. Recheck paths and observations after migrations. Supply an independent assembly proposal before reporting proposal gaps. Classify semantic differences through review as missing knowledge, missing building blocks, incorrect composition or justified domain choices; the structural comparator does not make those judgments automatically.

Run the package tests and typecheck, and the consuming App check when contracts change. External consumer proofs install versioned artifacts in an independent directory without monorepo aliases or workspace links. Local tarball acceptance is distinct from public publication, authenticated domain behaviour and release. Keep source-reviewed, checks-passed and journey-proved evidence separate. Generation, automated implementation, independent sibling acceptance and release are separate unfinished responsibilities; no live AI calls or deployment are needed to check this foundation.

## App context at creation

The brief/build/verify steps in `src/runtime/utils/ignition-method.ts` require
preparing one operator-reviewed App context string and carrying it through the
existing owning command. Configured Apps declare `context` in `defineFireuxConfig`;
Core routes it through server-only `runtimeConfig.fireux.initialAppContext` and
uses it only for first creation. FireUX ecosystem Project App creation accepts
`context` with the form input. Reinitialization preserves subsequent operator edits.
This package guides preparation and verification; it does not own persistence,
run an automatic model call or create a separate context registry. Context is
background, distinct from public description, instructions and approved settings.
Verify Core's `app-context-creation.test.mjs` and FireUX App's
`project-relationship-authority.test.mjs` alongside this package's method checks.

## Living maintenance

Update this context with stable scope, ownership or verification changes in the same patch. Keep concrete reference learnings with their App; promote only proved reusable method or implementation into this package. Replace disproved assumptions rather than preserving a reference app’s incidental structure as universal architecture.
