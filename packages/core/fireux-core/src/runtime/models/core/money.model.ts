/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Model support
 * Storage: shared runtime model support, not a persisted entity
 * Used by: stored models that need simple currency display preferences
 *
 * Decision note:
 * - Currency display format is a shared primitive.
 * - Domain models may compose it, but should not own one-off copies.
 */
export type CurrencyDisplayFormat = 'dash' | 'symbol' | 'code'
