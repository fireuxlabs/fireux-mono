<template>
  <KitchenItems
    v-if="kitchen"
    :key="JSON.stringify([kitchen.id, itemId])"
    :kitchen-id="kitchen.id"
    :items="kitchen.items"
    :items-path="itemsPath"
    :item-id="itemId"
  />
  <template v-else>
    <WorkspacePageHeader title="Items">
      <template #actions>
        <UButton variant="ghost" to="/workspace/kitchen"
          >Back to Kitchen</UButton
        >
      </template>
    </WorkspacePageHeader>
    <FireState
      v-if="outcome === 'pending' || outcome === 'error'"
      :outcome="outcome"
      :entity="workspace.outcome.value === 'ready' ? 'Items' : 'Kitchen'"
      :error="error"
    />
    <p v-else>Open an accessible Kitchen to manage Items.</p>
  </template>
</template>

<script setup lang="ts">
import { computed, type Ref } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import type { ReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import type { Kitchen } from '../../../models/kitchen.model'
import { useKitchenItemCollection } from '../../../composables/useKitchenItemCollection'
import KitchenItems from './Index.vue'

const { workspace } = defineProps<{
  workspace: {
    data: Ref<Kitchen | null>
    outcome: Ref<ReadOutcome>
    error: Ref<unknown>
  }
  itemsPath: string
}>()
const itemId = useRouteParam('itemId')
const collection = useKitchenItemCollection(
  computed(() =>
    workspace.outcome.value === 'ready' ? (workspace.data.value?.id ?? '') : ''
  )
)
const outcome = computed(() => {
  if (workspace.outcome.value !== 'ready') return workspace.outcome.value
  if (collection.outcome.value === 'error') return 'error'
  return ['ready', 'empty'].includes(collection.outcome.value)
    ? 'ready'
    : 'pending'
})
const error = computed(() => workspace.error.value ?? collection.error.value)
const kitchen = computed(() =>
  workspace.data.value && outcome.value === 'ready'
    ? { ...workspace.data.value, items: collection.items.value }
    : null
)
</script>
