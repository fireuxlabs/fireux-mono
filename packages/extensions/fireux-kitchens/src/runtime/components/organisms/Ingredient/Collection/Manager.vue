<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>{{ title }}</div>
          <p>{{ description }}</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search ingredients..."
          />
          <UButton
            size="xs"
            variant="ghost"
            :icon="variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
            :aria-label="variant === 'pill' ? 'Switch to list view' : 'Switch to grid view'"
            @click="toggleVariant"
          />
          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <IngredientCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink
          :to="linkEnabled ? card.to : undefined"
          class="block"
          :class="linkEnabled ? '' : 'cursor-pointer'"
          @click.prevent="linkEnabled ? undefined : handleSelect(card.id)"
        >
          <IngredientCardsPill
            v-bind="card"
            :warning="warningByIngredientId[card.id]"
          />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink
          :to="linkEnabled ? card.to : undefined"
          class="block"
          :class="linkEnabled ? '' : 'cursor-pointer'"
          @click.prevent="linkEnabled ? undefined : handleSelect(card.id)"
        >
          <IngredientCardsCell
            v-bind="card"
            :prop="card.description"
            :warning="warningByIngredientId[card.id]"
          />
        </NuxtLink>
      </template>
    </IngredientCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No ingredients match your search.' : 'No ingredients found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="devJsonTitle"
        :context="devJsonContext"
        :data="devJsonData"
        :default-open="devJsonDefaultOpen"
        :hide-when-empty="devJsonHideWhenEmpty"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useIngredientInterface } from '../../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface';
import type { Ingredient } from '../../../../models/ingredient.model';

const props = withDefaults(
  defineProps<{
    collection?: Ingredient[]
    title?: string
    description?: string
    link?: boolean
    devJsonTitle?: string
    devJsonContext?: string
    devJsonData?: unknown
    devJsonDefaultOpen?: boolean
    devJsonHideWhenEmpty?: boolean
    warningByIngredientId?: Record<string, string>
  }>(),
  {
    title: 'Ingredients',
    description: 'Browse global ingredients available to this runtime.',
    link: true,
  }
)

const emit = defineEmits<{
  (event: 'select', ingredient: Ingredient): void
}>()

const { card: makeCard, searchText } = useIngredientInterface()

const collection = computed(() => props.collection ?? [])
const warningByIngredientId = computed(() => props.warningByIngredientId ?? {})
const linkEnabled = computed(() => props.link !== false)
const totalCount = computed(() => collection.value.length)

const ingredientById = computed(() => {
  const map = new Map<string, Ingredient>()
  for (const ingredient of collection.value) {
    const id = String(ingredient.id || '').trim()
    if (!id) continue
    map.set(id, ingredient)
  }
  return map
})

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<Ingredient, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (ingredient: Ingredient) => searchText(ingredient),
  makeCard: (ingredient: Ingredient) => makeCard(ingredient),
})

const isDev = import.meta.dev

const devJsonTitle = computed(() => props.devJsonTitle || 'Ingredients (JSON)')
const devJsonContext = computed(
  () => props.devJsonContext || 'collection manager · ingredients'
)
const devJsonData = computed(() => props.devJsonData ?? collection.value)
const devJsonDefaultOpen = computed(() => props.devJsonDefaultOpen ?? false)
const devJsonHideWhenEmpty = computed(() => props.devJsonHideWhenEmpty ?? true)

const handleSelect = (id: string) => {
  const ingredient = ingredientById.value.get(String(id || '').trim())
  if (ingredient) emit('select', ingredient)
}
</script>
