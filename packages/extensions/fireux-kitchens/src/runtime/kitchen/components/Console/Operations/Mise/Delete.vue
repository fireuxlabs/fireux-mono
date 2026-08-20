<template>
  <div>
    <UButton
      :label="tool.label"
      :icon="tool.icon"
      color="error"
      variant="soft"
      @click="open = true"
    />

    <UModal
      v-model:open="open"
      title="Delete prep task?"
      description="This permanently removes the task from the Kitchen prep list."
    >
      <template #body>
        <div class="space-y-4">
          <p class="m-0 text-sm text-muted">
            {{ task.title || 'This prep task' }} cannot be recovered.
          </p>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              @click="open = false"
            />
            <UButton
              label="Delete prep task"
              icon="i-lucide-trash-2"
              color="error"
              :loading="deleting"
              @click="deleteTask"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { navigateTo, useToast } from '#imports'
import { ref } from 'vue'
import type { KitchenMiseTask } from '../../../../models/mise.model.ts'
import { kitchenMisePrepTaskDeleteTool } from '../../../../tools/mise'
import { useKitchenMiseDelete } from '../../../../composables/console/operations/Mise/mutations/useKitchenMiseDelete'
import { useKitchenMiseTaskWorkspace } from '../../../../composables/console/operations/Mise/useKitchenMiseTaskWorkspace'

defineProps<{ task: KitchenMiseTask }>()
const { kitchenId, rootCollection, miseId } = useKitchenMiseTaskWorkspace()
const { deleteKitchenMiseTask } = useKitchenMiseDelete({
  kitchenCollectionPath: rootCollection,
})
const tool = kitchenMisePrepTaskDeleteTool.surfaces.human
const toast = useToast()
const open = ref(false)
const deleting = ref(false)

async function deleteTask() {
  if (deleting.value) return
  deleting.value = true
  try {
    await deleteKitchenMiseTask(kitchenId.value, miseId.value)
    toast.add({
      title: 'Prep task deleted',
      color: 'success',
      icon: 'i-lucide-trash-2',
    })
    await navigateTo('/console/kitchen/mise')
  } finally {
    deleting.value = false
  }
}
</script>
