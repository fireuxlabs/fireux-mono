import type { AppCreateInput as AppCreatePayload } from 'fireux-core/runtime/models/core/app.model'
import { normalizeSlug } from '../../../../../../utils/slug/normalizeSlug'
import { validateSlugFormat } from '../../../../../../utils/slug/validateSlugFormat'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'

export type AppCreateOptions = {
  collectionPath?: string
}

export type CreateAppInput = AppCreatePayload & {
  id: string
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useAppCreate(options: AppCreateOptions = {}) {
  const { setDocument } = useFirestoreCreate()
  const collectionPath = normalizeString(options.collectionPath || 'apps') || 'apps'

  async function createApp(input: CreateAppInput): Promise<{ id: string }> {
    const id = normalizeString(input?.id)
    const slug = normalizeSlug(input?.slug)
    const slugFormat = validateSlugFormat(slug, {
      required: true,
      minLength: 3,
      maxLength: 80,
      label: 'App slug',
    })

    if (!id) {
      throw new Error('App id is required')
    }

    if (!slugFormat.isValid) {
      throw new Error(slugFormat.message || 'Invalid app slug')
    }

    const { id: _id, ...rest } = input
    const payload = {
      ...rest,
      slug,
    }

    await setDocument(collectionPath, id, payload, {
      creator: true,
    })

    return { id }
  }

  return { createApp }
}
