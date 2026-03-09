import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { NavItem } from '../../../../../types/nav'

type ScopeConsoleOptions<
  TRuntime,
  TStats extends Record<string, unknown>,
  TActions extends Record<string, unknown>,
  TExtra extends Record<string, unknown>,
> = {
  runtime: TRuntime
  navItems?: MaybeRefOrGetter<NavItem[]>
  stats?: MaybeRefOrGetter<TStats>
  actions?: TActions
  extra?: TExtra
}

/**
 * Shared console wrapper factory.
 * Keeps per-scope console composables thin while preserving named public APIs.
 */
export function createScopeConsole<
  TRuntime,
  TStats extends Record<string, unknown> = Record<string, never>,
  TActions extends Record<string, unknown> = Record<string, never>,
  TExtra extends Record<string, unknown> = Record<string, never>,
>(options: ScopeConsoleOptions<TRuntime, TStats, TActions, TExtra>) {
  const navItems = computed<NavItem[]>(() => toValue(options.navItems) ?? [])
  const stats = computed<TStats>(() => (toValue(options.stats) ?? {}) as TStats)
  const actions = (options.actions ?? {}) as TActions
  const extra = (options.extra ?? {}) as TExtra

  return {
    runtime: options.runtime,
    navItems,
    stats,
    actions,
    ...extra,
  }
}
