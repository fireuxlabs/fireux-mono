import { validatePublicSlug as validateSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { usePublish } from 'fireux-core/runtime/composables/fireux/publishing/usePublish'
import { KitchenStorage } from '../../../../../models/kitchen.model'

export type KitchenPublishInput = {
  id: string
  slug: string
  displayName?: string
}

function clean(value: unknown) {
  return String(value ?? '').trim()
}

function assertKitchenPublishReady(input: KitchenPublishInput) {
  const id = clean(input.id)
  const slug = clean(input.slug)
  const displayName =
    input.displayName === undefined ? undefined : clean(input.displayName)

  if (!id) throw new Error('Kitchen id is required before publishing.')
  if (!slug) throw new Error('Kitchen slug is required before publishing.')
  if (input.displayName !== undefined && !displayName) {
    throw new Error('Kitchen display name is required before publishing.')
  }

  const result = validateSlug(slug, {
    label: 'Kitchen slug',
    reservedScope: 'root',
  })

  if (!result.isValid) {
    throw new Error(result.message || 'Kitchen slug is not valid.')
  }

  return {
    id,
    slug: result.slug,
  }
}

export function useKitchenPublish() {
  const { publish } = usePublish()

  async function publishKitchen(input: KitchenPublishInput) {
    const ready = assertKitchenPublishReady(input)
    const routePath = `/${KitchenStorage.rootCollection}/${encodeURIComponent(ready.slug)}`

    return publish({
      collectionPath: KitchenStorage.rootCollection,
      id: ready.id,
      routePath,
      patch: {
        show: true,
        slug: ready.slug,
      },
    })
  }

  return {
    publishKitchen,
  }
}
