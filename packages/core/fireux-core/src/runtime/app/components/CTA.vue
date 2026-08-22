<template>
  <UPageCTA
    data-entity-cta-family="platform-app"
    :title="title"
    :description="description"
    orientation="horizontal"
  >
    <template #links>
      <div class="flex flex-wrap gap-2">
        <UButton
          color="primary"
          variant="soft"
          icon="i-lucide-rocket"
          to="/get-started"
        >
          {{ primaryLabel }}
        </UButton>
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-badge-dollar-sign"
          to="/pricing/your-app"
        >
          View pricing
        </UButton>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMyApps } from '../composables/firestore/utils/useMyApps'
import type { AppCollectionController } from '../composables/useApps'

const props = defineProps<{
  controller: AppCollectionController
}>()

const { hasApps } = useMyApps(props.controller.apps)
const title = computed(() => (hasApps.value ? 'My apps' : 'Apps'))
const description = computed(() =>
  hasApps.value
    ? 'Manage your apps, or start another app.'
    : 'Explore apps, or start your app.'
)
const primaryLabel = computed(() =>
  hasApps.value ? 'Add another app' : 'Start your app'
)
</script>
