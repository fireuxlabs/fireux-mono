<template>
  <UCard v-if="pending || cards.length">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-highlighted">My apps</h2>
        <UBadge color="neutral" variant="soft">{{ cards.length }}</UBadge>
      </div>
    </template>

    <div v-if="pending" class="text-sm text-dimmed">Loading apps...</div>

    <div v-else class="space-y-3">
      <AppCardsCell
        v-for="card in cards"
        :key="card.id"
        v-bind="card"
        :link="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useAppInterface,
  type AppCard,
} from 'fireux-core/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useProjectConsoleApps } from '../../../../../composables/fireux/console/project/operations/Apps/useProjectConsoleApps'

const { apps, pending } = useProjectConsoleApps()
const { cell: appCell } = useAppInterface()

const cards = computed(() =>
  apps.value
    .map((app) => appCell(app))
    .filter((card): card is AppCard.Card => Boolean(card))
)
</script>
