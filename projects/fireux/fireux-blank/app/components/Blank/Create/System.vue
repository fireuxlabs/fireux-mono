<!-- Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: own Blank creation UI and behavior. -->
<template>
  <UPageCard
    v-if="canCreate"
    title="Blank target"
    description="This creates the smallest workspace target: root truth plus app workspace scope."
    variant="subtle"
  >
    <form class="space-y-4" @submit.prevent="handleCreate">
      <UFormField label="Name">
        <UInput
          v-model="name"
          placeholder="Blank target"
          autocomplete="off"
        />
      </UFormField>

      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="Create failed"
        :description="error"
      />

      <div class="flex items-center gap-2">
        <UButton
          type="submit"
          icon="i-lucide-plus"
          color="primary"
          :loading="creating"
        >
          Create Blank
        </UButton>

        <UButton
          to="/"
          variant="ghost"
          color="neutral"
        >
          Cancel
        </UButton>
      </div>
    </form>
  </UPageCard>

  <UPageCard
    v-else
    title="Blank creation is not enabled here"
    description="This app uses existing Blank workspace targets."
    variant="subtle"
  />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed, ref } from 'vue'
import { useBlankWorkspace } from '../../../composables/fireux/workspace/blank/core/useBlankWorkspace'
import { useBlankWorkspaceIndex } from '../../../composables/fireux/workspace/blank/index/useBlankWorkspaceIndex'

const name = ref('Blank target')
const creating = ref(false)
const error = ref('')
const canCreate = computed(() => true)
const workspace = useBlankWorkspace()
const workspaceIndex = useBlankWorkspaceIndex()

async function handleCreate() {
  if (!canCreate.value || creating.value) return

  creating.value = true
  error.value = ''

  try {
    const result = await workspace.crud.create({ name: name.value })
    workspaceIndex.select(result.id)
    await navigateTo('/')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    creating.value = false
  }
}
</script>
