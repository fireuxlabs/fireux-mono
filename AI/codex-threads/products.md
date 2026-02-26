# FireUX - Products and Revenue (Codex)

Updated: 2026-02-26
Scope: implementation details for products, pricing, and licensing.

Key surfaces:
- packages/extensions/fireux-products/src/runtime/components/organisms/Product/CTA.vue
- packages/extensions/fireux-products/src/runtime/pages/admin/licenses/index.vue
- packages/extensions/fireux-products/src/runtime/pages/products/index.vue

Guardrails:
- Keep create and checkout flows explicit; avoid hidden defaults.
- Prefer shared modal/confirm patterns over browser confirm.
- Keep licensing admin isolated from public product pages.

Recent scan (2026-02-20):
- Commit 20b2754f updated Product CTA and admin licenses page.

#end
