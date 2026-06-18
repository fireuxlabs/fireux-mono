<template>
  <section class="space-y-2">
    <pre>ConsoleKitchenIndexTargets</pre>

    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Choose Kitchen</h2>
            <p>Select the Kitchen console target you want to work on.</p>
          </div>

          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </template>

      <p v-if="pending" class="text-sm text-dimmed">Loading kitchens...</p>

      <div v-else-if="cards.length" class="space-y-3">
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

      <p v-else class="text-sm text-dimmed">
        No Kitchen targets found.
      </p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenSurface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = withDefaults(
  defineProps<{
    collection?: KitchenSurface[]
    pending?: boolean
  }>(),
  {
    collection: () => [],
    pending: false,
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const consoleIds = computed(() =>
  props.collection
    .map((kitchen) => String(kitchen.id ?? '').trim())
    .filter(Boolean)
)
const consoleIdSet = computed(() => new Set(consoleIds.value))
const { cell } = useKitchenInterface()
const cards = computed(() =>
  props.collection
    .map((kitchen) => cell(kitchen))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)

function selectKitchen(id: string) {
  const kitchenId = String(id ?? '').trim()
  if (!consoleIdSet.value.has(kitchenId)) return
  emit('select', kitchenId)
}
</script>
