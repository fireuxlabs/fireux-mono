<!-- Concurrent edit — 2026-07-21 21:23 CEST — Console index parity: centralize selected-target chrome and clear behavior. -->
<template>
  <section class="space-y-2">
    <UPageCard
      v-if="selectedId"
      :title="selectedTitle"
      :description="selectedDescription"
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
      :title="emptyTitle"
      :description="emptyDescription"
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    selectedId?: string
    description?: string
  }>(),
  {
    selectedId: '',
    description: '',
  }
)

const emit = defineEmits<{
  (event: 'clear'): void
}>()

const label = computed(() => String(props.label ?? '').trim() || 'Target')
const selectedId = computed(() => String(props.selectedId ?? '').trim())
const selectedDescription = computed(
  () => String(props.description ?? '').trim() || selectedId.value
)
const selectedTitle = computed(() => `Selected ${label.value}`)
const emptyTitle = computed(() => `No selected ${label.value}`)
const emptyDescription = computed(
  () =>
    `Choose a ${label.value} target to open selected ${label.value} console state.`
)
</script>
