<template>
  <UModal
    :open="open"
    title="Create Test"
    :description="`Add one named Test to this ${entityLabel}.`"
    :ui="{ content: 'sm:max-w-md' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <form class="space-y-5" @submit.prevent="create">
        <UFormField label="Value"
          ><UInput
            v-model="value"
            name="value"
            autocomplete="off"
            autofocus
            class="w-full"
        /></UFormField>
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
import type { useTest } from '../../../../composables/fireux/workspace/useTest'
type WorkspaceTestActions = ReturnType<typeof useTest>['primitives']
const props = defineProps<{
  open: boolean
  entityLabel: string
  primitives: WorkspaceTestActions
}>()
const emit = defineEmits<{ (event: 'update:open', open: boolean): void }>()
const value = ref('')
const pending = ref(false)
async function create() {
  const next = value.value.trim()
  if (!next || pending.value) return
  pending.value = true
  try {
    if (!(await props.primitives.create(next))) return
    value.value = ''
    emit('update:open', false)
  } finally {
    pending.value = false
  }
}
</script>
