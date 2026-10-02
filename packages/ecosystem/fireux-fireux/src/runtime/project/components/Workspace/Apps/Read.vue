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
      :description="error?.message || 'Please try again.'"
    />

    <div v-else-if="outcome === 'ready'" class="space-y-3">
      <div v-for="card in cards" :key="card.id" class="space-y-2">
        <AppCardsCell v-bind="card" :link="false" />
        <UButton variant="soft" @click="previewId = card.id">Preview {{ card.id }}</UButton>
      </div>
      <AppPreview v-if="previewApp" :app="previewApp" />
    </div>

    <p v-else class="text-sm text-dimmed">
      No app records point to this project.
    </p>
    <MoleculesCopyError v-if="outcome === 'error'" :message="error?.message || 'Project apps could not be loaded.'" />
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AppPreview from 'fireux-core/runtime/app/components/Preview.vue'
import {
  useAppView,
  type AppCard,
} from 'fireux-core/runtime/app/composables/useAppView'
import { useProjectApps } from '../../../composables/useProjectApps'
import { useProjectWorkspace } from '../../../composables/workspace/core/useProjectWorkspace'

const { apps, outcome, error } = useProjectApps(useProjectWorkspace().id, { management: true })
const previewId = ref('')
const previewApp = computed(() => apps.value.find(app => app.id === previewId.value))
const { toCard: appCell } = useAppView()

const cards = computed(() =>
  apps.value
    .map((app) => appCell(app))
    .filter((card): card is AppCard => Boolean(card))
)
</script>
