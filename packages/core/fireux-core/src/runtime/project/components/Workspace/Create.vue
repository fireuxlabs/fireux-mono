<template>
  <div>
    <UButton
      icon="i-lucide-plus"
      color="neutral"
      variant="ghost"
      aria-label="Create Project"
      @click="open = true"
    />

    <UModal v-model:open="open" title="Create Project">
      <template #body>
        <WorkspaceProjectCreateForm @created="created" />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  refresh?: () => Promise<unknown>
}>()

const open = ref(false)

async function created() {
  await props.refresh?.()
  open.value = false
}
</script>
