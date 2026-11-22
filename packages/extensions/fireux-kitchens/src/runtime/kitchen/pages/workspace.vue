<template>
  <WorkspacePageHeader :title="kitchen?.identity.name || 'Kitchen'" />
  <FireState
    v-if="outcome === 'pending' || outcome === 'error'"
    :outcome="outcome"
    entity="Kitchen"
    :error="access.error.value || source.error.value"
  />
  <form v-else-if="canCreate || kitchen?.identity.name" @submit.prevent="save">
    <UFormField label="Kitchen name" name="name">
      <UInput v-model="name" required :maxlength="120" :disabled="busy" />
    </UFormField>
    <UButton
      type="submit"
      :loading="busy"
      :disabled="!name.trim() || name.trim() === kitchen?.identity.name"
    >
      {{ kitchen ? 'Rename Kitchen' : 'Create Kitchen' }}
    </UButton>
    <UAlert v-if="failure" color="error" :title="failure" />
  </form>
  <p v-else-if="kitchen">{{ kitchen.identity.slug }}</p>
  <p v-else>No Kitchen is available to this account.</p>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useWorkspace } from 'fireux-workspace/runtime/workspace/composables/useWorkspace'
import { useWorkspaceRecord } from 'fireux-workspace/runtime/workspace/composables/useWorkspaceRecord'
import { resolveWorkspaceCanCreate } from 'fireux-workspace/runtime/workspace/utils/policy'
import { useKitchenAccess } from '../composables/useKitchenAccess'
import { useKitchenRead } from '../composables/useKitchenRead'
import { useKitchenUpdate } from '../composables/useKitchenUpdate'
import type { KitchenShellCreateResult } from '../server/index/onboarding/kitchen-onboarding'

definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: false,
})

const { currentUser, isAuthenticated } = useAuth()
const config = useFireUXConfig()
const access = useKitchenAccess()
const selection = useWorkspace('kitchen')
const selectedId = computed(() => {
  const saved = selection.selectedId.value
  return access.ids.value.includes(saved) ? saved : access.ids.value[0] || ''
})
const {
  data: kitchen,
  outcome,
  source,
} = useWorkspaceRecord(
  selectedId,
  access,
  (id) => useKitchenRead(id, { hydrate: false }),
  (state) => state.kitchen
)
const canCreate = computed(
  () =>
    isAuthenticated.value &&
    !selectedId.value &&
    ['empty', 'idle'].includes(outcome.value) &&
    resolveWorkspaceCanCreate(config.role, config.workspaceConfig, 'kitchen')
)
const name = ref('')
const failure = ref('')
const busy = ref(false)
watch(
  [
    () => currentUser.value?.uid,
    selectedId,
    () => kitchen.value?.identity.name,
  ],
  () => {
    name.value = kitchen.value?.identity.name || ''
    failure.value = ''
  },
  { immediate: true, flush: 'sync' }
)

const captureAccount = useCommandScope([() => currentUser.value?.uid])
const { updateKitchen } = useKitchenUpdate([selectedId, access.outcome])

async function save() {
  const value = name.value.trim()
  const user = currentUser.value
  const current = kitchen.value
  if (!value || !user || busy.value || (!current && !canCreate.value)) return
  const isCurrent = captureAccount()
  busy.value = true
  failure.value = ''
  try {
    if (current) {
      await updateKitchen({
        kitchenId: current.id,
        changes: { 'identity.name': value },
      })
    } else {
      const token = await user.getIdToken()
      if (!isCurrent() || !canCreate.value) return
      const result = await $fetch<KitchenShellCreateResult>(
        '/api/kitchens/onboarding/shell',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: { intent: 'create_shell', name: value },
        }
      )
      if (
        !result?.ok ||
        !result.kitchen_id ||
        result.owner_user_id !== user.uid
      )
        throw new Error('Kitchen creation returned an unexpected result.')
      if (isCurrent() && !selection.selectedId.value)
        selection.select(result.kitchen_id)
    }
  } catch (error) {
    if (isCurrent() && (!current || current.id === selectedId.value))
      failure.value =
        (error as { data?: { statusMessage?: string }; message?: string })?.data
          ?.statusMessage ||
        (error instanceof Error ? error.message : 'Could not save the Kitchen.')
  } finally {
    busy.value = false
  }
}
</script>
