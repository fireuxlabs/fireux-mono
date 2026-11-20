# Walking handoff — Workspace-first manifestation, industry-led setup, and bridge verification

**Date:** 2026-11-20
**Repository:** `fireuxlabs/fireux-mono` · `main`
**Status:** Operator product decisions + **read-only status request** for Codex. **Do not execute Kitchen or Ignite implementation from this handoff.**
**Related source-backed notes:** [Kitchen Core audit](../reviews/2026-11-20-kitchen-core-independence.md), [Kitchen parked build sequence](2026-11-20-misebox-kitchen-walking-parked.md), [dependency-ordered Ignite](2026-11-20-entity-core-dependency-ordered-ignite.md), [Core reset order](2026-11-20-fireux-core-reset-build-order.md), [Walking Bridge README](../../tools/walking-bridge/README.md).

## Agreed mental model

- **Entity:** the actual thing being managed (Kitchen, Stable, Property, Portfolio, Project, etc.).
- **Workspace:** the management environment and selected-Entity context, **not** another stored Entity.
- **Capabilities:** optional things the operator can do with that Entity, independently built and attached at real dependency points.
- An **empty Workspace** is useful before any Entity is selected or created. On first arrival the navigation can show available capabilities without fabricating saved data, automatically joining a team, or forcing a setup journey.

## Product experience: remove mandatory onboarding, keep optional guidance

1. A visitor enters the Kitchen Workspace without a questionnaire, an account requirement merely to preview, or a forced selection. A clean empty state can offer: **Explore demo**, **Manifest my Kitchen**, **Guide me through setup**. Demonstration Kitchen records must be clearly synthetic and safe; check existing real fixtures rather than assuming names/IDs.
2. **Manifest** is progressive. The user may begin from a simple provisional label (e.g. “My Kitchen 1”), rename it, optionally associate a Place later, and add capabilities in whatever order is allowed. A blank page view **must not create a persistent Kitchen or grant access**. Distinguish a local preview from the first authorized save; preserve recoverability and trusted mutation authority.
3. The setup guide is **optional and contextual**. The sidebar remains fully usable. The guide may present next tasks, explain prerequisites and offer skipping nonessential tasks; it must not declare a Kitchen unusable because optional features are absent.
4. **Do not mechanically expose engineering build order as a user checklist.** Engineering might prove independent Items before Menus, but a real chef's preferred first step may be **“Upload your menu”**, from which an assisted, reviewed workflow extracts candidate Items and composes a Menu. It must not silently persist fabricated Item data. This is a **product intention, not a claim an AI parser is implemented**. If no existing menu exists, manual Item entry remains possible.
5. Cross-industry intake examples: Supplier **upload a catalogue**; Granite **import a portfolio**; BuenoHost **add/import property information**; Workbox **add/import vacancies**. These are illustrative invitations, **not assertions of working import pipelines**. Ignite should recognise the operator's existing artefacts, then map them to actual owned records.
6. The guiding distinction is **dependency-first implementation; industry-led, operator-first input**. Document both. Use hypothetical Stable for (a) architecture and (b) dependency order, then a second dissimilar industry to test that the method generalizes. No need to build either sample App.

## Existing Kitchen reality and risks to preserve

- Canonical Kitchen model is already sparse. Existing management creation functions create a Team member and starter Menu; directory contribution can create a bare Kitchen but grants no management authority. Do not equate the latter with a working management Workspace.
- **Ownership/grant is separate from Team roster membership.** Review the role of automatic Team record creation; do not break permissions while decoupling it.
- Keep the explicit Menu Hosting/guest path requiring its current starter Menu working. Do not remove the starter Menu universally or rewrite all onboarding source at once.
- Misebox `/` is currently a public Kitchen/Menu directory, while `/workspace/kitchen` is an accessible no-selection entrance. Considering Workspace-first arrival does **not yet approve changing the public homepage**, public SEO, redirects or discovery.
- Finish the current **Core/User/App membership/optional Workspace** gate before any bounded Kitchen implementation. Then test a minimal managed Kitchen, followed by Items, then Menus, and independent branches.

## Codex — next interaction, status only

On **Big Mac Local**, do a **read-only diagnostic** and report succinctly (do not modify configuration, arm workers, approve a job or start other tasks):

1. Give the **current main SHA**, working-tree clean/dirty status, and whether the earlier Ecosystem completion is pushed. Tell us what slice the active Codex session is working on and whether it is idle or running; do not infer an interactive session from GitHub alone.
2. Run `node tools/walking-bridge/bridge.mjs status` if safe. Say whether the macOS LaunchAgent is loaded, **read-only vs armed**, the latest local claim/result and whether GitHub completion reporting has been independently demonstrated. If blocked, report the exact blocker without changing settings. Do not restart/arm without explicit operator approval.
3. Explain the **actual trigger**: the README requires a top-level approval comment on the current main commit, with `/fireux-walk <full-sha> <handoff-path> <scope-list>`, from the configured approver. A file push alone **does not authorize execution**. Determine whether this flow is configured and has passed a real end-to-end test; distinguish implementation, local test, monitoring and real production operation.
4. Clarify **notifications/webhooks**: has any genuine event-driven route been configured from GitHub to the user's phone or **this active ChatGPT conversation**, or are there only GitHub commit comments, macOS notifications and on-demand GitHub reads? An existing chat has no presumed inbound webhook endpoint. Do not claim a ping can reach ChatGPT without verified transport. If instant notification is impossible here, propose the smallest working user notification and GitHub completion check, not new infrastructure by default.
5. Check whether a separate FireUX App/documentation agent **actually exists**, not merely proposed; report status in one sentence. This remains independent from the Core reset.
6. Acknowledge these product decisions and point to the owning docs for future update. **Do not start Kitchen, Ignite, FireUX App redesign or provisioning code** on this status pass.

## Acceptance and continuation

Return a **short, pasteable report**: Core/App/Ecosystem/User checkpoint; bridge mode and trigger; real ping capability; agent existence; blockers and the **single next recommended bounded Core slice**. We will decide the next execution instruction together after reviewing it. No destructive writes, data migrations, Rules changes, deployments or speculative automation.

This handoff's GitHub commit is **documentation publication only**; no bridge approval has been issued by publishing it.
