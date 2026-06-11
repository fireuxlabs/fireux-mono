<template>
  <section class="space-y-2">
    <pre>ConsolePropertyIndexSelected</pre>

    <UPageCard
      v-if="propertyId"
      :title="selectedTitle"
      :description="propertyName || propertyId"
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
      title="No selected Property"
      description="Choose a live or demo Property target to open selected Property console state."
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import type { Property } from '../../../../models/property.model'

const props = defineProps<{
  property?: Property | null
  propertyId?: string
  mode?: ConsoleMode
}>()

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const propertyName = computed(() =>
  String(props.property?.identity?.name || props.property?.slug || '').trim()
)
const selectedTitle = computed(() =>
  props.mode === 'demo' ? 'Selected Demo Property' : 'Selected Property'
)
</script>
