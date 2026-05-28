import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import {
  ModuleStorage,
  type Module,
  type ModuleUpdateInput,
} from 'fireux-core/runtime/models/system/module.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useModuleUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  async function updateModule(
    moduleId: string,
    patch: ModuleUpdateInput
  ): Promise<void> {
    const resolvedModuleId = normalizeString(moduleId)
    if (!resolvedModuleId) {
      throw new Error('[fireux-core] module id is required.')
    }

    await updateDocument<Module>(ModuleStorage.collection, resolvedModuleId, patch)
  }

  return {
    updateModule,
  }
}
