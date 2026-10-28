<template>
  <UCard
    v-if="identity.outcome.value === 'ready' && identity.selectedKitchen.value"
    aria-label="Kitchen listing"
  >
    <template #header>
      <div class="workspace-profile__header">
        <div class="workspace-profile__heading-row">
          <UIcon name="i-lucide-link" class="workspace-profile__icon" />
          <h2 class="workspace-profile__heading">Kitchen listing</h2>
          <UBadge color="neutral" variant="subtle">{{ kitchenStatus }}</UBadge>
        </div>
        <UButton
          v-if="identity.canWriteKitchen.value"
          label="Edit listing"
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="kitchenEditorOpen = true"
        />
      </div>
    </template>
    <div class="workspace-profile__header">
      <div class="workspace-profile__copy">
        <p class="workspace-profile__label">Kitchen URL</p>
        <p class="workspace-profile__path">
          {{ kitchenPath || 'No Kitchen URL set' }}
        </p>
      </div>
      <KitchenEditPublication
        :key="identity.kitchenId.value"
        :kitchen="identity.selectedKitchen.value"
        :kitchen-id="identity.kitchenId.value"
        :can-write="identity.canWriteKitchen.value"
      />
    </div>
  </UCard>
  <KitchenListingEdit v-model:open="kitchenEditorOpen" />
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import KitchenListingEdit from '../Workspace/Home/Edit.vue'
import type { useKitchenWorkspaceIdentity } from '../../composables/workspace/useKitchenWorkspaceIdentity'
const props = defineProps<{
  identity: ReturnType<typeof useKitchenWorkspaceIdentity>
}>()
const kitchenEditorOpen = ref(false)
const kitchenPath = computed(() => {
  const slug = props.identity.selectedKitchen.value?.identity?.slug
  return slug ? `/kitchens/${encodeURIComponent(slug)}` : ''
})
const kitchenStatus = computed(() => {
  const status = props.identity.selectedKitchen.value?.identity?.status
  return status === 'active'
    ? 'Active'
    : status === 'archived'
      ? 'Archived'
      : 'Inactive'
})
watch(
  [props.identity.kitchenId, props.identity.canWriteKitchen],
  () => {
    kitchenEditorOpen.value = false
  },
  { flush: 'sync' }
)
</script>
