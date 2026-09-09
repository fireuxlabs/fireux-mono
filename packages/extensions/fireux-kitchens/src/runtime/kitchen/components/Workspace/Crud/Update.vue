<template>
  <UModal
    :open="open"
    title="Edit Kitchen"
    description="Update the selected Kitchen root without replacing Place-owned identity."
    :ui="{ content: 'sm:max-w-md' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <form class="space-y-5" @submit.prevent="save">
        <UFormField label="Slug" :error="updateError || undefined">
          <UInput v-model="slug" maxlength="80" autofocus class="w-full" />
        </UFormField>
        <UFormField label="Status">
          <USelect v-model="status" :items="statusItems" class="w-full" />
        </UFormField>
        <UFormField label="Publicly visible">
          <USwitch v-model="visibility" />
        </UFormField>
        <MoleculesCopyError v-if="updateError" :message="updateError" />
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            type="button"
            @click="emit('update:open', false)"
          />
          <UButton label="Save changes" type="submit" :loading="saving" />
        </div>
      </form>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'

const props = defineProps<{ open: boolean }>()
const workspace = useKitchenWorkspace()
const emit = defineEmits<{ 'update:open': [open: boolean] }>()

const editingKitchenId = ref('')
const slug = ref('')
const status = ref<'active' | 'inactive' | 'archived'>('inactive')
const visibility = ref(false)
const updateError = ref('')
const saving = ref(false)
const statusItems = ['active', 'inactive', 'archived']

watch(
  () => props.open,
  (open: boolean) => {
    if (!open) return
    editingKitchenId.value = workspace.id.value || ''
    slug.value = String(workspace.data.value?.slug || '')
    status.value = workspace.data.value?.status || 'inactive'
    visibility.value = Boolean(workspace.data.value?.visibility)
    updateError.value = ''
  }
)

async function save() {
  if (saving.value) return
  if (
    !editingKitchenId.value ||
    editingKitchenId.value !== workspace.id.value ||
    workspace.outcome.value !== 'ready'
  ) {
    updateError.value =
      'The selected Kitchen changed or is unavailable. Reopen the editor.'
    return
  }
  const normalizedSlug = slug.value.trim()
  if (!normalizedSlug) {
    updateError.value = 'Enter a Kitchen slug.'
    return
  }
  saving.value = true
  updateError.value = ''
  try {
    await workspace.crud.update({
      slug: normalizedSlug,
      status: status.value,
      visibility: visibility.value,
    })
    emit('update:open', false)
  } catch (cause) {
    updateError.value =
      cause instanceof Error ? cause.message : 'Kitchen could not be updated.'
  } finally {
    saving.value = false
  }
}
</script>
