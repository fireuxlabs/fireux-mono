# La Tap Bern pre-migration audit

**La Tap is ready for local Kitchen and Items development.** Its catalogue
already exists at the canonical path. The public Menu cutover still needs
coordinated reference migration, publication verification and release approval.

## Evidence

- Local `codex/kitchen-item-reference-cutover` was clean at
  `e94ab7f5163b958414c2ef746715099012757417`, matching GitHub. GitHub `main` was
  `53a99869e8a1fac2aa3313ad902081efe98e6c43`. The feature branch adds the Item
  reference cutover and rehearsal, the Kitchen/Items read separation, pricing
  error isolation and submission guards, and the Misebox import correction.
- Production Firestore snapshot at **14:11:32 CET on 24 November 2026** in
  `misebox-78f9c/misebox`. Kitchen
  `ChIJ08WSgYSjj0cRD6oE3RwUFk0` reaches the existing Place with the same ID
  through the historical fallback. The Place is named **La Tapberne** and its
  slug is `la-tapberne`. The Kitchen has no explicit `placeId`.
- Google Cloud reports the La Tap function active at revision
  `latapberne-00014-qep`, updated 30 August 2026. Its metadata does not establish
  a Git SHA. The November feature-branch work is a development checkpoint. The
  stored legacy references and existing release gates confirm the coordinated
  cutover remains pending. Current public Hosting rewrites and live route
  behavior were outside this verification.
- Ownership follows the [Entity contract](../concepts/entities.md), the
  [Workspace Identity handoff](../handoffs/2026-11-23-walk-mode-workspace-identity-boundaries.md)
  and the [Item cutover handoff](../handoffs/2026-11-23-walk-mode-kitchen-item-shape-relationships-variants.md).

## Shape comparison

| Area                           | Current stored shape                                                                                                                                                                                                                                                                                               | Target contract                                                                                                                                                 | Mismatch                                                                                                                                                                                                                                                              | Severity          | Required action                                                                                                                                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kitchen Identity and Place     | Kitchen root has context, management and audit stamps. Nested Identity has slug, active status and boolean visibility; the root has no name, description, slug, status, visibility or Place pointer. The same-ID Place supplies the venue name, address, phone, website, about text, hours and timezone.           | Kitchen owns its flat identity, publication state and context. Place owns actual venue facts and contact. A Place link is explicit and optional.                | **Migration required.** The canonical reader can discover the Place by same ID, but its flat public projection needs a root slug, active status and string visibility. Legacy public consumers have their own nested reads.                                           | High              | Review the exact flat identity values and link, preserve existing public eligibility, then change data with compatible readers. Preserve venue contact at Place and Kitchen context at Kitchen.                                                           |
| Theme and Appearance           | Kitchen has a four-token palette. Place has a brand palette, imagery, logo, wordmark and backdrop color. Menus carry `theme_mode` and the three roots have no local theme object. `services.item_images` is absent.                                                                                                | Public Menu selects its effective palette from its permitted Menu override, Kitchen palette or default. Place remains the current source for venue brand media. | **Code issue / decision required.** Workspace Appearance reads `services.item_images` from a projection that omits Services. La Tap has no stored override to recover. Kitchen image versus Place media ownership and the setting's final owner still need agreement. | Medium            | Verify the public palette and media with current readers. Agree the setting's owner and read/write projection before moving its storage or copying brand fields.                                                                                          |
| Items                          | 35 `dishes` and 35 `items`, all matching by ID and stored fields. All named, 33 have descriptions and 34 images. All have numeric base prices and no `currency_code` or `item_kind`. One nonempty legacy `price_options` list and five nonempty `add_ons` lists. One record carries an empty `choice_groups` list. | Kitchen owns `items/{itemId}`. New authored selling terms carry explicit currency, with either a fixed base price or full-price choices and optional extras.    | **Compatible for catalogue storage / decision required for commercial normalization.** There are no La Tap catalogue copies to do. Historical choices and bare prices need their supported read path or reviewed normalization.                                       | High for currency | Retain IDs and amounts. Confirm historical denominations from evidence before writing currency. The current Place default of CHF is venue configuration. Review food/drink classification separately where it affects presentation.                       |
| Menus, Sections and Promotions | Three Menus and nine sections. Published `comida-casera-2` has 34 placements, published daily `specials` has one, and draft `drinks` has zero. All 35 placements have `dish_id`, none have `item_id`, and all targets exist in `items`. Zero Promotion documents.                                                  | Each placement retains its own ID and points at an Item with `item_id`. Publication validates referenced selling terms.                                         | **Migration required.** The Stage 2 readers expect `item_id`. Empty Drinks also lacks publishable content.                                                                                                                                                            | High              | Rewrite 35 references in the coordinated cutover, preserve section and placement IDs, and verify publication and signed-out rendering. Removing a placement changes its Menu child record. Item deletion is a separate command with reference protection. |
| Services and public experience | One disabled `offerings/service-pre-order` record carries `hours`, `menu_ids` and `interactions`. No `services` subcollection. Specials stores daily publication dates.                                                                                                                                            | Saved Offerings own service eligibility, Menu selection and service hours. Public Menu presentation resolves its own published content, pricing and theme.      | **Compatible for browse / decision required for service activation.** A disabled offering gives no active pre-order service. A published stored status alone does not prove the Stage 2 Menu resolves.                                                                | Medium            | Verify the app's public `/menus/[menuId]` route for Food and Specials with their actual Kitchen scope. Keep Drinks draft. Review service schedule and assigned Menus only if enabling the offering.                                                       |

The feature-branch selling-terms decoder accepted all 35 Items at the snapshot.
It projected one full-price variant group and additional choices on five Items.
That verifies the historical read path, including missing currency, separately
from readiness to author new priced Items.

Comida Casera selects Kitchen theme. Specials and Drinks select default theme.
The disabled pre-order Offering references Menu document `food` (slug
`comida-casera-2`) and stores custom Wednesday–Sunday hours, 17:00–22:00 in
Europe/Zurich. Its saved interactions enable browse and disable pre-order, with
24 hours’ notice and ASAP disabled. Specials has one saved published date,
23 November 2026, already past at the snapshot. Verify date eligibility with
the public reader before treating the published root as a current special.

Source checks include the [canonical Kitchen reader](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/read-kitchen-document.ts),
[Appearance toggle](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Identity/Appearance/Index.vue),
[Item pricing reader](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/item-pricing.ts),
[Menu theme resolver](../../packages/extensions/fireux-kitchens/src/runtime/menu/server/payload/theme.ts),
[publication validation](../../packages/extensions/fireux-kitchens/src/runtime/menu/server/publication/validation.ts)
and [Offering update](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/server/offerings/update.ts).

## Smallest safe sequence

1. Continue local development with La Tap selected in Identity and Items.
   Rehearse Menu composition and rendering with copied or synthetic data. The
   two signed-in screens already have the canonical Item collection available.
2. Agree the Kitchen identity values and Place link, the media owner and the
   historical price-denomination evidence. Keep documentation of any unresolved
   commercial terms. Prepare consumer changes while legacy public reads remain
   compatible.
3. Rehearse the coordinated Stage 2 release. Review fresh inventory, backup,
   writer pause, Rules and runtime alignment, and rollback before approval.
   La Tap contributes 35 placement rewrites and zero catalogue copies.
   Other Kitchens share the database and may still require both catalogue
   copies and reference updates. Keep historical Orders, Submitted Orders,
   Sales and FinancialFacts as recorded.
4. Verify public Food and Specials, then consider service activation. La
   Tap-specific branding, content and offering choices can be planned
   independently. Changes to canonical readers, publication validation, Rules
   and the reference cutover affect shared consumers.

Production access was read-only. No export, migration, deployment or Rules
release was performed.
