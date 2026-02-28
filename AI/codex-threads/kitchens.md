# Kitchens Roadmap (FireUX)

Status: Active
Updated: 2026-02-28
Scope: roadmap only (actionable order). No scenarios or examples.

Phase 0 - Anchor and guardrails
- Choose the anchor scenario (one line product promise).
- Lock the MVP entity set (ingredient, recipe, kitchen, chef).
- Decide the route surface (for example /kitchen/*).
- Decide auth assumptions (public vs auth-only).
- Define the kitchen UI language (cards, lists, status chips).

Phase 0.5 - Test kitchen environment
- Treat test kitchens as the primary safe sandbox for console prototyping.
- Require explicit kitchen selection; no automatic fallback between real and test kitchens.
- Keep test-kitchens collection separate from kitchens; never merge silently.
- Surface clear UI labels when a test kitchen is active.
- Use test kitchens to validate flows without affecting real kitchens.

Phase 1 - MVP slice: ingredients and recipes
- Ingredients list with CRUD (name, unit, cost per unit).
- Recipe detail with ingredient rows and quantities.
- Basic cost and quantity summary (no edge cases).
- Clean, screenshot-ready UI; remove unfinished actions.

Phase 2 - Kitchen profile and team
- Kitchen profile page with core attributes and helper copy.
- Chef profile list under apps/{appId}/chefs.
- Role labels and responsibilities (no permissions system).

Phase 3 - Mise en place and prep lists
- Daily and weekly prep list view (group by station or recipe).
- Checklist state with simple completion tracking.
- Prep notes and owner assignment (single field).

Phase 4 - Menu and dish modeling
- Menu entity (active window, meal period, status).
- Dishes reference recipes; menus reference dishes.
- Read-only menu view with cost rollup.

Phase 5 - Inventory awareness (light)
- Ingredient stock field plus reorder threshold.
- Low-stock alerts (UI only, no automation).
- Optional supplier link placeholder (no ordering workflow).

Phase 6 - Station and service flow
- Station board (prep, line, pass) with status columns.
- Order and plate tickets as lightweight items (no full order system).
- Touch-friendly layout option for kitchen screens.

Phase 7 - Ordering and procurement (add-on)
- Supplier entities and purchase orders.
- Receiving log and variance tracking.
- Cost reconciliation tied to recipes and menus.

Phase 8 - Reporting and operational insights
- Food cost trends, waste tracking, prep variance.
- Menu profitability snapshot and prep time estimates.
- Exportable reports or shareable summaries.

Phase 9 - Ecosystem integrations
- Connect to fireux-products, fireux-places, fireux-companies.
- Tenant-level defaults and shared component recipes.
- Extension docs, runtime contract, and onboarding copy.

Phase 10 - Continuous improvement
- Tighten UI tokens, accessibility, and copy.
- Add guardrails based on real usage feedback.
- Ship small, high-signal slices; avoid platform creep.

Canon decision - ingredient identity
Rule:
- Ingredient identity is named by kitchen usage, not by supplier naming or taxonomy.

Implications:
- If prep, ordering, or costing differs, it is a different ingredient.
- Supplier SKUs map to ingredients; ingredients do not derive from SKUs.

Recent scan (2026-02-20):
- Commit 20b2754f updated kitchen console menu and dishes pages plus runtime kitchen helpers.

#end
