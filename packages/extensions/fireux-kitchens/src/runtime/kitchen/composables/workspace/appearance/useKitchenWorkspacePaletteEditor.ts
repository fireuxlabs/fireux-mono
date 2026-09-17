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

export function useKitchenWorkspacePaletteEditor() {
  const { selectedKitchen, kitchenId, canWrite, outcome } =
    useKitchenWorkspaceIdentity()
  const toast = useToastify()
  const saving = ref(false)
  const saveState = ref('')
  const error = ref('')
  watch(kitchenId, () => {
    saveState.value = ''
    error.value = ''
  })
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
    saving.value = true
    saveState.value = 'Saving...'
    error.value = ''
    try {
      const user = await useRequireUser()
      const token = await user.getIdToken()
      if (kitchenId.value !== targetId || !canSave.value) {
        if (kitchenId.value === targetId) saveState.value = ''
        return
      }
      await $fetch('/api/workspace/kitchen/theme', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { kitchen_id: targetId, palette: next },
      })
      if (kitchenId.value === targetId) saveState.value = 'Saved'
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Please try again.'
      if (kitchenId.value === targetId) {
        saveState.value = 'Save failed'
        error.value = message
      }
      toast.error(`Failed to update Kitchen colours: ${message}`)
    } finally {
      saving.value = false
    }
  }

  return {
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
