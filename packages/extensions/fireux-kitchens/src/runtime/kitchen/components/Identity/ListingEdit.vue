<template>
  <UModal
    :open="open"
    title="Kitchen listing"
    description="Choose your Kitchen URL, status and directory visibility."
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <form class="workspace-surface" @submit.prevent="save">
        <UFormField label="URL name" :error="updateError || undefined">
          <UInput v-model="slug" maxlength="80" autofocus />
        </UFormField>
        <UFormField label="Status">
          <USelect v-model="status" :items="statusItems" />
        </UFormField>
        <UFormField label="Show in directory">
          <USwitch v-model="visibility" />
        </UFormField>
        <FireCopyError v-if="updateError" :message="updateError" />
        <div class="fx-card__actions">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            type="button"
            @click="emit('update:open', false)"
          />
          <UButton
            label="Save changes"
            type="submit"
            :loading="saving"
            :disabled="!status"
          />
        </div>
      </form>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { onScopeDispose, ref, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenUpdate } from '../../composables/useKitchenUpdate'
import { useKitchenWorkspace } from '../../composables/workspace/useKitchenWorkspace'
import type { KitchenStatus } from '../../models/kitchen.model'

const props = defineProps<{ open: boolean }>()
const workspace = useKitchenWorkspace()
const { updateKitchen } = useKitchenUpdate()
const emit = defineEmits<{ 'update:open': [open: boolean] }>()

const editingKitchenId = ref('')
const slug = ref('')
const status = ref<KitchenStatus>()
const visibility = ref(false)
const updateError = ref('')
const saving = ref(false)
let savingAttempt: symbol | undefined
onScopeDispose(() => {
  savingAttempt = undefined
})
const statusItems: KitchenStatus[] = ['active', 'inactive', 'archived']
const { currentUser } = useAuth()
const captureCompletion = useCommandScope([
  () => currentUser.value?.uid,
  workspace.id,
  workspace.outcome,
  () => props.open,
  slug,
  status,
  visibility,
])

watch(
  () => props.open,
  (open: boolean) => {
    savingAttempt = undefined
    saving.value = false
    if (!open) return
    const kitchen = workspace.data.value
    if (workspace.outcome.value !== 'ready' || !kitchen) {
      emit('update:open', false)
      return
    }
    editingKitchenId.value = workspace.id.value
    slug.value = kitchen.identity.slug
    status.value = kitchen.identity.status
    visibility.value = kitchen.identity.visibility
    updateError.value = ''
  },
  { flush: 'sync' }
)

async function save() {
  if (saving.value || !status.value) return
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
  const isCurrent = captureCompletion()
  const attempt = Symbol()
  savingAttempt = attempt
  saving.value = true
  updateError.value = ''
  try {
    await updateKitchen(
      {
        kitchenId: editingKitchenId.value,
        changes: {
          'identity.slug': normalizedSlug,
          'identity.status': status.value,
          'identity.visibility': visibility.value,
        },
      },
      isCurrent
    )
    if (isCurrent()) emit('update:open', false)
  } catch (cause) {
    if (!isCurrent()) return
    updateError.value =
      cause instanceof Error ? cause.message : 'Kitchen could not be updated.'
  } finally {
    if (savingAttempt === attempt) {
      savingAttempt = undefined
      saving.value = false
    }
  }
}
</script>
