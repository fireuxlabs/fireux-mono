# Finance map

Updated: 2026-07-27
Ref: 1e55eece7
Role: map, not canon

## Purpose
Map the shared financial-fact boundary without turning domain operations or
reports into one generic Finance console.

## Authority and ownership

- `packages/extensions/fireux-finance` owns reusable money validation and
  formatting, deterministic FinancialFact identity, the minimal fact model,
  and product-neutral report metric and trend presentation.
- Producing domains own their operation, named record, authorization, and
  transaction. Finance imports FireUX Core only; domains depend on Finance.
- App-scoped FinancialFacts live at
  `apps/{appId}/financial-facts/{factId}` and are server-only in the current
  Firestore contract.
- Current implementation truth is the package source, Kitchen completion
  transaction, Misebox Rules template, rendered Rules artifact, and security
  test gate linked below.

## Family checkpoint

- Family: explicit-import extension library plus domain adapters.
- Nearest presentation sibling: the shared Card family. Finance report
  presentation is likewise dumb and view-model-driven, but remains a distinct
  metric-summary family rather than a Card.
- Nearest record sibling: Core `AppEvent` for an App-scoped immutable record
  with deterministic identity and source/actor timestamps.
- `FinancialMoney` is a primitive. `KitchenSale` and `FinancialFact` are
  parent-owned records, not entities. Neither has an independent mutable
  lifecycle, public route, collection stack, or direct Console surface. The
  Kitchen Finance sheet is a derived report over Sales, not a record editor.
- `FinancialReportMetricSummaryView`, `FinancialReportTrendView`, and their
  Finance presentation components accept already-labelled display values.
  Producing domains own those labels, report semantics, states, queries, and
  authorization.

## Current fact contract

- `id`: deterministic hash of schema version, App, fact kind, and source path.
- `schema_version`: currently `1`.
- `app_id`, `kind`, `subject`, and exact `source` lineage.
- safe integer `amount_minor` plus uppercase ISO `currency_code`.
- `occurred_at`, `recorded_at`, and a user/system actor.
- no mutable status, update stamp, label, account, budget, tax, payment, or P&L
  field. Corrections must be new facts after a correction lifecycle is proven;
  source facts are never rewritten.

## First proven producer

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

## Not producers yet

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

## Reporting and Console boundary

- Raw facts are not a browser collection API. Expose bounded server projections
  only after target access, period, currency, grouping, and query limits are
  explicit.
- The first projection is the Kitchen-owned `/console/kitchen/finance` sheet.
  Its authenticated `/api/console/kitchen/reports/gross-sales` endpoint queries
  only the selected Kitchen's immutable Sales for the selected 7, 30, or
  90-day period. The trusted server resolves the Kitchen's effective timezone
  from its valid custom operation-hours override or its exact linked Place,
  then derives a from-inclusive, to-exclusive range of complete owner-local
  calendar days.
- The projection requires a valid App membership plus App-admin or Kitchen
  operator authority. It accepts at most 93 days and 5,000 Sales, fails rather
  than returning partial, oversized, or malformed totals. It returns
  reconciled period and owner-local daily aggregates grouped by currency:
  gross sales, completed-Sale count, average Sale, item quantity, item sales,
  delivery fees, and stable item rollups. It exposes no raw Sale or Order ids,
  customer data, actors, add-on detail, or raw FinancialFacts.
- The current UI offers 7, 30, and 90-day periods with a currency-safe metric
  summary, current-period trend, owner-local calendar, selected-day item
  detail, and a bounded period roundup. Live mode uses only the authenticated
  server projection; a missing daily bucket inside its complete range is zero
  completed sales, not invented history. Demo mode may use clearly labelled,
  deterministic, aggregate-only owner-local fixtures that never become
  KitchenSales, FinancialFacts, Firestore records, or Test data. Test remains
  the simulation database and does not fall back to Demo values. The UI never
  combines currencies.
- `KitchenFinanceSummary` is the Kitchen adapter over the shared Finance metric
  summary. It retains gross-sale semantics and completed-service labels while
  both Console and Product Demo reuse the same product-neutral layout and money
  formatter.
- Live current-period trend, calendar, day detail, and roundup are derived only
  from the same bounded daily projection. Deanos Demo owns one deterministic
  180-day daily aggregate series with reconciled item rollups, from which its
  Kitchen projector derives current/prior 7, 30, and 90-day totals, grouped
  trend points, best and quietest days, weekday averages, top items, and daily
  averages.
- That ordered Demo series justifies the product-neutral
  `FinancialReportTrendView` presentation contract. The shared component uses
  native Vue/SVG and adds no React/Recharts or chart-library dependency.
- P&L, cashflow, cost, and period views are derived reports. They are not
  Console Operations and are not separately editable stored truth.
- A Demo Dish detail may show a read-only cost-of-sales planning estimate by
  expanding its current Spec through represented prep/recipe yields and the
  preferred Supplier offer terms. It must identify incomplete price coverage,
  exclude unrepresented labour, energy, tax, oil, and waste, and remain an
  estimate rather than a KitchenSale, expense, or FinancialFact. The pure
  Kitchen estimator is shared by the real Console adapter and presentation-only
  Demo projections so those surfaces cannot drift into competing arithmetic.
- A Product Demo may pair that estimate with explicitly fictional owner-local
  Dish quantity fixtures. Any displayed total sales must be derived exactly
  from the fixture quantity and resolved selling price and must not be
  presented as Orders, KitchenSales, FinancialFacts, or real customer
  performance. The surrounding source selection distinguishes Demo from Live;
  reusable Finance field labels remain source-agnostic.
- A Product Demo may also expose the separate Kitchen Finance report from the
  explicit aggregate-only Demo fixture. Console Demo and Product Demo share
  the Kitchen-owned average/minor-unit projector, and the landing keeps the
  report under a distinct Reports affordance rather than adding Finance to the
  Kitchen operation catalogue.
- There is no generic Finance Console Operation in this pass. Kitchens keep
  Kitchen operations; Suppliers, Projects, and Portfolios keep their own future
  producer operations.

## Current source

- `packages/extensions/fireux-finance/src/runtime/models/money.model.ts`
- `packages/extensions/fireux-finance/src/runtime/models/financial-fact.model.ts`
- `packages/extensions/fireux-finance/src/runtime/models/report-presentation.model.ts`
- `packages/extensions/fireux-finance/src/runtime/utils/money.ts`
- `packages/extensions/fireux-finance/src/runtime/components/Finance/ReportMetricSummary.vue`
- `packages/extensions/fireux-finance/src/runtime/components/Finance/ReportTrend.vue`
- `packages/extensions/fireux-finance/src/runtime/server/financial-fact.ts`
- `scripts/guards/finance.mjs`
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
- `packages/extensions/fireux-kitchens/src/runtime/demo/kitchen/finance.ts`
- `packages/extensions/fireux-kitchens/src/runtime/utils/kitchen/demo-finance.ts`
- `packages/extensions/fireux-kitchens/src/runtime/utils/kitchen/dish-finance.ts`
- `packages/extensions/fireux-kitchens/src/runtime/utils/kitchen/demo-dishes.ts`
- `packages/extensions/fireux-kitchens/src/runtime/demo/kitchen/operations/Dishes/finance.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDishFinance.ts`
- `packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Overview/Finance.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/FinanceSummary.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/FinanceTrend.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/FinanceCalendar.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/FinanceDayDetail.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/FinanceRoundup.vue`
- `packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Operations/Dishes/Finance.vue`
- `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/finance.vue`
- `packages/extensions/fireux-kitchens/src/runtime/server/api/console/kitchen/orders/transition.post.ts`
- `packages/extensions/fireux-kitchens/src/runtime/server/api/menus/payments/stripe-webhook.post.ts`
- `packages/extensions/fireux-kitchens/src/runtime/server/api/menus/[menuId]/orders/[orderId]/checkout-session.post.ts`
- `packages/ecosystem/fireux-misebox/src/config/firebase/firestore.template.rules`
- `scripts/firebase/misebox/firestore.rules`
- `scripts/deploy-misebox-firestore-rules.mjs`

## Refresh and verification

- Re-read the Finance model/builders and each producing domain transaction.
- Confirm the current Firestore database edition and composed Rules ownership
  before changing storage or access.
- Run Finance and Kitchen focused typechecks/builds, Rules rendering drift
  checks, Misebox Rules compile/security tests, the repository guard, and
  `git diff --check` in proportion to the change.
- Update this map in the same change when fact ownership, storage, authority,
  producer semantics, or the reporting boundary changes. Keep rollout state,
  chat history, and speculative adapters out.
