<!-- Concurrent edit — 2026-07-20 16:19 CEST — Workspace Spine project cleanup: render App operation outcomes explicitly. -->
<template>
  <UCard v-if="outcome !== 'idle'">
    <template #header>
      <div class="card__header">
        <h2 class="fx-type-card-heading">Project apps</h2>
        <UBadge
          v-if="outcome === 'ready' || outcome === 'empty'"
          color="neutral"
          variant="soft"
        >
          {{ cards.length }}
        </UBadge>
      </div>
    </template>

    <div v-if="outcome === 'pending'">Loading apps...</div>

    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Project apps could not be loaded"
      :description="error?.message || 'Please try again.'"
    />

    <div v-else-if="outcome === 'ready'" class="fx-card-body-stack">
      <div v-for="card in cards" :key="card.id" class="fx-card-body-stack">
        <AppCardsCell
          :to="card.to"
          :thumbnail-url="card.thumbnailUrl"
          :avatar-text="card.avatarText"
          :name="card.name"
          :badges="card.badges"
          :tagline="card.tagline"
          :link="false"
        />
        <UButton variant="soft" @click="previewId = card.id"
          >Preview {{ card.id }}</UButton
        >
      </div>
      <AppPreviewHtml v-if="previewApp" :app="previewApp" />
    </div>

    <p v-else>No app records point to this project.</p>
    <FireCopyError
      v-if="outcome === 'error'"
      :message="error?.message || 'Project apps could not be loaded.'"
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  useAppView,
  type AppCard,
} from 'fireux-core/runtime/app/composables/useAppView'
import { useProjectApps } from '../../../composables/useProjectApps'
import { useProjectWorkspace } from '../../../composables/workspace/useProjectWorkspace'

const { apps, outcome, error } = useProjectApps(useProjectWorkspace().id, {
  management: true,
})
const previewId = ref('')
const previewApp = computed(() =>
  apps.value.find((app) => app.id === previewId.value)
)
const { toCard: appCell } = useAppView()

const cards = computed(() =>
  apps.value
    .map((app) => appCell(app))
    .filter((card): card is AppCard => Boolean(card))
)
</script>
