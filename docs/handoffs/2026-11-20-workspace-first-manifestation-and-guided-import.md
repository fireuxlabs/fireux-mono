# FireUX / Misebox — Workspace-first manifestation and optional guided import

**Date:** 2026-11-20  
**Status:** PARKED product and architecture handoff for Codex review. **Not an approval to execute.**  
**First proof:** Misebox Kitchen; reusable principle belongs in FireUX Ignite once verified.  
**Implementation prerequisites:** Complete the current FireUX Core, User/App membership and optional Workspace reset gates first.

## The product decision

**The user gets a Workspace immediately.** It is the management surface, even if no domain Entity has yet been created. It is not another persisted Entity. A new, unauthenticated visitor can enter the Kitchen Workspace, see a left-hand capability navigation and an honest empty state without answering setup questions or signing in just to look.

Give the visitor natural choices inside the Workspace:

- **Explore a demo** — view a clearly labelled synthetic Kitchen such as a sample burger shop, using safe demo or fixture data, without acquiring edit rights. Confirm the names and fixture locations from actual source before hardcoding any example.
- **Manifest my Kitchen** — create a minimal managed Kitchen at the first meaningful save/ownership action, starting with a placeholder like “My Kitchen 1”; rename it freely, optionally attach its venue identity to a Google Place later, and add chosen capabilities in any valid order.
- **Guide me** — an optional, dismissible industry-specific setup assistant or checklist for someone who wants a recommended path. It must never gate free exploration or ordinary permitted management.

**No compulsory onboarding wizard.** Do not ask for business category, location, team, menu or other profile fields before showing the blank Workspace. An empty Workspace is a genuine useful state; an empty Workspace does *not* falsely assert that a Kitchen document has been saved. A user may abandon it with no Kitchen record created. Sign-in and required permissions can be deferred until a protected persistent action. Do not weaken authentication, actor authority, tenant scoping or account recovery.

**Vocabulary:** “Manifest a Kitchen” describes creating the minimal business Entity from its Workspace. The optional guide may still be called “Onboarding” or “Get set up” in user-facing language. Neither phrase should become a new technical persisted layer.

## Three different orders — do not conflate them

1. **Engineering build/dependency order:** the source contracts should be proved bottom-up, e.g. Kitchen Core → Items → Menus → Menu publication → Services → Orders. This is how we build reliable software, not necessarily how a chef starts using it.
2. **Human input / import order:** users start with artifacts they already have. A chef is likely to have a complete menu, so a better opening suggestion can be **“Upload your menu”** instead of “Add your first Item”. The import can stage/review Item records and Menu sections, then persist them through their existing owning commands in the right dependency order. Do not save unreviewed AI guesses, duplicate Items or Menu ownership, or conflate PDF-only hosting with structured menu ingestion.
3. **Workspace navigation / choice order:** the sidebar presents capabilities where people expect them. It is not a technical dependency graph or a mandatory questionnaire. People can work in any order their *actual hard prerequisites* permit.

The optional guide should be **industry-aware** and context-sensitive rather than a static checklist copied from the engineering roadmap. When the user has a source document, prefer an import-and-review journey over repetitive manual entry. When they have none, offer manual creation. The next suggestion should reflect what is already present and what they want to accomplish, not simply the first incomplete database field. Guide, never trap.

### Cross-industry hypothesis for FireUX Ignite

Test the **same architecture and flow** against different industries; do not pretend they have all been implemented:

- Kitchen / Misebox: upload an existing menu → review extracted Items → build/review Menu, or create manually.
- Suppliers: upload an existing product catalogue → review Products / catalogue.
- Granite: import an existing portfolio → review its owned records and presentation.
- BuenoHost: import existing property information → review Properties and guest-facing information.
- Workbox: enter/import vacancies through the appropriate Jobs owner.

The examples above are **hypotheses**, not approved schemas, extraction pipelines or promises of deployed features. As with the hypothetical Stable used to test the filesystem, first prove the principle using the *same* example for structural layout and technical build order, then a different industry to test what is truly reusable. **Structure, engineering dependency order, human intake order and Workspace navigation are distinct.**

## What we verified in source

- `projects/misebox/misebox-app/app/pages/workspace/kitchen/index.vue` currently declares `requiresAuth: false` and `requiresSelection: false`. That proves route policy *declaration*, not a complete rendered anonymous visit.
- `projects/misebox/misebox-app/app/pages/index.vue` currently serves `LandingPublic` as the public Kitchens/Menus landing. Choosing to redirect `misebox.app/` to Workspace is **a separate product and SEO/discovery decision**, not approved by this handoff.
- `docs/reviews/2026-11-20-kitchen-core-independence.md` records the sparse Kitchen model, the unaffiliated directory contribution path, and the *management creation* paths that currently create both a Team record and a starter Menu. Those are implementation couplings to investigate, not reasons to introduce a compulsory guided setup.
- A Kitchen may show an optional linked Place identity. A Google Places account/search is **not** a prerequisite to starting from a name. The user's ownership/management grant is distinct from an optional employee Team roster entry.
- Some guest Menu Hosting paths require a `main` draft Menu. Keep that explicit downstream requirement intact; decouple generic Kitchen manifestation without deleting the guest Menu Hosting contract.

## Bounded implementation / review instructions (not yet approved)

After the Core reset and Workspace ownership gate, inspect the current Workspace entrance, demos, Kitchen creation, trusted command, grants, Place relationship and front-end empty state. Propose **the smallest vertical slice** showing a genuinely blank, unauthenticated Workspace and one first-intent Kitchen manifestation. Do not auto-persist a Kitchen just because a visitor opens a route. Decide how a save requests sign-in or a legitimate recoverable guest identity; never grant management through a public directory contribution.

Test: anonymous browsing; clearly read-only demo; no anonymous write by just visiting; first save/sign-in/resume; minimal Kitchen read/edit/reopen/switch; revoked/missing grants; optional Place attach after creation; zero Items/Menus/Services/Orders; optional guide can be dismissed; Menu Hosting still works with its specific starter Menu. Log whether checks are source review, automated tests, emulator journey or deployed acceptance. Clean filesystem/model coupling only after the minimal journey is proved.

Separately, ask Ignite to **record the learning as a reusable method**, linking to the human explanation instead of copying it into AI-specific docs. Do not implement a generic wizard engine, new generator, global registry or parallel graph service. Human documentation must be sufficient for a human developer; agent context should point to it and add nonduplicated authority/dependency cautions.

## Walking Bridge — request Codex status and answers, not execution

The reported bridge on Big Mac is installed, **polling GitHub read-only**, and had a passing local worker smoke test; the first *explicitly approved* handoff-to-publication run remains unverified. Read `tools/walking-bridge/README.md` and inspect the actual current status before claiming more.

Please report briefly:

1. Is the bridge still running on Big Mac, **read-only or armed**, and what is the last successful poll / actionable blocker? No need to alter the mode merely to answer.
2. Is it correct that a GitHub handoff commit alone **never approves work**, and that an exact current-main, top-level approval comment from the configured account plus `--armed` is required? What is the safest small **docs-only** first approved smoke handoff and exact scope? **Do not self-approve or arm the bridge.**
3. Where exactly will a successful run put its **GitHub completion comment and `docs/handoffs/results/` JSON**, and how can ChatGPT inspect it on a later turn? Distinguish GitHub/Mac notifications from an inbound **ChatGPT conversation ping**, which is not currently supported.
4. Is there any supported future notification integration actually connected, or are all “webhook pings to this conversation” still proposals? **Do not add webhook infrastructure or claim real-time delivery unless it can be verified.**
5. Are there concurrent local Codex tasks or branch changes that make an approval unsafe? Keep this handoff parked until the user explicitly chooses an implementation scope.

**Boundaries:** no App rewrite, unauthorised Firestore/Storage/Rules writes, deployments, provider changes, blanket source deletion or automatic bridge approval. No new Kitchen or demo data should be created merely by reading this handoff.

## References

- [Kitchen Core source audit](../reviews/2026-11-20-kitchen-core-independence.md)
- [Kitchen real-world build order](2026-11-20-kitchen-real-world-build-order.md)
- [Workspace ownership and composition](../concepts/workspace.md)
- [Entity Core and dependency-ordered Ignite](2026-11-20-entity-core-dependency-ordered-ignite.md)
- [Walking Bridge contract](../../tools/walking-bridge/README.md)
