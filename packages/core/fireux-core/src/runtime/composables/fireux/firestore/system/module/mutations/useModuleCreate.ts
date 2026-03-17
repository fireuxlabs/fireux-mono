import type { Module } from '../../../../../../models/system/module.model'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'

export type ModuleCreateOptions = {
  collectionPath?: string
}

export type ModuleCreateInput = Omit<Module, 'created' | 'updated'>

const normalizeString = (value: unknown) => String(value || '').trim()

export function useModuleCreate(options: ModuleCreateOptions = {}) {
  const { setDocument } = useFirestoreCreate()
  const collectionPath = String(options.collectionPath || 'modules').trim() || 'modules'

  async function createModule(input: ModuleCreateInput): Promise<{ id: string }> {
    const id = normalizeString(input?.id)

    if (!id) {
      throw new Error('Module id is required')
    }

    const { id: _id, ...rest } = input
    const payload: Omit<Module, 'id' | 'created' | 'updated'> = {
      ...rest,
    }

    await setDocument(collectionPath, id, payload, {
      creator: true,
    })

    return { id }
  }

  return { createModule }
}