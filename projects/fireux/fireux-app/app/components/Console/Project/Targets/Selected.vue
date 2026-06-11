<template>
  <section class="space-y-2">
    <pre>ConsoleProjectTargetsSelected</pre>

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
      description="Choose a live or demo Project target to open selected Project console state."
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import type { ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'

const props = defineProps<{
  project?: ProjectSurface | null
  projectId?: string
  mode?: ConsoleMode
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const projectName = computed(() =>
  String(props.project?.name || props.project?.slug || '').trim()
)
const selectedTitle = computed(() =>
  props.mode === 'demo' ? 'Selected Demo Project' : 'Selected Project'
)
</script>
