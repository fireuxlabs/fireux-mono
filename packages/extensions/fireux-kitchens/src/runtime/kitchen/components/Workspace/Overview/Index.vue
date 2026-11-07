<template>
  <FireState v-if="outcome === 'pending'" outcome="pending" entity="Kitchen" />
  <FireStateCard
    v-else-if="outcome === 'error'"
    state="error"
    title="Kitchen unavailable"
    description="The selected kitchen could not be loaded."
  />
  <FireStateCard
    v-else-if="!data"
    state="empty"
    title="No kitchen selected"
    description="Choose a kitchen to see its overview."
  />
  <section v-else>
    <header>
      <UAvatar
        :src="imageUrl || undefined"
        :alt="name"
        icon="i-lucide-chef-hat"
        size="xl"
      />
      <div>
        <h2>{{ name || 'Kitchen overview' }}</h2>
        <p v-if="tagline">
          {{ tagline }}
        </p>
      </div>
    </header>
    <OverviewGroups />
  </section>
</template>
<script setup lang="ts">
import OverviewGroups from './Groups.vue'
import { computed, watchEffect } from 'vue'
import type { WorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'
import { useKitchenIdentityProjection } from '../../../composables/useKitchenIdentity'
const workspace = useKitchenWorkspace()
const { data, id, outcome } = workspace
const { name, tagline, imageUrl, placeOutcome } =
  useKitchenIdentityProjection(workspace)
const pageState = computed(() => ({
  kitchen: data.value
    ? {
        id: id.value,
        name: name.value,
        description: tagline.value,
        image: imageUrl.value,
      }
    : null,
  derived: { status: outcome.value, placeStatus: placeOutcome.value },
}))
const emit = defineEmits<{ state: [value: WorkspacePageState] }>()
watchEffect(() => emit('state', pageState.value))
</script>
