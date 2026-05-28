import { useFirestoreDelete } from '../../../operations/useFirestoreDelete'
import { ModuleStorage } from 'fireux-core/runtime/models/system/module.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useModuleDelete() {
  const { deleteDocument } = useFirestoreDelete()

  async function deleteModule(moduleId: string): Promise<void> {
    const resolvedModuleId = normalizeString(moduleId)
    if (!resolvedModuleId) {
      throw new Error('[fireux-core] module id is required.')
    }

    await deleteDocument(ModuleStorage.collection, resolvedModuleId)
  }

  return {
    deleteModule,
  }
}
