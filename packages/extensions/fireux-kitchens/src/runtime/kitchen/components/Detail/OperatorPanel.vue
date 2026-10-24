<template>
  <aside v-if="showPanel" class="rounded-xl bg-elevated/50 px-4 py-3 text-sm">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-key-round" />
        <h2 class="font-semibold">Operator panel</h2>
      </div>
      <div class="flex flex-wrap gap-2">
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
const { workspaceEntryHref, openWorkspace: navigateToWorkspace } = useWorkspaceEntryCta('kitchen')
const workspaceTo = computed(() =>
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
