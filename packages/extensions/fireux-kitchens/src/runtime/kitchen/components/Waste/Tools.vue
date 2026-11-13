<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-labelledby="waste-tools-title"
  >
    <UCard description="Waste actions">
      <template #title><h2 id="waste-tools-title">Tools</h2></template>
      <UButton
        label="Record Waste"
        icon="i-lucide-trash-2"
        size="sm"
        :disabled="!canWrite"
        @click="open = true"
      />
    </UCard>

    <UModal
      v-model:open="open"
      title="Record Waste"
      description="Record what was wasted, how much, why, and where it happened."
    >
      <template #body>
        <KitchenWasteCreate @cancel="open = false" @created="handleCreated" />
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useToast } from '#imports'
import { useKitchenWorkspaceWaste } from '../../composables/workspace/waste/useKitchenWorkspaceWaste'

const toast = useToast()
const { canWrite, kitchenId } = useKitchenWorkspaceWaste()
const open = ref(false)
const route = useRoute()
const { currentUser } = useAuth()
watch(
  [kitchenId, canWrite, () => currentUser.value?.uid, () => route.fullPath],
  () => {
    open.value = false
  },
  { flush: 'sync' }
)

function handleCreated(result: { id: string; itemName: string }) {
  open.value = false
  toast.add({
    title: `${result.itemName} recorded`,
    description: 'The Waste event is now part of this Kitchen’s evidence.',
    color: 'success',
    icon: 'i-lucide-circle-check',
  })
}
</script>
