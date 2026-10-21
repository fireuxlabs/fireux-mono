import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { computed, ref, watch } from 'vue'
import type { WorkspacePalette } from 'fireux-core/types/theme'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { readKitchenThemePalette } from '../../../utils/kitchen-readers'
import { useKitchenWorkspaceIdentity } from '../identity/useKitchenWorkspaceIdentity'

const fallbackWorkspacePalette: WorkspacePalette = {
  canvas: '#f8fafc',
  text: '#0f172a',
  accent: '#0f766e',
  accent_contrast: '#f8fafc',
}

export function useKitchenWorkspacePaletteEditor(
  identity = useKitchenWorkspaceIdentity()
) {
  const { selectedKitchen, kitchenId, canWrite, outcome } =
    identity
  const toast = useToastify()
  const saving = ref(false)
  const saveState = ref('')
  const error = ref('')
  const config = useFireUXConfig()
  const { currentUser } = useAuth()
  const { appUser } = useUserSession()
  const sources = [kitchenId, canWrite, () => currentUser.value?.uid, () => config.appId, () => JSON.stringify(appUser.value)]
  const captureIntent = useCommandScope(sources)
  watch(sources, () => {
    saving.value = false
    saveState.value = ''
    error.value = ''
  }, { flush: 'sync' })
  const storedPalette = computed(() =>
    readKitchenThemePalette(selectedKitchen.value)
  )
  const palette = computed<WorkspacePalette>(
    () => storedPalette.value || fallbackWorkspacePalette
  )
  const canSave = canWrite

  async function save(next: WorkspacePalette) {
    if (!kitchenId.value || !canSave.value || saving.value) return
    const targetId = kitchenId.value
    const isCurrent = captureIntent()
    const uid = currentUser.value?.uid
    const body = { kitchen_id: targetId, palette: { ...next } }
    saving.value = true
    saveState.value = 'Saving...'
    error.value = ''
    try {
      const user = await useRequireUser()
      if (!isCurrent() || user.uid !== uid) throw new Error('The account or Kitchen changed. Reopen colours.')
      const token = await user.getIdToken()
      if (!isCurrent() || !canSave.value) throw new Error('The account or Kitchen changed. Reopen colours.')
      const result = await $fetch<{ ok: true; kitchen_id: string }>('/api/workspace/kitchen/theme', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
        retry: 0,
      })
      if (result?.ok !== true || result.kitchen_id !== targetId) throw new Error('Kitchen colours response was invalid.')
      if (isCurrent()) saveState.value = 'Saved'
    } catch (cause) {
      if (!isCurrent()) return
      const message =
        cause instanceof Error ? cause.message : 'Please try again.'
      if (isCurrent()) {
        saveState.value = 'Save failed'
        error.value = message
      }
      toast.error(`Failed to update Kitchen colours: ${message}`)
    } finally {
      if (isCurrent()) saving.value = false
    }
  }

  return {
    captureIntent,
    kitchenId,
    outcome,
    palette,
    storedPalette,
    canSave,
    saving,
    saveState,
    error,
    save,
  }
}
