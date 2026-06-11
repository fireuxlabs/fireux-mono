<template>
  <section class="space-y-2">
    <pre>ConsoleBlankTargetsSelected</pre>

    <UPageCard
      v-if="selectedId"
      :title="selectedTitle"
      :description="selectedId"
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
      title="No selected Blank"
      description="Choose a live or demo Blank target to test selected-target console state."
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'

const props = defineProps<{
  selectedId?: string
  mode?: ConsoleMode
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const selectedTitle = computed(() =>
  props.mode === 'demo' ? 'Selected Demo Blank' : 'Selected Blank'
)
</script>
