# FireUX — Products & Revenue (Codex Thread)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Version: **v1**
Updated: 2026-02-07

Purpose:
- Define what we can sell and how to keep scope cash-first.
- Grounded in current repo reality (no invented features).

Primary context docs:
- `AI/gpt-chats/fireux-app.md`
- `AI/gpt-chats/fireux-fireux.md`
- `AI/gpt-chats/cleanbox-app.md`
- `AI/gpt-chats/misebox-app.md`
- `AI/gpt-chats/richies.md`

---

## 1. Current Reality
- Cash constraint is the driver: we need revenue soon.
- We sell working apps, not FireUX as an abstract platform.
- FireUX exists to ship/sell repeatable apps without burnout.

## 2. FireUX Sales Menu (Simple)
1. Branded business apps (primary)
2. Ecosystem memberships
3. Dedicated apps inside an ecosystem
4. White-label apps (later)
5. Custom client apps (controlled)
6. Paid add-ons (later)
7. Setup/onboarding services
8. Support/maintenance plans
9. Digital products (later)

## 3. Focus Cut (Next 3–6 Months)
- Anchor: Richie’s (real client app).
- Push: Cleanbox (fewer roles, clearer buyer).
- Keep Misebox slow and deliberate.
- Pricing: one setup fee + one monthly subscription.

## 4. FireUX App Role (Do Not Overbuild)
- FireUX app is a credibility surface, not the product.
- No pricing pages or dashboards unless a sale forces it.
- Repo truth: `projects/fireux/fireux-app/nuxt.config.ts` uses `fireux-products` + `fireux-blogs`.

## 5. Product Module Reality (Current Code)
- Product defaults are currently oriented around a FireUX App offer.
- Create flow defaults live in:
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/state/useCreateProductState.ts`
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/Prices/useCreatePricesState.ts`
- Stripe create endpoint exists at:
  - `packages/extensions/fireux-products/src/runtime/server/api/stripe/create-product.post.ts`

## 6. Ecosystem Baseline
- `fireux-fireux` baseline modules: `fireux-products`, `fireux-blogs`.
- Other extensions are opt-in by ecosystem/app.

#end
