<template>
  <template v-if="creatingWithoutLocation">
    <KitchenOnboardingShellCreate
      :owner-user-id="ownerUserId"
      :directory="directory"
      @created="emit('shell-created', $event)"
      @contributed="emit('contributed', $event)"
    />
    <UButton
      color="neutral"
      variant="link"
      @click="creatingWithoutLocation = false"
      >Back to search</UButton
    >
  </template>
  <PlaceOnboarding
    v-else
    required-only
    :resolve-existing="resolveExisting"
    @created="emit('created', $event)"
  >
    <template #intro>
      <h1 class="text-2xl font-semibold text-highlighted">Find your kitchen</h1>
      <p class="mt-2 text-sm text-muted">Search by name or address.</p>
    </template>
    <template #find-secondary>
      <UButton
        color="neutral"
        variant="link"
        @click="creatingWithoutLocation = true"
        >Create without a listed location</UButton
      >
    </template>
  </PlaceOnboarding>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { PlaceOnboardingResult } from 'fireux-places/runtime/place/composables/usePlaceOnboarding'
import type {
  KitchenDirectoryContributionResult,
  KitchenShellCreateResult,
} from '../../models/kitchen-onboarding.model.ts'
defineProps<{
  ownerUserId: string
  directory: boolean
  resolveExisting: (id: string) => Promise<boolean>
}>()
const emit = defineEmits<{
  (event: 'created', result: PlaceOnboardingResult): void
  (event: 'shell-created', result: KitchenShellCreateResult): void
  (event: 'contributed', result: KitchenDirectoryContributionResult): void
}>()
const creatingWithoutLocation = ref(false)
</script>
