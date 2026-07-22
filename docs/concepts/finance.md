Finance map

<!-- Concurrent edit — 2026-07-21 16:41 CEST — FireUX Finance pass: map product-neutral facts, domain producers, and derived reporting. -->
<!-- Concurrent edit — 2026-07-21 17:11 CEST — Kitchen Finance surface: map the first bounded gross-sales projection. -->
<!-- Concurrent edit — 2026-07-22 12:47 CEST — Shared Job spine alignment: classify validated compensation as an offer term, not a fact. -->

Updated: 2026-07-22
Ref: 1e55eece7
Role: map, not canon

Purpose:
Map the shared financial-fact boundary without turning domain operations or
reports into one generic Finance console.

Authority and ownership:

- `packages/extensions/fireux-finance` owns reusable money validation,
  deterministic FinancialFact identity, and the minimal fact model.
- Producing domains own their operation, named record, authorization, and
  transaction. Finance imports FireUX Core only; domains depend on Finance.
- App-scoped FinancialFacts live at
  `apps/{appId}/financial-facts/{factId}` and are server-only in the current
  Firestore contract.
- Current implementation truth is the package source, Kitchen completion
  transaction, Misebox Rules template, rendered Rules artifact, and security
  test gate linked below.

Family checkpoint:

- Family: explicit-import extension library plus domain adapters.
- Nearest package sibling: `fireux-translation` for a module with no registered
  runtime UI; Finance's accepted delta is explicit model, utility, and trusted
  server helpers.
- Nearest record sibling: Core `AppEvent` for an App-scoped immutable record
  with deterministic identity and source/actor timestamps.
- `FinancialMoney` is a primitive. `KitchenSale` and `FinancialFact` are
  parent-owned records, not entities. Neither has an independent mutable
  lifecycle, public route, collection stack, or direct Console surface. The
  Kitchen Finance sheet is a derived report over Sales, not a record editor.

Current fact contract:

- `id`: deterministic hash of schema version, App, fact kind, and source path.
- `schema_version`: currently `1`.
- `app_id`, `kind`, `subject`, and exact `source` lineage.
- safe integer `amount_minor` plus uppercase ISO `currency_code`.
- `occurred_at`, `recorded_at`, and a user/system actor.
- no mutable status, update stamp, label, account, budget, tax, payment, or P&L
  field. Corrections must be new facts after a correction lifecycle is proven;
  source facts are never rewritten.

First proven producer:

- Server-resolved menu prices are captured on every new Kitchen Order as an
  internally consistent minor-unit pricing snapshot.
- `ready -> completed` remains a Kitchen operator action.
- One transaction updates the Order, creates `KitchenSale` with the same id,
  and creates the deterministic App-level `gross_sale` FinancialFact using
  `transaction.create`.
- Stripe checkout and verified payment settlement re-read the Order in
  transactions, so delayed payment work cannot regress an advanced or
  completed Order after its Sale and fact exist.
- The Sale preserves PII-free Kitchen line and pricing detail. The shared fact
  preserves only product-neutral amount, currency, subject, lineage, and time.
- `gross_sale` is the truthful current name: Order data does not yet separate
  VAT or prove net revenue. Payment/deposit receipt is a different event.
- Orders created before the pricing snapshot cannot be completed through this
  producer without a separately reviewed migration; the runtime fails closed
  instead of guessing from line sums or payment deposits.

Not producers yet:

- Supplier catalogue `pack_cost_minor` is an offer term, not a purchase,
  receipt, invoice, inventory-consumption, or expense fact.
- Job compensation reuses `FinancialMoney` plus an explicit hour/shift/day
  unit, but remains a mutable offer term. Publishing or closing a Job does not
  emit a FinancialFact.
- Property values and Portfolio rent fields are mutable terms, not dated facts.
- Core Project is FireUX control-plane identity, not a business-project finance
  lifecycle.
- Add adapters only when the owning package has a real authoritative operation.
  Cross-extension Project/Portfolio composition belongs in an ecosystem or app
  that owns both participants.

Reporting and Console boundary:

- Raw facts are not a browser collection API. Expose bounded server projections
  only after target access, period, currency, grouping, and query limits are
  explicit.
- The first projection is the Kitchen-owned `/console/kitchen/finance` sheet.
  Its authenticated `/api/console/kitchen/reports/gross-sales` endpoint queries
  only the selected Kitchen's immutable Sales for a from-inclusive,
  to-exclusive period, then returns aggregate totals grouped by currency.
- The projection requires a valid App membership plus App-admin or Kitchen
  operator authority. It accepts at most 93 days and 5,000 Sales, fails rather
  than returning partial or malformed totals, and exposes no Order lines,
  customer data, actors, source ids, or raw FinancialFacts.
- The current UI offers 7, 30, and 90-day periods with gross sales, completed
  Sale count, and average Sale. It does not synthesize Demo/Test or historical
  values, and it never combines currencies.
- P&L, cashflow, cost, and period views are derived reports. They are not
  Console Operations and are not separately editable stored truth.
- There is no generic Finance Console Operation in this pass. Kitchens keep
  Kitchen operations; Suppliers, Projects, and Portfolios keep their own future
  producer operations.

Current source:

- `packages/extensions/fireux-finance/src/runtime/models/money.model.ts`
- `packages/extensions/fireux-finance/src/runtime/models/financial-fact.model.ts`
- `packages/extensions/fireux-finance/src/runtime/utils/money.ts`
- `packages/extensions/fireux-finance/src/runtime/server/financial-fact.ts`
- `packages/extensions/fireux-kitchens/src/runtime/models/kitchen/order.model.ts`
- `packages/extensions/fireux-kitchens/src/runtime/models/kitchen/sale.model.ts`
- `packages/extensions/fireux-kitchens/src/runtime/models/kitchen/finance-report.model.ts`
- `packages/extensions/fireux-kitchens/src/runtime/server/kitchen/order/pricing.ts`
- `packages/extensions/fireux-kitchens/src/runtime/server/kitchen/order/sale.ts`
- `packages/extensions/fireux-kitchens/src/runtime/server/kitchen/sales/gross-sales-report.ts`
- `packages/extensions/fireux-kitchens/src/runtime/server/kitchen/operator-access.ts`
- `packages/extensions/fireux-kitchens/src/runtime/server/api/console/kitchen/reports/gross-sales.get.ts`
- `packages/extensions/fireux-kitchens/src/config/module/server-config.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/console/kitchen/overview/useKitchenConsoleFinance.ts`
- `packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Overview/Finance.vue`
- `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/finance.vue`
- `packages/extensions/fireux-kitchens/src/runtime/server/api/console/kitchen/orders/transition.post.ts`
- `packages/extensions/fireux-kitchens/src/runtime/server/api/menus/payments/stripe-webhook.post.ts`
- `packages/extensions/fireux-kitchens/src/runtime/server/api/menus/[menuId]/orders/[orderId]/checkout-session.post.ts`
- `packages/ecosystem/fireux-misebox/src/config/firebase/firestore.template.rules`
- `scripts/firebase/misebox/firestore.rules`
- `scripts/deploy-misebox-firestore-rules.mjs`

Refresh and verification:

- Re-read the Finance model/builders and each producing domain transaction.
- Confirm the current Firestore database edition and composed Rules ownership
  before changing storage or access.
- Run Finance and Kitchen focused typechecks/builds, Rules rendering drift
  checks, Misebox Rules compile/security tests, the repository guard, and
  `git diff --check` in proportion to the change.
- Update this map in the same change when fact ownership, storage, authority,
  producer semantics, or the reporting boundary changes. Keep rollout state,
  chat history, and speculative adapters out.
