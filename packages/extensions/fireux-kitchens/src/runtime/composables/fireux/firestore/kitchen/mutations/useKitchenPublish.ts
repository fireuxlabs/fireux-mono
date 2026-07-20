// Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: publish Kitchen directory visibility through the canonical sparse Kitchen mutation.
import { validatePublicSlug as validateSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import { useKitchenUpdate } from './useKitchenUpdate'

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
  const { updateKitchen } = useKitchenUpdate()

  async function publishKitchen(input: KitchenPublishInput) {
    const ready = assertKitchenPublishReady(input)
    const routePath = `/${KitchenStorage.rootCollection}/${encodeURIComponent(ready.slug)}`

    await updateKitchen(ready.id, {
      slug: ready.slug,
      'visibility.show': true,
    })

    return { id: ready.id, routePath }
  }

  async function unpublishKitchen(kitchenId: unknown) {
    const id = clean(kitchenId)
    if (!id) throw new Error('Kitchen id is required before hiding it.')

    await updateKitchen(id, {
      'visibility.show': false,
    })

    return { id }
  }

  return {
    publishKitchen,
    unpublishKitchen,
  }
}
