<template>
  <FireState
    v-if="targetOutcome === 'pending'"
    outcome="pending"
    entity="Kitchen"
  />
  <FireStateCard
    v-else-if="targetOutcome === 'error'"
    state="error"
    title="Kitchen unavailable"
    description="The selected kitchen could not be loaded."
  />
  <FireStateCard
    v-else-if="!selectedKitchen"
    state="empty"
    title="No kitchen selected"
    description="Choose a kitchen to see its overview."
  />
  <section v-else>
    <header>
      <UAvatar
        :src="identityImage || undefined"
        :alt="kitchenTitle"
        icon="i-lucide-chef-hat"
        size="xl"
      />
      <div>
        <h2>{{ kitchenTitle }}</h2>
        <p v-if="kitchenSubtitle">
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
