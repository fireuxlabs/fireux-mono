<template>
  <UPageCard
    v-if="projectId"
    title="Selected Project"
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
</script>
