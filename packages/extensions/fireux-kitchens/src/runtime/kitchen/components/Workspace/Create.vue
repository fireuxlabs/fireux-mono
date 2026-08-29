<template>
  <div>
    <UButton
      :icon="kitchen?.id ? 'i-lucide-ellipsis-vertical' : 'i-lucide-plus'"
      color="neutral"
      variant="ghost"
      :aria-label="kitchen?.id ? 'Edit Kitchen' : 'Create Kitchen'"
      @click="open = true"
    />

    <UModal
      v-model:open="open"
      :title="kitchen?.id ? 'Edit Kitchen' : 'Create Kitchen'"
      description="Add a Kitchen name, tagline and image."
      :ui="{
        content: 'sm:max-w-xl',
        header: 'absolute top-2 right-2 z-10',
        title: 'sr-only',
        description: 'sr-only',
      }"
    >
      <template #body>
        <WorkspaceKitchenCreateForm :kitchen="kitchen" @created="created" />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { KitchenWorkspaceIndexState } from '../../composables/workspace/index/useKitchenWorkspaceIndex'

const props = defineProps<{
  kitchen?: KitchenWorkspaceIndexState['kitchen']
  refresh?: () => Promise<unknown>
}>()

const open = ref(false)

async function created() {
  if (!props.kitchen?.id) await props.refresh?.()
  open.value = false
}

watch(open, async (value) => {
  if (!value && props.kitchen?.id) await props.refresh?.()
})
</script>
