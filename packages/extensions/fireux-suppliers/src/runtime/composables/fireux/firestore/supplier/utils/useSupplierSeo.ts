import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { SupplierStorage, type Supplier } from '../../../../../models/supplier/Supplier.model'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => clean(value).replace(/\s+/g, ' ').slice(0, 180)

export function buildSupplierJsonLd(supplier: Partial<Supplier> | null | undefined) {
  const name = clean(supplier?.supplier_organization_name)
  const id = clean(supplier?.id)
  const state = clean(supplier?.state)
  if (!name || !id || !['public', 'official'].includes(state)) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    description: excerpt(supplier?.supplier_headline || supplier?.summary || supplier?.supplier_bio),
    image: clean(supplier?.supplier_image) || undefined,
  }
}

export function useSupplierSeo(supplier: MaybeRefOrGetter<Partial<Supplier> | null | undefined>) {
  const entry = computed(() => toValue(supplier))
  const id = computed(() => clean(entry.value?.id))
  const slug = computed(() => clean(entry.value?.slug))
  const state = computed(() => clean(entry.value?.state))
  const isPublic = computed(() =>
    Boolean(id.value && slug.value && ['public', 'official'].includes(state.value))
  )

  return useSeo({
    title: computed(() => clean(entry.value?.supplier_organization_name) || 'Supplier'),
    description: computed(() => excerpt(entry.value?.supplier_headline || entry.value?.summary || entry.value?.supplier_bio || 'Supplier details.')),
    image: computed(() => clean(entry.value?.supplier_image)),
    path: computed(() =>
      slug.value ? `/${SupplierStorage.collection}/${encodeURIComponent(slug.value)}` : ''
    ),
    robots: computed(() => (isPublic.value ? 'index, follow' : 'noindex, nofollow')),
    jsonLd: computed(() => buildSupplierJsonLd(entry.value)),
  })
}
