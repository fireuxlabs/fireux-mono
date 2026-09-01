<template>
  <UModal
    :open="open"
    title="Create Test"
    description="Add one named Test to this Project."
    :ui="{ content: 'sm:max-w-md' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <form class="space-y-5" @submit.prevent="create">
        <UFormField label="Name">
          <UInput
            v-model="name"
            name="name"
            autocomplete="off"
            autofocus
            class="w-full"
          />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            type="button"
            @click="emit('update:open', false)"
          />
          <UButton
            label="Create Test"
            icon="i-lucide-plus"
            type="submit"
            :loading="pending"
          />
        </div>
      </form>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { useProjectWorkspaceTest } from '../../../../../project/composables/workspace/test/useProjectWorkspaceTest'

type Workspace = ReturnType<typeof useProjectWorkspaceTest>

const props = defineProps<{
  open: boolean
  actions: Workspace['actions']
}>()

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
}>()

const name = ref('')
const pending = ref(false)

async function create() {
  const value = name.value.trim()
  if (!value || pending.value) return
  pending.value = true
  try {
    if (!(await props.actions.create(value))) return
    name.value = ''
    emit('update:open', false)
  } finally {
    pending.value = false
  }
}
</script>
