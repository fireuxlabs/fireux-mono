<template>
  <aside v-if="showPanel">
    <div>
      <div>
        <UIcon name="i-lucide-key-round" />
        <h2>Operator panel</h2>
      </div>
      <div>
        <UButton
          :to="editTo"
          label="Edit identity"
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
        />
        <UButton
          :to="workspaceTo"
          label="Open Kitchen workspace"
          icon="i-lucide-panel-right-open"
          color="neutral"
          variant="ghost"
          @click="openWorkspace"
        />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import { useKitchenAccess } from '../../composables/useKitchenAccess'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'

const props = defineProps<{ kitchen?: { id: string; slug?: string } | null }>()
const access = useKitchenAccess()
const kitchenId = computed(() => String(props.kitchen?.id || '').trim())
const showPanel = computed(
  () =>
    access.outcome.value === 'ready' &&
    access.ids.value.includes(kitchenId.value)
)
const editTo = computed(
  () =>
    `/kitchens/${encodeURIComponent(props.kitchen?.slug || kitchenId.value)}/edit`
)
const { workspaceEntryHref, openWorkspace: navigateToWorkspace } =
  useWorkspaceEntryCta('kitchen')
const workspaceTo = computed(
  () =>
    `${workspaceEntryHref.value}?${new URLSearchParams({ kitchenId: kitchenId.value })}`
)
const { select } = useWorkspace('kitchen')
async function openWorkspace(event: MouseEvent) {
  event.preventDefault()
  if (!showPanel.value) return
  select(kitchenId.value)
  await navigateToWorkspace({ kitchenId: kitchenId.value })
}
</script>
