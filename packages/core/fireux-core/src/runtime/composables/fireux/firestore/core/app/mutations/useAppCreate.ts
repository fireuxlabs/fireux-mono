import type { AppCreateInput } from 'fireux-core/runtime/models/core/app.model'
import { normalizeSlug, normalizeString } from '../../../../../../utils/slug/normalizeSlug'
import { validateSlugFormat } from '../../../../../../utils/slug/validateSlugFormat'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'

export type AppCreateOptions = {
  collectionPath?: string
}

export function useAppCreate(options: AppCreateOptions = {}) {
  const { setDocument } = useFirestoreCreate()
  const collectionPath = normalizeString(options.collectionPath || 'apps') || 'apps'

  async function createApp(input: AppCreateInput): Promise<{ id: string }> {
    const resolvedId = normalizeString(input?.id)
    const slug = normalizeSlug(input?.slug)
    const slugFormat = validateSlugFormat(slug, {
      required: true,
      minLength: 3,
      maxLength: 80,
      label: 'App slug',
    })

    if (!resolvedId) {
      throw new Error('App id is required')
    }

    if (!slugFormat.isValid) {
      throw new Error(slugFormat.message || 'Invalid app slug')
    }

    const payload = {
      ...input,
      slug,
    }

    await setDocument(collectionPath, resolvedId, payload, {
      creator: true,
    })

    return { id: resolvedId }
  }

  return { createApp }
}
