<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: remove raw console debug label. -->
<template>
  <section class="space-y-2">
    <UPageCard
      v-if="projectId"
      :title="selectedTitle"
      :description="projectName || projectId"
      variant="subtle"
    >
      <template #footer>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-x"
          @click="emit('clear')"
        >
          Clear
        </UButton>
      </template>
    </UPageCard>

    <UPageCard
      v-else
      title="No selected Project"
      description="Choose a Project target to open selected Project console state."
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'

const props = defineProps<{
  project?: ProjectSurface | null
  projectId?: string
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const projectName = computed(() =>
  String(props.project?.name || props.project?.slug || '').trim()
)
const selectedTitle = 'Selected Project'
</script>
