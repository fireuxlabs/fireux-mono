# Editorial evidence — 2 October 2026

Draft: article.md. Review draft only; no live publication, repository edits, provider calls or database reads/writes. Shared checkout remains under concurrent migration. Claims describe inspected source, not deployment.

## External attribution

https://www.martinfowler.com/eaaCatalog/serviceLayer.html — read through web tool on 2 October 2026. Title Service Layer; credits Randy Stafford, 5 March 2003. Article uses a short original paraphrase and links attribution; no direct quotation, copied diagram or endorsement claim.

## Repository source anchors

Paths below are relative to /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono.

- docs/ai/gpt-context.md and docs/concepts/fireux-mono.md: lower ownership and App/Ecosystem/Extension/Core relationships; Workspace is a surface; trusted commands; evidence scope.
- docs/concepts/product-language.md: Workspace → Capability → Tool → authorized command; presentation and domain ownership.
- docs/ai/misebox-context.md, sections Kitchen services, Shared sellable adoption, Confirmation-first customer orders: route and model routing; followed through source below rather than treated as release proof.
- packages/extensions/fireux-kitchens/src/runtime/kitchen/models/service.model.ts: stable named offering; enabled, menu_ids, hours, interactions. Hours are optional in the record shape, required where the ordering workflow demands them.
- packages/extensions/fireux-kitchens/src/runtime/menu/server/ordering/context.ts: owning Menu target, App/Kitchen/Place and currency context.
- packages/extensions/fireux-kitchens/src/runtime/menu/server/ordering/order-items.ts: published source Menus; matching enabled/unpaused service interaction; Dish identity; server price and add-on resolution; canonical variant/add-on IDs; sellable revision snapshot; subtotal.
- packages/extensions/fireux-kitchens/src/runtime/menu/server/ordering/schedule.ts: collection times accepted only from menuOrderTimeOptions; notice, interval, horizon and service hours.
- packages/extensions/fireux-kitchens/src/runtime/server/api/menus/[menuId]/orders.post.ts: current orchestration stays in HTTP handler; context → actor/channel → idempotent replay → prices → fulfilment → record → commit → optional pre-order WhatsApp. No claim all HTTP adapters are thin. Menu/service/pricing reads precede commit.
- packages/extensions/fireux-kitchens/src/runtime/menu/server/ordering/idempotency.ts: scoped reservation/request matching and transactional record creation. Key optional at handler; article says supports, never guarantees all submissions deduplicate.
- packages/extensions/fireux-kitchens/src/runtime/kitchen/server/operations/orders/service-sequence.ts: transactional operational numbering and order creation; operational service_id is separate from named kitchen_service_id.
- packages/extensions/fireux-kitchens/src/runtime/menu/server/ordering/payment-choice.ts: confirmation-first state and allowed methods; deferred remains unpaid; scheduled versus awaiting_preparation release; checkout conflict guard.
- packages/extensions/fireux-kitchens/src/runtime/kitchen/server/core/operator-access.ts: bearer account, admin/user/dev App membership, existing Kitchen and membership-bound access. In Order actions this happens BEFORE transaction; no revocation-atomicity claim.
- packages/extensions/fireux-kitchens/src/runtime/kitchen/server/operations/orders/actions.ts: executeKitchenOrderAction; lifecycle patch, Order/Sale/financial-fact writes in one runtime transaction; postcommit acceptance notification; error caught/logged without rollback.
- packages/extensions/fireux-kitchens/src/runtime/kitchen/server/operations/orders/customer-notification.ts: deterministic notification identity and create-if-absent in separate identity transaction. Applies only where customerUid exists; no email/SMS or delivered-message guarantee.

## Focused executable evidence

Ran node --test on these four existing files under packages/extensions/fireux-kitchens/src/test:
- confirmation-first-payment.test.mjs
- scheduled-pickup.test.mjs
- kitchen/menu-order-idempotency.test.mjs
- kitchen/order-completion-identity.test.mjs

Result: 29 passed, zero failures. Node emitted its experimental stripTypeScriptTypes warning. Tests use source harnesses/mocks; they are not browser, emulator, production Rules or live-provider verification. No typecheck/build needed for this outside-checkout prose draft; neither was run.

## Review caveats

1. Margherita CHF 13 + CHF 2 extra is explicitly illustrative. No live Menu, Bären configuration, named client, account ID or private commercial fact is published. Two units yield CHF 30 item subtotal; no claim about fees/tax policy.
2. User expressly requested discussing Misebox, FireUX, Daniel/deadon and Codex. Final public byline wording remains editorial review.
3. Diagram shows new confirmation-first customer path, not historical orders or Staff POS completeness. Current context says Staff POS has no customer payment-choice handoff. Do not broaden the example to POS/kiosk without another audit.
4. No assertion of automatic stock deductions, slot capacity, email/SMS, guest cross-device recovery, provider readiness, or repository-wide alignment.
5. Accepted development-open Rules remain independent of application command checks. Draft explicitly avoids security/shipping certification; publication must not turn the server-authority discussion into a claim of complete client security.
6. Existing audit at /Users/danielwatson/.codex/.chatgpt-projects/g-p-69832ced5e0c8191bcbc90dbde10482f/kitchen-spine-audit.md was navigation evidence. Its historical migration recommendations were not executed.
7. No applicable context maintenance edit was necessary for this prose artifact. Concurrent Project migration may change unrelated context; do not use this article as its acceptance.

Suggested metadata (not saved to Blog):
- Title: What a pizza order taught me about service layers
- Slug: pizza-order-service-layer
- Description: Following a pizza through Misebox shows how FireUX connects Workspaces, Tools and trusted commands—and where transactions and external effects separate.
- Status: Draft, requires human editorial review.
