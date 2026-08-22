import { assertPublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { usePublish } from 'fireux-core/runtime/composables/fireux/publishing/usePublish'
import { ProductStorage } from '../../../utils/product.ts'

export type ProductPublishInput = {
  slug: string
  name?: string
}

function clean(value: unknown) {
  return String(value ?? '').trim()
}

export function useProductPublish() {
  const { publish } = usePublish()

  async function publishProduct(input: ProductPublishInput) {
    const slug = await assertPublicSlug(input.slug, {
      label: 'Product slug',
      namespace: ProductStorage.collection,
      reservedScope: 'entity',
    })
    const name = input.name === undefined ? undefined : clean(input.name)

    if (!slug) throw new Error('Product slug is required before publishing.')
    if (input.name !== undefined && !name) {
      throw new Error('Product name is required before publishing.')
    }

    return publish({
      collectionPath: ProductStorage.collection,
      id: slug,
      routePath: `/${ProductStorage.collection}/${encodeURIComponent(slug)}`,
      patch: {
        slug,
        visibility: 'public',
        active: true,
      },
    })
  }

  return {
    publishProduct,
  }
}
