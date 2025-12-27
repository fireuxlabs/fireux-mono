# Dashboard Overview (temp)

Scope: http://localhost:3000/dashboard

This doc is for the *dashboard overview page* (the “Overview” tab).
It is intentionally separate from user-profile editing.

---

## 1) Page + composition

Page:
- packages/core/fireux-core/src/runtime/pages/dashboard/index.vue

The page renders three layers in order:
1) Core overview (FireUX-wide)
2) Ecosystem overview (e.g. FireUX / Misebox / Cleanbox)
3) App overview (e.g. fireux-app / tenant / niederhorn)

As of the restructuring, each layer is future-proofed under an `overview/` path segment.

---

## 2) Component resolution (what should render)

Core (always from fireux-core):
- packages/core/fireux-core/src/runtime/components/dashboard/overview/Core.vue

Ecosystem (overridden by the active ecosystem package when available):
- packages/core/fireux-core/src/runtime/components/dashboard/overview/Ecosystem.vue (fallback)
- packages/ecosystem/<ecosystem>/src/runtime/components/dashboard/overview/Ecosystem.vue (override)

App (overridden by the active app when available):
- packages/core/fireux-core/src/runtime/components/dashboard/overview/App.vue (fallback)
- projects/<ecosystem>/<app>/app/components/Dashboard/overview/App.vue (override)

We currently keep a visible marker in each component like:
- "Component: DashboardOverview…" 
so it’s obvious which component is being used.

---

## 3) What belongs in Overview (rules)

Overview should answer:
- “What’s my status right now?”
- “What should I do next?”
- “What changed recently?”

Keep it lightweight:
- small stats, small previews, a few calls-to-action
- no deep settings/editor UIs (those live elsewhere)

---

## 4) Data sources (allowed)

Core user doc:
- /users/{uid}

App membership overlay:
- /apps/{appId}/users/{uid}

Apps list:
- /apps collection

Logo priority used by dashboard ecosystem lists:
1) per-user overrides in user.apps (untyped override bucket)
2) branding URLs on /apps/{appId}

---

## 5) Next planned steps (overview-first)

Near-term (overview):
- Confirm the correct component renders for each ecosystem and app.
- Keep the marker text while wiring is being validated.
- Only after wiring is correct, start implementing the actual overview content.
