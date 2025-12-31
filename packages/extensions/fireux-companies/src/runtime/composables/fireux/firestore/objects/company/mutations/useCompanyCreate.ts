import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import type { Company, CompanyCreateInput } from '../../../../../../models/objects/company.model.ts'

const COLLECTION_PATH = 'companies'

const newId = (prefix?: string) => {
  const uuid = globalThis.crypto?.randomUUID?.()
  const base = uuid ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`
  return prefix ? `${prefix}_${base}` : base
}

export function useCompanyCreate() {
  const { setDocument } = useFirestoreManager()

  const createCompany = async (input: CompanyCreateInput): Promise<string> => {
    const name = String(input?.name ?? '').trim()
    if (!name) throw new Error('[useCompanyCreate] name is required')

    const id = newId('company')

    await setDocument<Company>(
      COLLECTION_PATH,
      id,
      {
        id,
        name,
        website: input.website ?? null,
        logo_url: input.logo_url ?? null,
      },
      { raw: false }
    )

    return id
  }

  return { createCompany }
}
