<template>
  <UModal
    :open="open"
    title="Create Kitchen"
    description="Add a Kitchen to this workspace."
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
import type { KitchenOnboardingCompleteResult } from '../../models/kitchen-onboarding.model.ts'

const props = defineProps<{
  open: boolean
  refresh?: () => Promise<unknown>
}>()

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
  (event: 'created', result: KitchenOnboardingCompleteResult): void
}>()

async function onCreated(result: KitchenOnboardingCompleteResult) {
  await props.refresh?.()
  emit('created', result)
  emit('update:open', false)
}
</script>
