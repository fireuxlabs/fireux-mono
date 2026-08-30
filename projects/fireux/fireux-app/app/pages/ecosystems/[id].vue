<template>
  <UPage>
    <UPageBody>
      <DirectoryEcosystemDetail v-if="ecosystem" :ecosystem="ecosystem" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import type {
  EcosystemDirectoryEntry,
  PlatformDirectoryResponse,
} from 'fireux-core/runtime/models/utils/directory'

definePageMeta({
  layout: 'default',
  title: 'Ecosystem',
  description: 'View a FireUX Ecosystem and its connected Apps.',
  name: 'FireuxEcosystemDetailPage',
})

const routeId = useRouteParam('id')
const { data } = await useAsyncData<PlatformDirectoryResponse>(
  'fireux-default-directory',
  () => $fetch('/api/directory'),
  { server: true, lazy: false }
)
const ecosystem = computed(
  () =>
    data.value?.ecosystems.find(
      (entry: EcosystemDirectoryEntry) =>
        entry.id === routeId.value ||
        entry.detail_url === `/ecosystems/${routeId.value}`
    ) ?? null
)
</script>
