import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { IngredientStorage, type Ingredient } from '../../../models/ingredient.model.ts'

const clean = (value: unknown) => String(value ?? '').trim()

export function buildIngredientJsonLd(ingredient: Partial<Ingredient> | null | undefined) {
  const name = clean(ingredient?.name)
  const id = clean(ingredient?.id)
  if (!name || !id || (ingredient as any)?.status !== 'active') return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: clean(ingredient?.image_url) || undefined,
  }
}

export function useIngredientSeo(ingredient: MaybeRefOrGetter<Partial<Ingredient> | null | undefined>) {
  const entry = computed(() => toValue(ingredient))
  const id = computed(() => clean(entry.value?.id))
  const isPublic = computed(() =>
    Boolean((entry.value as any)?.status === 'active' && id.value)
  )

  return useSeo({
    title: computed(() => clean(entry.value?.name) || 'Ingredient'),
    description: computed(() => {
      const category = clean((entry.value as any)?.category)
      return category
        ? `${clean(entry.value?.name) || 'Ingredient'} · ${category}`
        : 'Ingredient details.'
    }),
    image: computed(() => clean(entry.value?.image_url)),
    path: computed(() =>
      id.value ? `/${IngredientStorage.collection}/${encodeURIComponent(id.value)}` : ''
    ),
    robots: computed(() => (isPublic.value ? 'index, follow' : 'noindex, nofollow')),
    jsonLd: computed(() => buildIngredientJsonLd(entry.value)),
  })
}
