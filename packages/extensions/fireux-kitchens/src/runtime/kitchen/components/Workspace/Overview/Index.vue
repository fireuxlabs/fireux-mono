<template>
  <USkeleton v-if="targetOutcome === 'pending'" class="h-48" />
  <MoleculesStateCard
    v-else-if="targetOutcome === 'error'"
    state="error"
    title="Kitchen unavailable"
    description="The selected kitchen could not be loaded."
  />
  <MoleculesStateCard
    v-else-if="!selectedKitchen"
    state="missing"
    title="No kitchen selected"
    description="Choose a kitchen to see its overview."
  />
  <section v-else class="mx-auto grid w-full max-w-6xl gap-6">
    <header class="flex min-w-0 items-center gap-3">
      <UAvatar
        :src="identityImage || undefined"
        :alt="kitchenTitle"
        icon="i-lucide-chef-hat"
        size="xl"
      />
      <div class="min-w-0">
        <h2 class="text-lg font-semibold">{{ kitchenTitle }}</h2>
        <p v-if="kitchenSubtitle" class="text-sm text-muted">
          {{ kitchenSubtitle }}
        </p>
      </div>
    </header>
    <OverviewGroups />
  </section>
</template>
<script setup lang="ts">
import OverviewGroups from './Groups.vue'
import { watchEffect } from 'vue'
import type { WorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import { useKitchenWorkspaceHome } from '../../../composables/workspace/useKitchenWorkspaceHome'
const {
  pageState,
  selectedKitchen,
  targetOutcome,
  kitchenTitle,
  kitchenSubtitle,
  identityImage,
} = useKitchenWorkspaceHome()
const emit = defineEmits<{ state: [value: WorkspacePageState] }>()
watchEffect(() => emit('state', pageState.value))
</script>
