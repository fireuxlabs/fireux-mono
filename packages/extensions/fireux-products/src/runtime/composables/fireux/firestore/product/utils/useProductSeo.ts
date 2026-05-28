import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { ProductStorage, type Product } from '../../../../../models/product.model'

const clean = (value: unknown) => String(value ?? '').trim()
const excerpt = (value: unknown) => clean(value).replace(/\s+/g, ' ').slice(0, 180)

export function buildProductJsonLd(product: Partial<Product> | null | undefined) {
  const name = clean(product?.name)
  const slug = clean(product?.slug)
  if (!name || !slug || (product as any)?.visibility !== 'public') return null

  const amount = Number(product?.default_price?.unit_amount ?? 0)
  const currency = clean((product as any)?.default_price?.currency || (product as any)?.currency)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: excerpt(product?.tagline || product?.description || product?.content),
    image: clean(product?.main_image || product?.images?.[0]?.url) || undefined,
    offers: amount > 0
      ? {
          '@type': 'Offer',
          price: amount / 100,
          priceCurrency: currency || undefined,
          availability: product?.active === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        }
      : undefined,
  }
}

export function useProductSeo(product: MaybeRefOrGetter<Partial<Product> | null | undefined>) {
  const entry = computed(() => toValue(product))
  const slug = computed(() => clean(entry.value?.slug))
  const isPublic = computed(() =>
    Boolean((entry.value as any)?.visibility === 'public' && entry.value?.active !== false && slug.value)
  )

  return useSeo({
    title: computed(() => clean(entry.value?.name) || 'Product'),
    description: computed(() => excerpt(entry.value?.tagline || entry.value?.description || entry.value?.content || 'Product details.')),
    image: computed(() => clean(entry.value?.main_image || entry.value?.images?.[0]?.url)),
    path: computed(() =>
      slug.value ? `/${ProductStorage.collection}/${encodeURIComponent(slug.value)}` : ''
    ),
    robots: computed(() => (isPublic.value ? 'index, follow' : 'noindex, nofollow')),
    jsonLd: computed(() => buildProductJsonLd(entry.value)),
  })
}
