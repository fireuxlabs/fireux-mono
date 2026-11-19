import { computed, inject, provide, ref, watch, type InjectionKey } from 'vue'
import { useIngredientInterface } from '../../../../../ingredient/composables/useIngredientInterface'
import type { KitchenPrepIngredients } from '../../../../composables/workspace/prep/ingredients/state'
import { INGREDIENT_CATEGORY_OPTIONS } from '../../../../../ingredient/models/ingredient-taxonomy'

function createIngredientCatalogue(workspace: KitchenPrepIngredients) {
  const { ingredients, kitchenId, canWrite } = workspace
  const { pill } = useIngredientInterface()
  const query = ref('')
  const category = ref('all')
  const imageFilter = ref('all')
  const layout = ref<'grid' | 'list'>('list')
  const addOpen = ref(false)
  const failedImages = ref<Record<string, string>>({})
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .trim()
  const cards = computed(() =>
    ingredients.value
      .flatMap((ingredient) => {
        const card = pill(ingredient)
        if (!card) return []
        const id = ingredient.ingredient_id || ingredient.id
        return [
          {
            ...card,
            id,
            category: ingredient.category || 'uncategorised',
            hasImage: Boolean(
              card.imageUrl && failedImages.value[id] !== card.imageUrl
            ),
            to: `/workspace/kitchen/prep/ingredients/${encodeURIComponent(id)}`,
          },
        ]
      })
      .sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
      )
  )
  const categories = computed(() =>
    [
      ...INGREDIENT_CATEGORY_OPTIONS,
      {
        value: 'uncategorised',
        label: 'Uncategorised',
        icon: 'i-lucide-circle-help',
      },
    ]
      .map((option) => ({
        ...option,
        count: cards.value.filter((card) => card.category === option.value)
          .length,
      }))
      .filter((option) => option.count)
  )
  const categoryNavigation = computed(() => [
    {
      value: 'all',
      label: 'All ingredients',
      icon: 'i-lucide-grid-2x2',
      count: cards.value.length,
    },
    ...categories.value,
  ])
  const filtered = computed(() =>
    cards.value.filter(
      (card) =>
        (category.value === 'all' || card.category === category.value) &&
        (imageFilter.value !== 'missing' || !card.hasImage) &&
        (!normalize(query.value) ||
          normalize([card.title, ...card.aliases].join(' ')).includes(
            normalize(query.value)
          ))
    )
  )
  const page = ref(1)
  const pageSize = 40
  const pageCards = computed(() =>
    filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize)
  )
  watch([query, category, imageFilter, kitchenId], () => {
    page.value = 1
  })
  watch(
    () => filtered.value.length,
    (count) => {
      page.value = Math.min(
        page.value,
        Math.max(1, Math.ceil(count / pageSize))
      )
    }
  )
  const groups = computed(() =>
    categories.value
      .map((option) => ({
        ...option,
        cards: pageCards.value.filter((card) => card.category === option.value),
      }))
      .filter((group) => group.cards.length)
  )
  const visibleCount = computed(() => filtered.value.length)
  const hasFilters = computed(() =>
    Boolean(
      query.value || category.value !== 'all' || imageFilter.value !== 'all'
    )
  )
  function clearFilters() {
    query.value = ''
    category.value = 'all'
    imageFilter.value = 'all'
  }
  watch(kitchenId, () => {
    clearFilters()
    addOpen.value = false
    failedImages.value = {}
  })
  watch(canWrite, (allowed) => {
    if (!allowed) addOpen.value = false
  })
  return {
    query,
    category,
    imageFilter,
    layout,
    addOpen,
    failedImages,
    cards,
    categoryNavigation,
    groups,
    visibleCount,
    page,
    pageSize,
    hasFilters,
    clearFilters,
  }
}

const key: InjectionKey<ReturnType<typeof createIngredientCatalogue>> = Symbol(
  'IngredientCatalogue'
)

export function provideIngredientCatalogue(workspace: KitchenPrepIngredients) {
  const catalogue = createIngredientCatalogue(workspace)
  provide(key, catalogue)
  return catalogue
}

export function requireIngredientCatalogue() {
  const catalogue = inject(key)
  if (!catalogue) throw new Error('Ingredient catalogue is not available')
  return catalogue
}
