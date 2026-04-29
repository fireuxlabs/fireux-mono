import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/console/useConsole'
import { useSupplierConsole } from './useSupplierConsole'

export function useSupplierConsoleIdentity() {
  const {
    selectedSupplier,
    selectedMode,
    supplierId,
    rootCollection,
    canWrite,
    clearSelectedSupplier,
  } = useSupplierConsole()

  const hello = computed(() => normalizeString(selectedSupplier.value?.hello))
  const debug = computed(() => ({
    mode: selectedMode.value,
    supplierId: supplierId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    hello: hello.value,
    selectedSupplier: selectedSupplier.value,
  }))

  return {
    selectedSupplier,
    selectedMode,
    supplierId,
    rootCollection,
    canWrite,
    clearSelectedSupplier,
    hello,
    debug,
  }
}

export type SupplierConsoleIdentityState = ReturnType<
  typeof useSupplierConsoleIdentity
>
