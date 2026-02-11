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
            placeholder="Search mise tasks..."
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

    <MiseCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <UPopover :popper="{ placement: 'right-start' }">
          <template #default>
            <NuxtLink
              :to="card.to || undefined"
              class="block"
              :class="card.to ? '' : 'cursor-pointer'"
            >
              <MiseCardsPill v-bind="card" />
            </NuxtLink>
          </template>
          <template #content>
            <div class="w-[20rem] p-3">
              <MiseCardsPreview v-if="previewById[card.id]" v-bind="previewById[card.id]" />
            </div>
          </template>
        </UPopover>
      </template>

      <template #cell="{ card }">
        <UPopover :popper="{ placement: 'right-start' }">
          <template #default>
            <NuxtLink
              :to="card.to || undefined"
              class="block"
              :class="card.to ? '' : 'cursor-pointer'"
            >
              <MiseCardsCell v-bind="card" :prop="card.description" />
            </NuxtLink>
          </template>
          <template #content>
            <div class="w-[20rem] p-3">
              <MiseCardsPreview v-if="previewById[card.id]" v-bind="previewById[card.id]" />
            </div>
          </template>
        </UPopover>
      </template>
    </MiseCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No mise tasks match your search.' : 'No mise tasks found.' }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import { useMiseEnPlaceInterface } from '../../../../composables/fireux/firestore/mise/utils/view/useMiseEnPlaceInterface'
import type { KitchenMiseTask } from '../../../../models/kitchen-mise.model'

const props = withDefaults(
  defineProps<{
    collection?: KitchenMiseTask[]
    title?: string
    description?: string
  }>(),
  {
    title: 'Mise Tasks',
    description: 'Browse mise tasks for this kitchen.',
  }
)

const { card: makeCard, preview: makePreview, searchText } = useMiseEnPlaceInterface()

const collection = computed(() => props.collection ?? [])
const totalCount = computed(() => collection.value.length)

const previewById = computed(() => {
  const map: Record<string, ReturnType<typeof makePreview> | null> = {}
  for (const task of collection.value) {
    const card = makeCard(task)
    if (!card?.id) continue
    map[card.id] = makePreview(task)
  }
  return map
})

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<KitchenMiseTask, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (task: KitchenMiseTask) => searchText(task),
  makeCard: (task: KitchenMiseTask) => makeCard(task),
})
</script>
