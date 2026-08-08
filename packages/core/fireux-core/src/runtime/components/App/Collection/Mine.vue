<template>
  <UCard v-if="appCards.length">
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2>My apps</h2>
          <p>Apps you can access or administer.</p>
        </div>

        <UBadge variant="soft">{{ appCards.length }}</UBadge>
      </div>
    </template>

    <div class="space-y-3">
      <AppCardsCell
        v-for="appCard in appCards"
        :key="appCard.id"
        v-bind="appCard"
        link
        :show-badges="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMyApps } from '../../../composables/fireux/firestore/core/app/utils/useMyApps'
import { useAppInterface } from '../../../composables/fireux/app/useAppInterface'
import type { AppDirectoryController } from '../../../types/directory-controller.types'

const props = defineProps<{
  controller: AppDirectoryController
}>()

const { myApps } = useMyApps(props.controller.apps)
const { cell: appToCell } = useAppInterface()

const appCards = computed(() =>
  myApps.value
    .map((app) => appToCell(app))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
)
</script>
