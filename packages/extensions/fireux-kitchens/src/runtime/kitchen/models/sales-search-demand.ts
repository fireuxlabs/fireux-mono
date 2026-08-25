export type KitchenSalesToolHypothesis = { id: `kitchen.finance.${string}`; label: string; layer: 'human' | 'ai-assisted' | 'compound'; purpose: string; inputs: readonly string[]; outputs: readonly string[]; evidence: readonly string[]; authority: string; approval: string; status: 'requested' }

export const kitchenSalesSearchDemand = {
  observedAt: '2026-08-23', geography: 'English-language web', language: 'English',
  question: 'What are Kitchen operators trying to do when they search for restaurant Sales reporting?',
  method: 'Current search results establish operator language. Official product guidance validates report jobs and terminology. FireUX capability claims remain bounded by the current KitchenSale producer and projection.',
  seeds: [
    { seed: 'restaurant daily Sales', queries: ['restaurant daily sales report', 'restaurant end of day sales report', 'restaurant sales summary', 'restaurant close of day report'] },
    { seed: 'item Sales', queries: ['restaurant item sales report', 'restaurant product mix report', 'best selling menu items report', 'restaurant sales by item'] },
    { seed: 'Sales trends', queries: ['restaurant sales comparison report', 'restaurant sales trends by day', 'week over week restaurant sales', 'restaurant sales by period'] },
    { seed: 'restaurant Sales analytics', queries: ['restaurant sales dashboard', 'restaurant average check report', 'restaurant order channel sales', 'restaurant sales performance report'] },
  ],
  clusters: [
    { id: 'daily', title: 'Close and understand one service date', operatorJob: 'Review completed Sales, gross Sales, completed-Sale count, average Sale, item quantity and item Sales for the Kitchen-local day.', evidenceQueries: ['restaurant daily sales report', 'restaurant close of day report'], interpretation: 'The current producer proves completed Order gross Sales only. Refunds, discounts, tax, tips, tenders and net Sales remain absent unless their owning producers exist.' },
    { id: 'ledger', title: 'Reconcile totals to completed transactions', operatorJob: 'Trace a period total back to its completed Sales, line quantities, channels, order numbers and accountable closers.', evidenceQueries: ['restaurant sales summary', 'restaurant item sales report'], interpretation: 'A bounded PII-free ledger makes the aggregation defensible without exposing Orders, customers, raw actor ids or FinancialFacts.' },
    { id: 'items', title: 'Understand what sold', operatorJob: 'Review stable item quantities and gross line Sales within the selected Kitchen and period.', evidenceQueries: ['restaurant product mix report', 'restaurant sales by item'], interpretation: 'Item rollups use captured Sale lines and stable source identities. Renamed or missing current catalogue items must not rewrite historical Sales.' },
    { id: 'compare', title: 'Compare equivalent periods', operatorJob: 'Compare the same bounded gross-Sales measures across complete owner-local periods.', evidenceQueries: ['week over week restaurant sales', 'restaurant sales by period'], interpretation: 'Comparisons preserve timezone, currency, range and metric semantics. A change explains what happened, not why it happened.' },
  ],
  validationSources: [
    { label: 'Square restaurant daily Sales guidance', url: 'https://squareup.com/help/us/en/article/8579-review-daily-sales-for-your-restaurant', note: 'Validates operator demand for daily Sales summaries, item/category breakdowns and comparable periods while showing why metric definitions matter.' },
    { label: 'Square item Sales reporting guidance', url: 'https://squareup.com/help/us/en/article/8363-view-item-category-and-modifiers-sales-reports', note: 'Validates period-bounded item quantity and Sales reporting with explicit filters and groupings.' },
    { label: 'Square close-of-day reporting guidance', url: 'https://squareup.com/help/us/en/article/6594-end-of-day-reporting-with-square-for-restaurants', note: 'Validates close-of-day Sales review as an operator job; FireUX does not claim unsupported payment, tip, refund or net-Sales fields.' },
  ],
  records: [
  {
    id: 'kitchen.finance.sale',
    label: 'Kitchen Sale',
    kind: 'owned',
    status: 'available',
    owner: 'Sales',
    authority: 'Immutable completed KitchenSale owns the captured gross Sale, item lines, quantities, currency and source identities.',
    facts: [
      'Sale and source Order identity',
      'completed time',
      'currency-safe gross amounts',
      'item quantities and captured prices',
      'channel, Menu and closer references'
    ],
    readBy: [ 'kitchen.finance.daily-sales-report', 'kitchen.finance.compare-periods' ],
    writtenBy: []
  },
  {
    id: 'kitchen.finance.sales-report',
    label: 'Sales report',
    kind: 'projection',
    status: 'available',
    owner: 'Sales',
    authority: 'The bounded server projection derives gross Sales measures without becoming another Sale or claiming net revenue, payment, cost or profit.',
    facts: [
      'Kitchen-local period',
      'currency-separated totals',
      'counts, averages and item rollups',
      'transaction reconciliation and exclusions'
    ],
    readBy: [ 'kitchen.finance.daily-sales-report', 'kitchen.finance.compare-periods' ],
    writtenBy: []
  }
],
  recordQuestions: ['Which Kitchen, owner-local timezone and inclusive date range define the report?', 'Which immutable completed KitchenSales are included and which historical Orders lack canonical Sales?', 'Which currency groups must remain separate?', 'Which exact gross-Sale, item-Sale, delivery-fee, quantity, count and average definitions are used?', 'Which transaction rows reconcile to each aggregate?', 'Which Menu, item, channel, order type and closer identities were captured at the Sale?', 'Which refunds, discounts, taxes, tips, payments or costs are absent rather than zero?', 'Is the selected period complete, bounded and within query limits?', 'Which comparison period uses equivalent calendar and metric semantics?', 'Which deduction is an observation versus an unsupported causal explanation?'],
  toolHypotheses: [
    { id: 'kitchen.finance.daily-sales-report', label: 'Restaurant Daily Sales Report', layer: 'ai-assisted', purpose: 'Read and explain one bounded Kitchen-local day of immutable completed Sales.', inputs: ['selected Kitchen', 'owner-local service date', 'authorized KitchenSale projection'], outputs: ['reconciled currency-grouped totals, item rollups and transaction summaries'], evidence: ['immutable KitchenSales and bounded server projection'], authority: 'The Tool reports gross Sales only and does not invent refunds, net Sales, tax, tips, payments, costs or profit.', approval: 'Read-only reporting needs no mutation approval; export or external sharing is separate.', status: 'requested' },
    { id: 'kitchen.finance.compare-periods', label: 'Sales Period Comparison', layer: 'ai-assisted', purpose: 'Compare equivalent bounded gross-Sales measures across two Kitchen-local periods.', inputs: ['selected Kitchen', 'two explicit periods', 'authorized complete projections'], outputs: ['currency-safe measure differences, trends and source scope'], evidence: ['same canonical KitchenSale measures for both periods'], authority: 'The Tool preserves timezone and metric definitions, avoids cross-currency totals and does not invent causes.', approval: 'Read-only comparison needs no mutation approval.', status: 'requested' },
  ] satisfies KitchenSalesToolHypothesis[],
  aiContract: {
    salesAI: ['Own Kitchen gross-Sales interpretation, bounded report semantics and Sales Tool specifications.', 'Use only immutable KitchenSales and their trusted server projection.', 'Keep stored Sale, report projection, comparison and deduction distinct.', 'Never invent refunds, net revenue, tax, tips, payment settlement, costs, profit or causal explanations.', 'Expose current Tools as requested until callable registration and AI verification exist.'],
    kitchenAI: ['Recognise Sales-reporting intent and delegate it to SalesAI.', 'Pass selected Kitchen, authorized period and context without copying Finance semantics.', 'Route cost or contribution questions to CostsAI rather than broadening Sales.', 'Discover real Tool availability through SalesAI registration and preserve export boundaries.'],
    activation: ['The current bounded gross-Sales reader remains reconciled and authorized.', 'Callable Tool adapters validate Kitchen, timezone, date range, currency and query limits.', 'Report metric names match the KitchenSale producer exactly.', 'Tool registration truthfully distinguishes the existing page from AI-callable availability.', 'Authorization, export policy, UI and end-to-end verification are complete.'],
  },
  conclusion: 'Sales owns bounded reporting over immutable completed KitchenSales. The current evidence proves gross Sales, counts, averages, quantities, item rollups, delivery fees and reconciled transaction summaries—not net revenue, payments, costs, profit or accounting.',
} as const
