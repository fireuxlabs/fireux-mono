# Kitchen product architecture review

> Archived / parked on 2026-10-25. Preserved planning and evidence; this file is not the active task list. See [current FireUX priorities](../../../roadmaps/fireux-priorities.md) before resuming work.

Date: 2026-09-08
Status: recommendation for review, not an accepted capability reclassification or migration
Scope: Kitchen capability organisation, operator experience and existing source evidence. No records, routes or ownership moved in this review.

## Recommendation

Keep FireUX's universal, optional shared and domain hierarchy. Design the Kitchen experience around the operator's work, rather than presenting every record type and every proposed report as an equally important destination.

The existing App → Ecosystem → Extension → Core dependency direction is useful. The problem found here is primarily product composition and maturity, not a reason to rebuild those layers.

## Product objective comes first

Build a kitchen operating system that helps a kitchen team know what to make, have the ingredients to make it, execute consistently, fulfil demand and learn from recorded results. Success is a useful working day, not a complete sidebar or preservation of existing code.

Start discovery with independent commercial kitchens and small groups, using Interlaken Pizza as a real validation site. The architecture can grow toward catering and central production, but those workflows must earn their scope through evidence rather than speculative completeness. This target is a recommended starting point, not a claim that every kitchen has identical needs.

Design for three working perspectives, without introducing new permission roles:

- The cook needs today's work, the current recipe, quantities, exceptions and a quick way to record completion.
- The chef or shift lead needs readiness, workloads, shortages, quality checks and service progress.
- The owner or manager needs purchasing control, consistent standards and trustworthy sales, cost and waste evidence.

Define the required jobs first, compare relevant products and industry practice, design the operator journey, then derive capability and record boundaries. Only after that, map existing code to keep, change, replace or remove. Current package ownership is an implementation fact, not a veto on a better product boundary. For example, if table or payment context is necessary to fulfil an order, the experience must provide it even if the supported implementation belongs to Front of House. A separate owner should not force an operator to hunt for information.

The universal/shared/domain categories organise reuse and participation after the job is understood. They do not dictate the cook's navigation or justify an otherwise unnecessary screen. A kitchen operating system also need not replace payroll, accounting and every point-of-sale product in its first release; supported integrations may meet those needs more effectively.

The small set of evidence that should decide the first release is: can staff find the required information, complete the next action without duplicate entry, recover from a mistake or connection loss, and trust the recorded result? Suggested measurements are time and errors for representative tasks, duplicate entry, missed orders/checks, and reconciliation of counts. Baselines must be observed before promising improvements.

## What the source actually proves

| Finding | Evidence | Consequence |
| --- | --- | --- |
| Misebox explicitly selects Kitchen; its ecosystem installs the Kitchen extension. | `projects/misebox/misebox-app/nuxt.config.ts`, `packages/ecosystem/fireux-misebox/src/module.ts`, Kitchen `src/module.ts` | Keep Kitchen workflows in the Kitchen extension and App branding/configuration above it. |
| Food and drink share the Dish record, differentiated by `item_kind`. | Kitchen `models/dish.model.ts`, `components/Workspace/Dishes/Index.vue` | A combined user-facing food and drink library is plausible without merging storage or creating a new product engine. Keep useful food/drink filters. |
| Recipe identity and Prep item specification are separate. Prep items already contain inputs, yield, method and station. | Kitchen `models/recipe.model.ts`, `models/prep-item.model.ts`, `composables/prep-item/` | Investigate their existing relationship before inventing a new Recipe model. A preparation specification is not evidence of a daily prep execution log. |
| Several operational pages are discovery scaffolds. | Inventory, Purchasing, Receiving and Food Safety routes compose `Workspace/Capability/View.vue`, which renders a heading and description; `models/capability-tools.ts` projects research tool hypotheses. | Do not infer an operational workflow from the presence of a route, AI area or tool description. |
| Waste has an actual event presentation and named record tool. | `components/Workspace/Waste/Index.vue`, `tools/waste/record-event.ts` | Preserve this implementation; it is not equivalent to the surrounding placeholder pages. |
| Orders have a defined lifecycle and a real queue/pass surface. | `models/order.model.ts`, `models/order-lifecycle.model.ts`, `components/Workspace/Orders/`, `docs/concepts/order-processing-kitchen-fulfilment.md` | Extend the existing order flow. Do not build a parallel shared order engine. This review does not certify every payment, cancellation or fulfilment path. |
| Costs and Performance explicitly describe missing evidence dependencies. | Their current routes and search-demand models | Reports should follow working event producers. Gross sales alone cannot substantiate profit or labour performance. |
| Kitchen Overview placeholders are currently discovered from navigation groups. | `components/Workspace/Overview/Capabilities.vue` and Core `useNav` | This is a useful display projection, not architectural classification. Sidebar labels must not become the authority for universal/shared/domain ownership. |

Kitchen paths above are relative to `packages/extensions/fireux-kitchens/src/runtime/kitchen/` unless another location is named.

## Internal hierarchy

**Universal:** retain Landing, Overview, Identity, Team, Calendar and Notifications as the agreed common responsibilities. Test remains the development proof until its separately agreed move to optional shared. Universal availability does not require a sidebar item, large AI panel or identical domain fields.

**Optional shared:** compose existing lower owners where they already have a useful contract. Supplier relationships and finance primitives are existing dependencies. Tasks, Documents, Contacts, Training and Integrations are candidates when a concrete Kitchen workflow needs them, not a mandatory new backlog of pages. Kitchen-specific supplier ordering or food-safety interpretation still belongs to Kitchen.

**Domain:** Menus, food/drink specifications, Recipes and preparation, Ingredients, kitchen service, food safety, food stock and waste. Purchasing, order handling and stock may later expose shared mechanics; a general-sounding name is not proof that their workflows are shared today.

The category, readiness and display group answer different questions. A domain capability can be unfinished; a shared capability can be fully working; either can appear in a user-facing area such as Stock & purchasing. Reuse the existing capability declarations when implementing classification. Do not add another competing registry.

## Proposed customer experience

The organising model is a repeating operating cycle, not a mandatory wizard:

**Plan → Buy → Receive & store → Prepare → Serve & fulfil → Close & review → Plan again.**

This is our synthesis of the industry references below. Steps overlap during a real shift, and different food processes take different paths. A purchased bottled drink does not need the same preparation workflow as pizza dough.

| Stage | Information needed | Information produced | Existing or proposed home |
| --- | --- | --- | --- |
| Plan | Menu, recipes, expected demand, known stock | Required quantities and preparation plan | Menus & food; proposed Prep |
| Buy | Requirements, shortages, supplier offers | Purchase order | Stock & purchasing |
| Receive & store | Expected order, actual goods and observations | Receipt, discrepancies, accepted stock movements | Stock & purchasing; food-safety checks in context |
| Prepare | Recipe or prep specification, available inputs, planned quantity | Actual batch/yield and completed work | Proposed Prep; reuse current specification owners |
| Serve & fulfil | Guest order and current availability | Ticket transitions and recorded handoff | Existing Orders & Service |
| Close & review | Sales, waste, remaining stock and outstanding checks | Recorded adjustments, closing evidence and supported reports | Stock, Food safety, Reports; Overview composes attention items |

There are three connected information layers within this cycle:

- **Reference information:** what an ingredient, dish, recipe, menu, supplier or station means.
- **Recorded activity:** what was ordered, received, made, wasted or handed over at a particular time.
- **Derived views:** stock balances, completion, costs, sales summaries and Overview. These read the first two layers rather than becoming competing truth stores.

This is a conceptual distinction, not a proposal for three new folders or services. The current record owners remain authoritative. A recipe is not a production batch, a purchase order is not proof of receipt, and an accepted customer order is not proof of handoff.

Food safety, allergens, traceability and accountability span the cycle. A Food Safety destination can collect plans, evidence and exceptions, but checks should also be reachable at the moment of receiving, preparation or close-down. Team and other universal capabilities support the work throughout.

Overview remains the entry into the current Kitchen. Identity and Team stay easy to reach. Beneath that, use these working areas as a proposal:

| Area | The operator's question | Capabilities and views |
| --- | --- | --- |
| Service | What needs making or handing over now? | Existing Orders queue, pass, order details and fulfilment. Device and station setup sit behind appropriate settings. |
| Menus & food | What do we sell, and how is it made? | Menus; one food/drink library with filters; Recipes; Ingredients. Preserve their distinct records and commands. |
| Prep | What must we make before service? | Proposed daily prep quantities, station work, batches and completion. Reuse existing prep specifications; prove the first real execution workflow before adding a new top-level destination. |
| Stock & purchasing | What have we got, what is arriving, and what must we buy? | Inventory, purchase orders, receiving, supplier relationships and waste recording. Connected views, distinct records. |
| Food safety | What needs checking, and what needs corrective action? | Applicable checklists, observations and follow-up. A checklist tick alone must not claim compliance. |
| Reports | What happened, and what should change? | Sales first where supported; costs, waste and service analysis as their inputs become reliable. One reporting destination with relevant views. |

These areas are navigation and composition choices, not additional repository layers or new record owners. A small pizza kitchen can emphasise Service and Menus; a production kitchen may emphasise Prep and Stock. That difference should not require forking the underlying capabilities.

## Specific critiques and changes

1. **Keep Dishes and Recipes distinct in meaning.** A dish is what is offered; a recipe describes repeatable production. The same preparation can support several dishes. Bottled drinks may need no recipe. Present those relationships without forcing users to create unnecessary records.
2. **Combine related destinations, not their data.** Purchasing and Receiving can share an area while retaining separate order and receipt records. Waste recording and waste analysis can share one destination with two views. Stations belong near preparation/service setup rather than being a primary everyday stop for everyone.
3. **Give preparation a fair assessment.** The present navigation overrepresents reports compared with the daily question of what must be prepared. Existing Prep item code is a starting point, not a reason to claim daily prep is implemented.
4. **Make Overview useful before making it exhaustive.** The first section should eventually surface actionable live facts: orders waiting, a recorded shortage or a check due. Only show facts backed by records. The complete capability map requested during development can remain below this, with explicitly labelled placeholders. A future customer view should not look like a development backlog.
5. **Use AI in the job where it helps.** Import a menu, explain a cost variance, help scale a recipe or draft a purchase order. Reuse the same underlying commands. A large chat panel above every task is not a prerequisite for an AI product.
6. **Treat readiness precisely.** Distinguish an implemented page, an implemented summary, a tested workflow and a released capability. The red cards currently mean the summary is not connected, not necessarily that the destination page is absent or broken.

## Industry evidence and its limits

The broader product comparison supports connected jobs rather than one vendor's exact module list:

| Reference | Observed emphasis | Design lesson for Misebox |
| --- | --- | --- |
| meez | Ingredients, yields, preparation methods and visual recipe knowledge | Make recipes usable at the point of work, not just searchable records. |
| Apicbase | Planned menu quantities become supplier requirements and production plans | Connect planning, purchasing and execution; avoid entering the same quantities repeatedly. |
| MarketMan | Purchase orders connect to mobile receiving | A receipt should continue the purchasing workflow rather than restart data entry. |

These are vendor-documented capabilities, not independently verified usability or return-on-investment claims. Sources: [meez recipe workflow](https://intercom.help/getmeez/en/articles/4664927-creating-your-first-recipe), [Apicbase menu-to-production workflow](https://support.apicbase.com/help/ordering-and-production-planning-from-a-menu-plan), [MarketMan purchasing and receiving](https://www.marketman.com/platform/restaurant-purchasing-software-and-order-management).

Lightspeed groups stock management, production and purchasing within its Inventory module, including supplier orders and receiving. This supports treating supply as connected work rather than unrelated screens. Its structure is a reference, not an instruction to copy its product. [About Inventory](https://k-series-support.lightspeedhq.com/hc/en-us/articles/4407517428891-About-Inventory)

Lightspeed distinguishes made-to-order recipes from batch production, including pizza dough. This supports keeping reusable production instructions separate from when a batch is actually made. [Creating and managing recipes](https://k-series-support.lightspeedhq.com/hc/en-us/articles/4407511552155-Creating-and-managing-recipes)

Restaurant365 calculates costs from records such as inventory counts, invoices and prep logs. This supports building reliable operational inputs before presenting cost analysis. It does not establish Misebox's accounting policy. [Item Costing](https://docs.restaurant365.com/docs/item-costing)

This is a source-informed product recommendation, not customer research across all kitchen types or Swiss food-safety advice. Validate the working areas with an actual operator workflow; do not treat competitor documentation as proof of demand.

The Food Standards Agency's catering pack covers menu checks, storage, cooking, cleaning, stock control, and opening/closing routines. It supplies a useful small-business workflow reference rather than a software module list. Its UK jurisdiction is not a Swiss implementation requirement. [Safer food, better business for caterers](https://www.gov.uk/government/publications/safer-food-better-business-for-caterers)

FDA HACCP guidance recommends understanding and verifying the actual process flow, including ingredients, processing, storage and final use. That supports mapping the work before turning it into screens; it does not prescribe FireUX's navigation or make our outline a validated safety plan. [HACCP Principles and Application Guidelines](https://www.fda.gov/food/hazard-analysis-critical-control-point-haccp/haccp-principles-application-guidelines)

For eventual Swiss food-safety implementation, BLV's industry good-practice guidance is the relevant starting point for local requirements. This audit does not set temperatures, retention periods, legal thresholds or a compliance guarantee. [BLV good-practice guidelines](https://www.blv.admin.ch/de/leitlinien-fuer-gute-verfahrenspraxis-lebensmittelbetriebe)

## Smallest implementation sequence

1. Use the existing capability declarations to express the accepted category and actual readiness, with navigation and Overview consuming those facts. First trace the universal declarations and optional participation seam; do not add a new central engine.
2. Try the proposed navigation as a reversible Kitchen presentation change. Preserve existing URLs, stored records, reader/command owners and the ability to reach every current capability.
3. Prove Service and Menus with Interlaken Pizza: choose an item, submit an order, see it in the correct Kitchen, mark it ready and complete handoff. Include reconnect, repeat submission and unavailable-item cases before a release claim.
4. Trace Recipe ↔ Prep item ↔ Dish in current consumers, then prove one daily preparation example. Do not migrate these records on the strength of this review alone.
5. Build supply and safety workflows in bounded slices. Add each live Overview summary with its capability. Reports follow their actual producers.

Acceptance for the architecture pass: a human can identify where to run service, change the menu and find a recipe without understanding developer categories; each capability still has one owner; every displayed metric has a source; unavailable work is honest; no existing workflow is lost.

## Limits and documentation drift

This review inspected the assembly path, representative routes, current capability declarations, their generic view/tool projection, and relevant record models. It is not a full server, database, security or runtime audit. The shared working tree contains earlier changes that are not part of this architectural recommendation.

`docs/concepts/product-language.md` still describes an Operation as a separate area above Capability, whereas `docs/ai/gpt-context.md` explicitly uses Workspace → Capability → Tool → command with no separate Workspace Operation layer. Follow the higher-authority context; reconcile that wording in a bounded documentation pass rather than importing the obsolete layer into this design.
