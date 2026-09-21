<template>
  <div class="mx-auto w-full max-w-7xl space-y-7">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-primary">
          {{ kitchenName || 'Your kitchen' }}
        </p>
        <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
          Your ingredients
        </h1>
      </div>
      <UButton
        v-if="canWrite"
        label="Create Ingredient"
        icon="i-lucide-plus"
        size="lg"
        @click="addOpen = true"
      />
    </header>

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
      <div
        class="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-default pb-5 text-sm"
      >
        <span class="text-muted"
          ><strong class="font-semibold tabular-nums text-highlighted">{{
            cards.length
          }}</strong>
          ingredients</span
        >
        <span class="text-muted"
          ><strong class="font-semibold tabular-nums text-highlighted">{{
            categories.length
          }}</strong>
          categories</span
        >
        <button
          v-if="missingImageCount"
          type="button"
          class="inline-flex items-center gap-1.5 text-muted transition hover:text-primary focus-visible:outline-primary"
          @click="imageFilter = imageFilter === 'missing' ? 'all' : 'missing'"
          :aria-pressed="imageFilter === 'missing'"
        >
          <UIcon name="i-lucide-image-plus" class="size-4" />
          <span
            >{{ missingImageCount }}
            {{ missingImageCount === 1 ? 'image' : 'images' }} to add</span
          >
        </button>
      </div>

      <div class="ingredient-catalogue-layout">
        <aside
          v-if="cards.length"
          class="ingredient-category-sidebar"
          aria-label="Ingredient categories"
        >
          <div class="ingredient-category-navigation">
            <button
              v-for="item in categoryNavigation"
              :key="item.value"
              type="button"
              :aria-pressed="category === item.value"
              class="ingredient-category-button flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition focus-visible:outline-primary"
              :class="
                category === item.value
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted hover:bg-elevated hover:text-highlighted'
              "
              @click="category = item.value"
            >
              <UIcon :name="item.icon" class="size-4 shrink-0" />
              <span class="ingredient-category-label flex-1">{{
                item.label
              }}</span>
              <span class="ml-1 text-xs tabular-nums opacity-70">{{
                item.count
              }}</span>
            </button>
          </div>
        </aside>

        <div class="min-w-0 flex-1 space-y-6">
          <div v-if="cards.length" class="flex flex-col gap-3 sm:flex-row">
            <UInput
              v-model="query"
              icon="i-lucide-search"
              placeholder="Find an ingredient…"
              aria-label="Search kitchen ingredients"
              size="lg"
              class="w-full min-w-0 sm:flex-1"
              :ui="{ trailing: 'pe-1.5' }"
            >
              <template v-if="query" #trailing
                ><UButton
                  icon="i-lucide-x"
                  aria-label="Clear search"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click="query = ''"
              /></template>
            </UInput>
            <div class="flex items-center gap-2">
              <USelect
                v-model="imageFilter"
                :items="imageOptions"
                aria-label="Filter ingredient images"
                size="lg"
                class="min-w-40 flex-1"
              />
              <div
                class="flex items-center rounded-lg border border-default p-1"
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
            </div>
          </div>

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
                  preview
                  @open="selectedId = card.id"
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
    </template>

    <USlideover
      :open="Boolean(selectedIngredient)"
      :title="selectedIngredient?.name || 'Ingredient'"
      :ui="{ content: 'sm:max-w-lg' }"
      @update:open="
        (open) => {
          if (!open) selectedId = ''
        }
      "
    >
      <template #body>
        <WorkspaceKitchenIngredientsPreview
          v-if="selectedIngredient"
          :ingredient="selectedIngredient"
          :show-heading="false"
        />
      </template>
      <template #footer>
        <div class="flex w-full flex-wrap items-center justify-between gap-3">
          <UButton
            icon="i-lucide-arrow-left"
            label="Previous"
            color="neutral"
            variant="ghost"
            :disabled="selectedIndex <= 0"
            @click="moveSelection(-1)"
          />
          <UButton
            v-if="selectedId"
            label="Open Ingredient"
            icon="i-lucide-arrow-up-right"
            :to="`/workspace/kitchen/food/ingredients/${encodeURIComponent(selectedId)}`"
          />
          <span
            v-if="selectedIndex >= 0"
            class="text-xs tabular-nums text-muted"
            aria-live="polite"
            >{{ selectedIndex + 1 }} / {{ previewCards.length }}</span
          >
          <UButton
            trailing-icon="i-lucide-arrow-right"
            label="Next"
            color="neutral"
            variant="ghost"
            :disabled="
              selectedIndex < 0 || selectedIndex >= previewCards.length - 1
            "
            @click="moveSelection(1)"
          />
        </div>
      </template>
    </USlideover>

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
    <DevDebugPanel
      title="Kitchen ingredients"
      scope="workspace"
      object-origin="fetched"
      :objects="{ ingredients }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
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
const layout = ref<'grid' | 'list'>('grid')
const addOpen = ref(false)
const selectedId = ref('')
const selectedIngredient = computed(() =>
  !loadError.value && !pending.value
    ? ingredients.value.find(
        (item) => (item.ingredient_id || item.id) === selectedId.value
      )
    : undefined
)
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
const missingImageCount = computed(
  () => cards.value.filter((card) => !card.hasImage).length
)
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
const groups = computed(() =>
  categories.value
    .map((option) => ({
      ...option,
      cards: filtered.value.filter((card) => card.category === option.value),
    }))
    .filter((group) => group.cards.length)
)
const previewCards = computed(() =>
  groups.value.flatMap((group) => group.cards)
)
const selectedIndex = computed(() =>
  previewCards.value.findIndex((card) => card.id === selectedId.value)
)
function moveSelection(offset: number) {
  const card = previewCards.value[selectedIndex.value + offset]
  if (card) selectedId.value = card.id
}
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
  selectedId.value = ''
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
.ingredient-category-sidebar {
  min-width: 0;
}
.ingredient-category-navigation {
  display: flex;
  gap: 0.375rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}
.ingredient-category-label {
  white-space: nowrap;
}
.ingredient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 9.5rem), 1fr));
  gap: 1rem;
}
@media (min-width: 1024px) {
  .ingredient-catalogue-layout {
    flex-direction: row;
    gap: 2rem;
  }
  .ingredient-category-sidebar {
    flex: 0 0 12rem;
    width: 12rem;
  }
  .ingredient-category-navigation {
    position: sticky;
    top: 0;
    flex-direction: column;
    overflow: visible;
    padding-bottom: 0;
  }
  .ingredient-category-button {
    width: 100%;
  }
  .ingredient-category-label {
    white-space: normal;
  }
}
</style>
