import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'
import {
  ModuleStorage,
  type Module,
  type ModuleCreateInput,
} from 'fireux-core/runtime/models/system/module.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useModuleCreate() {
  const { setDocument } = useFirestoreCreate()

  async function createModule(input: ModuleCreateInput): Promise<string> {
    const id = normalizeString(input.id)
    if (!id) {
      throw new Error('[fireux-core] module id is required.')
    }

    await setDocument<Partial<Module>>(ModuleStorage.collection, id, input, {
      creator: true,
      app: true,
    })

    return id
  }

  return {
    createModule,
  }
}
