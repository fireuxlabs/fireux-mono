<template>
  <UCard v-if="cards.length">
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>

        <UBadge variant="soft">
          {{ cards.length }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-3">
      <KitchenCardsCell
        v-for="card in cards"
        :key="card.id"
        v-bind="card"
        :link="false"
        action
        :show-source="false"
        :show-badges="false"
        @action="selectKitchen(card.id)"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenFetchSource } from '../../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    collection?: KitchenSurface[]
    source?: KitchenFetchSource
  }>(),
  {
    collection: () => [],
    source: 'live',
  }
)

const emit = defineEmits<{
  (event: 'select', id: string, source: KitchenFetchSource): void
}>()

const { cell } = useKitchenInterface()
const cards = computed(() =>
  props.collection
    .map((kitchen) => cell(kitchen))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
const cardIdSet = computed(() =>
  new Set(cards.value.map((card) => card.id).filter(Boolean))
)

function selectKitchen(id: string) {
  const kitchenId = String(id ?? '').trim()
  if (!cardIdSet.value.has(kitchenId)) return
  emit('select', kitchenId, props.source)
}
</script>
