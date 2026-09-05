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
        <UFormField label="Value" :error="error || undefined"
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
import { ref, watch } from 'vue'
import type { useTest } from '../../../../composables/fireux/workspace/useTest'
type WorkspaceTestActions = ReturnType<typeof useTest>['primitives']
const props = defineProps<{
  open: boolean
  initialValue?: string
  entityLabel: string
  primitives: WorkspaceTestActions
}>()
const emit = defineEmits<{ (event: 'update:open', open: boolean): void }>()
const value = ref('')
watch(
  () => props.open,
  (open: boolean) => {
    if (open) {
      value.value = props.initialValue || ''
      error.value = ''
    }
  }
)
const pending = ref(false)
const error = ref('')
async function create() {
  const next = value.value.trim()
  if (pending.value) return
  if (!next) {
    error.value = 'Enter some text for this Test.'
    return
  }
  pending.value = true
  error.value = ''
  try {
    if (!(await props.primitives.create(next))) {
      error.value =
        'This Test cannot be created with the current access or allowance.'
      return
    }
    value.value = ''
    emit('update:open', false)
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : 'Test could not be created.'
  } finally {
    pending.value = false
  }
}
</script>
