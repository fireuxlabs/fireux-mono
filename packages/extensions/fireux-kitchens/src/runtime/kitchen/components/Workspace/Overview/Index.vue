<template>
  <FireState v-if="outcome === 'pending'" outcome="pending" entity="Kitchen" />
  <UAlert
    v-else-if="outcome === 'error'"
    title="Kitchen unavailable"
    description="The selected kitchen could not be loaded."
    color="error"
    variant="soft"
    role="alert"
    aria-live="assertive"
  >
    <template #actions>
      <FireCopyError
        message="Kitchen unavailable&#10;The selected kitchen could not be loaded."
      />
    </template>
  </UAlert>
  <UAlert
    v-else-if="!data"
    title="No kitchen selected"
    description="Choose a kitchen to see its overview."
    color="neutral"
    variant="soft"
    role="status"
    aria-live="polite"
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
