<template>
  <WorkspacePageHeader :title="kitchen ? kitchen.name : 'Kitchen'" />
  <FireState
    v-if="outcome === 'pending' || outcome === 'error'"
    :outcome="outcome"
    entity="Kitchen"
    :error="error"
  />
  <UButton v-else-if="kitchen && hasItems" to="/workspace/kitchen/items">
    Items
  </UButton>
  <template v-else-if="canCreate">
    <form @submit.prevent="create">
      <UFormField label="Kitchen name" name="name">
        <UInput v-model="name" required maxlength="120" :disabled="busy" />
      </UFormField>
      <UButton type="submit" :loading="busy" :disabled="!name.trim()">
        Create Kitchen
      </UButton>
    </form>
    <UAlert v-if="failure" color="error" :title="failure" />
  </template>
  <p v-else-if="!kitchen">No Kitchen is available to this account.</p>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRouter } from '#imports'
import { resolveWorkspaceCanCreate } from 'fireux-workspace/runtime/workspace/utils/policy'
import { useKitchenOnlyWorkspace } from '../composables/workspace/useKitchenOnlyWorkspace'
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
const hasItems = useRouter().hasRoute('workspace-kitchen-items')
const { data: kitchen, outcome, error, selectedId } = useKitchenOnlyWorkspace()
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
const accountId = () => currentUser.value?.uid
watch(
  accountId,
  () => {
    failure.value = ''
  },
  { flush: 'sync' }
)
const captureAccount = useCommandScope([accountId])

async function create() {
  const user = currentUser.value
  const submittedName = name.value.trim()
  if (!user || busy.value || !canCreate.value || !submittedName) return
  const isCurrent = captureAccount()
  busy.value = true
  failure.value = ''
  try {
    const token = await user.getIdToken()
    if (!isCurrent() || !canCreate.value) return
    const result = await $fetch<KitchenShellCreateResult>(
      '/api/kitchens/onboarding/shell',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { intent: 'create_shell', name: submittedName },
      }
    )
    if (!result?.ok || !result.kitchen_id || result.owner_user_id !== user.uid)
      throw new Error('Kitchen creation returned an unexpected result.')
  } catch (error) {
    if (isCurrent())
      failure.value =
        (error as { data?: { statusMessage?: string } })?.data?.statusMessage ||
        (error instanceof Error
          ? error.message
          : 'Could not create the Kitchen.')
  } finally {
    busy.value = false
  }
}
</script>
