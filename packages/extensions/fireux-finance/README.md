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
generic Finance console and its presentation does not load data or infer
financial meaning.

Start at `AGENTS.md`, `docs/ai/gpt-context.md`, and
`docs/concepts/finance.md`. Import runtime contracts explicitly from
`fireux-finance/runtime/*`.
