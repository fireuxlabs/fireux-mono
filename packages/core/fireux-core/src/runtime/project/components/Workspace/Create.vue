<template>
  <div>
    <UButton
      v-if="launcher === 'button'"
      icon="i-lucide-plus"
      color="neutral"
      variant="ghost"
      aria-label="Create Project"
      @click="open = true"
    />

    <UModal v-if="launcher === 'button'" v-model:open="open" title="Create Project">
      <template #body>
        <WorkspaceProjectCreateForm @created="open = false" />
      </template>
    </UModal>

    <WorkspaceProjectCreateForm v-else />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const { launcher = 'button' } = defineProps<{
  launcher?: 'button' | 'inline'
}>()
const open = ref(false)
</script>
