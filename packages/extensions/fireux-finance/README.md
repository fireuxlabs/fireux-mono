# FireUX Finance

Updated: 2026-07-27
Ref: 1e55eece7
Role: package router, not canon

Product-neutral Finance primitives for FireUX products:

- validated minor-unit money and locale-aware formatting;
- immutable FinancialFact identity/model and trusted server builders;
- typed, view-model-driven report metric and trend presentation.

Producing domains continue to own their operations, records, authorization,
transactions, report queries, labels, and adapters. This package does not own a
generic Finance workspace and its presentation does not load data or infer
financial meaning.

See the [Finance concept map](../../../docs/concepts/finance.md) for relationships with producing domains. Import runtime contracts explicitly from
`fireux-finance/runtime/*`.

## Operational default currency

The operating Entity owns its optional default currency. Place can suggest an
initial value for confirmation. Changing the default neither converts nor
redenominates existing records. Where a record stores a bare price, preserve
its denomination before changing the default. Prices, reservations, valuations,
and financial facts retain their own money contracts.

Kitchen Menu creation and presentation still read currency from the linked
Place. See the [Menu creation command](../fireux-kitchens/src/runtime/menu/server/records/create.ts).
Changing that dependency or existing records needs its own migration and
verification.
