# FireUX Progress Roadmap
Authority: Tier2 (Operational roadmap)
Updated: 2026-05-20

Purpose: keep multi-app FireUX work focused while the canon is turned into working product surfaces. Canon is mostly established; the next phase is aligning active apps against it while closing visible product gaps.

This roadmap is a steering artifact, not architecture canon. If it conflicts with Tier1 canon or package contracts, the Tier1 source wins.

## Roadmap Rule

Every task must be classified as one ownership layer:

| Layer | Owns |
| --- | --- |
| Canon | Durable rules, contracts, routing/data/SEO conventions, package boundaries, and guard expectations. |
| Shared Runtime | Reusable FireUX implementation patterns used by multiple apps or extensions. |
| Extension-Owned | Domain work inside a specific extension/package, such as kitchens, suppliers, products, SEO, portfolios, or jobs. |
| App-Local | App shell, deployment, demo data, public pages, app-specific composition, branding, and copy. |

If a task appears in more than one app, prefer Canon or Shared Runtime before app-local fixes.

## Product Pattern

The active pressure should be treated as variations of one reusable FireUX pattern:

```txt
Public App Surface
+ Owner/Admin Console
+ Structured Content
+ Optional QR
+ Optional Embed
+ Optional Ordering
+ Optional Translation
```

This pattern can serve La Tap Berne, Bären Ringgenberg, Sproochli, BuenoHost, Find My SEO, and Kitchen public menus without making five unrelated products.

## Active Apps

| App | Role | Current State | Next Milestone | Primary Ownership Layer | Risk |
| --- | --- | --- | --- | --- | --- |
| FireUX App / Console | Shared app/admin spine | Present in repo; implementation status needs focused inventory | Stable console spine with explicit demo/read-only/live state | Shared Runtime | App-local console fixes could duplicate shared patterns. |
| Misebox / Kitchen | Proof app for restaurant/kitchen workflows | Kitchen extension and Misebox app surfaces are present; readiness needs inventory | Public menu/content spine plus thin Kitchen console adoption | Extension-Owned | Kitchen can become too broad before the public demo feels real. |
| La Tap Berne | Urgent public venue website/web app | App exists in repo; old site availability unknown | Fresh one-page venue surface with menu/contact/hours | App-Local | Waiting for an old-site replica blocks a shippable rescue. |
| Bären Ringgenberg | Food order/delivery opportunity | External website status/access unknown | Hosted order endpoint with menu/order/contact flow | App-Local | Overbuilding API before proving ordering flow. |
| Sproochli | Translation and QR content layer | Extension present; menu translation works but structure needs tighter integration | Structured menu/content connection | Extension-Owned | Translation can drift away from app-owned menu models. |
| BuenoHost | Quick QR guest guide product | Existing app state needs inventory | QR guest guide MVP | App-Local | Scope creep into full property management. |
| Find My SEO | Public SEO directory/profile concept | App state needs inventory; test data acceptable first | Test-data profile/directory surface | App-Local | Marketplace mechanics too early. |
| Granite / Portfolio | Different-industry proof of reusable engine | Granite app and portfolio/property extension surfaces are present | Reuse console/portfolio patterns after spine stabilizes | Extension-Owned | Proving a second industry too early can split focus. |

## Urgent Client Pressure

| Project | Pressure | Fastest Useful Move | Reusable Pattern | Risk |
| --- | --- | --- | --- | --- |
| La Tap Berne | Needs website/web app | One-page public venue app with menu/contact/hours | Public venue surface | Waiting for old site blocks progress. |
| Bären Ringgenberg | Order/delivery contract ending | Hosted order endpoint first, iframe embed second, API later | Public venue + ordering | Overbuilding API before proving flow. |
| Sproochli | Translation works but needs stronger structure | Structured menu/content model | Translation + QR public content | Translation detached from app model. |
| BuenoHost | Quickest simple product | QR guest guide MVP | Public content + QR | Scope creep into property management. |
| Find My SEO | Charlie wants it soon | Test-data public directory/profile surface | Public profile/directory | Marketplace mechanics too early. |

## Cross-App Workstreams

1. Runtime/contracts.
2. Extension alignment.
3. Console/admin surfaces.
4. Public routes/content.
5. Demo/read-only/live data modes.
6. Data seeding/migration.
7. Smoke testing/deploys.
8. SEO/meta/public discovery.
9. SEO runtime honesty: canonical sitemap data first, no old projection fallback.

## Next 2 Weeks

### Batch 1: Inventory

Audit active apps against the current canon.

Output: app readiness table with unknowns clearly marked.

### Batch 2: Shared Missing Patterns

Identify repeated gaps that should become Shared Runtime or Canon.

Output: short list of repeated gaps, each with an ownership layer.

### Batch 3: One Reusable Pattern End-To-End

Pick one pattern and implement it through:

```txt
canon/docs -> shared runtime -> extension -> app adoption -> smoke test
```

Output: one working reusable pattern, not five local variations.

### Batch 4: Highest-Priority App Adoption

Apply the chosen pattern to the highest-priority app first. Current default is Console/Kitchen for architecture work and La Tap/Bären for client rescue work.

Output: one demonstrable surface that proves the pattern.

### Batch 5: SEO Canon Closure

Remove silent SEO fallback paths before expanding SEO features.

Output: sitemap runtime reads canonical public entity data only; each public extension either declares canonical sitemap reads or stays out of entity sitemap generation until it is ready.

## Decision Rules

- Do not solve the same class of problem app-locally in multiple apps.
- Do not expand canon unless an active app exposes a real gap.
- Prefer thin app pages over duplicated domain logic.
- Public/SEO work should follow a believable demo surface.
- Demo/read-only/live state must be visible and unavoidable where applicable.
- Missing required data should be explicit, not hidden by fallback paths.
- Sitemap data must come from canonical public records, not `seo_index_*` fallback collections.
- Hosted endpoint before iframe.
- Iframe before API.
- Take over an existing website only if access/domain handover is realistic.
- Do not wait for an old site replica if a clean replacement can ship faster.
- Shared public content models should serve La Tap, Bären, Sproochli, BuenoHost, and Kitchen public menus.

## Current Recommended Priority

Use this order for urgent client/product pressure unless repo inventory contradicts it:

1. Public venue/content app spine.
2. La Tap replacement surface.
3. Bären hosted ordering endpoint.
4. Structured Sproochli menu connection.
5. BuenoHost QR guest guide MVP.
6. Find My SEO test-data public surface.

Keep this balanced against the architecture priority:

1. FireUX App / Console spine.
2. Demo/read-only/live flow.
3. Misebox / Kitchen proof app.
4. Supplier-lite support if needed by Kitchen.
5. Public menu/demo polish.
6. SEO runtime honesty and public surface inventory.
7. SEO/meta/public discovery.
8. Granite / Portfolio proof.
9. Buenohost / Sproochli alignment.

## Parking List

Use this list for good ideas that are not in the current core lane, proof app, or client rescue lane.

- Full supplier app.
- Granite implementation beyond pattern validation.
- SEO/public metadata expansion beyond demo readiness.
- Per-extension canonical sitemap reads for Products, Blog, Jobs, Kitchens, Places, Companies, Suppliers, and profile directories.
- Jobs application workflow beyond shared entity/create/edit/publish alignment.
- Marketplace/profile mechanics before public profile surfaces exist.
- Custom API integration before a hosted endpoint and iframe option are proven.
