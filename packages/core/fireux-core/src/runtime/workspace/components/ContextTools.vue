<template>
  <UCard v-if="open">
    <template #header
      ><h2 class="font-semibold">{{ title }}</h2></template
    >
    <WorkspaceCapabilityInfo />
    <template #footer
      ><UButton
        :label="copied ? 'Copied' : 'Copy JSON'"
        icon="i-lucide-copy"
        color="neutral"
        variant="soft"
        @click="copy"
    /></template>
  </UCard>
  <UModal v-else :title="title">
    <UButton
      icon="i-lucide-info"
      :label="title"
      color="neutral"
      variant="ghost"
    />
    <template #body><WorkspaceCapabilityInfo /></template>
    <template #footer
      ><UButton
        :label="copied ? 'Copied' : 'Copy JSON'"
        icon="i-lucide-copy"
        @click="copy"
    /></template>
  </UModal>
  <FireCopyError v-if="error" :message="error" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWorkspacePageState } from '../composables/useWorkspacePageState'
const props = defineProps<{
  title: string
  workspace: string
  open?: boolean
}>()
const page = useWorkspacePageState(props.workspace)
const copied = ref(false)
const error = ref('')
async function copy() {
  try {
    await page.copy()
    copied.value = true
  } catch {
    error.value = 'Clipboard access was not allowed.'
  }
}
</script>
