import type { Ecosystem } from '../../../../../../models/system/ecosystem.model'
import { normalizeSlug } from '../../../../../../utils/slug/normalizeSlug'
import { validateSlugFormat } from '../../../../../../utils/slug/validateSlugFormat'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'

export type EcosystemCreateOptions = {
  collectionPath?: string
}

export type EcosystemCreateInput = Omit<Ecosystem, 'created' | 'updated'>

const normalizeString = (value: unknown) => String(value || '').trim()

export function useEcosystemCreate(options: EcosystemCreateOptions = {}) {
  const { setDocument } = useFirestoreCreate()
  const collectionPath = String(options.collectionPath || 'ecosystems').trim() || 'ecosystems'

  async function createEcosystem(input: EcosystemCreateInput): Promise<{ id: string }> {
    const id = normalizeString(input?.id)
    const slug = normalizeSlug(input?.slug)
    const slugFormat = validateSlugFormat(slug, {
      required: true,
      minLength: 3,
      maxLength: 80,
      label: 'Ecosystem slug',
    })

    if (!id) {
      throw new Error('Ecosystem id is required')
    }

    if (!slugFormat.isValid) {
      throw new Error(slugFormat.message || 'Invalid ecosystem slug')
    }

    const { id: _id, ...rest } = input
    const payload: Omit<Ecosystem, 'id' | 'created' | 'updated'> = {
      ...rest,
      slug,
    }

    await setDocument(collectionPath, id, payload, {
      creator: true,
    })

    return { id }
  }

  return { createEcosystem }
}