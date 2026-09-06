<template>
  <UCard>
    <template #header
      ><div class="flex justify-between gap-3">
        <h2 class="text-lg font-semibold">App context</h2>
        <UButton
          label="Refresh"
          color="neutral"
          variant="ghost"
          :loading="pending"
          @click="load"
        /></div
    ></template>
    <p v-if="pending" class="text-muted">Loading shared context…</p>
    <p v-else-if="message" class="text-muted">{{ message }}</p>
    <div v-else-if="data" class="space-y-3">
      <div class="flex gap-3 items-center">
        <h3 class="font-semibold">{{ data.context.title }}</h3>
        <UBadge color="neutral">{{ data.context.reviewStatus }}</UBadge>
      </div>
      <p class="whitespace-pre-line">{{ data.context.summary }}</p>
      <p class="text-sm text-muted">Source: {{ data.context.source }}</p>
      <p class="text-xs text-muted">Misebox · {{ data.sourcePath }}</p>
      <UButton
        label="Copy context"
        color="neutral"
        variant="ghost"
        @click="copy"
      />
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { ref, watch, watchEffect, onBeforeUnmount } from 'vue'
import { useProjectWorkspace } from 'fireux-core/runtime/project/composables/workspace/core/useProjectWorkspace'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
const workspace = useProjectWorkspace()
const data = ref<{
  sourcePath: string
  revision: string
  context: {
    title: string
    summary: string
    source: string
    reviewStatus: string
  }
} | null>(null)
const pending = ref(false),
  message = ref('')
const emit = defineEmits<{
  state: [value: { data: typeof data.value; pending: boolean; message: string }]
}>()
watchEffect(() => {
  emit('state', { data: data.value, pending: pending.value, message: message.value })
})
let generation = 0
onBeforeUnmount(() => {
  generation++
})
async function load() {
  const current = ++generation,
    id = workspace.id.value
  data.value = null
  message.value = ''
  pending.value = false
  if (!id) {
    message.value = 'Select a Project to read its shared App context.'
    return
  }
  pending.value = true
  try {
    const user = await useRequireUser()
    const result = await $fetch<NonNullable<typeof data.value>>(
      `/api/internal/control/projects/${encodeURIComponent(id)}/app-context`,
      {
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        timeout: 15000,
        retry: 0,
      }
    )
    if (current === generation) data.value = result
  } catch (cause) {
    if (current === generation)
      message.value =
        cause instanceof Error ? cause.message : 'Context could not be read.'
  } finally {
    if (current === generation) pending.value = false
  }
}
async function copy() {
  try {
    await navigator.clipboard.writeText(JSON.stringify(data.value, null, 2))
  } catch {
    message.value = 'Could not copy context.'
  }
}
watch(workspace.id, load, { immediate: true })
</script>
