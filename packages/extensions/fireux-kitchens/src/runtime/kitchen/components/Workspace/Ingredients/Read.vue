<template>
  <div class="grid min-w-0 gap-6">
    <WorkspaceKitchenCollectionHeader
      title="Ingredients"
      :kitchen-name="kitchenName"
    >
      <template #actions>
        <UButton
          v-if="canWrite"
          label="Create Ingredient"
          icon="i-lucide-plus"
          @click="addOpen = true"
        />
      </template>
    </WorkspaceKitchenCollectionHeader>

    <MoleculesStateCard
      v-if="loadError"
      state="error"
      title="Ingredients unavailable"
      :description="errorMessage"
      icon="i-lucide-triangle-alert"
    />
    <div
      v-else-if="pending"
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      aria-label="Loading ingredients"
      aria-busy="true"
    >
      <USkeleton v-for="n in 8" :key="n" class="h-56 rounded-2xl" />
    </div>
    <template v-else>
      <CollectionToolbar
        v-if="cards.length"
        v-model="query"
        label="ingredients"
        singular="ingredient"
        :count="visibleCount"
      >
        <template #controls>
          <div
            class="flex items-center gap-1"
            role="group"
            aria-label="Ingredient layout"
          >
            <UButton
              v-for="view in views"
              :key="view.value"
              :icon="view.icon"
              :aria-label="view.label"
              :aria-pressed="layout === view.value"
              color="neutral"
              :variant="layout === view.value ? 'soft' : 'ghost'"
              @click="layout = view.value"
            />
          </div>
        </template>
        <template #filters>
          <USelect
            v-model="category"
            :items="categoryNavigation"
            value-key="value"
            label-key="label"
            aria-label="Ingredient category"
            class="min-w-48"
          />
          <USelect
            v-model="imageFilter"
            :items="imageOptions"
            aria-label="Filter ingredient images"
            class="min-w-40"
          />
        </template>
      </CollectionToolbar>
      <div class="ingredient-catalogue-layout">
        <div class="min-w-0 flex-1 space-y-6">
          <div
            v-if="hasFilters && cards.length"
            class="flex items-center justify-between gap-3 text-sm"
            role="status"
            aria-live="polite"
          >
            <span class="text-muted"
              >{{ visibleCount }} of {{ cards.length }} ingredients</span
            >
            <UButton
              label="Clear filters"
              color="neutral"
              variant="link"
              size="sm"
              @click="clearFilters"
            />
          </div>

          <div v-if="groups.length" class="space-y-8">
            <section
              v-for="group in groups"
              :key="group.value"
              :aria-labelledby="`ingredients-${group.value}`"
              class="space-y-3"
            >
              <div class="flex items-center gap-2">
                <h2
                  :id="`ingredients-${group.value}`"
                  class="text-base font-semibold text-highlighted"
                >
                  {{ group.label }}
                </h2>
                <span class="text-xs tabular-nums text-dimmed">{{
                  group.cards.length
                }}</span>
              </div>
              <div
                :class="
                  layout === 'grid' ? 'ingredient-grid' : 'flex flex-col gap-2'
                "
              >
                <WorkspaceKitchenIngredientsCardsCell
                  v-for="card in group.cards"
                  :key="card.id"
                  :id="card.id"
                  :to="card.to"
                  :title="card.title"
                  :image-url="card.hasImage ? card.imageUrl : ''"
                  :icon="group.icon"
                  :category-label="group.label"
                  :variant="layout"
                  fluid
                  @image-error="failedImages[card.id] = card.imageUrl"
                />
              </div>
            </section>
          </div>
          <div
            v-else
            class="flex flex-col items-center rounded-2xl border border-dashed border-default px-6 py-16 text-center"
          >
            <div
              class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-elevated"
            >
              <UIcon
                :name="cards.length ? 'i-lucide-search' : 'i-lucide-carrot'"
                class="size-6 text-muted"
              />
            </div>
            <h2 class="text-lg font-semibold text-highlighted">
              {{
                cards.length
                  ? 'No matching ingredients'
                  : 'Start your ingredient library'
              }}
            </h2>
            <p class="mt-2 max-w-sm text-sm text-muted">
              {{
                cards.length
                  ? 'Try another name, category or image filter.'
                  : 'Choose the ingredients your kitchen uses from the shared catalogue.'
              }}
            </p>
            <UButton
              v-if="cards.length"
              label="Clear filters"
              color="neutral"
              variant="soft"
              class="mt-5"
              @click="clearFilters"
            />
            <UButton
              v-else-if="canWrite"
              label="Create Ingredient"
              icon="i-lucide-plus"
              class="mt-5"
              @click="addOpen = true"
            />
          </div>
        </div>
      </div>
      <UPagination
        v-if="visibleCount > pageSize"
        v-model:page="page"
        :total="visibleCount"
        :items-per-page="pageSize"
        :sibling-count="1"
        class="justify-center"
      />
    </template>

    <USlideover
      v-model:open="addOpen"
      title="Create Ingredient"
      description="Choose from the shared ingredient catalogue."
      :ui="{ content: 'sm:max-w-xl' }"
    >
      <template #body
        ><WorkspaceKitchenIngredientsWrite v-if="addOpen && canWrite"
      /></template>
    </USlideover>
    <DiagnosticsDebugPanel
      title="Kitchen ingredients"
      scope="workspace"
      object-origin="fetched"
      :objects="{ ingredients }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import CollectionToolbar from '../CollectionToolbar.vue'
import WorkspaceKitchenCollectionHeader from '../CollectionHeader.vue'
import { computed, ref, watch } from 'vue'
import { useIngredientInterface } from '../../../../ingredient/composables/useIngredientInterface'
import { useKitchenIngredientsContext } from '../../../composables/workspace/ingredients/useKitchenIngredientsContext'
import { INGREDIENT_CATEGORY_OPTIONS } from '../../../../ingredient/models/ingredient-taxonomy'

const {
  ingredients,
  kitchenId,
  kitchenName,
  pending,
  loadError,
  canWrite,
  debug,
} = useKitchenIngredientsContext()
const { pill } = useIngredientInterface()
const query = ref('')
const category = ref('all')
const imageFilter = ref('all')
const layout = ref<'grid' | 'list'>('list')
const addOpen = ref(false)
const failedImages = ref<Record<string, string>>({})
const errorMessage = 'Your ingredients could not be loaded. Please try again.'
const views = [
  { value: 'grid' as const, label: 'Grid view', icon: 'i-lucide-layout-grid' },
  { value: 'list' as const, label: 'List view', icon: 'i-lucide-list' },
]
const imageOptions = [
  { label: 'All images', value: 'all' },
  { label: 'Images missing', value: 'missing' },
]
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
          to: `/workspace/kitchen/food/ingredients/${encodeURIComponent(id)}`,
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
    page.value = Math.min(page.value, Math.max(1, Math.ceil(count / pageSize)))
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
</script>

<style scoped>
.ingredient-catalogue-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
}
.ingredient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 9.5rem), 1fr));
  gap: 1rem;
}
</style>
