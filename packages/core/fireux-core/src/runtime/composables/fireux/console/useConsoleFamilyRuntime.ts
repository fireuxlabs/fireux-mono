import { useNuxtApp } from '#imports'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { normalizeConsoleFamily } from './useConsole'

const registryKey = Symbol.for('fireux.console-family-runtimes')

type RuntimeRegistry = Map<string, unknown>

/**
 * Creates one Console family runtime per Nuxt App request/client instance.
 * Every family surface consumes the same targets, selection, and resolved entity.
 */
export function useConsoleFamilyRuntime<TRuntime>(
  family: string,
  create: () => TRuntime
): TRuntime {
  const nuxtApp = useNuxtApp()
  const scope = nuxtApp as unknown as Record<PropertyKey, unknown>
  const registry = (scope[registryKey] ??= new Map()) as RuntimeRegistry
  const { appId } = useFireUXConfig()
  const key = `${appId}:${normalizeConsoleFamily(family)}`
  const current = registry.get(key) as TRuntime | undefined
  if (current) return current

  const runtime = create()
  registry.set(key, runtime)
  return runtime
}
