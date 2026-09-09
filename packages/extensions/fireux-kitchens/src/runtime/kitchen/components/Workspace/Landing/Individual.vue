<template>
  <header class="flex flex-wrap items-center justify-between gap-2">
    <h2 class="font-semibold">In focus</h2>
    <UButton
      label="Edit Kitchen settings"
      icon="i-lucide-pencil"
      color="neutral"
      variant="soft"
      :disabled="!selected || !canUpdate"
      @click="editOpen = true"
    />
    <WorkspaceKitchenCrudUpdate v-model:open="editOpen" />
  </header>
  <UCard v-if="selected">
    <div class="space-y-3">
      <UAvatar
        :src="selected.display_image_url || undefined"
        :alt="selected.display_name"
        icon="i-lucide-chef-hat"
        size="xl"
      />
      <h3 class="font-medium">
        {{ selected.display_name || selected.id }}
      </h3>
      <p v-if="selected.tagline" class="text-sm text-muted">
        {{ selected.tagline }}
      </p>
      <UButton
        to="/workspace/kitchen/identity"
        label="Open identity"
        variant="link"
      />
    </div>
  </UCard>
  <p v-else class="text-sm text-muted">Choose a Kitchen from the collection.</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { useKitchenWorkspaceIndex } from '../../../composables/workspace/index/useKitchenWorkspaceIndex'
import WorkspaceKitchenCrudUpdate from '../Crud/Update.vue'

const props = defineProps<{
  selected:
    | ReturnType<typeof useKitchenWorkspaceIndex>['collection']['value'][number]
    | undefined
  canUpdate: boolean
}>()
const editOpen = ref(false)
function openEdit() { if (props.selected && props.canUpdate) editOpen.value = true }
defineExpose({ openEdit })
</script>
