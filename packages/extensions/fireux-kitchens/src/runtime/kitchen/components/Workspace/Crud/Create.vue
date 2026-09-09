<template>
  <UModal
    :open="open"
    title="Add Kitchen"
    description="Find your venue, then continue with its existing Kitchen or set up a new one."
    :ui="{ content: 'sm:max-w-4xl' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <KitchenOnboarding
        v-if="open"
        mode="workspace"
        return-to="/"
        @created="onCreated"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { KitchenOnboardingCompleteResult } from '../../../models/kitchen-onboarding.model.ts'

defineProps<{ open: boolean }>()

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
  (event: 'created', result: KitchenOnboardingCompleteResult): void
}>()

function onCreated(result: KitchenOnboardingCompleteResult) {
  emit('created', result)
  emit('update:open', false)
}
</script>
