# FireUX / Misebox — Build a Kitchen as if Opening a Real Kitchen

**Date:** 2026-11-20  
**Status:** Agreed architecture direction and Codex audit/checklist handoff; **not** an implemented migration or completed workflow.  
**Scope:** Kitchen lifecycle from an empty Kitchen to an operational kitchen. Establish a proven FireUX Entity Core and Workspace slice before downstream capabilities.  
**Related:** [Item Detail & Capability Relationships](2026-11-20-item-detail-capability-relationships.md), [Workspace Spine](../concepts/workspace.md), [Entities](../concepts/entities.md), [Menu & Service terminology](../../packages/extensions/fireux-kitchens/docs/menu-service-glossary.md), [Ignite context](../../packages/extensions/fireux-ignite/docs/ai/ignite-context.md).

## North star

**Design the system around how an actual kitchen comes into existence and operates.** The software mirrors real entities, responsibilities, and dependencies; FireUX adds reusable tools, connections, computations, and convenient presentation. Do not invent extra layers to explain a real-world process.

**Build upstream first.** Kitchen Core must work while Items, Menus, Suppliers, Prep, Team, Services and Orders are entirely absent. A Menu should not need Orders to exist. An Item should not need a Menu, Recipe, Supplier or Order to exist. The downstream consumer depends on the upstream owner; **never reverse that dependency to make existing downstream code convenient.**

This is a **reference journey**, not a claim every restaurant follows one rigid operational sequence. A fine-dining restaurant, food truck, canteen, delivery kitchen, kiosk and vending-machine operator may skip, simplify or reorder optional preparations. Distinguish (a) what a Kitchen record needs to exist; (b) what that business needs to operate safely and profitably; and (c) what it needs for a *particular* digital ordering service. Never make every operational enhancement mandatory to create a Kitchen.

## Real-world Kitchen checklist: first to last

Each checkbox describes a human/operator action; the **done when** line is the acceptance check for a bounded FireUX slice. Do **not** start by designing its folders.

### Phase A — Establish the business (independent Kitchen Core)

- [x] **01. Create the Kitchen.** The owner names a kitchen and establishes its identity. Choose an existing Google Place where useful, or create a Kitchen from a name when no listing exists. A Place is the shared venue identity in the current FireUX model; *Google registration is not mandatory*. **Done when:** a canonical Kitchen can be created, retrieved, selected, reopened, and edited with no child capabilities present.
- [x] **02. Set up the Kitchen's basic identity and operating context.** Confirm owner/access, the associated venue identity, contact/presentation where relevant, current lifecycle status, operational defaults and basic working preferences. Reuse Place-owned name/location/media instead of copying them into Kitchen. **Done when:** the owner can inspect and update supported core facts, access is correct, and reload/switching Kitchens stays correctly scoped.
- [x] **03. Establish the Workspace entrance.** Open the Kitchen's management space, select/switch Kitchens, and find Identity and Settings. It should be useful when empty and show honest empty states rather than forcing an Item or Menu to be created. **Done when:** a Kitchen Workspace works with **zero** Items, Menus, Suppliers, Team members, Services or Orders.

Keep the Kitchen root, reader, trusted mutations and Workspace selection usable independently of downstream capabilities.

**Slice 01 local checkpoint (2026-11-22).** The two creation paths, empty
Kitchen, selected listing edit, switching, refresh and access revocation are
verified in local Misebox. [Source map and evidence](../reviews/2026-11-20-kitchen-core-independence.md#slice-01-local-evidence-2026-11-22).

### Phase B — Decide what is sold

- [x] **04. Define Items.** Enter the dishes, drinks, or products the kitchen intends to offer. The Item is a Kitchen-owned record and should have a simple create/list/detail/edit journey. A dish name can exist before a complete recipe or price. **Done when:** one Item can be created, read, updated and listed alphabetically with no Menu or Order required.
- [x] **05. Sketch a Menu.** Organise existing Items into sections and intended offerings, with placement rules, variations and selling terms only where required. **Done when:** a draft/working Menu can reference Items, be reviewed, and remain private/unpublished. Menus consume Items; they must not redefine Item identity. This is **not** an orderable Menu yet.

**Slice 02 local checkpoint.** Signed-in Misebox created name-only Items at
desktop and mobile widths. The existing alphabetical list opened the exact
`kitchens/{kitchenId}/dishes/{dishId}` record. Editing the name retained the
same document ID and survived reload with the price still unset. Switching
to a second Kitchen hid the first Kitchen's Items. The authored Rules and
trusted update command denied an unrelated member and a previously authorized
operator after live grant revocation. The test Kitchens had zero Menus,
Recipes, Suppliers or Orders.

The 159 focused tests also cover description, photo intent and failure
handling, and rejection of unpriced Items at Menu publication. Browser
checks used the named Firestore emulator with the production Rules candidate.
The five existing Misebox typecheck errors remain outside this slice.

**Draft Menu local checkpoint.** A signed-in Misebox operator created a blank
regular Menu, added a section and selected two existing unpriced Items. Both
placements survived reload and could be reviewed in Items & prices. Publishing
showed Unpublished and identified both missing prices. Readback from the named
`misebox` emulator database confirmed `status: draft` and two `dish_id`
references at the existing section Items path. The public Menu API returned
404 and the production Rules candidate denied a read by an App member without
the Kitchen grant. The test Kitchen had no Orders.

**Independent draft Menu checkpoint.** With only Kitchen, Items and private
draft Menus registered, normal Core sign-in opened the draft Workspace.
The operator created “Kitchen Lunch,” added one section and placed two
existing unpriced Items. Both placements survived reload under “Unpublished.”
The named emulator confirmed `status: draft`, unchanged Item records, and
`dish_id` references at the existing section Items path. The Rules candidate
denied guests and an unrelated App member, and the public Menu API returned
`404`. Nuxt registered no Services, Orders, publishing or public Menu routes.
This check used the existing Place and currency prerequisite.

### Phase C — Work out how food is made and supplied

- [ ] **06. Define the method of production.** For each relevant Item: ingredients, preparation or Recipe, quantities, units, portions/yield, equipment, dietary/allergen facts and practical production instructions. Purchased finished goods may need little or no recipe. **Done when:** those facts live with the correct owner and can be linked to the Item without bloating its base model.
- [ ] **07. Connect sources and Suppliers.** Choose how each ingredient/product is obtained. Record existing Suppliers and their useful catalogue/pack/price/lead-time information where supported; allow manual sourcing if a Supplier integration is not available. **Done when:** purchasing relationships answer *where do we obtain this?* without making the Supplier's entire system a prerequisite for Kitchen Core.
- [ ] **08. Purchase and receive Stock.** Plan opening quantities, receive purchases, distinguish stock on hand from planned buying, and identify shortages. Kitchens that do not use digital inventory may run this manually. **Done when:** selected stock functionality accurately reflects receipts and quantities and does not invent availability when inputs are missing.
- [ ] **09. Cost and price the Items.** Use known recipe quantities/yields and real ingredient/packaging costs, then determine intended selling price, gross margin and food-cost percentage where calculable. Review likely waste and other business costs separately; food-cost percentage is not net profit. **Done when:** Item Detail can show sourced, clearly labelled cost/price/margin facts; missing inputs are **unknown**, never misleading zeroes.

### Phase D — Prepare the people and the operation

- [ ] **10. Prepare the Team.** Identify people/roles, who can manage the Kitchen, who prepares or serves, and necessary training. A solo operator counts; no large roster should be required. **Done when:** access authority is independent of merely appearing in a Team list, and relevant training/assignments attach without rewriting Item Core.
- [ ] **11. Establish operating routines and readiness.** Decide opening/production times, prep lists, stations, equipment, allergens and food-safety responsibilities, stock handling and how orders will be prepared. Applicable compliance is real-world business responsibility; a software checkbox is **not** proof of legal compliance. **Done when:** the operator knows how the proposed service can actually fulfil its offer.
- [ ] **12. Review and publish the customer-facing Menu.** Finalise sections, prices, descriptions, availability and presentation; test a customer view. A public viewable Menu can exist without taking digital Orders. **Done when:** published visibility is controlled by Menu rules; changes to an Item do not silently grant public availability.

### Phase E — Decide how customers are served

- [ ] **13. Configure Services and channels.** Choose relevant modes: table/QR, counter or staff POS, kiosk, collection, delivery, room service, etc. Separate **how an order is taken** (channel) from **how food is received** (fulfilment). Configure actual service/menu relationships, local serving times, and required operational details. A vending operation can have a different set of Services from a fine-dining restaurant. **Done when:** each configured Service can determine which published Menu it offers, when, and by what rules.
- [ ] **14. Run a pre-opening rehearsal.** With only the capabilities that business actually needs, test the owner experience, Item/menu corrections, supply/prep assumptions, staff/service readiness and a simulated customer journey. Verify no orphaned access or stale Kitchen selection. **Done when:** an operator can accurately say *we are ready for this chosen service*, with explicit unresolved blockers and no fabricated readiness.
- [ ] **15. Enable live Orders — only now.** Connect a ready Service and published, orderable Menu to an order intake channel; accept, confirm, prepare, hand over/dispatch and complete the Order. Preserve what was actually ordered at purchase time rather than reading mutable Item or Menu data as historical Order truth. **Done when:** a real end-to-end order/fulfilment journey works for the chosen channel and failures can be safely handled.
- [ ] **16. Operate and learn.** Use actual sales, waste, prep, stock movement, cost changes and customer demand to improve the Kitchen. Add analytics, forecasts, staffing optimisation, advanced procurement or new channels **only after** their base sources and operational uses exist. **Done when:** metrics show their source, time range, unit and missing-input state.

## Readiness gates (not a single mandatory all-features checklist)

1. **Kitchen exists:** Core creation/read/update + selection/Workspace verified. Nothing downstream needed.
2. **Offer exists:** Items and a Menu can be managed. No Orders, Stock or Team module required to show the offer.
3. **Operation ready:** For the selected kitchen type, the operator has the supply, production, people and safety arrangements needed in real life. Not every arrangement must be digitally implemented.
4. **Service ready:** The chosen service has a valid Menu, times, method of intake, fulfilment requirements and verified user experience.
5. **Ordering ready:** Only the chosen Services/Channels pass their required checks. Do not label the whole Kitchen unusable because an optional channel is incomplete.

**Dependency spine for the first code slices:** Kitchen Core → Workspace → Items → Menu composition → Menu presentation → configured Services → Orders. Recipe/Prep, Supplier/Stock, Costing, Team and Compliance are independently owned capability branches that attach when justified. They are **not** mandatory steps along that single technical spine, even though their real-world facts can be essential for a particular business opening.

## How to apply this to our library without another code bomb

This is a **Kitchen audit checklist** and reusable development method, not permission to scaffold sixteen new directories. For each stage, Codex should first inspect *only* the existing owners required to complete it:

- **The real-world responsibility:** What actual thing or action are we modelling? Is it an independent Entity, a parent-owned Record, a Shape, or a capability?
- **The source of truth:** Which model and record own the facts? Which existing reader and protected command access/update them?
- **The user journey:** Which native page and focused component let the operator do that one task? Keep domain state with the correct composable only where needed; a one-off presentational child does not require its own controller.
- **The dependency direction:** Which upstream inputs are genuinely required? Are imports, data loading or controllers improperly reaching into downstream Menus, Services or Orders?
- **The acceptance:** Can we create/read/edit/reload with correct scope, empty/pending/error states, switching and permission checks? Can we prove it with the relevant source-owned tests and actual App consumer?

For each subsequent slice, trace the actual route, stored owner, trusted
commands and consumers. Record the verified behavior and any remaining
coupling before going downstream.

## What changes in FireUX Ignite — later, not now

The long-term goal is that a future developer could describe a real-world business and Ignite could guide them from **prerequisites → Entity Core → Workspace → dependency-ordered capability slices**, with explicit readiness gates. Ignite should explain *what to build next and why* and what evidence proves readiness, not generate every feature at once.

**Current priority is manual development with the operator and Codex.** Capture this method as durable context but **do not launch an Ignite rewrite, new engine, or generalized generator in this task**. Use the Kitchen as the first worked example; only generalise after a second genuinely different Workspace Entity succeeds.
