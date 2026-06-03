Authority: fireux-core public composable layer
Updated: 2026-06-03

# Public Composable Layer

`public/` is for guest-facing route helpers.

Use this layer when a public page needs shaping that does not belong in the stored Firestore stack, such as:
- public route availability
- published-only filtering
- route-specific view rows
- guest-facing SEO/view text
- combining multiple stored records for a public page

Do not put stored CRUD, selected console state, or demo scenario data here.

Layer split:
- `firestore/` owns stored data access.
- `console/` owns selected operator workspace behavior.
- `public/` owns guest/public route behavior.
- `demo/` owns fake scenario data.

Simple public index/detail pages may use `firestore/` directly until they need public-specific shaping.
