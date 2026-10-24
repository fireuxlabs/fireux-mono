<template>
  <UCard
    v-if="identity.outcome.value === 'ready' && identity.selectedKitchen.value"
    aria-label="Kitchen listing"
  >
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-link" class="size-5 text-muted" />
          <h2 class="font-semibold">Kitchen listing</h2>
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
    <div
      class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="min-w-0">
        <p class="text-xs font-medium text-muted">Kitchen URL</p>
        <p class="mt-1 break-all font-mono text-sm">
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
