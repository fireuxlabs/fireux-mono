<template>
  <UCard v-if="ecosystem">
    <template #header>Ecosystem</template>
    <ULink :to="ecosystem.detail_url">{{ ecosystem.name }}</ULink>
    <p class="text-sm text-muted">{{ ecosystem.description }}</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { App } from 'fireux-core/runtime/app/models/app.model'
import type { EcosystemDirectoryEntry } from 'fireux-core/runtime/models/utils/directory'
import { usePlatformDirectory } from '../../../composables/usePlatformDirectory'

const props = defineProps<{ app: App }>()
const { data: directory } = usePlatformDirectory()
const ecosystem = computed(
  () =>
    directory.value?.ecosystems.find(
      (entry: EcosystemDirectoryEntry) => entry.id === props.app.ecosystem_id
    ) ?? null
)
</script>
