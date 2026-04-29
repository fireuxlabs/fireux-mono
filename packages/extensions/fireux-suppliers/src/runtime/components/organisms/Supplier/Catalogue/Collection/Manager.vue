<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>
      </div>
    </template>

    <div class="space-y-2">
      <UAlert
        color="neutral"
        variant="soft"
        :title="emptyStateTitle"
        :description="emptyStateDescription"
      />

      <p class="text-sm text-dimmed">
        Collection path:
        <code>{{ collectionPath || 'none' }}</code>
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    collection?: unknown[]
    pending?: boolean
    collectionPath?: string
    title?: string
    description?: string
    emptyTitle?: string
    emptyDescription?: string
  }>(),
  {
    collection: () => [],
    pending: false,
    collectionPath: '',
    title: 'Supplier Catalogues',
    description: 'Browse supplier catalogue grouping surfaces.',
    emptyTitle: 'No catalogues',
    emptyDescription: 'No supplier catalogues found.',
  }
)

const emptyStateTitle = computed(() =>
  props.pending ? 'Loading catalogues' : props.emptyTitle
)
const emptyStateDescription = computed(() =>
  props.pending ? 'Fetching supplier catalogues.' : props.emptyDescription
)
</script>
