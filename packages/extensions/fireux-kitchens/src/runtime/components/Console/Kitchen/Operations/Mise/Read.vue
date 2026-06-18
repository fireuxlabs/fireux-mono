<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Mise Tasks</h2>
            <p>Browse mise tasks for the selected kitchen.</p>
          </div>

          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </template>

      <div v-if="cards.length" class="space-y-3">
        <ConsoleKitchenOperationsMiseCardsCell
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
          :link="true"
        />
      </div>

      <p v-else class="text-sm text-dimmed">
        No mise tasks found.
      </p>
    </UCard>

    <DevFireuxDebugPanel
      title="Kitchen mise"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMiseEnPlaceInterface } from '../../../../../composables/fireux/console/kitchen/operations/Mise/utils/view/useMiseEnPlaceInterface'
import { useKitchenConsoleMise } from '../../../../../composables/fireux/console/kitchen/operations/Mise/useKitchenConsoleMise'

const { miseTasks, debug } = useKitchenConsoleMise()
const { cell } = useMiseEnPlaceInterface()
const cards = computed(() =>
  miseTasks.value
    .map((task) => cell(task))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
</script>
