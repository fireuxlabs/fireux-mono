# Walking-mode handoff — Kitchen Item contract, relationships, variants and allergens

Date: 2026-11-23
Project: FireUX / Misebox
Status: **Architecture direction for Codex review; no migration or broad implementation authorised**
Priority: **Items are next now**. The user explicitly reprioritised from finishing the entire cross-Workspace Identity programme before Items. Preserve the Identity handoffs, but do not make them a blocker for this focused Item design/audit.

## Intent established in the walking conversation

We are designing the **target** system, not making permanent concessions for old Firestore shapes. Migration will be planned and verified separately. Keep it simple: one authoritative owner for each fact and no redundant relationships.

Use the domain term **Kitchen Item** (a Kitchen-owned record), not **Product** (a separate commerce/payment vocabulary) or **Menu Item** (which suggests ownership by the Menu). An Item exists even if not placed on a Menu. Avoid coupling the culinary model to Stripe products/prices.

### Ownership and relationships — accepted direction

- **Kitchen owns Items and Menus** as independent child capabilities.
- **Item owns its identity, food/drink kind and ordinary selling terms**. It need not have a price or any Menu placement to exist. Its canonical identity includes a stable ID, name, optional description/image and provenance.
- **Menu owns Sections**, and **Section owns MenuEntry placements**. A placement references an Item ID; it controls the local ordering and active/archived state. An Item may appear on multiple Menus and has **no menuIds reverse array**.
- **MenuEntry is not merely an array element or copied Item**. Keep the existing scoped entry shape and guard cross-Kitchen references. Removing a placement never removes the Item.
- **ItemOffer is the Item's normal selling contract**, not a separate independent offer document and not a Menu-owned price. It may be a separate TypeScript composition/projection, but the authoritative default selling fields belong to the same Kitchen Item record.
- **Promotion** owns explicitly promotional terms and may override the normal offer. **Services** own Menu access/eligibility/fulfilment. Neither owns Item identity or default pricing.
- Reverse usage lookup for deletion or operator display is allowed as a derived query across Menu and Promotion references; it is **not** a persisted reverse relationship on Item. Keep deletion reference guards.

### Variants and choices — accepted experience, exact schema to review

One Margherita Pizza Item with Size choices (12-inch CHF 18, 16-inch CHF 25), not two duplicate Items and not an explosion of WooCommerce-style variant combinations. A size group requires one choice with each option carrying its complete selling price (`pricing: 'full'`). Optional extras, e.g. mozzarella, can form an independent additional-charge group (`pricing: 'additional'`). Reuse/refine existing `ItemChoiceGroup` with stable option IDs, selection `min/max`, and validation. Keep the customer selection in order/request state, not on the Item.

Design the smallest intuitive authoring interface for a restaurant: create Item, add Size choices, optional Extras, set prices. Do not generate combinatorial SKU/product records or matrix editors. Preserve standalone base-price Items and zero-priced choices where valid. Define a consistent rule for an optional base price when full-price size choices exist; do not infer or silently reinterpret it.

**Currency**: existing `ItemOffer` has no denomination; `docs/concepts/family-menu.md#item-offer-denomination` already calls for explicit `currency_code` on priced Item terms, covering base and choices. Do not assume linked Place currency is authoritative, or re-label historical bare amounts from a newly selected default. Audit the approved denomination direction and plan separately.

### Food/drink kind and allergens — direction, not completed design

The user correctly distinguished the Kitchen Item record from a generic Item: it may be **food** or **drink**. Legacy reader code already recognises `item_kind`, but the clean canonical `Item` type currently does not. Propose one simple explicit kind contract aligned with the current Food & Drinks UI. Do not conflate kind with Menu Section, imported category or Ingredient taxonomy.

Food-specific **allergens/dietary details** are a desired extension. A base pizza may contain wheat and milk, but a gluten-free base or added topping may change the final allergen information. Audit the existing Ingredient, Recipe, Prep and Item relationships first; determine the authoritative and editable source, and whether variant options can affect a reviewed final declaration. Do not copy an unverified Ingredient-derived inference directly to public food-safety statements. Keep public declarations accurate per selectable configuration. The conversation **did not** settle an allergen storage schema or whether composition can reliably calculate them; return options and minimal recommendation for review.

### Current repo evidence to reconcile

- `packages/extensions/fireux-kitchens/src/runtime/kitchen/models/item.model.ts`: currently root `Item` with `id`, `name`, optional `description`, `image`, `created`, `updated`. `ItemStorage` currently declares `kitchens/{kitchenId}/items/{dishId}`.
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/records/menus/items/item-offer.ts`: `ItemOffer` holds optional `price` and `choice_groups`, but is located under a path that suggests Menu ownership. It is Item-owned selling data.
- `packages/extensions/fireux-kitchens/src/runtime/menu/records/sections/entry.ts`: `MenuEntry` stores scoped placement with `dish_id` or `promotion_id`, `sort_order`, and `status`. Keep that relationship shape; consider any naming change only as part of a reviewed cutover.
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/item.ts`: historical collection presentation combines Item with pricing, kind, flagship, groups, prep references and legacy conversion; **this is not a canonical schema**.
- `packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/item-pricing.ts`: still handles historical `price_options` and `add_ons` alongside `choice_groups`. These should not become permanent parallel canonical systems.
- `docs/concepts/family-menu.md`, `docs/reviews/2026-11-22-kitchen-items-architecture.md`, and `docs/handoffs/2026-11-23-kitchen-items-lifecycle.md`: some guidance/verification still says persisted `dishes`, while new `ItemStorage` declares `items`; **inspect current runtime readers/writers, deployed paths and migration evidence before choosing a physical cutover**. Do not equate a TS declared path to completed migration.
- Separate Item and Menu routing/module registration has already been tested. Do not regress the Items-only Kitchen flow, optional Place independence, grant checks, or Menu reference protections.

## What Codex should do at sit-down

1. **Read the latest local working tree and the related handoffs**, identify any drift from GitHub, and protect concurrently edited files. Note the shifted priority: focused Items audit now; Identity cleanup remains queued independently.
2. Produce a tight dependency/ownership map: Kitchen → Item (+ ItemOffer selling terms); Menu → Section → MenuEntry → Item reference; Services → Menu; Promotions → Item terms. Distinguish canonical TS shape, persisted Firestore document, read projections and editor UI.
3. Propose the smallest final **Kitchen Item** type/composition, including optional base selling terms, choice-group variants and food/drink kind, and a minimal migration plan from legacy pricing/kind paths. State which data stays on the Item document versus referenced owners; **no new offer collection, duplicate Item-per-size, or menuIds**.
4. Explicitly list unsettled decisions requiring review: exact kind field/name, whole Item composition/type naming, price defaults with full-price choices, currency adoption for historical prices, allergen authority/variant impact, and physical `items` vs `dishes` storage cutover.
5. Recommend a simple Workspace Item editing flow and small tests: standalone/unpriced Item; one Item in two Menus; remove one placement; two full-price sizes; optional extra; invalid choices; forbidden access; referenced-Item delete guard; variant-dependent allergen safety once the authority is approved.
6. **Audit and proposal first**. Do not rewrite the Menu family, migrate/deploy Firestore, change stored currency, or introduce broad backwards-compatibility glue. After explicit target approval, implement narrow checkpoints and run focused contract, permission and consumer tests; commit/push via normal Git save and report SHA.

## Other 23 Nov walking handoffs

- `2026-11-23-walk-mode-workspace-identity-boundaries.md`: shared Workspace experience, domain-owned identity, no permanent legacy fallbacks.
- `2026-11-23-walk-mode-workspace-identity-common-contract.md`: potential shared typed Identity interface, domain deltas, deliberate public/private context.
- `2026-11-23-workspace-entity-theme-audit.md`: entity Theme proposal, audit only; avoid a second theme system or theming whole Workspace.
- `2026-11-23-workspace-identity-location-contact-decision.md`: proposed Profile/Brand/Location/Publication navigation, Place-preferred display resolution, no universal required Place shape.

These are distinct handoffs with differing statuses. **Do not treat unimplemented proposals as approved schema migrations.**
