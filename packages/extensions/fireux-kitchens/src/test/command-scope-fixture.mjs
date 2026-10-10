import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { ref, watch, onScopeDispose } from 'vue'
const source = readFileSync(
  new URL(
    '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
const createScope = compileFunction(
  `${stripTypeScriptTypes(source)};return useCommandScope`,
  ['watch', 'onScopeDispose']
)
export function commandScopeDeps(deps) {
  const dispose = deps.onScopeDispose ?? deps.onBeforeUnmount ?? onScopeDispose
  return {
    useFireUXConfig: () => ({ appId: 'app' }),
    useUserSession: () => ({
      appUser: ref({ role: 'user', created: { at: 'one' } }),
      appPending: ref(false),
      appError: ref(null),
      appOutcome: ref('ready'),
    }),
    useKitchenAccess: () => ({ ids: ref([]), outcome: ref('ready') }),
    onScopeDispose: dispose,
    useCommandScope: createScope(watch, dispose),
    ...deps,
  }
}
