<template>
  <UPage>
    <UContainer>
      <UPageHeader :title="title" :description="description" />
      <UPageBody>
        <FireState v-if="state" v-bind="state" />
        <slot />
        <FireCollectionPagination
          v-if="pagination"
          v-bind="pagination"
          @load-more="$emit('load-more')"
        />
        <FireDiagnosticsDebugPanel v-if="diagnostics" v-bind="diagnostics" />
      </UPageBody>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import type { ReadOutcome } from '../../composables/fireux/firestore/operations/read-outcome'
import type { DevDebugPayload } from '../../types/dev-debug'

defineProps<{
  title: string
  description?: string
  state?: { outcome: ReadOutcome; entity?: string; error?: unknown }
  pagination?: { hasMore: boolean; loading?: boolean; error?: unknown }
  diagnostics?: {
    objects: unknown
    derived: unknown
    objectOrigin: DevDebugPayload['objectOrigin']
    title?: string
    context?: string
    includeRoute?: boolean
    launcher?: boolean
  }
}>()

defineEmits<{ 'load-more': [] }>()
</script>
