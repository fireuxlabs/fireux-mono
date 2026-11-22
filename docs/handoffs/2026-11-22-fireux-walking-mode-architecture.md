# FireUX — Walking-Mode Architecture & Documentation Handover

**Date:** Sunday, 22 November 2026  
**Repository:** `fireuxlabs/fireux-mono`  
**Status:** Decisions captured for review and implementation; no source changes approved or performed during this walking session.  
**Purpose:** Hand over the architectural choices made while walking so that desktop work can resume without retracing the discussion.

> **Key instruction:** Review the *current local checkout* before editing. The GitHub `main` branch inspected during the walk showed an older tree than the locally committed documentation cleanup. Do not overwrite or undo newer local work merely to match old remote paths.

## 1. Starting point and repository reconciliation

The earlier README-spine and documentation-cleanup Phases 1–3 were reported accepted in local commit **`0d8d59ce8`**: 131 changed files, clean local working tree, and 42 focused tests passing. No push or deployment had been performed at that point. Codex reported that root `docs/` fell from **121 files to 71**, excluding documentation within individual packages and Apps.

During the walk, direct GitHub inspection of `fireuxlabs/fireux-mono` on `main` still found historical folders such as `docs/archive/`, `docs/reports/` and `docs/onboarding.md`, and GitHub did not resolve commit `0d8d59ce8`. The latest remote commit observed was `eb57620fa94f6aab9e858ede57163b55120f2e36`. This is **compatible with a clean local checkout whose commit has not been pushed**: a clean tree does not mean remote and local branches match. It does not establish that any work is lost or that the local checkout is dirty.

**Desktop reconciliation:** inspect `git status`, `git branch -vv`, `git log -n 5 --oneline`, and the remote tracking branch. Confirm the fate of `0d8d59ce8` and any successors. Do not push, reset, cherry-pick or otherwise change refs just to reconcile without an explicit decision.

**Prior acceptance caveats:** The earlier Codex Map fixture showed 23 retired concept IDs/anchors as unmatched, and retained associations resolving. Live chat association metadata was not verified. Keep any legitimate open links/tasks visible without restoring obsolete concepts purely for ID compatibility.

## 2. The architectural and documentation philosophy we agreed

1. **Simplify first; grow deliberately.** A file, dependency, consumer or test doesn't deserve preservation just because it exists. Sometimes the right move is deleting both an obsolete reference and its obsolete target. Protect meaningful current behaviour and production safeguards.
2. **FireUX is opinionated.** The chosen foundations are **Nuxt, Nuxt UI and Firebase**. The product should remove developer decisions through conventions and reliable defaults, not add endless MongoDB/framework/plugin alternatives or parallel engines.
3. **Upstream owns upstream functionality.** Nuxt documents pages, route conventions and native configuration; Nuxt UI documents its controls and theme APIs; Nuxt Color Mode manages Light/Dark/System. FireUX documents only what it contributes, extends or chooses.
4. **The owner owns the explanation.** Package-specific implementation detail belongs beside Core, an Extension, an Ecosystem or an App. A temporarily rough owner-local document is acceptable; a permanent central dumping ground is not.
5. **Root README should be a small table of contents.** Group **Core, Extensions, Ecosystems, Apps and Tools**. For each, show its name, a one-line purpose, and a link to the owner README. The root tells you *what exists and where*; the owner tells you *how it works*. Avoid duplicating full technical guidance or inventing a complex generated registry.
6. **Central `docs/concepts/` is for genuinely cross-owner philosophy**, not for per-package implementation inventories. Living documents should describe today's decisions and real future intent, not the entire history that led there. Git stores history.
7. **Use line counts, not character counts** when discussing document size during audits.
8. **Document existence and published library admission are separate decisions.** Meaningful, single-use UI components are welcome for separation of concerns. Shared/public components require a separately justified, clear contract.
9. **Do not turn this handover into another general architecture refactor.** Move, simplify and retire documentation based on existing owners, then return to product work. Preserve security, privacy, rules, trusted writes and deployment approval requirements.

## 3. Detailed concept decisions

The paths below were discussed using the **older GitHub `main`** and might already have been altered by the earlier local cleanup. Treat them as *intent*, not an instruction to recreate a missing file.

### 3.1 `docs/concepts/components.md` — slim or retire central implementation map

**Observation:** The older document mixed high-level component responsibility with naming, migrations, layout examples, authentication, Dashboard and numerous package-specific implementation details.

**Keep, briefly, in the appropriate design-system / Nuxt UI integration guidance:**
- Core owns proven, genuinely shared components and platform UI. Extensions own domain UI; Apps own their own presentation.
- Prefer **native Nuxt UI** controls, props, slots and events before making a FireUX wrapper. Avoid forwarding-only wrappers and generic component engines without a real responsibility.
- Keep presentation and interaction separate from stored authority, readers, domain commands and permissions.
- Use **shared semantic CSS/SCSS/design tokens** instead of repeatedly hand-authoring Tailwind utilities in FireUX components. Nuxt UI's own internal Tailwind is fine; precise authorised exceptions may exist.
- A component may be extracted to make its parent easier to read, **even if it is never reused**. Publication to a shared library is a later, separate decision.

**Action:** Move meaningful implementation rules beside their owners. Avoid a second 40-page central manual. If the cross-package essentials are covered in existing Nuxt UI/Lasagne guidance, the large central component file need not survive.

### 3.2 `docs/concepts/lasagne.md` — KEEP centrally, shorten, refresh

**Why it survives:** Lasagne is a **cross-cutting FireUX composition philosophy**, not a tutorial on how Vue components work. It covers pages, component boundaries, composables, contexts, dependency direction and coherent ownership.

**Main idea:** A well-composed parent should let a developer understand the UI by reading its named children. Extract for clear responsibility and readability, not only for reuse. Dependencies remain one-directional; lower owners do not know their consumers. Deliberate small repetition is better than a premature abstraction.

**The 'parmesan on the lasagne' convention:** Small component-local `index.ts` files may contain named **static re-exports** of nearby Vue child components. Parents import them as local namespaces, for example `import * as Menu from './index'`, then render `<Menu.Overview />` and `<Menu.Create />`. These indexes are for **local readable composition, not a global registry** or public library admission.

**Repository evidence:** On the older GitHub branch, 14 matching `index.ts` files were found under component directories: 13 in Kitchens and one in the FireUX App. Examples include Kitchen Menu, Prep Ingredients, Recipes, Stations and Team People, plus `Framework.Hero`, `Framework.Offers`, `Framework.Layers`, `Framework.Library`. Corresponding parent usage was seen for 13; the specific `Menu/Items/index.ts` consumer was left unverified. Recheck actual current sources before referencing counts or declaring a general migration complete.

**Not a rigid rule:** A simple page may render one component, multiple components or local markup. A simple leaf stays simple. Do not create empty wrappers, forced layer counts or automatic index migrations.

**Action:** Keep a short central `lasagne.md` with a genuine current Kitchen/Framework example and the component-extraction/publication distinction; move granular implementation/migration instructions to owners.

### 3.3 `docs/concepts/demo-data.md` — KEEP as a tiny future-intent stub

**History and lesson:** Early fictional demo Kitchens, suppliers, profiles and similar fixtures made development and learning possible before real customers existed. Once real requirements emerged, the synthetic shape became an accidental architectural authority; its system was deliberately retired.

**Future intended use:** Safe, optional, populated **customer demonstrations** can reduce the intimidation of an empty Workspace. Demo records must **follow the current real models**, never determine them, and must not masquerade as production data or grant production authority.

**Action:** Keep approximately ten lines stating *retired for now*, *why a demo may return*, *the trigger (stable real workflows)* and *the rule that demos follow genuine source shapes*. No legacy fixture reconstruction, no speculative implementation architecture, and no active task merely because the stub exists.

### 3.4 `docs/concepts/collection-manager.md` — remove central prescriptive contract, park questions with Kitchen Items

**Lesson:** The old universal Collection Manager approach tried too hard to fit every entity and context to one reading, joining, list and card system. The recent Kitchen Workspace Menu Items experience intentionally returned to a simple list of names and links until real requirements are clear.

**Principle:** **Entity + collection + consuming context determine the experience.** A Kitchen Items list, Chef directory and Supplier catalogue may have different projections, interaction and joins. Standardise lower mechanics only after proving genuine repetition. Do not force every presentation into a general Collection Manager.

**Unresolved question:** Does a collection render only records it fetched, or include related records? E.g. User and Chef may live in separate root collections sharing a UID. **Presentation must not automatically fetch related profiles merely because their IDs match**; the consuming domain reader or trusted server projection decides whether the joined view is actually needed.

**Action:** Do **not** copy the entire old document into another location. Transfer a short **pending decision note** to the real Kitchen Workspace Menu Items owner on list presentation, read outcome, filtering, related-record hydration and future shared mechanics. Revisit during the upcoming real Items work; delete the obsolete central contract after reference reconciliation.

### 3.5 `docs/concepts/debug.md` — split structured-data inspection from debugging

**Lesson:** Displaying raw JSON or meaningful data shapes is not intrinsically debugging. The `FireDiagnosticsDebugPanel` currently conveys a structured **object inspector** capability used for development.

**Vocabulary:** `objects` represents fetched or passed source payloads; `derived` represents computed flags, view projections, counts, filters etc. `object-origin` identifies `fetched` versus `passed`. The discussion did **not** establish a mandatory third `merged` bucket.

**Action:** Let Core own the data-inspector implementation and its documentation. Debugging becomes a usage mode. Remove the generic central `debug.md` if its useful contracts are represented in Core. Keep developer-only access, SSR/server authorization and bounded expensive reads. Do not turn a desire for clearer terminology into an unapproved code rename.

### 3.6 `docs/concepts/translation.md` — MOVE to `fireux-sproochli`

**Decision:** Translation is **optional**, depending on each App's users and, where useful, individual capabilities. The FireUX technical App can remain English-only today; Misebox public Menus may need multiple languages.

**Ownership:** Sproochli owns translation intelligence, language support, provider operation, host-local caching and review rules. Apps and domain features decide whether to use it and own their copy/approved content.

**Future business idea:** Sproochli should also offer a **standalone server-side API** using an API key for single translation requests, without installing a Nuxt module. This is future scope, **not a claim that a public API-key product is already implemented**. Do not put API secrets in browsers; preserve audience/identity scope, billing safeguards and translation approval boundaries.

**Action:** Move technical guidance to its existing Sproochli owner; the root README directory makes its existence discoverable without a separate central translation encyclopedia.

### 3.7 `docs/concepts/card-family.md` — KEEP filename, REPLACE legacy contents

**Explicit decision:** Do **not** simply delete the file. Replace the large Entity-by-Entity inventory with a **short living concept** that is open to future refinement.

**Optional presentation vocabulary:**
- **Pill:** compact identity or selection.
- **Cell:** record shown in a list or collection.
- **Preview:** supplied record or draft shown for review.
- **Overview:** richer Entity presentation.

These are useful descriptions, **not four compulsory variants per entity**, a universal size ladder, or a reason to generate empty components. Domains own their content and appearances; native Nuxt UI and FireUX semantic styling are preferred. Components can exist for readable separation of concerns without shared reuse; public-library admission is a separate contract.

**Interaction invariant:** Navigation should be a real link, actions real buttons; a passive card remains noninteractive. The owning reader/controller supplies data and authority; cards do not silently fetch or mutate storage.

**Action:** Replace the document with a concise approved vocabulary and a short 'pending real-use review' note for Kitchen Items, rather than carrying forward old source inventories.

### 3.8 `docs/concepts/ai-document-processing.md` — move mechanics to `fireux-ai`; preserve a small cross-domain boundary

**Proven experiment:** FireUX AI has successfully transformed Menu photographs, PDFs and URLs into structured Menu/Firebase documents. This is the **first demonstrated consumer**, not the final definition of FireUX AI.

**Future vision:** An AI-assisted business inbox could classify bills, delivery notes, supplier invoices and correspondence, then propose appropriate follow-up work. For example, changes in ingredient purchasing costs could be linked to recipes and dish cost-of-sales calculations. This is **future product scope**, not an instruction to build a universal inbox now.

**Boundary:** AI extracts/interprets/**proposes**; the relevant domain validates, reviews and performs authorised writes. `fireux-ai` owns the general provider/mechanics; Kitchen owns Menu meaning and commands; Finance/Suppliers/Stock would own their later workflows. Protect paid provider usage and sensitive document processing.

**Action:** Move detailed processing to `fireux-ai`/Kitchen owners. Retain only a tiny cross-owner boundary if it cannot be adequately expressed by package README links. No speculative generic workflow engine.

### 3.9 `docs/concepts/app-config.md` — MOVE across `fireux-app` and other owners

**Principle:** FireUX extends native Nuxt configuration; it does not replace `nuxt.config.ts` or `app.config.ts` with an unrelated configuration universe. Firebase, Nuxt and Nuxt UI are deliberate defaults.

**Repository finding:** Actual Apps use `defineFireuxApp`/`defineFireuxEcosystem`. FireUX assembles Nuxt UI, Firebase, Core, PWA, styling and runtime setup, but a sample App still declares overlapping-looking `modules`, `extends`, `workspaces`, `domains` and `profiles` fields. They may have distinct technical meanings today, but the developer-facing API should eliminate unnecessary restatement.

**Action:** Owner documents explain FireUX App assembly and which values belong to native `app.config.ts`, while Core and relevant packages own Firebase, SEO and security implementation. Record **minimal declaration of intent, sensible defaults, and a narrow override surface** as a future simplification target. No new independent configuration framework during this cleanup.

### 3.10 `docs/concepts/landing-templates.md` — MOVE to `fireux-misebox`

**Decision:** Each Ecosystem owns its landing/presentation templates. Misebox owns restaurant-specific Kitchen, Menu and Dish templates. A common capability may be promoted to Core only when it proves genuinely useful across Ecosystems.

**Action:** Move its local Template One detail to existing Misebox documentation. General reusable template ideas may be expressed in an existing cross-cutting template concept, but don't build a universal template engine merely for theoretical parity.

### 3.11 `docs/concepts/color-mode.md` — DELETE central document

**Decision:** Use Nuxt UI/Nuxt Color Mode's built-in Light/Dark/System behaviour. It handles preference and switching. FireUX should **not** make a competing theme engine or rewrite native usage docs.

**Action:** Delete central `color-mode.md`; retain only uniquely FireUX branding/wordmark/semantic-token behaviour in its actual Core/asset owner if still needed. Preserve any relevant privacy/storage disclosures.

### 3.12 `docs/concepts/pages.md` — DELETE central document after owner-specific extraction

**Decision:** Nuxt owns route conventions. FireUX pages should be understandable, with route metadata, layout selection and meaningful composition, but **there is no hard rule** forcing a page to render exactly one parent component. Several named components or straightforward inline presentation are valid.

**Action:** Move real Workspace, Dashboard, auth and scoped route behaviour to their code owners. Keep the basic readability idea in Lasagne. Remove central `pages.md` rather than maintaining a second Nuxt manual.

## 4. What to do next on the laptop

The conversation did **not** authorise a broad automated refactor or direct changes to runtime behaviour. Suggested bounded sequence:

1. **Confirm local/remote state** and read the latest root README spine, AGENTS instructions and owner READMEs. Avoid relying on the older GitHub `main` inventory to infer missing files.
2. **Check whether the 12 reviewed concept documents still exist**, whether some have already moved, and whether a smaller existing owner document can absorb each. Report actual relevant differences; do not blindly apply stale paths.
3. **Make targeted document changes**: keep and shorten `lasagne.md`; replace `card-family.md`; retain a tiny `demo-data.md` future stub; move owner-specific concepts; retire obsolete central copies. Transfer only necessary unique safeguards and open questions.
4. **Add the compact root README index** (Core, Extensions, Ecosystems, Apps, Tools; name, one-sentence description and owner README link). It is navigation, not a new architecture catalogue. Protect the accepted README-spine changes.
5. **Check incoming links, anchors and Codex Map associations**. Real current consumers may need a new canonical link; obsolete consumers can be deleted. Preserve valid production/security requirements. Do not rebuild old docs merely to keep stale identifiers alive.
6. **Run focused documentation navigation/link/format tests and `git diff --check`**; inspect changes to runtime/feature files and report anything that goes beyond docs.
7. **Stop and report** files kept, simplified, moved, deleted, references updated and truly open decisions. Do not push, deploy, alter live Firebase data, or create a new general refactor without explicit approval.

### Open obligations that should not disappear

The prior roadmap/report identified Core User privacy and portal SSR verification, Misebox Rules rollout, the live Walking Session check, Recipe implementation, and a trusted standalone Ecosystem provisioning entrypoint as unresolved. They are separate product/security work, not blockers to talking through concepts; keep them traceable in their real owners.

### Development priority once documentation is reconciled

Return to **a private draft Kitchen Menu built from existing Items**, then work through the actual Kitchen Items experiences. Resolve collection presentation and related-record hydration requirements from working Kitchen needs rather than importing the old Collection Manager architecture.

## 5. Review posture for the desktop handoff

The human sets direction; the architecture discussion defines intended boundaries; repository-aware implementation can **challenge** them using inspected code and tests. A consumer proves usage, **not necessity**. Prefer small, coherent, honest changes that make FireUX easier to understand and build with. Avoid turning this living handover into another permanent central document once its decisions have landed with their owners.