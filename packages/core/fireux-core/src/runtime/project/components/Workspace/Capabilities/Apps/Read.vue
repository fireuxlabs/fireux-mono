<!-- Concurrent edit — 2026-07-20 16:19 CEST — Workspace Spine project cleanup: render App operation outcomes explicitly. -->
<template>
  <UCard v-if="outcome !== 'idle'">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-highlighted">Project apps</h2>
        <UBadge
          v-if="outcome === 'ready' || outcome === 'empty'"
          color="neutral"
          variant="soft"
        >
          {{ cards.length }}
        </UBadge>
      </div>
    </template>

    <div v-if="outcome === 'pending'" class="text-sm text-dimmed">
      Loading apps...
    </div>

    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Project apps could not be loaded"
      description="Please try again."
    />

    <div v-else-if="outcome === 'ready'" class="space-y-3">
      <AppCardsCell
        v-for="card in cards"
        :key="card.id"
        v-bind="card"
        :link="false"
      />
    </div>

    <p v-else class="text-sm text-dimmed">
      No app records point to this project.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useAppView,
  type AppCard,
} from '../../../../../app/composables/useAppView'
import { useProjectWorkspaceApps } from '../../../../composables/workspace/capabilities/Apps/useProjectWorkspaceApps'

const { apps, outcome } = useProjectWorkspaceApps()
const { cell: appCell } = useAppView()

const cards = computed(() =>
  apps.value
    .map((app) => appCell(app))
    .filter((card): card is AppCard => Boolean(card))
)
</script>
