import { usePublish } from '../../../../publishing/usePublish'
import { EcosystemStorage } from '../../../../../../models/core/ecosystem.model'
import { assertPublicSlug } from '../../../../../../utils/slug/validatePublicSlug'

export type EcosystemPublishInput = {
  id: string
  slug: string
  name?: string
}

const clean = (value: unknown) => String(value ?? '').trim()

export function useEcosystemPublish() {
  const { publish } = usePublish()

  async function publishEcosystem(input: EcosystemPublishInput) {
    const id = clean(input.id)
    const slug = await assertPublicSlug(input.slug, {
      label: 'Ecosystem slug',
      namespace: EcosystemStorage.collection,
      reservedScope: 'entity',
    })
    const name = input.name === undefined ? undefined : clean(input.name)

    if (!id) throw new Error('Ecosystem id is required before publishing.')
    if (!slug) throw new Error('Ecosystem slug is required before publishing.')
    if (input.name !== undefined && !name) {
      throw new Error('Ecosystem name is required before publishing.')
    }

    return publish({
      collectionPath: EcosystemStorage.collection,
      id,
      routePath: `/${EcosystemStorage.collection}/${encodeURIComponent(slug)}`,
      patch: {
        slug,
        status: 'active',
      },
    })
  }

  return {
    publishEcosystem,
  }
}
