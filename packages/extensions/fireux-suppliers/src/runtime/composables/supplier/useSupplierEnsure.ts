import type { ConsoleCreateMode } from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import { useSupplierCreate } from './useSupplierCreate'

export function useSupplierEnsure() {
  const { ensureSupplier } = useSupplierCreate()

  const ensure = async (
    id?: string | null,
    mode: ConsoleCreateMode = 'console'
  ) => {
    return ensureSupplier({
      existingRootId: id ?? null,
      mode,
    })
  }

  return { ensure }
}
