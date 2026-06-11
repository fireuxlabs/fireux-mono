<template>
  <section class="space-y-2">
    <pre>ConsoleBlankIndexSelected</pre>

    <UPageCard
      v-if="blankId"
      :title="selectedTitle"
      :description="blankName || blankId"
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
      description="Choose a live or demo Blank target to open selected Blank console state."
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import type { Blank } from '../../../../models/blank.model'

const props = defineProps<{
  blank?: Blank | null
  blankId?: string
  mode?: ConsoleMode
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const blankName = computed(() =>
  String(props.blank?.name || props.blank?.slug || '').trim()
)
const selectedTitle = computed(() =>
  props.mode === 'demo' ? 'Selected Demo Blank' : 'Selected Blank'
)
</script>
