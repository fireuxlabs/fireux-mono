Tenant/global family map
Updated: 2026-07-17
Ref: de5f53b09
Role: map, not canon

Purpose:
Map the recurring difference between global ecosystem apps and tenant apps.

Vertical links:
- Parent: app-config.md
- Parent: console.md

Horizontal links:
- family-console-entity.md
- family-menu.md
- tool-provider.md

Global app:
- Example: Misebox.
- Can expose multiple domains/consoles.
- Can let a user select from multiple authorized targets.
- Can create new targets when config allows.

Tenant app:
- Example: La Tap Berne.
- Usually exists for one business/target or a small configured set.
- Uses `role: tenant`.
- Uses `consoleConfig.<family>.targetIds`.
- Often sets create behavior off for pinned single-target workflows.

Similar:
- Both should operate the same target with the same package-owned domain logic.
- Both should use shared console target resolution.
- Both should store data in the owning app/scope determined by the selected target.

Different:
- Tenant app can auto-select a single configured target.
- Global app needs user/permission-aware target lists.
- Public route scope follows the explicit app role and surface, not configured
  target count.
- A tenant route may keep its configured target implicit while a directory
  route makes that target explicit. URL shape does not change data ownership
  scope.

App-scope vocabulary:
- App role is `tenant`; the corresponding entity scope state is `tenant_app`.
- `parent_app` means an entity's operational overlay is owned by the ecosystem/global app.
- `tenant_app` means the operational overlay is owned by the tenant app.
- `root_only` means there is no app-owned operational overlay.
- `dedicated_app` is legacy stored input only while existing records are migrated; new writes use `tenant_app`.
- App-role mapping is explicit: `tenant` writes `tenant_app`; `global` and
  `standalone` write `parent_app`. A standalone app directly owns its overlay;
  unknown roles do not receive an ownership default.

Tenant target ownership:
- Creating an App record does not silently transfer a pinned entity from its current app.
- A new tenant-owned entity can be written directly as `tenant_app`.
- Attaching an existing root that belongs to another app must stop and use an explicit transfer that moves scoped records before repointing the root.
- Cross-app protection applies to global and tenant callers; neither may silently reclaim a root owned by another app.
- Writers preserve each entity family's current nested or flat app-scope representation until that family is deliberately migrated.
- Tenant creation should present attach-versus-transfer as an explicit workflow step; target pinning alone is not ownership migration.
- The shared server transfer planner is dry-run only. Its fixed phase order is:
  inspect the source tree, copy the complete overlay tree, verify the
  destination tree, repoint the root, then delete the source tree last.
- A transfer executor must never infer that copying the overlay document also
  copied its Firestore subcollections; it must inventory and verify the full
  descendant tree explicitly.
- The public Menu family currently requires exactly one tenant Kitchen target.
  Missing, multiple, or nonexistent targets are configuration errors; they do
  not fall back to global data or render a misleading empty menu index.
- Tenant root routes omit the Kitchen slug. Directory routes carry it in their
  explicit route scope; a client-provided slug cannot change tenant ownership.
- Public Menu count changes the tenant index outcome, not its route grammar:
  `/menus` temporarily redirects to `/menus/<menuId>` only when the bounded
  server result proves there is exactly one published menu and no next page.
  Zero menus render an empty index and multiple menus render a paginated list.
  Ecosystem and explicit kitchen-directory indexes remain lists at every count.

Tenant page composition:
- Reference-in-progress: `projects/misebox/la-tap-berne/app`.
- A tenant page should compose visible layers explicitly instead of hiding all chrome in one large wrapper.
- Current La Tap page shape: `LaTapBernePage` frame plus shared backdrop, `LaTapBerneHero` title/intro/content stack, then page-specific content.
- `Page` should stay boring: page frame, shared always-on backdrop, minimum structure, page variant only when the frame itself differs, no hidden domain copy.
- `Backdrop` owns image and wash decisions.
- `Hero` owns title, eyebrow, subtitle, and the page body slot.
- Route pages should read like a small composition recipe: page, hero, content.
- Shared tenant pass-ins should live in app-local config or assets, not repeated across pages/components.
- Content route pages should not carry one-off scoped style blocks; styled content belongs in small tenant components beside the markup it styles.
- Landing route pages should still avoid frame CSS; use a page variant and pass only the unique landing child.
- Tenant-specific naming is allowed while the pattern is proving itself. Do not prematurely extract generic `TenantPage` components before another tenant confirms the shape.
- Existing tenants are not assumed migrated. When touching a tenant, compare against La Tap, then decide whether the same page composition applies or whether the tenant has a legitimate delta.

Open questions:
- The dry-run transfer contract exists, but an authenticated executor,
  recursive inventory, backup gate, verification ledger, and recovery behavior
  are still required before live migration.
- Tenant public menu URL rules need to stay separate from provider tool preview URLs.
- Shared tenant page primitives may be extracted only after at least two tenants use the same layer shape cleanly.
