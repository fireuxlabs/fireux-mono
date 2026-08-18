# Finance map

Updated: 2026-08-17
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
- Completed Orders retained from before this producer are historical Order
  evidence. Do not fabricate zero-value Sales or FinancialFacts when their
  canonical pricing cannot be reconstructed.

## Not producers yet

- Supplier catalogue `pack_cost_minor` is an offer term, not a purchase,
  receipt, invoice, inventory-consumption, or expense fact.
- Kitchen owns the future Purchasing operation and its purchase orders,
  deliveries, supplier invoices, and supplier payments. Its canonical Console
  route is `/console/kitchen/purchasing`. Supplier remains the referenced
  counterparty and may expose filtered supply options or links to Kitchen-owned
  purchasing records; `/console/kitchen/suppliers/*` does not own purchasing
  transactions. The Purchasing route remains hidden until those authoritative
  producers exist.
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

- The Restaurant labour-cost calculator is the first deterministic Finance ×
  Kitchen planning Tool. Kitchen owns the restaurant meaning and accepts only
  User-supplied sales, wages, employer costs, and other labour costs; Finance
  supplies neutral validated money. The pure calculator is shared by the
  public SEO Tool, Kitchen Team Tools, and the validated server adapter named
  `kitchen.finance.calculate-labour-cost`. It creates no payroll, paid-hours,
  expense, FinancialFact, or saved scenario truth. TeamAI and FinanceAI may
  declare the Tool, but conversational execution remains unavailable until
  the shared AI runtime supports validated structured Tool calls.

- Raw facts are not a browser collection API. Expose bounded server projections
  only after target access, period, currency, grouping, and query limits are
  explicit.
- The first projection is the Kitchen-owned `/console/kitchen/finance` sheet.
  Its authenticated `/api/console/kitchen/reports/gross-sales` endpoint queries
  only the selected Kitchen's immutable Sales for Today, the previous
  Monday-to-Sunday week, or an explicit inclusive owner-local date range. The
  trusted server resolves the Kitchen's effective timezone
  from its valid custom operation-hours override or its exact linked Place,
  then derives a from-inclusive, to-exclusive range of complete owner-local
  calendar days.
- The projection requires a valid App membership plus App-admin or Kitchen
  operator authority. It accepts at most 93 days and 5,000 Sales, fails rather
  than returning partial, oversized, or malformed totals. It returns
  reconciled period and owner-local daily aggregates grouped by currency:
  gross sales, completed-Sale count, average Sale, item quantity, item sales,
  delivery fees, and stable item rollups. It also returns a bounded
  transaction-summary row for each completed Sale: stable `kitchen_sale`
  source identity, occurrence time, operator order number, status, order
  type/channel, PII-free item labels/quantities/line amounts, item quantity,
  signed/gross amount, counterparty/summary, and the server-resolved public
  display name of the team member who closed the Sale. Raw actor ids, customer
  data, add-on detail, document paths, Orders, and FinancialFacts are not
  returned. Those rows reconcile to the same period totals.
- The current Console page is an operator-first transaction ledger.
  Its thin Dashboard route owns a secondary `UDashboardToolbar`: Today, This
  week, This month and Last 90 days update one authoritative range, while a
  compact `UPopover` trigger opens `UCalendar` for a custom range of at most 93
  days. When the selected source is Demo, a success marker identifies the
  simulation date and all presets anchor to that deterministic date; Live
  remains anchored to the actual Kitchen-local reporting date. The
  `.console-surface` body loads the bounded gross-sales projection and lists
  one row per completed Sale in a source-neutral activity ledger. One signed
  amount column uses `+` for incoming and reserves red `−` presentation for
  future outgoing entries; In, Out, and All controls filter direction without
  duplicating debit/credit columns. Each row can open a detail modal containing
  the bounded transaction-summary fields. Money out remains explicitly unavailable until
  a producing domain owns real outgoing transactions; the ledger does not
  invent costs or present missing data as zero.
- `KitchenFinanceSummary` is the Kitchen adapter over the shared Finance metric
  summary. It retains gross-sale semantics and completed-service labels while
  both Console and Product Demo reuse the same product-neutral layout and money
  formatter.
- Live period totals, calendar and day detail are derived only from the same
  bounded daily projection. Deanos Demo owns a deterministic Team fixture and
  a Kitchen-owned 180-day Service history. Each dated Service contains
  completed Orders with canonical Menu items/prices, contiguous service-local
  numbers, placed/completed Zurich timestamps, and stable closer ids.
  Finance derives one incoming transaction per Order with the same source id,
  service identity, dates, status, signed minor-unit CHF amount,
  counterparty/summary, closer, and line detail. From those transactions the
  Kitchen projector derives current/prior 7, 30, and 90-day totals, grouped
  trend points, best and quietest days, weekday averages, top items, and daily
  averages.
- The Deanos Orders operation reuses the latest three completed rows from that
  same series. Scenario composition fails closed unless their order identity,
  service, channel, item identity and quantities, total, and Team closer
  reconcile exactly with Finance.
- Completed sales are the only current Deanos Finance row family. Refunds have
  no Order-owned refund producer. Supplier catalogue offers are not deliveries,
  purchases, receipts, or invoices. Team membership is not rota/payroll. No
  dated rent producer exists. Finance therefore does not manufacture supplier
  invoice states, staff pay, recurring rent, expenses, wages, VAT, labour,
  cashflow, profit, or P&L rows.
- That ordered Demo series justifies the product-neutral
  `FinancialReportTrendView` presentation contract. The shared component uses
  native Vue/SVG and adds no React/Recharts or chart-library dependency.
- P&L, cashflow, and accounting-cost views are absent until the required
  producing domains exist. If introduced later they would be derived reports,
  not Console Operations or separately editable stored truth.
- A Demo Dish detail may show a read-only cost-of-sales planning estimate by
  expanding its current Spec through represented prep/recipe yields and the
  preferred Supplier offer terms. It must identify incomplete price coverage,
  exclude unrepresented labour, energy, tax, oil, and waste, and remain an
  estimate rather than a KitchenSale, expense, or FinancialFact. The pure
  Kitchen estimator is shared by the real Console adapter and presentation-only
  Demo projections so those surfaces cannot drift into competing arithmetic.
- A Product Demo may pair that estimate with sold quantities derived from the
  same completed Deanos Orders. Any displayed total sales must reconcile to
  those quantities and the resolved selling price and must not be presented as
  KitchenSales, FinancialFacts, or real customer performance. The surrounding
  source selection distinguishes Demo from Live; reusable Finance field labels
  remain source-agnostic.
- A Product Demo may also expose the separate Kitchen Finance report from the
  completed-Order-derived Demo projection. Console Demo and Product Demo share
  the Kitchen-owned transaction/average/minor-unit projectors, and the landing
  may keep a distinct Reports affordance while Finance remains in the Kitchen
  Operation catalogue.
- Kitchen Finance is a selected-Kitchen reporting Operation. There is no
  generic cross-entity Finance Console Operation in this pass; Suppliers,
  Projects, and Portfolios keep their own future producer operations.

## Current source

- `packages/extensions/fireux-finance/src/runtime/models/money.model.ts`
- `packages/extensions/fireux-finance/src/runtime/models/financial-fact.model.ts`
- `packages/extensions/fireux-finance/src/runtime/models/report-presentation.model.ts`
- `packages/extensions/fireux-finance/src/runtime/utils/money.ts`
- `packages/extensions/fireux-finance/src/runtime/components/Finance/ReportMetricSummary.vue`
- `packages/extensions/fireux-finance/src/runtime/components/Finance/ReportTrend.vue`
- `packages/extensions/fireux-finance/src/runtime/server/finance/financial-fact.ts`
- `scripts/guards/finance.mjs`
- `packages/extensions/fireux-kitchens/src/runtime/models/kitchen/order.model.ts`
- `packages/extensions/fireux-kitchens/src/runtime/models/kitchen/sale.model.ts`
- `packages/extensions/fireux-kitchens/src/runtime/models/kitchen/finance-report.model.ts`
- `packages/extensions/fireux-kitchens/src/runtime/server/kitchen/operations/orders/pricing.ts`
- `packages/extensions/fireux-kitchens/src/runtime/server/kitchen/operations/orders/sale.ts`
- `packages/extensions/fireux-kitchens/src/runtime/server/kitchen/operations/finance/gross-sales-report.ts`
- `packages/extensions/fireux-kitchens/src/runtime/server/kitchen/core/operator-access.ts`
- `packages/extensions/fireux-kitchens/src/runtime/server/api/console/kitchen/reports/gross-sales.get.ts`
- `packages/extensions/fireux-kitchens/src/config/module/server-config.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/console/kitchen/overview/useKitchenConsoleFinance.ts`
- `packages/extensions/fireux-kitchens/src/runtime/demo/kitchen/finance.ts`
- `packages/extensions/fireux-kitchens/src/runtime/demo/kitchen/operations/Orders/history.ts`
- `packages/extensions/fireux-kitchens/src/runtime/demo/kitchen/team.ts`
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
- `packages/extensions/fireux-kitchens/src/runtime/tools/team/restaurant-labour-cost.ts`
- `packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/Tools/RestaurantLabourCostCalculator.vue`
- `packages/extensions/fireux-kitchens/src/runtime/server/tools/calculate-restaurant-labour-cost.ts`
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
