import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  PropertyStorage,
  type Property,
  type PropertyCreateInput,
} from '../../../../../models/property.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePropertyCreate(
  options: { shape?: 'root' | 'overlay'; collectionPath?: string } = {}
) {
  const { setDocument } = useFirestoreCreate()
  const { appId } = useFireUXConfig()
  const collectionPath = () =>
    normalizeString(options.collectionPath) ||
    (options.shape === 'overlay'
      ? `${AppStorage.collection}/${normalizeString(appId)}/${PropertyStorage.overlayCollection}`
      : PropertyStorage.rootCollection)

  async function createProperty(input: PropertyCreateInput): Promise<string> {
    const name = normalizeString(input.identity?.name)
    const slug = normalizeSlug(normalizeString(input.slug) || name)
    const id = normalizeString(input.id) || slug

    if (!id) {
      throw new Error('[fireux-properties] property id is required.')
    }

    const payload: Partial<Property> = {
      ...input,
      slug,
      identity: {
        ...input.identity,
        name,
      },
    }

    await setDocument<Partial<Property>>(collectionPath(), id, payload, {
      creator: true,
      app: true,
    })

    return id
  }

  return {
    createProperty,
  }
}
